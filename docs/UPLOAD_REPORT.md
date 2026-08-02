# MOTAMO pilot v1.3 — upload report

## Upload

Extract the ZIP and upload its contents directly to the repository root, replacing the current files.

No build step, package installation or backend is required.

## Changes from v1.2

Only the two requested interface adjustments were made:

1. **Final-word alphabet bank**
   - `AUTRES LETTRES` now always displays the complete alphabet A–Z, including letters also present in `LETTRES GAGNÉES`.
   - Tile dimensions and the seven-column layout are unchanged.
   - Every displayed tile remains a finite source: once placed, that specific yellow or white tile disappears until removed from the answer.
   - When a final word needs more copies of a letter than the collected tiles plus the complete alphabet provide, the builder adds only the extra copies required to keep the level solvable.

2. **Tutorial page**
   - The four existing tutorial cards and their images are unchanged.
   - The three pills below them were removed.

No gameplay, level, question, hint, shop, mission, navigation, purchase-preview or storage behaviour was changed.
