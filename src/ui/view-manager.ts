import { MarkdownView, type TFile } from 'obsidian';

import { INJECTED_CLASS, REFRESH_DEBOUNCE_MS } from '../constants';
import type ArticleNavigatorPlugin from '../main';
import { getNavData } from '../nav/link-resolver';
import { attachEdgeHandlers, detachEdgeHandlers } from './edge-handlers';
import { removeFloatingForView, updateFloatingForView } from './floating-buttons';
import { injectInline } from './inline-injections';

/**
 * Orchestrates per-view DOM updates. The plugin lifecycle pushes events
 * (file open, layout change, metadata change) into `scheduleRefresh` which
 * debounces a vault-wide pass that:
 *  1. Removes any previously injected elements.
 *  2. Re-resolves the nav data for the active file.
 *  3. Re-renders floating buttons, inline cards, and edge handlers.
 */
export class ViewManager {
	private refreshTimer: number | null = null;

	constructor(private readonly plugin: ArticleNavigatorPlugin) {}

	scheduleRefresh(): void {
		if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
		this.refreshTimer = window.setTimeout(() => {
			this.refreshTimer = null;
			this.refreshAllViews();
		}, REFRESH_DEBOUNCE_MS);
	}

	refreshAllViews(): void {
		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (view instanceof MarkdownView) this.refreshView(view);
		});
	}

	refreshView(view: MarkdownView): void {
		if (!view.contentEl) return;
		view.contentEl
			.querySelectorAll(`.${INJECTED_CLASS}`)
			.forEach((el) => el.remove());

		if (!view.file) {
			removeFloatingForView(view);
			detachEdgeHandlers(view);
			return;
		}

		const data = getNavData(this.plugin.app, this.plugin.settings, view.file);
		updateFloatingForView(this.plugin, view, data);
		injectInline(this.plugin, view, data);
		attachEdgeHandlers(this.plugin, view);
	}

	cleanupAllViews(): void {
		this.plugin.app.workspace.iterateAllLeaves((leaf) => {
			const view = leaf.view;
			if (!(view instanceof MarkdownView) || !view.contentEl) return;
			view.contentEl
				.querySelectorAll(`.${INJECTED_CLASS}`)
				.forEach((el) => el.remove());
			removeFloatingForView(view);
			detachEdgeHandlers(view);
		});
	}

	computeExpectedInjections(file: TFile): number {
		const data = getNavData(this.plugin.app, this.plugin.settings, file);
		let count = 0;
		if (this.plugin.settings.inlineEnabled && (data.prevFile || data.nextFile)) {
			count++;
		}
		if (
			this.plugin.settings.seeAlsoPosition !== 'none' &&
			data.seeAlsoFiles.length > 0
		) {
			count++;
		}
		return count;
	}

	dispose(): void {
		if (this.refreshTimer !== null) {
			window.clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
	}
}
