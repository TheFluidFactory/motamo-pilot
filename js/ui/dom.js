(() => {
  'use strict';
  const M = window.Motamo;

  M.ui.collectDom = function collectDom() {
    M.ui.dom = {
      screens: [...document.querySelectorAll('[data-screen]')],
      toast: document.querySelector('#toast'),
      feedbackOverlay: document.querySelector('#feedback-overlay'),
      confirmOverlay: document.querySelector('#confirm-overlay'),
      splash: document.querySelector('#splash'),
      difficultyList: document.querySelector('#difficulty-list'),
      globalProgressText: document.querySelector('#global-progress-text'),
      globalProgressFill: document.querySelector('#global-progress-fill'),
      globalProgressTrack: document.querySelector('#global-progress-track'),
      missionList: document.querySelector('#mission-list'),
      missionTotal: document.querySelector('#mission-total'),
      howGrid: document.querySelector('#how-grid'),
      howBadges: document.querySelector('#how-badges'),
      hudLevel: document.querySelector('#hud-level'),
      hudQuestion: document.querySelector('#hud-question'),
      lives: document.querySelector('#lives'),
      questionType: document.querySelector('#question-type'),
      questionDifficulty: document.querySelector('#question-difficulty'),
      gameQuestion: document.querySelector('#game-question'),
      answerSlots: document.querySelector('#answer-slots'),
      inputMessage: document.querySelector('#input-message'),
      collectionCount: document.querySelector('#collection-count'),
      liveLetterRack: document.querySelector('#live-letter-rack'),
      finalLives: document.querySelector('#final-lives'),
      finalLetterRack: document.querySelector('#final-letter-rack'),
      finalSlots: document.querySelector('#final-slots'),
      finalMessage: document.querySelector('#final-message'),
      victoryWord: document.querySelector('#victory-word'),
      victoryStars: document.querySelector('#victory-stars'),
      victoryCopy: document.querySelector('#victory-copy'),
      defeatReason: document.querySelector('#defeat-reason'),
      defeatWord: document.querySelector('#defeat-word'),
      defeatAnswer: document.querySelector('#defeat-answer'),
      nextLevel: document.querySelector('#next-level'),
      feedbackIcon: document.querySelector('#feedback-icon'),
      feedbackTitle: document.querySelector('#feedback-title'),
      feedbackCopy: document.querySelector('#feedback-copy'),
      earnedLetter: document.querySelector('#earned-letter'),
      feedbackDetail: document.querySelector('#feedback-detail'),
      feedbackContinue: document.querySelector('#feedback-continue')
    };
    return M.ui.dom;
  };
})();
