import type { MarkdownView, TFile } from 'obsidian';

import { FLOATING_CLASS, HOST_CLASS } from '../constants';
import type ArticleNavigatorPlugin from '../main';
import type { FloatingStyle, NavData } from '../types';

interface FloatingButtonState {
	target: TFile | null;
	hovered: boolean;
}

const buttonState = new WeakMap<HTMLElement, FloatingButtonState>();
const idleTimers = new WeakMap<HTMLElement, number>();
const hoverAttached = new WeakSet<HTMLElement>();

function ensureState(btn: HTMLElement): FloatingButtonState {
	let s = buttonState.get(btn);
	if (!s) {
		s = { target: null, hovered: false };
		buttonState.set(btn, s);
	}
	return s;
}

export function removeFloatingForView(view: MarkdownView): void {
	if (!view.contentEl) return;
	const container = view.contentEl.querySelector<HTMLElement>(
		`:scope > .${FLOATING_CLASS}`,
	);
	if (container) {
		clearIdleTimer(container);
		container.remove();
	}
	view.contentEl.classList.remove(HOST_CLASS);
}

export function updateFloatingForView(
	plugin: ArticleNavigatorPlugin,
	view: MarkdownView,
	data: NavData,
): void {
	const style = plugin.settings.floatingStyle;
	const show = style !== 'none' && Boolean(data.prevFile || data.nextFile);

	let container = view.contentEl.querySelector<HTMLElement>(
		`:scope > .${FLOATING_CLASS}`,
	);

	if (!show) {
		if (container) {
			clearIdleTimer(container);
			container.remove();
		}
		view.contentEl.classList.remove(HOST_CLASS);
		return;
	}

	// Recreate the container if the style changed.
	if (container && container.dataset.navStyle !== style) {
		clearIdleTimer(container);
		container.remove();
		container = null;
	}

	if (!container) {
		container = createFloatingContainer(plugin, style);
		container.dataset.navStyle = style;
		view.contentEl.appendChild(container);
		view.contentEl.classList.add(HOST_CLASS);
		setupHoverHandlers(plugin, container);
	}

	const prevBtn = container.querySelector<HTMLButtonElement>(
		'.article-nav-floating-prev',
	);
	const nextBtn = container.querySelector<HTMLButtonElement>(
		'.article-nav-floating-next',
	);
	if (!prevBtn || !nextBtn) return;

	const i18n = plugin.i18n;
	const prevLabel = plugin.localizedLabel('previousLabel');
	const nextLabel = plugin.localizedLabel('nextLabel');

	ensureState(prevBtn).target = data.prevFile;
	ensureState(nextBtn).target = data.nextFile;
	prevBtn.classList.toggle('is-hidden', !data.prevFile);
	nextBtn.classList.toggle('is-hidden', !data.nextFile);
	prevBtn.title = data.prevFile ? `${prevLabel}: ${data.prevFile.basename}` : '';
	nextBtn.title = data.nextFile ? `${nextLabel}: ${data.nextFile.basename}` : '';
	prevBtn.setAttribute('aria-label', i18n.t.nav.previousAria);
	nextBtn.setAttribute('aria-label', i18n.t.nav.nextAria);

	resetIdleState(plugin, container);
}

function createFloatingContainer(
	plugin: ArticleNavigatorPlugin,
	style: FloatingStyle,
): HTMLElement {
	const container = document.createElement('div');
	container.classList.add(FLOATING_CLASS, `${FLOATING_CLASS}-${style}`);
	container.appendChild(createFloatingButton(plugin, 'prev', style));
	container.appendChild(createFloatingButton(plugin, 'next', style));
	return container;
}

function createFloatingButton(
	plugin: ArticleNavigatorPlugin,
	direction: 'prev' | 'next',
	style: FloatingStyle,
): HTMLButtonElement {
	const btn = document.createElement('button');
	btn.classList.add(
		'article-nav-floating-btn',
		`article-nav-floating-${direction}`,
		`article-nav-floating-btn-${style}`,
	);
	btn.setAttribute(
		'aria-label',
		direction === 'prev'
			? plugin.i18n.t.nav.previousAria
			: plugin.i18n.t.nav.nextAria,
	);

	const svgNS = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(svgNS, 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('width', '22');
	svg.setAttribute('height', '22');
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'currentColor');
	svg.setAttribute('stroke-width', '2.2');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-linejoin', 'round');

	const polyline = document.createElementNS(svgNS, 'polyline');
	polyline.setAttribute(
		'points',
		direction === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6',
	);
	svg.appendChild(polyline);
	btn.appendChild(svg);

	if (style === 'tall') {
		const bg = document.createElement('div');
		bg.classList.add('article-nav-floating-btn-tall-bg');
		btn.appendChild(bg);

		const strip = document.createElement('div');
		strip.classList.add('article-nav-tall-click-strip');
		strip.appendChild(svg);
		btn.appendChild(strip);

		strip.addEventListener('click', (e) => {
			const target = buttonState.get(btn)?.target;
			if (target) plugin.openFile(target, e);
		});
		strip.addEventListener('mouseenter', () => {
			if (btn.classList.contains('is-hidden')) return;
			btn.classList.add('is-hovered');
			ensureState(btn).hovered = true;
		});
		strip.addEventListener('mouseleave', () => {
			btn.classList.remove('is-hovered');
			ensureState(btn).hovered = false;
		});
	} else {
		btn.addEventListener('click', (e) => {
			const target = buttonState.get(btn)?.target;
			if (target) plugin.openFile(target, e);
		});
	}
	return btn;
}

// ---------- Idle fade behavior ----------

function setupHoverHandlers(
	plugin: ArticleNavigatorPlugin,
	container: HTMLElement,
): void {
	if (hoverAttached.has(container)) return;
	hoverAttached.add(container);
	const buttons = container.querySelectorAll<HTMLElement>(
		'.article-nav-floating-btn',
	);
	for (const btn of Array.from(buttons)) {
		const target =
			btn.querySelector<HTMLElement>('.article-nav-tall-click-strip') ?? btn;
		target.addEventListener('mouseenter', () => {
			clearIdleTimer(container);
			container.classList.remove('is-idle');
		});
		target.addEventListener('mouseleave', () => {
			scheduleIdleFade(plugin, container);
		});
	}
}

function scheduleIdleFade(
	plugin: ArticleNavigatorPlugin,
	container: HTMLElement,
): void {
	clearIdleTimer(container);
	if (!plugin.settings.floatingIdleFade) return;
	const ms = Math.max(300, plugin.settings.floatingIdleSeconds * 1000);
	const id = window.setTimeout(() => {
		container.classList.add('is-idle');
	}, ms);
	idleTimers.set(container, id);
}

function clearIdleTimer(container: HTMLElement): void {
	const id = idleTimers.get(container);
	if (id) {
		window.clearTimeout(id);
		idleTimers.delete(container);
	}
}

function resetIdleState(
	plugin: ArticleNavigatorPlugin,
	container: HTMLElement,
): void {
	clearIdleTimer(container);
	container.classList.remove('is-idle');
	if (plugin.settings.floatingIdleFade) {
		scheduleIdleFade(plugin, container);
	}
}
