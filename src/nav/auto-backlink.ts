import { Notice, TFile } from 'obsidian';

import { PLUGIN_LOG_PREFIX, RECIPROCAL_CHECK_DELAY_MS, SUPPRESSION_MS } from '../constants';
import { ConfirmModal } from '../ui/confirm-modal';
import type ArticleNavigatorPlugin from '../main';
import type { NavSnapshot } from '../types';
import {
	getFrontmatter,
	getNavSnapshot,
	resolveLinkedFile,
} from './link-resolver';
import { writeLinkProperty } from './frontmatter';

function stringifyFmValue(value: unknown): string {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return value.map(stringifyFmValue).join(', ');
	try {
		return JSON.stringify(value);
	} catch {
		return '';
	}
}

/**
 * Encapsulates the bookkeeping needed to keep Previous/Next links reciprocal
 * across notes, including the timer maps used to:
 *  - debounce per-file checks so rapid edits coalesce into one pass
 *  - suppress events fired by the plugin's own writes
 *  - snapshot previous Prev/Next values so re-index events don't trigger work
 */
export class AutoBacklinkController {
	private readonly suppressTimers = new Map<string, number>();
	private readonly pendingChecks = new Map<string, number>();
	private readonly lastKnownNavValues = new Map<string, NavSnapshot>();

	constructor(private readonly plugin: ArticleNavigatorPlugin) {}

	// ---------- Public state hooks ----------

	primeBaseline(file: TFile): void {
		if (this.lastKnownNavValues.has(file.path)) return;
		this.lastKnownNavValues.set(
			file.path,
			getNavSnapshot(this.plugin.app, this.plugin.settings, file),
		);
	}

	getBaseline(path: string): NavSnapshot | undefined {
		return this.lastKnownNavValues.get(path);
	}

	currentSnapshot(file: TFile): NavSnapshot {
		return getNavSnapshot(this.plugin.app, this.plugin.settings, file);
	}

	setBaseline(path: string, snapshot: NavSnapshot): void {
		this.lastKnownNavValues.set(path, snapshot);
	}

	isSuppressed(path: string): boolean {
		return this.suppressTimers.has(path);
	}

	dispose(): void {
		for (const id of this.suppressTimers.values()) window.clearTimeout(id);
		for (const id of this.pendingChecks.values()) window.clearTimeout(id);
		this.suppressTimers.clear();
		this.pendingChecks.clear();
		this.lastKnownNavValues.clear();
	}

	// ---------- Scheduling ----------

	scheduleCheck(file: TFile): void {
		if (!this.plugin.settings.autoBacklink) return;
		const existing = this.pendingChecks.get(file.path);
		if (existing) window.clearTimeout(existing);
		const id = window.setTimeout(() => {
			this.pendingChecks.delete(file.path);
			// Refresh baseline before processing so the writes we're about to do
			// don't re-trigger this code path when Obsidian re-indexes them.
			this.setBaseline(file.path, this.currentSnapshot(file));
			this.processReciprocalLinks(file).catch((e) =>
				console.error(PLUGIN_LOG_PREFIX, e),
			);
		}, RECIPROCAL_CHECK_DELAY_MS);
		this.pendingChecks.set(file.path, id);
	}

	// ---------- Processing ----------

	private async processReciprocalLinks(sourceFile: TFile): Promise<void> {
		const { app, settings } = this.plugin;
		if (!settings.autoBacklink) return;
		if (!(sourceFile instanceof TFile)) return;
		if (!app.vault.getAbstractFileByPath(sourceFile.path)) return;
		await this.ensureReciprocal(
			sourceFile,
			settings.previousKey,
			settings.nextKey,
		);
		await this.ensureReciprocal(
			sourceFile,
			settings.nextKey,
			settings.previousKey,
		);
	}

	private async ensureReciprocal(
		sourceFile: TFile,
		sourceKey: string,
		reciprocalKey: string,
	): Promise<void> {
		if (!sourceKey || !reciprocalKey || sourceKey === reciprocalKey) return;
		const { app, settings, i18n } = this.plugin;

		const target = resolveLinkedFile(app, sourceFile, sourceKey);
		if (!target || target.path === sourceFile.path) return;

		const targetFm = getFrontmatter(app, target);
		const existingReciprocal: unknown = targetFm
			? targetFm[reciprocalKey]
			: undefined;
		const existingResolved = resolveLinkedFile(app, target, reciprocalKey);

		// Already correctly back-linked.
		if (existingResolved && existingResolved.path === sourceFile.path) return;

		const isEmpty =
			existingReciprocal === undefined ||
			existingReciprocal === null ||
			existingReciprocal === '' ||
			(Array.isArray(existingReciprocal) && existingReciprocal.length === 0);

		if (isEmpty) {
			await this.writeAndAnnounce(target, reciprocalKey, sourceFile, 'autoLinked');
			return;
		}

		const mode = settings.onConflict;
		if (mode === 'skip') return;

		if (mode === 'auto-update') {
			await this.writeAndAnnounce(target, reciprocalKey, sourceFile, 'updated');
			return;
		}

		// mode === 'prompt'
		const currentText = existingResolved
			? existingResolved.basename
			: stringifyFmValue(existingReciprocal);
		const confirmed = await new Promise<boolean>((resolve) => {
			new ConfirmModal(app, {
				title: i18n.t.modal.confirmReverseTitle,
				message: i18n.format(i18n.t.modal.confirmReverseMessage, {
					target: target.basename,
					key: reciprocalKey,
					current: currentText,
					new: sourceFile.basename,
				}),
				confirmText: i18n.t.modal.confirmReverseConfirm,
				cancelText: i18n.t.modal.confirmReverseCancel,
				onResolve: resolve,
			}).open();
		});
		if (confirmed) {
			await this.writeAndAnnounce(target, reciprocalKey, sourceFile, 'updated');
		}
	}

	private async writeAndAnnounce(
		target: TFile,
		key: string,
		source: TFile,
		noticeKey: 'autoLinked' | 'updated',
	): Promise<void> {
		const { app, settings, i18n } = this.plugin;
		this.markSuppressed(target.path);

		// Pre-update our snapshot to the value we're about to write so the
		// subsequent 'changed' event doesn't look like a fresh user edit.
		const baseline: NavSnapshot = {
			...(this.lastKnownNavValues.get(target.path) ?? { prev: null, next: null }),
		};
		const newValueGuess = `[[${source.basename}]]`;
		if (key === settings.previousKey) baseline.prev = newValueGuess;
		else if (key === settings.nextKey) baseline.next = newValueGuess;
		this.setBaseline(target.path, baseline);

		const newValue = await writeLinkProperty(app, target, key, source);
		// Patch the snapshot with the actual written link text (it may include
		// folder paths if `fileToLinktext` chose to disambiguate).
		const finalBaseline: NavSnapshot = { ...baseline };
		if (key === settings.previousKey) finalBaseline.prev = newValue;
		else if (key === settings.nextKey) finalBaseline.next = newValue;
		this.setBaseline(target.path, finalBaseline);

		new Notice(
			i18n.format(i18n.t.notice[noticeKey], {
				target: target.basename,
				key,
				source: source.basename,
			}),
			5000,
		);
	}

	private markSuppressed(path: string): void {
		const existing = this.suppressTimers.get(path);
		if (existing) window.clearTimeout(existing);
		const id = window.setTimeout(
			() => this.suppressTimers.delete(path),
			SUPPRESSION_MS,
		);
		this.suppressTimers.set(path, id);
	}
}
