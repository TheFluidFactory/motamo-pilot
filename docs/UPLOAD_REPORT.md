# MOTAMO pilot v1.2 — upload report

## Upload

Décompresser le ZIP et téléverser son contenu directement à la racine du dépôt.

La racine doit contenir :

- `index.html`
- `.nojekyll`
- `assets/`
- `css/`
- `js/`
- `docs/`
- `README.md`

Aucune compilation, installation npm ou infrastructure serveur n’est requise.

## Correction du mot final

Le système ne réutilise plus les lettres comme des boutons générateurs.

Chaque bloc jaune ou blanc est maintenant une source unique :

- placé dans le mot, il disparaît de sa banque ;
- il ne peut pas être placé une deuxième fois ;
- retiré par toucher ou glissement extérieur, il revient dans sa position initiale ;
- durant le glissement, ni la source ni une copie statique dans la case de départ ne restent visibles.

L’implémentation reste centralisée dans `js/game/final-word-builder.js`.

## Correction des récompenses

Le niveau BAVARDE utilise désormais les initiales des réponses :

`VENT, D, BALEINE, AVOCAT, RAYON, ESCALIER, ABEILLE`

soit :

`V D B A R E A`

La règle « récompense = initiale de la réponse principale » est contrôlée centralement pour les 28 questions du pilote.

## Vérification

Tests effectués :

- syntaxe JavaScript ;
- validation des données ;
- parcours complet des sept questions ;
- placement, déplacement et retrait des lettres ;
- impossibilité de dupliquer une source ;
- cas partiel avec cinq lettres gagnées ;
- mot final BAVARDE et victoire ;
- largeurs 320, 390 et 430 pixels ;
- aucune erreur JavaScript ou console pendant les parcours testés.
