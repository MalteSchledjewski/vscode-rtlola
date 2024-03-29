# RTLola

This extension provides support for the stream-based specification language [RTLola](http://rtlola.org/).

## Features

- highlighting (rough / TextMate grammar based)

![highlighting](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/highlighting.PNG)

- snippets such as

  - `input`
    ![input snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_input.apng)
  - `output`
    ![output snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_output.apng)
  - `trigger`
    ![trigger snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_trigger.apng)
  - `.hold`
    ![hold snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_hold.apng)
  - `.get`
    ![get snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_get.apng)
  - `.offset`
    ![get snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_offset.apng)
  - `.agg`, `.agg_discrete`, `.defaults`
    ![agg, agg_discrete and defaults snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_agg_agg_discrete_defaults.apng)
  - `.agg_exactly`, `.agg_exactly_discrete`
    ![agg_exactly and agg_exactly_discrete snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_agg_exactly_agg_exactly_discrete.apng)
  - `if`
    ![if snippet animation](https://github.com/MalteSchledjewski/vscode-rtlola/raw/main/images/snippets_offset.apng)

- inlay hints showing the inferred types
- go to definition
- show errors
- information on hover

---

## Known Issues

```rtlola
input velo
    : Float64 // this does not highlight because the grammar is restricted to only one line
```

---

## Release Notes

## [0.3.0] - 2023-10-17

- fixed error that started a LS for every open RTLola file
- update to current RTLola language

Read the [full changelog](https://github.com/MalteSchledjewski/vscode-rtlola/blob/main/CHANGELOG.md)

---
