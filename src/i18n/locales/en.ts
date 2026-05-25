import type { Translation } from '../index';

const en: Translation = {
	nav: {
		previousLabel: 'Previous',
		nextLabel: 'Next',
		seeAlsoLabel: 'See also',
		previousAria: 'Previous article',
		nextAria: 'Next article',
		noPrevious: 'No previous article',
		noNext: 'No next article',
		noActiveFile: 'No active file',
	},
	commands: {
		goToPrevious: 'Go to previous article',
		goToNext: 'Go to next article',
		insertProperties: 'Insert navigation properties into current note',
	},
	notice: {
		propertiesAdded: 'Navigation properties added',
		propertiesAlreadyPresent: 'Navigation properties already present',
		autoLinked: 'Auto-linked: "{target}" {key} → "{source}"',
		updated: 'Updated: "{target}" {key} → "{source}"',
	},
	modal: {
		confirmReverseTitle: 'Update reverse link?',
		confirmReverseMessage:
			'"{target}" currently has {key} pointing to "{current}".\n\nUpdate it to point to "{new}"?',
		confirmReverseConfirm: 'Update',
		confirmReverseCancel: 'Skip',
	},
	settings: {
		heading: 'Article Navigator',

		addToNewNotesName: 'Add properties to new notes',
		addToNewNotesDesc:
			'Automatically add Previous / Next / SeeAlso properties to newly created notes.',

		inlineEnabledName: 'Inline navigation at bottom',
		inlineEnabledDesc:
			'Show VitePress-style Previous / Next cards at the bottom of each article.',

		floatingStyleName: 'Floating side buttons',
		floatingStyleDesc:
			'Style of the floating Previous / Next buttons inside the document area.',
		floatingStyleOff: 'Off',
		floatingStyleCircle: 'Circular (centered)',
		floatingStyleTall: 'Tall rectangular (full-height edges)',

		seeAlsoPositionName: 'See Also position',
		seeAlsoPositionDesc: 'Where to render the SeeAlso list within the note.',
		seeAlsoPositionBottom: 'Bottom of the article',
		seeAlsoPositionTop: 'Top of the article',
		seeAlsoPositionHidden: 'Hidden',

		floatingBehaviorHeading: 'Floating button behavior',
		idleFadeName: 'Fade buttons when idle',
		idleFadeDesc:
			'After a period of no interaction, fade the floating buttons. Hovering over them brings them back to full opacity.',
		idleSecondsName: 'Idle fade delay (seconds)',
		idleSecondsDesc: 'How many seconds of inactivity before the buttons fade.',

		tapHeading: 'Tap navigation',
		doubleClickEdgesName: 'Double-click left/right margins to navigate',
		doubleClickEdgesDesc:
			'When enabled, double-clicking the empty area to the left/right of the content navigates to the previous/next article.',
		mobileTapName: 'Tap left/right half on small screens',
		mobileTapDesc:
			'On mobile / small screens, a single tap on the left half navigates to the previous article and the right half navigates to the next.',

		backlinkHeading: 'Auto reverse linking',
		autoBacklinkName: 'Enable auto reverse linking',
		autoBacklinkDesc:
			'When you set Previous/Next on a note, automatically maintain the reciprocal link on the target note.',
		conflictName: 'When target already has a different link',
		conflictDesc:
			'Prompt: ask before overwriting. Auto-update: silently overwrite. Skip: leave the existing value alone.',
		conflictPrompt: 'Prompt for confirmation',
		conflictAuto: 'Auto-update silently (no prompt)',
		conflictSkip: 'Skip silently',

		keysHeading: 'Property keys',
		keysDesc:
			'Customize the frontmatter property names used for navigation. Existing notes using the old keys will not be migrated automatically.',
		previousKeyName: 'Previous article key',
		nextKeyName: 'Next article key',
		seeAlsoKeyName: 'See Also key',

		labelsHeading: 'Display labels',
		labelsDesc: 'Leave a label empty to use the Obsidian-language default.',
		previousLabelName: 'Previous label',
		nextLabelName: 'Next label',
		seeAlsoLabelName: 'See Also label',
	},
};

export default en;
