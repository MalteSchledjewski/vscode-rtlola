# Change Log

## [Unreleased]

## [0.3.0] - 2023-10-17

- fixed error that started a LS for every open RTLola file
- update to current RTLola language

## [0.2.0] - 2023-01-30

### Added

- Provide inlay hints with inferred stream type
- Provide hover information

## [0.1.0] - 2021-11-16

### Added

- Added tokenization for constant declarations
- Added basic LSP using the current RTLola frontend
  - "Go to definition" should work in most cases but only for files that parse correctly
  - Diagnostics are shown in VS Code
  - rudimentary completions (all constants, streams, and parameter in the current scope)

## [0.0.3] - 2020-10-27

### Fixed

- Tokenization now checks for word boundaries for trigger, input and output

## [0.0.2] - 2020-10-13

### Added

- Basic snippets
- Highlighting of time literals in `aggregate(over/over_exactly: $time literal$,...`

### Fixed

- Handling of plus and minus within numeric literals (leading & in front of the exponent)

## [0.0.1] - 2020-10-06

- Initial release

[unreleased]: https://github.com/MalteSchledjewski/vscode-rtlola/compare/v0.3.0...HEAD
[0.0.1]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.0.1
[0.0.2]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.0.2
[0.0.3]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.0.3
[0.1.0]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.1.0
[0.2.0]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.2.0
[0.3.0]: https://github.com/MalteSchledjewski/vscode-rtlola/releases/tag/v0.3.0
