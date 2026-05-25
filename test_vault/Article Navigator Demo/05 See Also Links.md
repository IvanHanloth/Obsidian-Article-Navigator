---
PreviousArticle: "[[04 Inline Navigation]]"
NextArticle: "[[06 Auto Backlink]]"
SeeAlso:
  - "[[01 Introduction]]"
  - "[[03 Floating Buttons]]"
  - "[[06 Auto Backlink]]"
tags:
  - article-navigator
  - demo
---

# See Also Links

The **See Also** block renders a styled list of related notes linked from the `SeeAlso` frontmatter key. It is independent of the previous/next chain and can appear at the top or bottom of a note.

## Position options

| Setting value | Result |
|---|---|
| `bottom` | Rendered after the note body, before backlinks (default) |
| `top` | Rendered at the very top of the note body |
| `none` | Hidden |

Change the position in **Settings → Article Navigator → See Also position**.

## Format of the SeeAlso property

The value must be a YAML list (array). Each item can be a plain filename, a wikilink, or a wikilink with an alias:

```yaml
SeeAlso:
  - "[[Another Note]]"
  - "[[Folder/Deep Note|Short name]]"
  - Plain Note Name
```

Duplicates and self-references are silently skipped.

## Things to check on this note

- [ ] See Also block lists *01 Introduction*, *03 Floating Buttons*, *06 Auto Backlink*
- [ ] Hovering a See Also link shows the hover preview
- [ ] Switch position to **top** in settings — block should move above the body text
- [ ] Set position to **none** — block disappears; switch back to **bottom**
- [ ] Add `"[[02 Setting Up Properties]]"` to the `SeeAlso` list and save — it should appear immediately

---

*This is a demo note — safe to edit for testing.*
