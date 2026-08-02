(() => {
  'use strict';
  const M = window.Motamo;
  M.data.levels = [
    {
      id: 1,
      difficulty: "easy",
      difficultyLabel: "Facile",
      title: "FORMULE",
      word: "FORMULE",
      scramble: ["U", "F", "E", "R", "L", "M", "O"],
      description: "Découverte de la collecte et du mot mystère.",
      questions: [
        { id: "formule-u", type: "Définition", difficulty: 1, prompt: "Ensemble des étoiles, planètes et galaxies.", answer: "Univers", acceptedAnswers: [], rewardLetter: "U" },
        { id: "formule-f", type: "Culture générale", difficulty: 2, prompt: "Quel métal a pour symbole chimique Fe ?", answer: "Fer", acceptedAnswers: [], rewardLetter: "F" },
        { id: "formule-e", type: "Culture générale", difficulty: 1, prompt: "Quel est le plus haut sommet du monde ?", answer: "Everest", acceptedAnswers: [], rewardLetter: "E" },
        { id: "formule-r", type: "Culture générale", difficulty: 1, prompt: "Quel est le plus grand pays du monde ?", answer: "Russie", acceptedAnswers: [], rewardLetter: "R" },
        { id: "formule-l", type: "Devinette", difficulty: 1, prompt: "Je protège les yeux du soleil, mais je ne vois rien.", answer: "Lunettes", acceptedAnswers: [], rewardLetter: "L" },
        { id: "formule-m", type: "Culture générale", difficulty: 1, prompt: "Quelle planète est surnommée la planète rouge ?", answer: "Mars", acceptedAnswers: [], rewardLetter: "M" },
        { id: "formule-o", type: "Culture générale", difficulty: 1, prompt: "Quelle est la capitale du Canada ?", answer: "Ottawa", acceptedAnswers: [], rewardLetter: "O" }
      ]
    },
    {
      id: 2,
      difficulty: "medium",
      difficultyLabel: "Intermédiaire",
      title: "CLAVIER",
      word: "CLAVIER",
      scramble: ["V", "R", "C", "E", "A", "I", "L"],
      description: "Variantes acceptées et difficulté intermédiaire.",
      questions: [
        { id: "clavier-v", type: "Analogie", difficulty: 1, prompt: "Rame est à bateau ce que pédale est à…", answer: "Vélo", acceptedAnswers: [], rewardLetter: "V" },
        { id: "clavier-r", type: "Antonyme", difficulty: 2, prompt: "Quel est l'antonyme d'abondant ?", answer: "Rare", acceptedAnswers: [], rewardLetter: "R" },
        { id: "clavier-c", type: "Synonyme", difficulty: 2, prompt: "Quel est un synonyme de peur ?", answer: "Crainte", acceptedAnswers: ["Frayeur"], rewardLetter: "C" },
        { id: "clavier-e", type: "Culture générale", difficulty: 2, prompt: "Quel est le plus grand volcan actif d'Europe ?", answer: "Etna", acceptedAnswers: [], rewardLetter: "E" },
        { id: "clavier-a", type: "Définition", difficulty: 2, prompt: "Qui est capable de s'adapter.", answer: "Adaptable", acceptedAnswers: [], rewardLetter: "A" },
        { id: "clavier-i", type: "Culture générale", difficulty: 1, prompt: "Quel pays a la forme d'une botte ?", answer: "Italie", acceptedAnswers: [], rewardLetter: "I" },
        { id: "clavier-l", type: "Culture générale", difficulty: 2, prompt: "Quelle est la monnaie du Royaume-Uni ?", answer: "Livre", acceptedAnswers: ["Pound"], rewardLetter: "L" }
      ]
    },
    {
      id: 3,
      difficulty: "hard",
      difficultyLabel: "Difficile",
      title: "JOURNAL",
      word: "JOURNAL",
      scramble: ["O", "J", "R", "A", "U", "L", "N"],
      description: "Questions plus longues et troisième boucle complète.",
      questions: [
        { id: "journal-o", type: "Culture générale", difficulty: 2, prompt: "Quel mammifère pond des œufs ?", answer: "Ornithorynque", acceptedAnswers: [], rewardLetter: "O" },
        { id: "journal-j", type: "Culture générale", difficulty: 2, prompt: "Quel est le premier mois de l'année ?", answer: "Janvier", acceptedAnswers: [], rewardLetter: "J" },
        { id: "journal-r", type: "Antonyme", difficulty: 2, prompt: "Quel est l'antonyme de fragile ?", answer: "Robuste", acceptedAnswers: ["Costaud"], rewardLetter: "R" },
        { id: "journal-a", type: "Expression à compléter", difficulty: 1, prompt: "Mieux vaut être seul que mal…", answer: "Accompagné", acceptedAnswers: [], rewardLetter: "A" },
        { id: "journal-u", type: "Suite logique", difficulty: 1, prompt: "École – Collège – Lycée – …", answer: "Université", acceptedAnswers: [], rewardLetter: "U" },
        { id: "journal-l", type: "Devinette", difficulty: 1, prompt: "Je peux remplir une pièce sans prendre de place.", answer: "Lumière", acceptedAnswers: [], rewardLetter: "L" },
        { id: "journal-n", type: "Analogie", difficulty: 1, prompt: "Soleil est à jour ce que lune est à…", answer: "Nuit", acceptedAnswers: [], rewardLetter: "N" }
      ]
    }
  ];
})();
