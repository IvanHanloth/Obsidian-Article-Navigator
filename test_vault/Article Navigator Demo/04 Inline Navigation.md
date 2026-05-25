---
PreviousArticle: "[[03 Floating Buttons]]"
NextArticle: "[[05 See Also Links]]"
SeeAlso:
  - "[[03 Floating Buttons]]"
  - "[[05 See Also Links]]"
tags:
  - article-navigator
  - demo
---

# Inline Navigation

The inline navigation bar renders a **VitePress-style** Previous / Next card pair at the bottom of each note (in both Reading view and Source view).

## Anatomy of the nav bar

```
┌──────────────────────────────────────────────────────┐
│ ‹ Previous          │           Next ›               │
│  03 Floating Buttons│    05 See Also Links            │
└──────────────────────────────────────────────────────┘
```

- Hovering a card highlights its border and label with the accent colour.
- `Ctrl/Cmd + Click` (or middle-click) opens the target in a new pane.
- Hovering triggers Obsidian's built-in hover preview popup.

## Labels

The text `‹ Previous` and `Next ›` come from the **Display labels** settings. Leave them empty to use the default label for Obsidian's current UI language (English → "Previous / Next", Chinese → "上一篇 / 下一篇").

## Source-view alignment

In Source view, the nav bar inherits the editor's `--file-margins` variable so its left and right edges align with the text.

## Things to check on this note

- [ ] The nav bar appears at the **bottom** of the note in Reading view
- [ ] The nav bar also appears in **Source view** (Live Preview or Source mode)
- [ ] Hover a card — accent-colour highlight and hover preview should appear
- [ ] Middle-click (or Ctrl+click) a card — it should open in a new tab/pane
- [ ] Turn off **Inline navigation** in settings — bar should disappear without a reload
- [ ] See Also shows *03 Floating Buttons* and *05 See Also Links*

---

*This is a demo note — safe to edit for testing.*
