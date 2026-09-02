import type { App, FrontMatterCache, TFile } from 'obsidian';

import type { ArticleNavigatorSettings } from '../settings';
import type { NavData, NavSnapshot, SeeAlsoTarget } from '../types';

/** `[[Note]]`, `[[Note#Section]]`, `[[Note#Section|Alias]]`. */
const WIKILINK_RE = /^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]*))?\]\]$/;

/** `[Label](destination)` — the destination may be a URL or an in-vault path. */
const MARKDOWN_LINK_RE = /^\[([^\]]*)\]\(([\s\S]*)\)$/;

/** `[Label](url "title")` / `[Label](url 'title')` — captures the bare url. */
const LINK_DESTINATION_TITLE_RE = /^(\S+)\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/;

/**
 * External destinations. Any `scheme://…` (http, obsidian, zotero, …), the
 * authority-less schemes people actually write by hand, or a bare `www.` host.
 * Requiring `//` keeps note names containing a colon from being mistaken for
 * URLs.
 */
const URL_WITH_AUTHORITY_RE = /^[a-z][a-z0-9+.-]*:\/\//i;
const BARE_SCHEME_RE = /^(?:mailto|tel|sms):/i;
const BARE_HOST_RE = /^www\./i;

/** Schemes that must never become a clickable href. */
const UNSAFE_SCHEME_RE = /^(?:javascript|data|vbscript|blob):/i;

interface ParsedEntry {
	/** Link path (internal) or URL (external). */
	target: string;
	/** Explicit display text from an alias or link label, when given. */
	display: string | null;
	external: boolean;
}

/**
 * Parse a frontmatter value into the link's path portion. Accepts plain strings,
 * `[[Wikilinks]]` (optionally with section anchors and aliases), and arrays
 * (only the first element is considered for single-target resolution).
 */
export function extractLinkPath(value: unknown): string | null {
	if (value == null) return null;
	if (typeof value !== 'string') {
		if (Array.isArray(value)) {
			return value.length > 0 ? extractLinkPath(value[0]) : null;
		}
		return null;
	}
	const trimmed = value.trim();
	if (!trimmed) return null;
	const m = trimmed.match(WIKILINK_RE);
	if (m && m[1]) return m[1].trim();
	return trimmed;
}

export function isExternalLink(value: string): boolean {
	return (
		URL_WITH_AUTHORITY_RE.test(value) ||
		BARE_SCHEME_RE.test(value) ||
		BARE_HOST_RE.test(value) ||
		UNSAFE_SCHEME_RE.test(value)
	);
}

/** Strip `<…>` wrappers and CommonMark titles from a markdown link target. */
function extractLinkDestination(raw: string): string {
	const dest = raw.trim();
	if (dest.startsWith('<') && dest.endsWith('>')) {
		return dest.slice(1, -1).trim();
	}
	const titled = dest.match(LINK_DESTINATION_TITLE_RE);
	return titled && titled[1] ? titled[1] : dest;
}

/** Markdown link destinations are percent-encoded; vault paths are not. */
function decodeVaultPath(path: string): string {
	try {
		return decodeURIComponent(path);
	} catch {
		return path;
	}
}

/**
 * Parse one See Also entry. Supports `[[Wikilinks]]` (with alias),
 * `[Label](url)` markdown links, bare URLs, and plain note names.
 */
function parseSeeAlsoEntry(value: unknown): ParsedEntry | null {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;

	const wiki = trimmed.match(WIKILINK_RE);
	if (wiki && wiki[1]) {
		const alias = wiki[2] ? wiki[2].trim() : '';
		return {
			target: wiki[1].trim(),
			display: alias || null,
			external: false,
		};
	}

	const md = trimmed.match(MARKDOWN_LINK_RE);
	if (md) {
		const destination = extractLinkDestination(md[2] ?? '');
		if (!destination) return null;
		const label = (md[1] ?? '').trim();
		const external = isExternalLink(destination);
		return {
			target: external ? destination : decodeVaultPath(destination),
			display: label || null,
			external,
		};
	}

	return { target: trimmed, display: null, external: isExternalLink(trimmed) };
}

/** Reject unsafe schemes and give bare `www.` hosts a protocol. */
function toSafeUrl(target: string): string | null {
	if (UNSAFE_SCHEME_RE.test(target)) return null;
	if (BARE_HOST_RE.test(target)) return `https://${target}`;
	return target;
}

export function getFrontmatter(
	app: App,
	file: TFile,
): FrontMatterCache | null {
	const cache = app.metadataCache.getFileCache(file);
	return cache && cache.frontmatter ? cache.frontmatter : null;
}

export function resolveLinkedFile(
	app: App,
	currentFile: TFile,
	key: string,
): TFile | null {
	const fm = getFrontmatter(app, currentFile);
	if (!fm) return null;
	const linkPath = extractLinkPath(fm[key]);
	if (!linkPath) return null;
	return app.metadataCache.getFirstLinkpathDest(linkPath, currentFile.path);
}

/**
 * Resolve the See Also list. Entries pointing outside the vault are kept as
 * external URLs instead of being dropped, so a note can mix in-vault notes and
 * web links in one list.
 */
export function resolveSeeAlsoTargets(
	app: App,
	currentFile: TFile,
	key: string,
): SeeAlsoTarget[] {
	const fm = getFrontmatter(app, currentFile);
	if (!fm) return [];
	const raw = fm[key] as unknown;
	if (raw == null) return [];
	const values: unknown[] = Array.isArray(raw) ? raw : [raw];

	const result: SeeAlsoTarget[] = [];
	const seen = new Set<string>();
	for (const value of values) {
		const entry = parseSeeAlsoEntry(value);
		if (!entry) continue;

		if (entry.external) {
			const url = toSafeUrl(entry.target);
			if (!url || seen.has(`url:${url}`)) continue;
			seen.add(`url:${url}`);
			result.push({
				kind: 'external',
				url,
				display: entry.display ?? entry.target,
			});
			continue;
		}

		const file = app.metadataCache.getFirstLinkpathDest(
			entry.target,
			currentFile.path,
		);
		if (!file || seen.has(`file:${file.path}`)) continue;
		seen.add(`file:${file.path}`);
		result.push({
			kind: 'internal',
			file,
			display: entry.display ?? file.basename,
		});
	}
	return result;
}

export function getNavData(
	app: App,
	settings: ArticleNavigatorSettings,
	file: TFile,
): NavData {
	return {
		prevFile: resolveLinkedFile(app, file, settings.previousKey),
		nextFile: resolveLinkedFile(app, file, settings.nextKey),
		seeAlsoTargets: resolveSeeAlsoTargets(app, file, settings.seeAlsoKey),
	};
}

/**
 * Snapshot the raw Prev/Next frontmatter values for change detection. Used by
 * auto-backlink to distinguish real user edits from Obsidian's internal
 * re-indexing events.
 */
export function getNavSnapshot(
	app: App,
	settings: ArticleNavigatorSettings,
	file: TFile,
): NavSnapshot {
	const fm = getFrontmatter(app, file);
	return {
		prev: fm ? fm[settings.previousKey] ?? null : null,
		next: fm ? fm[settings.nextKey] ?? null : null,
	};
}
