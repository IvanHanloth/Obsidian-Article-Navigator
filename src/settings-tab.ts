import {
	App,
	ButtonComponent,
	Notice,
	PluginSettingTab,
	Setting,
} from "obsidian";

import type ArticleNavigatorPlugin from "./main";
import {
	type KeyRename,
	renameFrontmatterKeysAcrossVault,
} from "./nav/frontmatter";
import { DEFAULT_SETTINGS } from "./settings";
import type { ConflictMode, FloatingStyle, SeeAlsoPosition } from "./types";

type KeyField = "previousKey" | "nextKey" | "seeAlsoKey";
const KEY_FIELDS: readonly KeyField[] = [
	"previousKey",
	"nextKey",
	"seeAlsoKey",
] as const;

export class ArticleNavigatorSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private readonly plugin: ArticleNavigatorPlugin,
	) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const t = this.plugin.i18n.t.settings;
		containerEl.empty();

		new Setting(containerEl).setName(t.heading).setHeading();

		new Setting(containerEl)
			.setName(t.addToNewNotesName)
			.setDesc(t.addToNewNotesDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.addToNewNotes)
					.onChange(async (v) => {
						this.plugin.settings.addToNewNotes = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.inlineEnabledName)
			.setDesc(t.inlineEnabledDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.inlineEnabled)
					.onChange(async (v) => {
						this.plugin.settings.inlineEnabled = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.floatingStyleName)
			.setDesc(t.floatingStyleDesc)
			.addDropdown((d) =>
				d
					.addOption("none", t.floatingStyleOff)
					.addOption("circle", t.floatingStyleCircle)
					.addOption("tall", t.floatingStyleTall)
					.setValue(this.plugin.settings.floatingStyle)
					.onChange(async (v) => {
						this.plugin.settings.floatingStyle = v as FloatingStyle;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.seeAlsoPositionName)
			.setDesc(t.seeAlsoPositionDesc)
			.addDropdown((d) =>
				d
					.addOption("bottom", t.seeAlsoPositionBottom)
					.addOption("top", t.seeAlsoPositionTop)
					.addOption("none", t.seeAlsoPositionHidden)
					.setValue(this.plugin.settings.seeAlsoPosition)
					.onChange(async (v) => {
						this.plugin.settings.seeAlsoPosition =
							v as SeeAlsoPosition;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.floatingBehaviorHeading)
			.setHeading();

		new Setting(containerEl)
			.setName(t.idleFadeName)
			.setDesc(t.idleFadeDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.floatingIdleFade)
					.onChange(async (v) => {
						this.plugin.settings.floatingIdleFade = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.idleSecondsName)
			.setDesc(t.idleSecondsDesc)
			.addSlider((s) =>
				s
					.setLimits(1, 15, 1)
					.setValue(this.plugin.settings.floatingIdleSeconds)
					.setDynamicTooltip()
					.onChange(async (v) => {
						this.plugin.settings.floatingIdleSeconds = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName(t.tapHeading).setHeading();

		new Setting(containerEl)
			.setName(t.doubleClickEdgesName)
			.setDesc(t.doubleClickEdgesDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.doubleClickEdgesEnabled)
					.onChange(async (v) => {
						this.plugin.settings.doubleClickEdgesEnabled = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.mobileTapName)
			.setDesc(t.mobileTapDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.mobileTapNavigate)
					.onChange(async (v) => {
						this.plugin.settings.mobileTapNavigate = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName(t.backlinkHeading).setHeading();

		new Setting(containerEl)
			.setName(t.autoBacklinkName)
			.setDesc(t.autoBacklinkDesc)
			.addToggle((tg) =>
				tg
					.setValue(this.plugin.settings.autoBacklink)
					.onChange(async (v) => {
						this.plugin.settings.autoBacklink = v;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t.conflictName)
			.setDesc(t.conflictDesc)
			.addDropdown((d) =>
				d
					.addOption("prompt", t.conflictPrompt)
					.addOption("auto-update", t.conflictAuto)
					.addOption("skip", t.conflictSkip)
					.setValue(this.plugin.settings.onConflict)
					.onChange(async (v) => {
						this.plugin.settings.onConflict = v as ConflictMode;
						await this.plugin.saveSettings();
					}),
			);

		this.renderPropertyKeysSection(containerEl);

		new Setting(containerEl).setName(t.labelsHeading).setHeading();
		containerEl.createEl("p", {
			text: t.labelsDesc,
			cls: "setting-item-description",
		});

		const navStrings = this.plugin.i18n.t.nav;

		new Setting(containerEl).setName(t.previousLabelName).addText((text) =>
			text
				.setPlaceholder(navStrings.previousLabel)
				.setValue(this.plugin.settings.previousLabel)
				.onChange(async (v) => {
					this.plugin.settings.previousLabel = v;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(containerEl).setName(t.nextLabelName).addText((text) =>
			text
				.setPlaceholder(navStrings.nextLabel)
				.setValue(this.plugin.settings.nextLabel)
				.onChange(async (v) => {
					this.plugin.settings.nextLabel = v;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(containerEl).setName(t.seeAlsoLabelName).addText((text) =>
			text
				.setPlaceholder(navStrings.seeAlsoLabel)
				.setValue(this.plugin.settings.seeAlsoLabel)
				.onChange(async (v) => {
					this.plugin.settings.seeAlsoLabel = v;
					await this.plugin.saveSettings();
				}),
		);
	}

	/**
	 * Property-keys block. The three text inputs are *drafts* — nothing is
	 * persisted until the user clicks one of the shared buttons. "Save" just
	 * updates the settings; "Save & rename" additionally rewrites the keys
	 * across every note in the vault. Both buttons are always visible but only
	 * become clickable once at least one key has actually changed.
	 */
	private renderPropertyKeysSection(containerEl: HTMLElement): void {
		const t = this.plugin.i18n.t.settings;
		const i18n = this.plugin.i18n;

		new Setting(containerEl).setName(t.keysHeading).setHeading();
		containerEl.createEl("p", {
			text: t.keysDesc,
			cls: "setting-item-description",
		});

		const draft: Record<KeyField, string> = {
			previousKey: this.plugin.settings.previousKey,
			nextKey: this.plugin.settings.nextKey,
			seeAlsoKey: this.plugin.settings.seeAlsoKey,
		};

		let saveBtn: ButtonComponent | null = null;
		let renameBtn: ButtonComponent | null = null;
		let busy = false;

		const isDirty = (): boolean =>
			KEY_FIELDS.some(
				(field) => draft[field] !== this.plugin.settings[field],
			);

		const refreshButtons = (): void => {
			const dirty = isDirty();
			const enabled = dirty && !busy;
			saveBtn?.setDisabled(!enabled);
			renameBtn?.setDisabled(!enabled);
		};

		const addKeyRow = (
			field: KeyField,
			name: string,
			placeholder: string,
		): void => {
			new Setting(containerEl).setName(name).addText((text) =>
				text
					.setPlaceholder(placeholder)
					.setValue(draft[field])
					.onChange((v) => {
						draft[field] = v;
						refreshButtons();
					}),
			);
		};

		addKeyRow(
			"previousKey",
			t.previousKeyName,
			DEFAULT_SETTINGS.previousKey,
		);
		addKeyRow("nextKey", t.nextKeyName, DEFAULT_SETTINGS.nextKey);
		addKeyRow("seeAlsoKey", t.seeAlsoKeyName, DEFAULT_SETTINGS.seeAlsoKey);

		// Normalise a draft value the same way the legacy onChange did: trim,
		// and fall back to the default if the user cleared the field.
		const normalise = (field: KeyField, raw: string): string =>
			raw.trim() || DEFAULT_SETTINGS[field];

		const buildPending = (): Record<KeyField, string> => ({
			previousKey: normalise("previousKey", draft.previousKey),
			nextKey: normalise("nextKey", draft.nextKey),
			seeAlsoKey: normalise("seeAlsoKey", draft.seeAlsoKey),
		});

		// Returns true if the draft is well-formed (non-empty after trim and
		// no two keys collide). Surfaces a Notice for any failure.
		const validate = (pending: Record<KeyField, string>): boolean => {
			if (KEY_FIELDS.some((field) => pending[field].length === 0)) {
				new Notice(t.keysInvalidNotice);
				return false;
			}
			const seen = new Set<string>();
			for (const field of KEY_FIELDS) {
				if (seen.has(pending[field])) {
					new Notice(t.keysDuplicateNotice);
					return false;
				}
				seen.add(pending[field]);
			}
			return true;
		};

		// Persist the draft into settings. Mirrors back into the draft so the
		// inputs reflect any post-normalisation value (e.g. trimmed whitespace).
		const commitDraft = async (
			pending: Record<KeyField, string>,
		): Promise<void> => {
			let changed = false;
			for (const field of KEY_FIELDS) {
				if (this.plugin.settings[field] !== pending[field]) {
					changed = true;
				}
				this.plugin.settings[field] = pending[field];
				draft[field] = pending[field];
			}
			await this.plugin.saveSettings();
			if (changed) this.plugin.onPropertyKeysChanged();
		};

		const runWithBusy = async (
			work: () => Promise<void>,
		): Promise<void> => {
			busy = true;
			refreshButtons();
			try {
				await work();
			} finally {
				busy = false;
				refreshButtons();
			}
		};

		new Setting(containerEl)
			.addButton((btn) => {
				saveBtn = btn;
				btn.setButtonText(t.keysSaveButton)
					.setTooltip(t.keysSaveTooltip)
					.onClick(async () => {
						if (!isDirty() || busy) return;
						const pending = buildPending();
						if (!validate(pending)) return;
						await runWithBusy(async () => {
							await commitDraft(pending);
							new Notice(t.keysSavedNotice);
						});
					});
			})
			.addButton((btn) => {
				renameBtn = btn;
				btn.setButtonText(t.keysSaveAndRenameButton)
					.setCta()
					.setTooltip(t.keysSaveAndRenameTooltip)
					.onClick(async () => {
						if (!isDirty() || busy) return;
						const pending = buildPending();
						if (!validate(pending)) return;
						// Capture the old keys *before* persisting so we know what to
						// rewrite in the vault.
						const renames: KeyRename[] = KEY_FIELDS.map(
							(field) => ({
								from: this.plugin.settings[field],
								to: pending[field],
							}),
						).filter((r) => r.from !== r.to);
						await runWithBusy(async () => {
							await commitDraft(pending);
							if (renames.length === 0) {
								new Notice(t.keysSavedNotice);
								return;
							}
							new Notice(t.keysRenameStartedNotice);
							const summary =
								await renameFrontmatterKeysAcrossVault(
									this.plugin.app,
									renames,
								);
							const template =
								summary.keysSkipped > 0
									? t.keysRenameDoneWithSkipsNotice
									: t.keysRenameDoneNotice;
							new Notice(
								i18n.format(template, {
									filesUpdated: summary.filesUpdated,
									keysRenamed: summary.keysRenamed,
									keysSkipped: summary.keysSkipped,
								}),
								6000,
							);
						});
					});
			});

		refreshButtons();
	}
}
