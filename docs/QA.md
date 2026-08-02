# QA — pilote v1.2

## Vérifications automatisées effectuées

- Syntaxe de tous les fichiers JavaScript avec `node --check`.
- Validation des quatre niveaux et des 28 questions.
- Vérification que les 28 récompenses correspondent aux initiales des réponses principales.
- Vérification des variantes et indices prédéfinis existants.
- Parcours complet du niveau BAVARDE jusqu’à la victoire.
- Ordre des récompenses BAVARDE : `V D B A R E A`.
- Une tuile source placée devient invisible et désactivée dans sa banque.
- Une même source ne peut pas être ajoutée deux fois.
- Toucher une lettre placée la retire et réaffiche sa source.
- La source est masquée pendant le glissement.
- La case d’origine est masquée pendant le glissement d’une lettre déjà placée.
- Glisser une lettre hors des cases la retire et la rend à sa banque.
- Composition et validation de `BAVARDE` avec sept sources distinctes.
- Parcours à cinq lettres gagnées : les lettres manquantes V et A restent disponibles en blanc.
- Support des lettres répétées sans source infiniment réutilisable.
- Bouton de validation désactivé tant que les sept cases ne sont pas remplies.
- Test des largeurs 320, 390 et 430 pixels sans débordement horizontal.
- Absence d’erreur JavaScript et d’erreur console pendant les parcours testés.

## Parcours manuel conseillé après publication

1. Ouvrir Facile niveau 2.
2. Vérifier que VENT donne V et affiche toujours le même indice N.
3. Vérifier le choix multiple D.
4. Jouer les questions AVOCAT, RAYON, ESCALIER et ABEILLE.
5. Sur le mot final, placer une tuile et vérifier qu’elle disparaît de sa banque.
6. Essayer de la placer une deuxième fois : cela doit être impossible.
7. Toucher la lettre placée et vérifier qu’elle revient à son emplacement d’origine.
8. Faire glisser une lettre vers une case précise.
9. Faire glisser une lettre placée hors des cases pour la retirer.
10. Composer BAVARDE et valider.
11. Revenir aux niveaux et vérifier les étoiles sous le niveau 2.
