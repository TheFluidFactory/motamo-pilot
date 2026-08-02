# MOTAMO — pilote solo

Prototype statique du mode **Classique solo**, conçu pour tester la boucle centrale :

1. répondre à sept questions ;
2. gagner une lettre configurée pour chaque bonne réponse ;
3. conserver des `?` pour les questions manquées ;
4. retrouver le mot mystère à partir des indices collectés.

## Lancer localement

Ouvrez directement `index.html` dans un navigateur moderne, ou servez le dossier avec :

```bash
python3 -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Publier sur GitHub Pages

1. Créez un dépôt GitHub vide, par exemple `motamo-pilot`.
2. Ajoutez tous les fichiers et dossiers de ce projet à la racine du dépôt.
3. Dans GitHub : **Settings → Pages**.
4. Choisissez **Deploy from a branch**.
5. Sélectionnez **main** et **/(root)**, puis **Save**.

## Fichiers

- `index.html` — structure des écrans.
- `css/styles.css` — design responsive et états visuels.
- `js/data.js` — trois niveaux et vingt-et-une questions.
- `js/app.js` — navigation, validation, vies, lettres, mot final et progression locale.
- `.nojekyll` — évite le traitement Jekyll de GitHub Pages.

## Règles du pilote

- Trois vies par niveau.
- Une mauvaise réponse ou un passage retire une vie et ne donne pas de lettre.
- Le niveau s'arrête immédiatement à zéro vie.
- Après sept questions, les lettres gagnées sont montrées dans un ordre garanti mélangé ; les lettres manquées deviennent `?`.
- Un mot final incorrect retire une vie.
- Les étoiles correspondent aux vies restantes.
- La progression terminée est sauvegardée dans `localStorage`; la tentative active ne l'est pas.

## Ajouter un niveau

Ajoutez un objet dans `window.MOTAMO_LEVELS` dans `js/data.js`.

Contraintes actuelles :

- mot final de sept lettres ;
- aucune lettre répétée ;
- sept questions ;
- `scramble` doit contenir exactement les sept lettres du mot, dans un ordre différent ;
- chaque question porte une `rewardLetter` correspondant à la position équivalente dans `scramble`.
