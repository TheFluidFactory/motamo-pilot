# MOTAMO — AI Architecture Guardrails

## Purpose

This file defines durable rules for maintaining and extending MOTAMO.

These rules are intentionally independent of:

- the number of levels;
- the number of screens;
- the current folder structure;
- the current visual design;
- the current set of question types;
- the framework or build tooling used later.

When changing the app, preserve the player experience unless the task explicitly asks for a visible or behavioural change.

---

## 1. Centralise before duplicating

Before adding new code, check whether the same concept already exists elsewhere.

A concept that appears more than once should normally have one source of truth.

Centralise reusable:

- game rules;
- configuration values;
- interface text;
- design tokens;
- content schemas;
- validation logic;
- state transitions;
- reusable UI components;
- question-type behaviour;
- persistence logic;
- navigation logic.

Do not copy and slightly modify an existing component when the difference can be expressed through data, configuration, properties, variants, or composition.

---

## 2. Separate content, rules, state, presentation and interaction

Keep these responsibilities distinct:

### Content

Content includes questions, answers, options, labels, rewards, tutorials, missions and level definitions.

Content should be represented as structured data rather than embedded in rendering or gameplay code.

### Rules

Rules decide what is valid, when a player succeeds, when a life is lost, what is unlocked and how progression works.

Rules should not depend on the visual structure of the page.

### State

State represents the current game session and saved player progress.

State should not be inferred from the DOM.

### Presentation

Presentation decides how information looks.

Visual differences should be controlled through shared styles, tokens, variants and component states rather than repeated inline styling.

### Interaction

Interaction components collect player input.

They should report their state and answer to the shared game engine rather than implementing progression themselves.

---

## 3. Keep one source of truth

Do not store the same fact in multiple places unless there is a clear synchronization strategy.

Examples of facts that should have one authoritative source:

- the current question;
- the selected answer;
- remaining lives;
- earned letters;
- completion state;
- accepted answers;
- question difficulty;
- reward letters;
- interface labels;
- global design values;
- game-wide limits.

The DOM is a view of state, not the source of state.

---

## 4. Use data-driven rendering

Whenever several screens, cards, buttons, levels, questions or options follow the same pattern, generate them from data.

Prefer:

```js
items.map(renderItem)
```

over manually writing every repeated item.

Adding a new content item should usually require editing data, not adding new rendering logic.

---

## 5. Reuse shared screen shells

Screens that share structure should use a common shell.

For question screens, keep shared elements centralised, such as:

- question progress;
- difficulty;
- lives;
- prompt area;
- validation controls;
- feedback;
- reward handling;
- word progression;
- navigation.

Only the interaction area should vary by question type.

Do not create a separate full page implementation for every question type unless the entire screen genuinely behaves differently.

---

## 6. Give every question type the same contract

All question interaction types should expose a consistent interface to the game engine.

A question type should be able to:

```js
mount(context)
getAnswer()
isComplete()
reset()
destroy()
```

Equivalent names are acceptable, but responsibilities must remain consistent.

The shared game engine should decide:

- whether the answer is correct;
- whether a life is lost;
- whether a reward is granted;
- whether feedback is shown;
- when the next question begins.

A question component should not independently advance the level.

---

## 7. Register new types centrally

Question types, screen types and reusable components should be discoverable through a central registry or equivalent mapping.

Example:

```js
const QUESTION_TYPES = {
  text: TextAnswer,
  multipleChoice: MultipleChoice,
  oddOneOut: OddOneOut
};
```

Do not scatter conditional chains throughout the app:

```js
if (type === "text") ...
else if (type === "multipleChoice") ...
else if (type === "oddOneOut") ...
```

A new type should normally require:

1. one self-contained implementation;
2. one registry entry;
3. compatible structured data;
4. focused tests.

---

## 8. Keep validation independent from rendering

Validation must operate on normalized data, not on text scraped from visible elements.

The same answer should validate correctly regardless of:

- capitalization;
- accents, when normalization rules allow it;
- the component used to collect the answer;
- the visual order of elements;
- animation state;
- button styling;
- screen size.

Accepted alternatives belong in content data or central validation rules.

---

## 9. Preserve shared progression behaviour

All question types must use the same central progression system unless a product requirement explicitly says otherwise.

Shared progression includes:

- lives;
- correct and incorrect feedback;
- passing a question;
- reward letters;
- question advancement;
- final-word preparation;
- completion;
- defeat;
- persistence.

Do not duplicate this logic inside individual question components.

---

## 10. Use explicit state transitions

Changes between meaningful app states should happen through named functions or actions.

Prefer:

```js
submitAnswer()
loseLife()
grantReward()
advanceQuestion()
completeLevel()
```

over directly modifying several unrelated variables and DOM elements in multiple places.

A state transition should update state first and then render the result.

---

## 11. Centralise configuration

Values that control behaviour should be configurable rather than repeated as unexplained literals.

Examples:

- starting lives;
- question count;
- level size;
- animation durations;
- timing delays;
- storage keys;
- supported interaction types;
- normalization rules;
- feature flags.

Use named configuration values.

Avoid unexplained magic numbers and repeated strings.

---

## 12. Centralise interface language

Reusable interface text should not be scattered through components.

Examples:

- validation labels;
- error messages;
- feedback titles;
- navigation labels;
- accessibility labels;
- empty states;
- confirmation text.

This supports consistency, editing and future localization.

Dynamic content may still be composed from central templates and runtime values.

---

## 13. Centralise design decisions

Shared design values should come from tokens or equivalent variables.

Centralise:

- colours;
- spacing;
- typography;
- radii;
- shadows;
- animation timing;
- breakpoints;
- touch-target sizes;
- layout widths;
- component states.

Do not introduce a near-duplicate colour, spacing value or button style when an existing token or variant can be used.

Inline styles should be reserved for genuinely dynamic values.

---

## 14. Prefer component variants over copied components

When components differ only in appearance or a small behaviour, use a variant.

Example:

```html
<button class="button button--primary">
<button class="button button--danger">
```

or:

```js
renderButton({ variant: "primary" })
```

Do not create separate implementations for every colour or context.

---

## 15. Keep accessibility inside shared components

Reusable components should own their accessibility behaviour.

This includes:

- semantic roles;
- keyboard support;
- focus management;
- disabled states;
- accessible labels;
- live regions;
- dialog behaviour;
- touch-target sizing.

A new instance of a component should inherit correct accessibility automatically.

---

## 16. Avoid hidden coupling

A module should not rely on undocumented DOM structure, execution order or global side effects.

Avoid:

- reading state from CSS classes;
- simulated clicks or keyboard events to reach internal logic;
- one script patching another script at runtime;
- mutation observers used to synchronize core state;
- duplicate event systems controlling the same action;
- components reaching into unrelated components.

Call shared functions directly through explicit APIs.

---

## 17. Do not patch around the core engine

When a feature changes answer entry, validation, progression or saved state, integrate it into the responsible core module.

Do not add a second layer that intercepts events and tries to imitate the original behaviour.

There should be one authoritative path for:

- entering an answer;
- validating an answer;
- showing feedback;
- applying consequences;
- moving forward.

---

## 18. Keep persistence versionable

Saved data should have a defined schema.

When the schema changes:

- preserve compatible existing data where practical;
- provide a migration or safe fallback;
- avoid silently corrupting progress;
- keep temporary session state separate from durable progress.

Never make DOM structure part of the saved-data format.

---

## 19. Make additions local and predictable

A well-structured feature should require changes in the smallest reasonable number of places.

Adding a new question type should not require editing unrelated screens, storage logic, lives logic and feedback logic.

Adding a new level should normally require content data only.

Adding a new visual variant should normally require a shared style or component variant only.

When a change touches many unrelated files, reconsider the architecture before proceeding.

---

## 20. Maintain backward compatibility by default

Unless the task explicitly requests a change, preserve:

- existing gameplay;
- existing content;
- existing saved progress;
- accepted answers;
- keyboard behaviour;
- feedback behaviour;
- level progression;
- responsive behaviour;
- accessibility behaviour.

Refactoring should not alter the visible experience.

---

## 21. Remove obsolete paths

After replacing an implementation:

- remove the old loader;
- remove unused scripts;
- remove duplicate listeners;
- remove dead styles;
- remove temporary workflows;
- remove compatibility patches that are no longer needed.

Do not leave two systems active for the same responsibility.

---

## 22. Test behaviour, not only syntax

A successful syntax check is not enough.

For changes affecting gameplay, verify at least:

- incomplete answer state;
- complete answer state;
- correct answer;
- incorrect answer;
- accepted alternative;
- life loss;
- reward grant;
- progression to the next question;
- final-word transition;
- keyboard and pointer input;
- small and large screen behaviour.

For a new interaction type, test its shared contract and confirm that the central game engine remains responsible for progression.

---

## 23. Keep changes narrowly scoped

Before editing:

1. identify the current source of truth;
2. identify the smallest responsible module;
3. list the behaviours that must remain unchanged;
4. avoid unrelated cleanup during a functional fix;
5. verify the diff contains only expected changes.

Do not rewrite stable systems merely because another part is being extended.

---

## 24. Document durable decisions

Document architectural decisions that future contributors must preserve.

Good documentation explains:

- ownership of responsibilities;
- component contracts;
- data schemas;
- extension points;
- state flow;
- invariants.

Avoid documentation tied to temporary line numbers, current content counts or short-lived implementation details.

---

## 25. Required checklist for AI changes

Before completing a change, confirm:

- [ ] I reused an existing component or abstraction where appropriate.
- [ ] I did not create a second source of truth.
- [ ] I did not infer core state from the DOM.
- [ ] I kept content separate from gameplay logic.
- [ ] I kept validation separate from rendering.
- [ ] I used shared configuration and design tokens.
- [ ] I preserved existing behaviour not mentioned in the request.
- [ ] I removed obsolete code introduced by the change.
- [ ] I tested the complete user flow affected by the change.
- [ ] I can explain the extension point for future additions.

---

## Core principle

> New content should usually be added as data.  
> New visual forms should usually be added as components.  
> New game rules should usually be added to the central engine.  
> No feature should create a competing path for an existing responsibility.
