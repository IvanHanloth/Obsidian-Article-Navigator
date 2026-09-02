import type { MarkdownView, TFile } from 'obsidian';

import { INJECTED_CLASS } from '../constants';
import type ArticleNavigatorPlugin from '../main';
import type { NavData, SeeAlsoTarget } from '../types';

interface InjectionContainer {
	el: HTMLElement;
	mode: 'preview' | 'source';
}

function getInjectionContainers(view: MarkdownView): InjectionContainer[] {
	const containers: InjectionContainer[] = [];
	const previewSizer = view.contentEl.querySelector<HTMLElement>(
		'.markdown-preview-view .markdown-preview-sizer',
	);
	if (previewSizer) containers.push({ el: previewSizer, mode: 'preview' });
	const cmSizer = view.contentEl.querySelector<HTMLElement>(
		'.markdown-source-view .cm-sizer',
	);
	if (cmSizer) containers.push({ el: cmSizer, mode: 'source' });
	return containers;
}

function appendBeforeBacklinks(container: HTMLElement, element: HTMLElement): void {
	const backlinks = container.querySelector<HTMLElement>(
		':scope > .embedded-backlinks',
	);
	if (backlinks) container.insertBefore(element, backlinks);
	else container.appendChild(element);
}

function prependAfterPusher(container: HTMLElement, element: HTMLElement): void {
	const pusher = container.querySelector<HTMLElement>(
		':scope > .markdown-preview-pusher',
	);
	if (pusher) container.insertBefore(element, pusher.nextSibling);
	else container.insertBefore(element, container.firstChild);
}

export function injectInline(
	plugin: ArticleNavigatorPlugin,
	view: MarkdownView,
	data: NavData,
): void {
	const containers = getInjectionContainers(view);
	if (containers.length === 0) return;

	const showInline = plugin.settings.inlineEnabled;
	const showSeeAlso =
		plugin.settings.seeAlsoPosition !== 'none' &&
		data.seeAlsoTargets.length > 0;
	const seeAlsoAtTop = plugin.settings.seeAlsoPosition === 'top';

	for (const { el: container } of containers) {
		if (showSeeAlso && seeAlsoAtTop) {
			const el = buildSeeAlsoElement(plugin, data.seeAlsoTargets);
			el.classList.add('article-nav-seealso-top');
			prependAfterPusher(container, el);
		}
		if (showSeeAlso && !seeAlsoAtTop) {
			const el = buildSeeAlsoElement(plugin, data.seeAlsoTargets);
			el.classList.add('article-nav-seealso-bottom');
			appendBeforeBacklinks(container, el);
		}
		if (showInline && (data.prevFile || data.nextFile)) {
			const el = buildInlineNavElement(plugin, data.prevFile, data.nextFile);
			appendBeforeBacklinks(container, el);
		}
	}
}

function buildInlineNavElement(
	plugin: ArticleNavigatorPlugin,
	prevFile: TFile | null,
	nextFile: TFile | null,
): HTMLElement {
	const root = document.createElement('div');
	root.classList.add('article-nav-inline', INJECTED_CLASS);

	if (prevFile) {
		const prevSlot = document.createElement('div');
		prevSlot.classList.add('article-nav-inline-slot', 'article-nav-inline-prev');
		prevSlot.appendChild(buildInlineLink(plugin, prevFile, 'prev'));
		root.appendChild(prevSlot);
	}

	if (nextFile) {
		const nextSlot = document.createElement('div');
		nextSlot.classList.add('article-nav-inline-slot', 'article-nav-inline-next');
		nextSlot.appendChild(buildInlineLink(plugin, nextFile, 'next'));
		root.appendChild(nextSlot);
	}

	return root;
}

function buildInlineLink(
	plugin: ArticleNavigatorPlugin,
	file: TFile,
	direction: 'prev' | 'next',
): HTMLAnchorElement {
	const a = document.createElement('a');
	a.classList.add('article-nav-inline-link');
	a.setAttribute('href', '#');
	a.setAttribute('data-href', file.path);

	const label = document.createElement('div');
	label.classList.add('article-nav-inline-label');
	const text =
		direction === 'prev'
			? `‹ ${plugin.localizedLabel('previousLabel')}`
			: `${plugin.localizedLabel('nextLabel')} ›`;
	label.textContent = text;

	const title = document.createElement('div');
	title.classList.add('article-nav-inline-title');
	title.textContent = file.basename;

	a.appendChild(label);
	a.appendChild(title);
	a.addEventListener('click', (e) => {
		e.preventDefault();
		plugin.openFile(file, e);
	});
	a.addEventListener('mouseover', (e) => triggerHoverPreview(plugin, e, file, a));
	return a;
}

function buildSeeAlsoElement(
	plugin: ArticleNavigatorPlugin,
	targets: SeeAlsoTarget[],
): HTMLElement {
	const root = document.createElement('div');
	root.classList.add('article-nav-seealso', INJECTED_CLASS);

	const title = document.createElement('div');
	title.classList.add('article-nav-seealso-title');
	title.textContent = plugin.localizedLabel('seeAlsoLabel');
	root.appendChild(title);

	const list = document.createElement('ul');
	list.classList.add('article-nav-seealso-list');
	for (const target of targets) {
		const li = document.createElement('li');
		li.appendChild(
			target.kind === 'external'
				? buildSeeAlsoExternalLink(target.url, target.display)
				: buildSeeAlsoInternalLink(plugin, target.file, target.display),
		);
		list.appendChild(li);
	}
	root.appendChild(list);
	return root;
}

function buildSeeAlsoInternalLink(
	plugin: ArticleNavigatorPlugin,
	file: TFile,
	display: string,
): HTMLAnchorElement {
	const a = document.createElement('a');
	a.classList.add('article-nav-seealso-link', 'internal-link');
	a.setAttribute('href', '#');
	a.setAttribute('data-href', file.path);
	a.textContent = display;
	a.addEventListener('click', (e) => {
		e.preventDefault();
		plugin.openFile(file, e);
	});
	a.addEventListener('mouseover', (e) =>
		triggerHoverPreview(plugin, e, file, a),
	);
	return a;
}

/**
 * Mirrors the markup Obsidian emits for external links in rendered markdown, so
 * clicks are handed to the system browser on both desktop and mobile without
 * any extra wiring.
 */
function buildSeeAlsoExternalLink(
	url: string,
	display: string,
): HTMLAnchorElement {
	const a = document.createElement('a');
	a.classList.add('article-nav-seealso-link', 'external-link');
	a.setAttribute('href', url);
	a.setAttribute('target', '_blank');
	a.setAttribute('rel', 'noopener nofollow');
	a.setAttribute('aria-label', url);
	a.setAttribute('data-tooltip-position', 'top');
	a.textContent = display;
	return a;
}

function triggerHoverPreview(
	plugin: ArticleNavigatorPlugin,
	evt: MouseEvent,
	file: TFile,
	sourceEl: HTMLElement,
): void {
	plugin.app.workspace.trigger('hover-link', {
		event: evt,
		source: 'article-navigator',
		hoverParent: sourceEl,
		targetEl: sourceEl,
		linktext: file.path,
	});
}
