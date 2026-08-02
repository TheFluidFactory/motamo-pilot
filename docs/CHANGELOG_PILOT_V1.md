# Changements du pack pilote v1.2

## Lettres récompenses du pilote

Dans cette version, chaque question donne l’initiale de sa réponse principale.

Cette règle est maintenant vérifiée automatiquement au démarrage. Une incohérence entre la réponse et `rewardLetter` empêche le contenu invalide d’être chargé silencieusement.

Les trois niveaux historiques respectaient déjà cette règle. Le niveau BAVARDE a été corrigé.

## Facile niveau 2 — BAVARDE

Ordre des lettres récompenses : `V D B A R E A`.

Questions :

1. Titre à compléter — `VENT` — récompense V, indice prédéfini N.
2. Position des lettres — `D` — récompense D, choix multiple sans indice.
3. Charade — `BALEINE` — récompense B, indice prédéfini E.
4. Double définition — `AVOCAT` — récompense A, indice prédéfini O.
5. Mot commun — `RAYON` — récompense R, indice prédéfini Y.
6. Devinette — `ESCALIER` — récompense E, indice prédéfini A.
7. Culture générale — `ABEILLE` — récompense A, indice prédéfini E.

Les sept initiales forment une anagramme de `BAVARDE`.

## Inventaire du mot final

- Chaque tuile gagnée ou alphabétique possède désormais une identité propre.
- Une tuile placée disparaît de sa banque et ne peut pas être ajoutée une seconde fois.
- Une tuile retirée revient dans sa position d’origine.
- La source et la case de départ sont masquées pendant le glissement.
- Toucher une lettre placée la retire.
- La faire glisser hors de la rangée de réponse la retire également.
- Déplacer une lettre vers une case occupée échange les deux lettres.
- Les lettres répétées sont gérées avec des exemplaires distincts, sans rendre une même tuile réutilisable.
- Lorsqu’une lettre répétée nécessaire n’a pas été gagnée, un exemplaire blanc correspondant reste disponible afin que le mot final reste résoluble.

## Préservé

- Les trois niveaux historiques.
- Les vies, feedbacks, étoiles et sauvegarde locale.
- Les indices clavier fixes.
- Le choix multiple sans marqueurs A/B/C/D.
- La boutique, les missions, le tutoriel et le pack Premium d’aperçu.
