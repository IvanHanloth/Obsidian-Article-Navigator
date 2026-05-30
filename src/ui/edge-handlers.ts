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

// Mobile double-tap allows taps inside the editable content (.cm-content) —
// single taps stay normal (cursor placement / editing) and only a deliberate
// second tap navigates.
const MOBILE_INTERACTIVE_SELECTOR = [
	'a',
	'button',
	'input',
	'textarea',
	'select',
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

const MOBILE_DOUBLE_TAP_MS = 350;
const MOBILE_DOUBLE_TAP_SLOP_PX = 40;

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function isMobileInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest(MOBILE_INTERACTIVE_SELECTOR));
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
		attachMobileDoubleTap(plugin, view, handlers);
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

/**
 * Mobile double-tap navigation. We can't rely on the native `dblclick` event
 * because CodeMirror swallows touch-to-mouse synthesis inside `.cm-content`,
 * so we detect the gesture manually from `touchend`. A `dblclick` fallback
 * remains for non-touch narrow windows (e.g. small desktop layouts).
 */
function attachMobileDoubleTap(
	plugin: ArticleNavigatorPlugin,
	view: MarkdownView,
	handlers: HandlerRecord[],
): void {
	let lastTime = 0;
	let lastX = 0;
	let lastY = 0;

	const navigate = (clientX: number): boolean => {
		if (!view.file) return false;
		const half = window.innerWidth / 2;
		const key =
			clientX < half ? plugin.settings.previousKey : plugin.settings.nextKey;
		const target = resolveLinkedFile(plugin.app, view.file, key);
		if (!target) return false;
		plugin.openFile(target);
		return true;
	};

	const onTouchEnd = (e: TouchEvent) => {
		if (!isSmallScreen()) return;
		if (e.changedTouches.length !== 1 || e.touches.length !== 0) {
			lastTime = 0;
			return;
		}
		const touch = e.changedTouches[0];
		if (!touch) return;
		if (isMobileInteractiveTarget(touch.target)) {
			lastTime = 0;
			return;
		}

		const now = Date.now();
		const dt = now - lastTime;
		const dist = Math.hypot(touch.clientX - lastX, touch.clientY - lastY);

		if (dt > 0 && dt < MOBILE_DOUBLE_TAP_MS && dist < MOBILE_DOUBLE_TAP_SLOP_PX) {
			if (navigate(touch.clientX)) {
				e.preventDefault();
				lastTime = 0;
				return;
			}
		}

		lastTime = now;
		lastX = touch.clientX;
		lastY = touch.clientY;
	};

	const onDblClick = (e: MouseEvent) => {
		if (!isSmallScreen()) return;
		if (isMobileInteractiveTarget(e.target)) return;
		const selection = window.getSelection?.();
		if (selection && selection.toString().length > 0) return;
		if (navigate(e.clientX)) e.preventDefault();
	};

	view.contentEl.addEventListener('touchend', onTouchEnd as (e: Event) => void);
	handlers.push({
		type: 'touchend',
		fn: onTouchEnd as (e: Event) => void,
		capture: false,
	});

	view.contentEl.addEventListener('dblclick', onDblClick as (e: Event) => void);
	handlers.push({
		type: 'dblclick',
		fn: onDblClick as (e: Event) => void,
		capture: false,
	});
}
