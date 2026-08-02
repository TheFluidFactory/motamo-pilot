# QA — pilote v1.1

## Vérifications automatisées effectuées

- Syntaxe de tous les fichiers JavaScript avec `node --check`.
- Validation des quatre niveaux et des 28 questions.
- Vérification des réponses principales, variantes et indices prédéfinis.
- Parcours complet du niveau BAVARDE jusqu’à la victoire.
- Choix multiple sans marqueurs A/B/C/D décoratifs.
- Mot final par toucher et glisser-déposer.
- Lettre source masquée pendant le glissement.
- Lettre placée supprimée par toucher et par glissement hors des cases.
- Support des lettres répétées dans BAVARDE.
- Bouton de validation désactivé tant que les sept cases ne sont pas remplies.
- Mauvaise réponse sans révélation de la solution.
- Test des largeurs 320, 390 et 430 pixels sans débordement horizontal.
- Absence d’erreur JavaScript pendant le parcours testé.

## Parcours manuel conseillé après publication

1. Ouvrir Facile niveau 2.
2. Vérifier que VENT affiche toujours le même indice N.
3. Vérifier le choix multiple D sans lettres de repérage A/B/C/D.
4. Jouer les cinq questions clavier suivantes.
5. Donner une mauvaise réponse et vérifier que la solution n’apparaît pas.
6. Sur le mot final, toucher une lettre pour l’ajouter.
7. Faire glisser une lettre vers une case précise.
8. Toucher une lettre placée pour la retirer.
9. Faire glisser une lettre placée hors des cases pour la retirer.
10. Composer BAVARDE et valider.
11. Revenir aux niveaux et vérifier les étoiles sous le niveau 2.
