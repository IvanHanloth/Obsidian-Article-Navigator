---
tags:
  - article-navigator
  - demo
PreviousArticle: "[[04 Inline Navigation]]"
NextArticle: "[[03 Floating Buttons]]"
SeeAlso:
  - "[[01 Introduction]]"
  - "[[03 Floating Buttons]]"
  - "[[06 Auto Backlink|Auto backlink demo]]"
  - "[Obsidian help](https://help.obsidian.md)"
  - https://obsidian.md
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

The value must be a YAML list (array). Items may mix notes inside the vault with external web links:

```yaml
SeeAlso:
  - "[[Another Note]]"
  - "[[Folder/Deep Note|Short name]]"
  - Plain Note Name
  - https://obsidian.md
  - "[Obsidian help](https://help.obsidian.md)"
  - "[Local note](Folder/Deep%20Note.md)"
  - mailto:someone@example.com
```

| Item form | Rendered as |
|---|---|
| `[[Note]]` / `[[Note\|Alias]]` | Internal link, opens in Obsidian (alias wins as the label) |
| `Plain Note Name` | Internal link |
| `https://…`, `mailto:…`, `obsidian://…`, `www.…` | External link, opens in the system browser |
| `[Label](https://…)` | External link labelled *Label* |
| `[Label](Note.md)` | Internal link labelled *Label* |

Markdown links must be quoted in YAML — an unquoted `[Label](url)` is a YAML parse error.

Duplicates are silently skipped, as are unresolvable notes and unsafe `javascript:` / `data:` URLs.

## Things to check on this note

- [ ] See Also block lists *01 Introduction*, *03 Floating Buttons*, *Auto backlink demo* (alias), *Obsidian help*, and the bare `https://obsidian.md` URL
- [ ] Hovering an internal See Also link shows the hover preview
- [ ] Selecting *Obsidian help* opens the site in the system browser, not inside Obsidian
- [ ] Switch position to **top** in settings — block should move above the body text
- [ ] Set position to **none** — block disappears; switch back to **bottom**
- [ ] Add `"[[02 Setting Up Properties]]"` to the `SeeAlso` list and save — it should appear immediately

---

*This is a demo note — safe to edit for testing.*
