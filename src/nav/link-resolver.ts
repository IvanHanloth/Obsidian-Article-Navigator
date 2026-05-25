import type { App, FrontMatterCache, TFile } from 'obsidian';

import type { ArticleNavigatorSettings } from '../settings';
import type { NavData, NavSnapshot } from '../types';

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
	const m = trimmed.match(/^\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]$/);
	if (m && m[1]) return m[1].trim();
	return trimmed;
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

export function resolveLinkedFiles(
	app: App,
	currentFile: TFile,
	key: string,
): TFile[] {
	const fm = getFrontmatter(app, currentFile);
	if (!fm) return [];
	const raw = fm[key] as unknown;
	if (raw == null) return [];
	const values: unknown[] = Array.isArray(raw) ? raw : [raw];

	const result: TFile[] = [];
	const seen = new Set<string>();
	for (const v of values) {
		const linkPath = extractLinkPath(v);
		if (!linkPath) continue;
		const target = app.metadataCache.getFirstLinkpathDest(
			linkPath,
			currentFile.path,
		);
		if (!target || seen.has(target.path)) continue;
		seen.add(target.path);
		result.push(target);
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
		seeAlsoFiles: resolveLinkedFiles(app, file, settings.seeAlsoKey),
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
