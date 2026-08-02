# MOTAMO pilot — scalable source pack

This pack is a structural refactor of the working MOTAMO pilot. It is intended to produce the same visual and gameplay experience while making future changes safer and easier to propagate.

## Uploading

Upload the **contents** of this folder to the root of the existing GitHub Pages repository, replacing the current files. There is no build step, package manager, framework, or server dependency.

## Where to change things

- `js/config.js` — shared rules and constants: lives, question count, keyboard rows, splash timing, displayed level count and difficulty groups.
- `js/data/levels.js` — levels, questions, accepted alternatives and reward letters.
- `js/data/missions.js` — mission cards and their example states.
- `js/data/tutorial.js` — How to Play steps and badges.
- `js/data/copy.js` — reusable interface messages.
- `css/tokens.css` — colours, spacing, shadows, radii and typography variables.
- `css/styles.css` — component and screen styling.
- `js/ui/components.js` — reusable keyboard, lives, stars, answer blocks, mission cards and tutorial cards.
- `js/ui/screens.js` — screen navigation and screen-level rendering.
- `js/game/answers.js` — answer normalization, helper-letter rules and accepted-answer matching.
- `js/game/engine.js` — gameplay sequence, lives, feedback, rewards, final word and results.
- `js/app.js` — small bootstrap file only.

## Important design principle

Content and repeated UI are data-driven. Adding another mission or tutorial step means adding one data object, not copying HTML. Shared game rules live in one config file, and repeating visual elements are rendered by one component function.

See `docs/ARCHITECTURE.md` for the dependency map and safe-change examples.
