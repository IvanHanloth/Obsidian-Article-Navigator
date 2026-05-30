---
tags:
  - article-navigator
  - demo
PreviousArticle: "[[05 See Also Links]]"
NextArticle:
SeeAlso:
  - "[[01 Introduction]]"
  - "[[03 Floating Buttons]]"
---
# Auto Backlink

When you set `PreviousArticle` or `NextArticle` on a note, the plugin can automatically maintain the **reciprocal link** on the target note — so you only have to write one side of the connection.

## How it works

1. You save a note with `NextArticle: "[[B]]"`.
2. The plugin detects that `B`'s `PreviousArticle` does not yet point back to this note.
3. Depending on the **conflict mode**, it either writes the link silently, prompts you, or skips.

## Conflict modes

| Mode | Behaviour |
|---|---|
| **Prompt** | Shows a confirmation dialog before overwriting an existing value *(default)* |
| **Auto-update** | Silently overwrites any existing value |
| **Skip** | Never overwrites; only fills in empty fields |

## Suppression mechanism

To avoid infinite loops, the plugin suppresses `metadata-cache:changed` events for 3 s after writing a link. During that window, further changes to the same file do not re-trigger the auto-backlink check.

## Testing auto backlink

> [!warning] Follow these steps carefully
> The test modifies real frontmatter — undo with `Ctrl/Cmd + Z` afterwards.

**Test A — Empty target field (should auto-fill)**

1. Create a new note called `Test Note A` anywhere in the vault.
2. Run *Insert navigation properties* to seed it with empty keys.
3. On *Test Note A*, set `PreviousArticle: "[[06 Auto Backlink]]"` and save.
4. Open **this** note — `NextArticle` should now point to `Test Note A`.

**Test B — Conflict prompt**

1. Create `Test Note B` with `PreviousArticle: "[[01 Introduction]]"` already set.
2. From *01 Introduction*, set `NextArticle: "[[Test Note B]]"` and save.
3. A dialog should appear asking whether to overwrite `Test Note B`'s `PreviousArticle`.

## Things to check on this note

- [ ] Inline nav shows Previous (*05 See Also Links*) and **no Next card**
- [ ] Left floating button navigates to *05*; right button is hidden
- [ ] See Also lists *01 Introduction* and *03 Floating Buttons*
- [ ] Auto backlink test A completes without a dialog
- [ ] Auto backlink test B shows the confirmation dialog

---

*This is a demo note — safe to edit for testing.*
