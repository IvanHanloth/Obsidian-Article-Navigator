import { MarkdownView, Plugin, TFile } from "obsidian";

import { registerCommands } from "./commands";
import {
	INJECTED_CLASS,
	INJECTION_REPAIR_INTERVAL_MS,
	NEW_NOTE_INIT_DELAY_MS,
	PLUGIN_LOG_PREFIX,
} from "./constants";
import { I18n } from "./i18n";
import { AutoBacklinkController } from "./nav/auto-backlink";
import { addDefaultPropertiesIfNew } from "./nav/frontmatter";
import {
	type ArticleNavigatorSettings,
	DEFAULT_SETTINGS,
	migrateSettings,
} from "./settings";
import { ArticleNavigatorSettingTab } from "./settings-tab";
import { ViewManager } from "./ui/view-manager";

type LabelKey = "previousLabel" | "nextLabel" | "seeAlsoLabel";

export default class ArticleNavigatorPlugin extends Plugin {
	settings: ArticleNavigatorSettings = DEFAULT_SETTINGS;
	i18n: I18n = new I18n("auto");

	private viewManager!: ViewManager;
	private backlink!: AutoBacklinkController;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.viewManager = new ViewManager(this);
		this.backlink = new AutoBacklinkController(this);

		this.addSettingTab(new ArticleNavigatorSettingTab(this.app, this));
		registerCommands(this);

		this.registerVaultEvents();
		this.registerWorkspaceEvents();
		this.registerMetadataEvents();

		this.app.workspace.onLayoutReady(() => {
			// Prime baselines so the very first user edit isn't swallowed as a
			// fresh-discovery event.
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view instanceof MarkdownView && leaf.view.file) {
					this.backlink.primeBaseline(leaf.view.file);
				}
			});
			this.viewManager.refreshAllViews();
		});

		this.registerInterval(
			window.setInterval(
				() => this.repairMissingInjections(),
				INJECTION_REPAIR_INTERVAL_MS,
			),
		);
	}

	onunload(): void {
		this.viewManager?.cleanupAllViews();
		this.viewManager?.dispose();
		this.backlink?.dispose();
	}

	async loadSettings(): Promise<void> {
		const stored =
			(await this.loadData()) as Partial<ArticleNavigatorSettings> | null;
		this.settings = migrateSettings(stored);
		this.i18n = new I18n("auto");
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
		this.viewManager.refreshAllViews();
	}

	/**
	 * Resolve a user-configurable label, falling back to the current locale's
	 * default when the user hasn't overridden it.
	 */
	localizedLabel(key: LabelKey): string {
		const override = this.settings[key];
		if (override && override.trim().length > 0) return override;
		return this.i18n.t.nav[key];
	}

	openFile(file: TFile, evt?: MouseEvent): void {
		const newLeaf = Boolean(
			evt && (evt.ctrlKey || evt.metaKey || evt.button === 1),
		);
		void this.app.workspace.getLeaf(newLeaf).openFile(file);
	}

	// ---------- Event wiring ----------

	private registerVaultEvents(): void {
		this.registerEvent(
			this.app.vault.on("create", (file) => {
				if (!(file instanceof TFile) || file.extension !== "md") return;
				if (!this.settings.addToNewNotes) return;
				window.setTimeout(() => {
					addDefaultPropertiesIfNew(
						this.app,
						this.settings,
						file,
					).catch((e) => console.error(PLUGIN_LOG_PREFIX, e));
				}, NEW_NOTE_INIT_DELAY_MS);
			}),
		);
	}

	private registerWorkspaceEvents(): void {
		const refresh = () => this.viewManager.scheduleRefresh();
		// 在打开时建立 baseline
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file) this.backlink.primeBaseline(file);
				refresh();
			}),
		);
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", refresh),
		);
		this.registerEvent(this.app.workspace.on("layout-change", refresh));
	}

	private registerMetadataEvents(): void {
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				this.viewManager.scheduleRefresh();
				if (!this.settings.autoBacklink) return;
				if (this.backlink.isSuppressed(file.path)) return;

				// Only trigger when Prev/Next values actually changed. This filters
				// out unrelated frontmatter edits, re-index noise, and the delayed
				// 'changed' Obsidian fires after the plugin's own writes.
				const current = this.backlink.currentSnapshot(file);
				const baseline = this.backlink.getBaseline(file.path);
				if (!baseline) {
					this.backlink.setBaseline(file.path, current);
					return;
				}
				if (
					current.prev === baseline.prev &&
					current.next === baseline.next
				)
					return;
				this.backlink.scheduleCheck(file);
			}),
		);
	}

	/**
	 * Safety net: if Obsidian re-renders a view without firing the events we
	 * listen to, our injected nodes can disappear. Periodically compare the
	 * expected count of injections against what's actually mounted and trigger
	 * a refresh when they diverge downwards.
	 */
	private repairMissingInjections(): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || !view.file) return;
		const expected = this.viewManager.computeExpectedInjections(view.file);
		if (expected === 0) return;
		const actual = view.contentEl.querySelectorAll(
			`.${INJECTED_CLASS}`,
		).length;
		if (actual < expected) this.viewManager.refreshAllViews();
	}
}
