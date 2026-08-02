(() => {
  'use strict';
  const M = window.Motamo;

  M.data.levels = [
    {
      id: 1,
      levelNumber: 1,
      difficulty: 'easy',
      difficultyLabel: 'Facile',
      title: 'FORMULE',
      word: 'FORMULE',
      scramble: ['U','F','E','R','L','M','O'],
      description: 'Découverte de la collecte et du mot mystère.',
      questions: [
        { id: 'formule-u', type: 'Définition', interaction: 'text', difficulty: 1, prompt: 'Ensemble des étoiles, planètes et galaxies.', answer: 'Univers', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'U' },
        { id: 'formule-f', type: 'Culture générale', interaction: 'text', difficulty: 2, prompt: 'Quel métal a pour symbole chimique Fe ?', answer: 'Fer', acceptedAnswers: [], hintIndex: 1, rewardLetter: 'F' },
        { id: 'formule-e', type: 'Culture générale', interaction: 'text', difficulty: 1, prompt: 'Quel est le plus haut sommet du monde ?', answer: 'Everest', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'E' },
        { id: 'formule-r', type: 'Culture générale', interaction: 'text', difficulty: 1, prompt: 'Quel est le plus grand pays du monde ?', answer: 'Russie', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'R' },
        { id: 'formule-l', type: 'Devinette', interaction: 'text', difficulty: 1, prompt: 'Je protège les yeux du soleil, mais je ne vois rien.', answer: 'Lunettes', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'L' },
        { id: 'formule-m', type: 'Culture générale', interaction: 'text', difficulty: 1, prompt: 'Quelle planète est surnommée la planète rouge ?', answer: 'Mars', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'M' },
        { id: 'formule-o', type: 'Culture générale', interaction: 'text', difficulty: 1, prompt: 'Quelle est la capitale du Canada ?', answer: 'Ottawa', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'O' }
      ]
    },
    {
      id: 4,
      levelNumber: 2,
      difficulty: 'easy',
      difficultyLabel: 'Facile',
      title: 'BAVARDE',
      word: 'BAVARDE',
      scramble: ['A','D','B','E','V','A','R'],
      description: 'Nouveaux formats de questions du pilote.',
      questions: [
        {
          id: 'bavarde-a',
          type: 'Compléter un titre',
          interaction: 'text',
          difficulty: 1,
          prompt: 'Autant en emporte le ... ?',
          answer: 'Vent',
          acceptedAnswers: [],
          hintIndex: 2,
          rewardLetter: 'A'
        },
        {
          id: 'bavarde-d',
          type: 'Position des lettres',
          interaction: 'multipleChoice',
          difficulty: 1,
          prompt: 'Quelle lettre précède sa voisine d’alphabet dans « escapade » ?',
          answer: 'D',
          acceptedAnswers: [],
          hintIndex: null,
          options: [
            { id: 'a', label: 'A', value: 'A' },
            { id: 'c', label: 'C', value: 'C' },
            { id: 'd', label: 'D', value: 'D' },
            { id: 'e', label: 'E', value: 'E' }
          ],
          rewardLetter: 'D'
        },
        {
          id: 'bavarde-b',
          type: 'Charade',
          interaction: 'text',
          difficulty: 2,
          prompt: 'Mon premier est le contraire de haut, mon deuxième est donné par la vache, mon troisième se fait quand on noue une ficelle, mon tout est un mammifère vivant dans l’océan.',
          answer: 'Baleine',
          acceptedAnswers: [],
          hintIndex: 3,
          rewardLetter: 'B'
        },
        {
          id: 'bavarde-e',
          type: 'Mot caché',
          interaction: 'text',
          difficulty: 1,
          prompt: 'Quel animal de quatre lettres est caché au début du mot « château » ?',
          answer: 'Chat',
          acceptedAnswers: [],
          hintIndex: 2,
          rewardLetter: 'E'
        },
        {
          id: 'bavarde-v',
          type: 'Mot commun',
          interaction: 'text',
          difficulty: 1,
          prompt: 'Quel mot complète ces trois expressions : ___ de soleil, ___ de vélo, ___ de supermarché ?',
          answer: 'Rayon',
          acceptedAnswers: [],
          hintIndex: 2,
          rewardLetter: 'V'
        },
        {
          id: 'bavarde-a2',
          type: 'Devinette',
          interaction: 'text',
          difficulty: 1,
          prompt: 'Je monte et je descends, mais je ne bouge jamais. Qui suis-je ?',
          answer: 'Escalier',
          acceptedAnswers: [],
          hintIndex: 3,
          rewardLetter: 'A'
        },
        {
          id: 'bavarde-r',
          type: 'Mot commun',
          interaction: 'text',
          difficulty: 1,
          prompt: 'Quel mot de trois lettres peut être de mer, de table ou fin ?',
          answer: 'Sel',
          acceptedAnswers: [],
          hintIndex: 1,
          rewardLetter: 'R'
        }
      ]
    },
    {
      id: 2,
      levelNumber: 1,
      difficulty: 'medium',
      difficultyLabel: 'Intermédiaire',
      title: 'CLAVIER',
      word: 'CLAVIER',
      scramble: ['V','R','C','E','A','I','L'],
      description: 'Variantes acceptées et difficulté intermédiaire.',
      questions: [
        { id: 'clavier-v', type: 'Analogie', interaction: 'text', difficulty: 1, prompt: 'Rame est à bateau ce que pédale est à…', answer: 'Vélo', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'V' },
        { id: 'clavier-r', type: 'Antonyme', interaction: 'text', difficulty: 2, prompt: "Quel est l'antonyme d'abondant ?", answer: 'Rare', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'R' },
        { id: 'clavier-c', type: 'Synonyme', interaction: 'text', difficulty: 2, prompt: 'Quel est un synonyme de peur ?', answer: 'Crainte', acceptedAnswers: ['Frayeur'], hintIndex: 1, rewardLetter: 'C' },
        { id: 'clavier-e', type: 'Culture générale', interaction: 'text', difficulty: 2, prompt: "Quel est le plus grand volcan actif d'Europe ?", answer: 'Etna', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'E' },
        { id: 'clavier-a', type: 'Définition', interaction: 'text', difficulty: 2, prompt: "Qui est capable de s'adapter.", answer: 'Adaptable', acceptedAnswers: [], hintIndex: 3, rewardLetter: 'A' },
        { id: 'clavier-i', type: 'Culture générale', interaction: 'text', difficulty: 1, prompt: "Quel pays a la forme d'une botte ?", answer: 'Italie', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'I' },
        { id: 'clavier-l', type: 'Culture générale', interaction: 'text', difficulty: 2, prompt: 'Quelle est la monnaie du Royaume-Uni ?', answer: 'Livre', acceptedAnswers: ['Pound'], hintIndex: null, rewardLetter: 'L' }
      ]
    },
    {
      id: 3,
      levelNumber: 1,
      difficulty: 'hard',
      difficultyLabel: 'Difficile',
      title: 'JOURNAL',
      word: 'JOURNAL',
      scramble: ['O','J','R','A','U','L','N'],
      description: 'Questions plus longues et troisième boucle complète.',
      questions: [
        { id: 'journal-o', type: 'Culture générale', interaction: 'text', difficulty: 2, prompt: 'Quel mammifère pond des œufs ?', answer: 'Ornithorynque', acceptedAnswers: [], hintIndex: 3, rewardLetter: 'O' },
        { id: 'journal-j', type: 'Culture générale', interaction: 'text', difficulty: 2, prompt: "Quel est le premier mois de l'année ?", answer: 'Janvier', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'J' },
        { id: 'journal-r', type: 'Antonyme', interaction: 'text', difficulty: 2, prompt: "Quel est l'antonyme de fragile ?", answer: 'Robuste', acceptedAnswers: ['Costaud'], hintIndex: 1, rewardLetter: 'R' },
        { id: 'journal-a', type: 'Expression à compléter', interaction: 'text', difficulty: 1, prompt: 'Mieux vaut être seul que mal…', answer: 'Accompagné', acceptedAnswers: [], hintIndex: 3, rewardLetter: 'A' },
        { id: 'journal-u', type: 'Suite logique', interaction: 'text', difficulty: 1, prompt: 'École – Collège – Lycée – …', answer: 'Université', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'U' },
        { id: 'journal-l', type: 'Devinette', interaction: 'text', difficulty: 1, prompt: 'Je peux remplir une pièce sans prendre de place.', answer: 'Lumière', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'L' },
        { id: 'journal-n', type: 'Analogie', interaction: 'text', difficulty: 1, prompt: 'Soleil est à jour ce que lune est à…', answer: 'Nuit', acceptedAnswers: [], hintIndex: 2, rewardLetter: 'N' }
      ]
    }
  ];
})();
