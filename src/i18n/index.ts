import en from './locales/en';
import zh from './locales/zh';

/**
 * Shape of a translation bundle. Adding a new locale only requires creating a
 * file under `locales/` that satisfies this interface and registering it in
 * `BUNDLES` below.
 */
export interface Translation {
	nav: {
		previousLabel: string;
		nextLabel: string;
		seeAlsoLabel: string;
		previousAria: string;
		nextAria: string;
		noPrevious: string;
		noNext: string;
		noActiveFile: string;
	};
	commands: {
		goToPrevious: string;
		goToNext: string;
		insertProperties: string;
	};
	notice: {
		propertiesAdded: string;
		propertiesAlreadyPresent: string;
		autoLinked: string;
		updated: string;
	};
	modal: {
		confirmReverseTitle: string;
		confirmReverseMessage: string;
		confirmReverseConfirm: string;
		confirmReverseCancel: string;
	};
	settings: {
		heading: string;

		addToNewNotesName: string;
		addToNewNotesDesc: string;

		inlineEnabledName: string;
		inlineEnabledDesc: string;

		floatingStyleName: string;
		floatingStyleDesc: string;
		floatingStyleOff: string;
		floatingStyleCircle: string;
		floatingStyleTall: string;

		seeAlsoPositionName: string;
		seeAlsoPositionDesc: string;
		seeAlsoPositionBottom: string;
		seeAlsoPositionTop: string;
		seeAlsoPositionHidden: string;

		floatingBehaviorHeading: string;
		idleFadeName: string;
		idleFadeDesc: string;
		idleSecondsName: string;
		idleSecondsDesc: string;

		tapHeading: string;
		doubleClickEdgesName: string;
		doubleClickEdgesDesc: string;
		mobileTapName: string;
		mobileTapDesc: string;

		backlinkHeading: string;
		autoBacklinkName: string;
		autoBacklinkDesc: string;
		conflictName: string;
		conflictDesc: string;
		conflictPrompt: string;
		conflictAuto: string;
		conflictSkip: string;

		keysHeading: string;
		keysDesc: string;
		previousKeyName: string;
		nextKeyName: string;
		seeAlsoKeyName: string;

		labelsHeading: string;
		labelsDesc: string;
		previousLabelName: string;
		nextLabelName: string;
		seeAlsoLabelName: string;
	};
}

type LocaleCode = 'en' | 'zh';
export type LocaleSetting = 'auto' | LocaleCode;

const FALLBACK_LOCALE: LocaleCode = 'en';

const BUNDLES: Record<LocaleCode, Translation> = {
	en,
	zh,
};

/**
 * Read Obsidian's UI language from local storage. Obsidian stores it under the
 * key `language`. Falls back to the browser's `navigator.language` and then to
 * the fallback locale.
 */
function detectObsidianLocale(): LocaleCode {
	const fromStorage =
		typeof window !== 'undefined' && window.localStorage
			? window.localStorage.getItem('language')
			: null;
	const candidates = [
		fromStorage,
		typeof navigator !== 'undefined' ? navigator.language : null,
	];
	for (const raw of candidates) {
		if (!raw) continue;
		const lower = raw.toLowerCase();
		if (lower.startsWith('zh')) return 'zh';
		if (lower.startsWith('en')) return 'en';
	}
	return FALLBACK_LOCALE;
}

export function resolveLocale(setting: LocaleSetting): LocaleCode {
	if (setting === 'auto') return detectObsidianLocale();
	if (setting in BUNDLES) return setting;
	return FALLBACK_LOCALE;
}

/**
 * Format a translated string by replacing `{name}` placeholders with the
 * corresponding values from `vars`. Missing keys are left as-is so they're
 * obvious during development.
 */
function format(template: string, vars?: Record<string, string | number>): string {
	if (!vars) return template;
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = vars[key];
		return value === undefined ? match : String(value);
	});
}

/**
 * Thin wrapper around a translation bundle. Created once per settings change so
 * that consumers can call `t.nav.previousLabel` directly without going through
 * a global mutable state.
 */
export class I18n {
	readonly locale: LocaleCode;
	readonly t: Translation;

	constructor(setting: LocaleSetting) {
		this.locale = resolveLocale(setting);
		this.t = BUNDLES[this.locale];
	}

	format(template: string, vars?: Record<string, string | number>): string {
		return format(template, vars);
	}
}
