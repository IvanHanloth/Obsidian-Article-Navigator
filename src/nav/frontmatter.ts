import { Notice, TFile, type App } from 'obsidian';

import {
	NEW_NOTE_MAX_BODY_BYTES,
	NEW_NOTE_MAX_CONTENT_BYTES,
	PLUGIN_LOG_PREFIX,
} from '../constants';
import type { I18n } from '../i18n';
import type { ArticleNavigatorSettings } from '../settings';

/**
 * If a freshly created file is still essentially empty (no real body), seed it
 * with the three navigation properties so users don't have to insert them by
 * hand on every new note.
 */
export async function addDefaultPropertiesIfNew(
	app: App,
	settings: ArticleNavigatorSettings,
	file: TFile,
): Promise<void> {
	let content: string;
	try {
		content = await app.vault.read(file);
	} catch {
		return;
	}
	if (content.length > NEW_NOTE_MAX_CONTENT_BYTES) return;

	const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	const body = (fmMatch?.[2] ?? content).trim();
	if (body.length > NEW_NOTE_MAX_BODY_BYTES) return;

	await addDefaultProperties(app, settings, file, false, null);
}

export async function addDefaultProperties(
	app: App,
	settings: ArticleNavigatorSettings,
	file: TFile,
	notify: boolean,
	i18n: I18n | null,
): Promise<void> {
	try {
		let added = false;
		await app.fileManager.processFrontMatter(file, (raw: unknown) => {
			const fm = raw as Record<string, unknown>;
			if (!(settings.previousKey in fm)) {
				fm[settings.previousKey] = '';
				added = true;
			}
			if (!(settings.nextKey in fm)) {
				fm[settings.nextKey] = '';
				added = true;
			}
			if (!(settings.seeAlsoKey in fm)) {
				fm[settings.seeAlsoKey] = [];
				added = true;
			}
		});
		if (notify && i18n) {
			new Notice(
				added
					? i18n.t.notice.propertiesAdded
					: i18n.t.notice.propertiesAlreadyPresent,
			);
		}
	} catch (e) {
		console.error(PLUGIN_LOG_PREFIX, 'processFrontMatter failed:', e);
	}
}

/**
 * Build a wikilink that resolves correctly from `from` to `target`, then write
 * it into `key` on `from`. Mirrors Obsidian's own link insertion behavior so
 * that the produced text matches what the editor would have written.
 */
export async function writeLinkProperty(
	app: App,
	from: TFile,
	key: string,
	target: TFile,
): Promise<string> {
	const linktext = app.metadataCache.fileToLinktext
		? app.metadataCache.fileToLinktext(target, from.path, true)
		: target.basename;
	const newValue = `[[${linktext}]]`;
	await app.fileManager.processFrontMatter(from, (raw: unknown) => {
		(raw as Record<string, unknown>)[key] = newValue;
	});
	return newValue;
}

export interface KeyRename {
	from: string;
	to: string;
}

export interface RenameKeysSummary {
	filesScanned: number;
	filesUpdated: number;
	keysRenamed: number;
	keysSkipped: number;
}

function randomTempKey(originalKey: string): string {
	const rand = Math.random().toString(36).slice(2, 10);
	const stamp = Date.now().toString(36);
	// Prefixed and bracketed so it's obvious in YAML if anything ever leaks.
	return `__article_nav_tmp_${originalKey}_${stamp}_${rand}__`;
}

/**
 * Rename a set of frontmatter keys across every markdown file in the vault.
 *
 * Uses a two-phase rename per file: each source key is first moved to a unique
 * temporary key, then the temporary key is moved to the target. This avoids
 * collisions when the user swaps two keys (A→B, B→A) or otherwise rotates
 * names through values that already exist in the rename batch.
 *
 * If a target key is already present on a file from an unrelated source, the
 * rename for that particular key on that file is skipped to avoid clobbering
 * data the plugin doesn't own.
 */
export async function renameFrontmatterKeysAcrossVault(
	app: App,
	renames: KeyRename[],
): Promise<RenameKeysSummary> {
	const summary: RenameKeysSummary = {
		filesScanned: 0,
		filesUpdated: 0,
		keysRenamed: 0,
		keysSkipped: 0,
	};

	const activeRenames = renames.filter(
		(r) => r.from && r.to && r.from !== r.to,
	);
	if (activeRenames.length === 0) return summary;

	const fromKeys = new Set(activeRenames.map((r) => r.from));
	const files = app.vault.getMarkdownFiles();

	for (const file of files) {
		summary.filesScanned += 1;

		// Cheap pre-check via the metadata cache so we don't rewrite files that
		// can't possibly contain any of the keys we're renaming.
		const cached = app.metadataCache.getFileCache(file);
		const fmCached = cached?.frontmatter;
		if (!fmCached) continue;
		let possiblyAffected = false;
		for (const key of fromKeys) {
			if (key in fmCached) {
				possiblyAffected = true;
				break;
			}
		}
		if (!possiblyAffected) continue;

		let renamedInFile = 0;
		let skippedInFile = 0;

		try {
			await app.fileManager.processFrontMatter(file, (raw: unknown) => {
				const fm = raw as Record<string, unknown>;

				// Phase 1: move every present source key to a unique temp key.
				const stagedTargets: Array<{ tempKey: string; to: string }> = [];
				for (const { from, to } of activeRenames) {
					if (!(from in fm)) continue;
					const tempKey = randomTempKey(from);
					fm[tempKey] = fm[from];
					delete fm[from];
					stagedTargets.push({ tempKey, to });
				}

				// Phase 2: move each temp key onto its final destination. If the
				// destination is already populated by something this rename batch
				// didn't own, skip that key for this file to avoid data loss.
				for (const { tempKey, to } of stagedTargets) {
					if (to in fm) {
						delete fm[tempKey];
						skippedInFile += 1;
						continue;
					}
					fm[to] = fm[tempKey];
					delete fm[tempKey];
					renamedInFile += 1;
				}
			});
		} catch (e) {
			console.error(PLUGIN_LOG_PREFIX, 'rename failed for', file.path, e);
			continue;
		}

		if (renamedInFile > 0) summary.filesUpdated += 1;
		summary.keysRenamed += renamedInFile;
		summary.keysSkipped += skippedInFile;
	}

	return summary;
}
