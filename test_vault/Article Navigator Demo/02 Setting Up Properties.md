---
tags:
  - article-navigator
  - demo
PreviousArticle: "[[01 Introduction]]"
NextArticle: "[[03 Floating Buttons]]"
SeeAlso: []
---

# Setting Up Navigation Properties

The plugin reads three frontmatter properties from each note. You can customise their names in **Settings → Article Navigator → Property keys**.

## Default property keys

| Property | Default key | Purpose |
|---|---|---|
| Previous | `PreviousArticle` | Link to the preceding note |
| Next | `NextArticle` | Link to the following note |
| See Also | `SeeAlso` | List of related notes (array) |

## Adding properties to an existing note

Run the command **Article Navigator: Insert navigation properties into current note** from the Command Palette (`Ctrl/Cmd + P`).

The command inserts empty `PreviousArticle`, `NextArticle`, and `SeeAlso` keys if they are not already present.

## Automatic insertion on new notes

Enable **Add properties to new notes** in settings. When you create a fresh note with little or no content, the plugin silently seeds it with the three empty keys.

> [!note] The threshold
> "Little or no content" means the file is under 600 bytes total and the body (excluding frontmatter) is under 120 characters. Larger files are assumed to be intentional drafts and are left alone.

## Things to check on this note

- [ ] Inline nav shows Previous (*01 Introduction*) and Next (*03 Floating Buttons*)
- [ ] Both floating buttons are visible and navigate correctly
- [ ] See Also block is **absent** (the `SeeAlso` array is empty)

---

*This is a demo note — safe to edit for testing.*
