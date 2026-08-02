(() => {
  'use strict';
  const M = window.Motamo;

  M.config = Object.freeze({
    storageKey: 'motamo-pilot-v2-progress',
    livesPerLevel: 3,
    questionsPerLevel: 7,
    levelsPerDifficulty: 20,
    splashDurationMs: 2100,
    splashExitMs: 460,
    toastDurationMs: 1900,
    finalRetryResetMs: 520,
    answerSlotWidthPx: 46,
    answerSlotsMaxWidthPx: 360,
    defaultQuestionInteraction: 'text',
    rewardLettersUseAnswerInitial: true,
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    keyboardRows: Object.freeze([
      Object.freeze(['A','Z','E','R','T','Y','U','I','O','P']),
      Object.freeze(['Q','S','D','F','G','H','J','K','L','M']),
      Object.freeze(['W','X','C','V','B','N','BACKSPACE'])
    ]),
    difficultyGroups: Object.freeze([
      Object.freeze({ key: 'easy', label: 'Facile', className: 'easy', description: 'Niveaux d’entrée en matière' }),
      Object.freeze({ key: 'medium', label: 'Intermédiaire', className: 'medium', description: 'Niveaux pour aller plus loin' }),
      Object.freeze({ key: 'hard', label: 'Difficile', className: 'hard', description: 'Niveaux les plus exigeants' }),
      Object.freeze({ key: 'premium', label: 'Premium', className: 'premium', description: 'Packs supplémentaires à débloquer', locked: true })
    ])
  });
})();
