import { MarkdownView, Platform } from 'obsidian';

import type ArticleNavigatorPlugin from '../main';
import { resolveLinkedFile } from '../nav/link-resolver';

interface HandlerRecord {
	type: keyof HTMLElementEventMap;
	fn: (e: Event) => void;
	capture: boolean;
}

const handlerRegistry = new WeakMap<HTMLElement, HandlerRecord[]>();

const INTERACTIVE_SELECTOR = [
	'a',
	'button',
	'input',
	'textarea',
	'select',
	'.cm-content',
	'.external-link',
	'.internal-link',
	'.markdown-embed',
	'.callout',
	'.task-list-item-checkbox',
	'.cm-link',
	'.cm-hmd-internal-link',
	'.article-nav-floating-btn',
	'.article-nav-inline-link',
	'.article-nav-seealso-link',
	'.metadata-container',
].join(', ');

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function isSmallScreen(): boolean {
	if (Platform.isMobile || Platform.isPhone) return true;
	return window.innerWidth < 600;
}

export function detachEdgeHandlers(view: MarkdownView): void {
	if (!view.contentEl) return;
	const handlers = handlerRegistry.get(view.contentEl);
	if (!handlers) return;
	for (const { type, fn, capture } of handlers) {
		view.contentEl.removeEventListener(type, fn, capture);
	}
	handlerRegistry.delete(view.contentEl);
}

export function attachEdgeHandlers(
	plugin: ArticleNavigatorPlugin,
	view: MarkdownView,
): void {
	detachEdgeHandlers(view);
	if (!view.contentEl) return;

	const handlers: HandlerRecord[] = [];
	if (plugin.settings.doubleClickEdgesEnabled) {
		const fn = (e: Event) => handleEdgeDblClick(plugin, e as MouseEvent, view);
		view.contentEl.addEventListener('dblclick', fn);
		handlers.push({ type: 'dblclick', fn, capture: false });
	}
	if (plugin.settings.mobileTapNavigate) {
		const fn = (e: Event) => handleMobileTap(plugin, e as MouseEvent, view);
		view.contentEl.addEventListener('dblclick', fn);
		handlers.push({ type: 'dblclick', fn, capture: false });
	}
	if (handlers.length) handlerRegistry.set(view.contentEl, handlers);
}

function handleEdgeDblClick(
	plugin: ArticleNavigatorPlugin,
	e: MouseEvent,
	view: MarkdownView,
): void {
	if (!view.file) return;
	if (isInteractiveTarget(e.target)) return;

	const sizer = view.contentEl.querySelector<HTMLElement>(
		'.markdown-preview-view .markdown-preview-sizer, .markdown-source-view .cm-sizer',
	);
	if (!sizer) return;
	const rect = sizer.getBoundingClientRect();
	const margin = 10;

	if (e.clientX < rect.left - margin) {
		const target = resolveLinkedFile(plugin.app, view.file, plugin.settings.previousKey);
		if (target) {
			e.preventDefault();
			plugin.openFile(target, e);
		}
	} else if (e.clientX > rect.right + margin) {
		const target = resolveLinkedFile(plugin.app, view.file, plugin.settings.nextKey);
		if (target) {
			e.preventDefault();
			plugin.openFile(target, e);
		}
	}
}

function handleMobileTap(
	plugin: ArticleNavigatorPlugin,
	e: MouseEvent,
	view: MarkdownView,
): void {
	if (!view.file) return;
	if (!isSmallScreen()) return;
	if (isInteractiveTarget(e.target)) return;

	const selection = window.getSelection?.();
	if (selection && selection.toString().length > 0) return;

	const half = window.innerWidth / 2;
	const key =
		e.clientX < half ? plugin.settings.previousKey : plugin.settings.nextKey;
	const target = resolveLinkedFile(plugin.app, view.file, key);
	if (target) {
		e.preventDefault();
		plugin.openFile(target, e);
	}
}
