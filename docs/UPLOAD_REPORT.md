# MOTAMO pilot v1.1 — upload report

## Upload

Extract the ZIP and upload its contents directly to the repository root.

The root must contain:

- `index.html`
- `.nojekyll`
- `assets/`
- `css/`
- `js/`
- `docs/`
- `README.md`

No build step, npm installation or backend is required.

## Facile level 2

The final word remains `BAVARDE`, with reward order:

`A D B E V A R`

Questions:

1. `VENT` — keyboard, fixed N hint.
2. `D` — multiple choice, no hint.
3. `BALEINE` — keyboard, fixed E hint.
4. `CHAT` — keyboard, fixed A hint.
5. `RAYON` — keyboard, fixed Y hint.
6. `ESCALIER` — keyboard, fixed A hint.
7. `SEL` — keyboard, fixed E hint.

The four anagram questions and their unused renderer were removed.

## Final-word page

The final page now contains:

1. seven empty answer blocks;
2. a row containing the earned letters;
3. a thin separator;
4. the remaining alphabet, excluding the earned letters;
5. the existing Validate button.

Supported actions:

- tap a source letter to place it in the first empty block;
- drag a source letter to a particular block;
- tap a placed letter to remove it;
- drag a placed letter to another block;
- drag a placed letter outside the answer row to remove it.

The source tile is hidden for the duration of a drag, so the stationary duplicate no longer remains visible.

Source letters are reusable. This is intentional: it supports repeated final-word letters without revealing in advance how many times a letter occurs.

## Centralized implementation

The final interaction is isolated in:

`js/game/final-word-builder.js`

It collects and orders letters only. The existing central engine still owns:

- validation;
- lives;
- incorrect-answer consequences;
- victory and defeat;
- saved stars;
- level progression.

No event-interception patch or secondary answer engine was added.

## Other adjustments

- Removed decorative A/B/C/D markers from multiple-choice answers.
- Increased the difficulty-pack subtitle size.
- Updated the tutorial miniature to represent the new final-word interaction.
- Preserved fixed question hints and the no-answer-reveal behaviour.

## Verification

Completed checks:

- JavaScript syntax for every source file.
- Four levels and 28 questions validated.
- Full Facile level 2 playthrough.
- Multiple-choice selection and validation.
- Tap placement.
- Targeted drag placement.
- Source tile hidden during drag.
- Tap removal.
- Drag-out removal.
- Repeated-letter final word `BAVARDE`.
- Successful victory and three-star save.
- 320 px, 390 px and 430 px viewport checks.
- No horizontal overflow.
- No JavaScript runtime or console errors in the tested flow.
