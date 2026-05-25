import { App, PluginSettingTab, Setting } from 'obsidian';

import type ArticleNavigatorPlugin from './main';
import { DEFAULT_SETTINGS } from './settings';
import type {
	ConflictMode,
	FloatingStyle,
	SeeAlsoPosition,
} from './types';

export class ArticleNavigatorSettingTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: ArticleNavigatorPlugin) {
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
					.addOption('none', t.floatingStyleOff)
					.addOption('circle', t.floatingStyleCircle)
					.addOption('tall', t.floatingStyleTall)
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
					.addOption('bottom', t.seeAlsoPositionBottom)
					.addOption('top', t.seeAlsoPositionTop)
					.addOption('none', t.seeAlsoPositionHidden)
					.setValue(this.plugin.settings.seeAlsoPosition)
					.onChange(async (v) => {
						this.plugin.settings.seeAlsoPosition = v as SeeAlsoPosition;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName(t.floatingBehaviorHeading).setHeading();

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
					.addOption('prompt', t.conflictPrompt)
					.addOption('auto-update', t.conflictAuto)
					.addOption('skip', t.conflictSkip)
					.setValue(this.plugin.settings.onConflict)
					.onChange(async (v) => {
						this.plugin.settings.onConflict = v as ConflictMode;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl).setName(t.keysHeading).setHeading();
		containerEl.createEl('p', {
			text: t.keysDesc,
			cls: 'setting-item-description',
		});

		new Setting(containerEl).setName(t.previousKeyName).addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.previousKey)
				.setValue(this.plugin.settings.previousKey)
				.onChange(async (v) => {
					this.plugin.settings.previousKey =
						v.trim() || DEFAULT_SETTINGS.previousKey;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(containerEl).setName(t.nextKeyName).addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.nextKey)
				.setValue(this.plugin.settings.nextKey)
				.onChange(async (v) => {
					this.plugin.settings.nextKey =
						v.trim() || DEFAULT_SETTINGS.nextKey;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(containerEl).setName(t.seeAlsoKeyName).addText((text) =>
			text
				.setPlaceholder(DEFAULT_SETTINGS.seeAlsoKey)
				.setValue(this.plugin.settings.seeAlsoKey)
				.onChange(async (v) => {
					this.plugin.settings.seeAlsoKey =
						v.trim() || DEFAULT_SETTINGS.seeAlsoKey;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(containerEl).setName(t.labelsHeading).setHeading();
		containerEl.createEl('p', {
			text: t.labelsDesc,
			cls: 'setting-item-description',
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
}
