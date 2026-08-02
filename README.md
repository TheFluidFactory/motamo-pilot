# MOTAMO — pilote solo v1.1

Pack statique prêt à déposer à la racine du dépôt GitHub Pages.

## Publication

1. Décompresser le ZIP.
2. Remplacer le contenu du dépôt par **le contenu du dossier décompressé**.
3. Conserver `index.html`, `css`, `js`, `assets`, `docs` et `.nojekyll` à la racine.
4. Faire un rechargement forcé après la publication.

Aucune dépendance, compilation ou installation npm n’est nécessaire.

## Contenu jouable

- Facile niveau 1 — niveau historique du pilote.
- Facile niveau 2 — niveau `BAVARDE`, avec six questions clavier et un choix multiple.
- Intermédiaire niveau 1 — niveau historique du pilote.
- Difficile niveau 1 — niveau historique du pilote.
- Pack Premium verrouillé — aperçu visuel uniquement.

## Architecture

```text
js/
├── config.js
├── core/              # état, stockage, utilitaires
├── data/              # niveaux, missions, tutoriel, boutique, textes UI
├── game/              # validation, mot final et moteur partagé
├── question-types/    # registre et composants d’interaction
└── ui/                # DOM, composants et écrans
```

Les formats de questions se branchent via `js/question-types/registry.js`. Le moteur de progression, les vies, les récompenses et les écrans de feedback restent communs.

## Interactions de questions

Interactions actuellement enregistrées :

- `text`
- `multipleChoice`

Les indices des réponses clavier sont prédéfinis par `hintIndex`. La valeur doit être `null` pour une réponse d’une lettre. L’indice 0 est interdit.

## Mot final

Le mot final n’utilise plus le clavier AZERTY. Le joueur construit le mot en touchant ou en faisant glisser des lettres depuis :

- la rangée des lettres gagnées ;
- le reste de l’alphabet.

Une lettre placée peut être retirée en la touchant ou en la faisant glisser hors des cases. Le composant est centralisé dans `js/game/final-word-builder.js`; les vies, la validation et la progression restent dans le moteur principal.

## Boutique

La boutique est une maquette. Les boutons n’effectuent aucun paiement et ne débloquent rien.

## Vérifications

Voir `docs/QA.md`, `docs/ARCHITECTURE.md` et `docs/CHANGELOG_PILOT_V1.md`.
