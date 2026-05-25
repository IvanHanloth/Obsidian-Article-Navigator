import type { ConflictMode, FloatingStyle, SeeAlsoPosition } from './types';

export interface ArticleNavigatorSettings {
	// Property keys
	previousKey: string;
	nextKey: string;
	seeAlsoKey: string;

	// Display
	inlineEnabled: boolean;
	floatingStyle: FloatingStyle;
	seeAlsoPosition: SeeAlsoPosition;

	// Floating behavior
	floatingIdleFade: boolean;
	floatingIdleSeconds: number;

	// Edge tap navigation
	doubleClickEdgesEnabled: boolean;
	mobileTapNavigate: boolean;

	// New note
	addToNewNotes: boolean;

	// Auto reverse linking
	autoBacklink: boolean;
	onConflict: ConflictMode;

	// Labels — empty string means "use the current locale's default".
	previousLabel: string;
	nextLabel: string;
	seeAlsoLabel: string;
}

export const DEFAULT_SETTINGS: ArticleNavigatorSettings = {
	previousKey: 'PreviousArticle',
	nextKey: 'NextArticle',
	seeAlsoKey: 'SeeAlso',

	inlineEnabled: true,
	floatingStyle: 'tall',
	seeAlsoPosition: 'bottom',

	floatingIdleFade: true,
	floatingIdleSeconds: 3,

	doubleClickEdgesEnabled: false,
	mobileTapNavigate: false,

	addToNewNotes: true,

	autoBacklink: true,
	onConflict: 'prompt',

	previousLabel: '',
	nextLabel: '',
	seeAlsoLabel: '',
};

interface LegacyShape {
	buttonStyle?: 'inline' | 'floating' | 'both' | 'none';
	prioritizeSuggestions?: unknown;
	/** Removed in v1.1 — language always follows Obsidian. */
	language?: unknown;
}

/**
 * Merge stored settings (which may include legacy keys from older versions)
 * onto the current defaults. Never mutates the input object.
 */
export function migrateSettings(
	stored: Partial<ArticleNavigatorSettings> & LegacyShape | null | undefined,
): ArticleNavigatorSettings {
	const merged: Partial<ArticleNavigatorSettings> & LegacyShape = {
		...(stored ?? {}),
	};

	if ('buttonStyle' in merged && !('inlineEnabled' in merged)) {
		switch (merged.buttonStyle) {
			case 'inline':
				merged.inlineEnabled = true;
				merged.floatingStyle = 'none';
				break;
			case 'floating':
				merged.inlineEnabled = false;
				merged.floatingStyle = 'circle';
				break;
			case 'both':
				merged.inlineEnabled = true;
				merged.floatingStyle = 'circle';
				break;
			case 'none':
				merged.inlineEnabled = false;
				merged.floatingStyle = 'none';
				break;
		}
	}
	delete merged.buttonStyle;
	delete merged.prioritizeSuggestions;
	delete merged.language; // language always follows Obsidian now

	return { ...DEFAULT_SETTINGS, ...merged };
}
