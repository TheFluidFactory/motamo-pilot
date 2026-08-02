# Architecture MOTAMO

## Principe

Le moteur du jeu ne dépend pas du mode de saisie. Chaque question monte un contrôleur d’interaction depuis le registre central.

```text
Question data
    ↓
question-types/registry.js
    ↓
text | anagram | multipleChoice
    ↓
getAnswer() / isComplete() / showIncomplete() / destroy()
    ↓
Shared game engine
    ↓
lives / feedback / reward / next question / final word
```

## Responsabilités

- `js/data/`: contenu uniquement.
- `js/question-types/`: collecte de la réponse uniquement.
- `js/game/answers.js`: validation du contenu et des réponses.
- `js/game/engine.js`: progression et conséquences.
- `js/ui/`: rendu des écrans et composants communs.
- `js/config.js`: règles et groupes globaux.

## Ajouter un type de question

1. Créer un fichier dans `js/question-types/`.
2. Enregistrer une factory avec `M.game.questionTypes.register(name, factory)`.
3. Retourner au minimum :
   - `getAnswer()`
   - `isComplete()`
   - `showIncomplete()`
   - `destroy()`
4. Ajouter la validation de son schéma dans `js/game/answers.js`.
5. Ajouter le script dans `index.html` avant `engine.js`.

Le type ne doit pas modifier les vies, les récompenses ni avancer le niveau lui-même.
