import type { Translation } from '../index';

const zh: Translation = {
	nav: {
		previousLabel: '上一篇',
		nextLabel: '下一篇',
		seeAlsoLabel: '相关阅读',
		previousAria: '上一篇文章',
		nextAria: '下一篇文章',
		noPrevious: '没有上一篇文章',
		noNext: '没有下一篇文章',
		noActiveFile: '没有打开的文件',
	},
	commands: {
		goToPrevious: '跳转到上一篇文章',
		goToNext: '跳转到下一篇文章',
		insertProperties: '为当前笔记插入导航属性',
	},
	notice: {
		propertiesAdded: '已添加导航属性',
		propertiesAlreadyPresent: '导航属性已存在',
		autoLinked: '已自动关联：「{target}」的 {key} → 「{source}」',
		updated: '已更新：「{target}」的 {key} → 「{source}」',
	},
	modal: {
		confirmReverseTitle: '更新反向链接？',
		confirmReverseMessage:
			'「{target}」的 {key} 当前指向「{current}」。\n\n是否将其更新为指向「{new}」？',
		confirmReverseConfirm: '更新',
		confirmReverseCancel: '跳过',
	},
	settings: {
		heading: 'Article Navigator（文章导航）',

		addToNewNotesName: '为新笔记添加属性',
		addToNewNotesDesc: '自动为新建笔记添加 Previous / Next / SeeAlso 属性。',

		inlineEnabledName: '底部内联导航',
		inlineEnabledDesc: '在文章底部显示 VitePress 风格的上一篇/下一篇卡片。',

		floatingStyleName: '浮动侧边按钮',
		floatingStyleDesc: '文档区域内浮动「上一篇/下一篇」按钮的样式。',
		floatingStyleOff: '关闭',
		floatingStyleCircle: '圆形（垂直居中）',
		floatingStyleTall: '高条形（贴边满高）',

		seeAlsoPositionName: 'See Also 位置',
		seeAlsoPositionDesc: 'SeeAlso 列表在笔记中的渲染位置。',
		seeAlsoPositionBottom: '文章底部',
		seeAlsoPositionTop: '文章顶部',
		seeAlsoPositionHidden: '隐藏',

		floatingBehaviorHeading: '浮动按钮行为',
		idleFadeName: '空闲时淡出按钮',
		idleFadeDesc: '一段时间无交互后，淡出浮动按钮；鼠标悬停会恢复完全不透明。',
		idleSecondsName: '空闲淡出延迟（秒）',
		idleSecondsDesc: '多少秒无操作后按钮开始淡出。',

		tapHeading: '点击导航',
		doubleClickEdgesName: '双击左右页边距进行导航',
		doubleClickEdgesDesc:
			'启用后，双击内容区左右两侧空白处分别跳转到上一篇/下一篇。',
		mobileTapName: '小屏幕双击左/右半屏',
		mobileTapDesc:
			'在移动端或小屏幕上，双击左半屏跳转到上一篇，双击右半屏跳转到下一篇。单击保持原有的光标定位和编辑行为不变。',

		backlinkHeading: '自动反向链接',
		autoBacklinkName: '启用自动反向链接',
		autoBacklinkDesc:
			'当你在笔记上设置 Previous/Next 时，自动维护目标笔记上的反向链接。',
		conflictName: '目标已存在不同链接时',
		conflictDesc:
			'提示：覆盖前先询问。自动更新：静默覆盖。跳过：保持原值不变。',
		conflictPrompt: '弹窗确认',
		conflictAuto: '静默自动更新',
		conflictSkip: '静默跳过',

		keysHeading: '属性键名',
		keysDesc:
			'自定义用于导航的 frontmatter 属性名。',
		previousKeyName: '上一篇属性键',
		nextKeyName: '下一篇属性键',
		seeAlsoKeyName: 'See Also 属性键',
		keysSaveButton: '保存',
		keysSaveAndRenameButton: '保存并重命名已有笔记',
		keysSaveTooltip:
			'只保存新键名；已有笔记仍然使用旧键名，直到你执行「保存并重命名」。',
		keysSaveAndRenameTooltip:
			'保存新键名，并扫描库中的每个笔记，将旧键名重写为新键名。',
		keysNoChangesNotice: '属性键名没有改动需要保存。',
		keysInvalidNotice: '属性键名不能为空。',
		keysDuplicateNotice: '三个属性键名必须互不相同。',
		keysSavedNotice: '属性键名已保存。',
		keysRenameStartedNotice: '正在重命名库中的属性…',
		keysRenameDoneNotice:
			'已在 {filesUpdated} 个笔记中重命名 {keysRenamed} 个属性。',
		keysRenameDoneWithSkipsNotice:
			'已在 {filesUpdated} 个笔记中重命名 {keysRenamed} 个属性。另有 {keysSkipped} 个属性因目标键名在该笔记中已存在而被跳过。',

		labelsHeading: '显示标签',
		labelsDesc: '留空则使用 Obsidian 当前语言的默认值。',
		previousLabelName: '上一篇标签',
		nextLabelName: '下一篇标签',
		seeAlsoLabelName: 'See Also 标签',
	},
};

export default zh;
