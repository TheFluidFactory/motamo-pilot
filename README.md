# MOTAMO — pilote solo v2

Prototype statique du mode **Classique solo**, prêt pour GitHub Pages.

## Ce que contient cette version

- écran d’ouverture MOTAMO temporaire ;
- page d’accueil avec bouton Jouer ;
- menu inférieur à deux icônes : Missions et Comment jouer ;
- page Missions illustrative avec plusieurs états de récompense ;
- tutoriel visuel sous forme de mini-écrans ;
- sélection de 60 niveaux : 20 Facile, 20 Intermédiaire, 20 Difficile ;
- un niveau jouable par difficulté : FORMULE, CLAVIER et JOURNAL ;
- clavier AZERTY intégré à l’application ;
- réponses affichées dans des cases individuelles ;
- aucune ouverture du clavier natif du téléphone ;
- variantes de réponses de même longueur ;
- collecte partielle de lettres, mot final, vies, victoire et défaite ;
- sauvegarde locale des étoiles.

## Publication avec GitHub Pages

1. Créer un dépôt GitHub public vide nommé `motamo-pilot`.
2. Importer **le contenu de ce dossier** à la racine du dépôt.
3. Ouvrir `Settings` → `Pages`.
4. Sélectionner `Deploy from a branch`.
5. Choisir `main` et `/(root)`.
6. Cliquer sur `Save`.

Le site apparaîtra normalement à l’adresse :

`https://VOTRE-NOM.github.io/motamo-pilot/`

## Fichiers

```text
motamo-pilot/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── data.js
│   └── app.js
├── README.md
└── .nojekyll
```

## Modifier les questions

Les niveaux et questions se trouvent dans `js/data.js`.

Toutes les variantes d’une réponse doivent avoir le même nombre de lettres que la réponse principale, car le nombre de cases est fixe. Les accents ne sont pas nécessaires pour répondre.


## Logo

The supplied MOTAMO logo is stored at `assets/motamo-logo.png` and is used on the splash and home screens.
