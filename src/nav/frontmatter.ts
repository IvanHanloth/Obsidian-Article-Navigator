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
