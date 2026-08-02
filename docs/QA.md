# QA — pilote v1 étendu

## Vérifications automatisées effectuées

- Syntaxe de tous les fichiers JavaScript avec `node --check`.
- Validation des quatre niveaux et des 28 questions.
- Vérification des réponses principales et variantes acceptées.
- Vérification des banques d’anagrammes, y compris les lettres répétées.
- Vérification des récompenses et des mots finaux.
- Parcours complet du niveau BAVARDE jusqu’à la victoire avec 3 étoiles.
- Validation du mot final BAVARDE, qui contient deux lettres A.
- Réponse clavier avec indice prédéfini.
- Indice identique après redémarrage du niveau.
- Choix multiple : sélection, activation du bouton et bonne réponse.
- Anagramme : placement par toucher et glisser-déposer, puis validation.
- Mauvaise réponse sans révélation de la solution.
- Rendu des quatre groupes de niveaux, des étoiles par niveau, du pack Premium et des quatre cartes boutique.
- Absence d’erreur JavaScript pendant les parcours testés.

## Parcours manuel conseillé après publication

1. Ouvrir Facile niveau 2.
2. Vérifier que VENT affiche toujours le même indice N.
3. Vérifier le choix multiple D.
4. Vérifier la charade et son clavier fixe.
5. Tester une anagramme par toucher puis par glisser-déposer.
6. Donner une mauvaise réponse et vérifier que la solution n’apparaît pas.
7. Terminer le niveau et saisir BAVARDE.
8. Revenir aux niveaux et vérifier les étoiles sous le niveau 2.
9. Ouvrir la Boutique et toucher un prix : seul un message d’aperçu doit apparaître.
