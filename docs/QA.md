# QA record

The refactored pack was checked against the working clean build.

## Behaviour tested

- Correct answers open the original French `Bonne réponse !` feedback.
- Incorrect answers open the original French `Mauvaise réponse` feedback.
- The helper letter is never placed in the first answer block.
- The validation button is disabled and muted while incomplete.
- The validation button becomes active when every remaining letter is entered.
- All seven questions in the easy pilot complete successfully.
- The final word `FORMULE` completes the level and opens the victory screen.
- The accepted alternative `FRAYEUR` is still accepted.
- Missions are generated from centralized mission data.
- How to Play cards are generated from centralized tutorial data.

## Visual comparison

Screenshots of Home, Levels, Missions, How to Play and the question screen were compared with the working clean build at 390 × 844 pixels. The pixel difference was 0 for all five screens.

## Responsive checks

No horizontal overflow or JavaScript errors were found at:

- 320 × 700
- 390 × 844
- 768 × 900
- 1280 × 900
