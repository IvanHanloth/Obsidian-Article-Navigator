import { Notice } from 'obsidian';

import { PLUGIN_LOG_PREFIX } from './constants';
import type ArticleNavigatorPlugin from './main';
import { addDefaultProperties } from './nav/frontmatter';
import { resolveLinkedFile } from './nav/link-resolver';

export function registerCommands(plugin: ArticleNavigatorPlugin): void {
	plugin.addCommand({
		id: 'go-to-previous-article',
		name: plugin.i18n.t.commands.goToPrevious,
		callback: () => navigateTo(plugin, 'previous'),
	});

	plugin.addCommand({
		id: 'go-to-next-article',
		name: plugin.i18n.t.commands.goToNext,
		callback: () => navigateTo(plugin, 'next'),
	});

	plugin.addCommand({
		id: 'insert-article-properties',
		name: plugin.i18n.t.commands.insertProperties,
		callback: () => {
			const file = plugin.app.workspace.getActiveFile();
			if (!file) {
				new Notice(plugin.i18n.t.nav.noActiveFile);
				return;
			}
			addDefaultProperties(plugin.app, plugin.settings, file, true, plugin.i18n).catch(
				(e) => console.error(PLUGIN_LOG_PREFIX, e),
			);
		},
	});
}

function navigateTo(
	plugin: ArticleNavigatorPlugin,
	direction: 'previous' | 'next',
): void {
	const file = plugin.app.workspace.getActiveFile();
	if (!file) return;
	const key =
		direction === 'previous'
			? plugin.settings.previousKey
			: plugin.settings.nextKey;
	const target = resolveLinkedFile(plugin.app, file, key);
	if (!target) {
		new Notice(
			direction === 'previous'
				? plugin.i18n.t.nav.noPrevious
				: plugin.i18n.t.nav.noNext,
		);
		return;
	}
	plugin.openFile(target);
}
