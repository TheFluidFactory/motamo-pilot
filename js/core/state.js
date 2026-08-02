(() => {
  'use strict';
  const M = window.Motamo;

  M.core.state = {
    progress: null,
    attempt: null,
    activeScreen: 'home',
    feedbackAction: null,
    toastTimer: null,

    initialise() {
      this.progress = M.core.storage.loadProgress();
    },

    startAttempt(level) {
      this.attempt = {
        level,
        questionIndex: 0,
        lives: M.config.livesPerLevel,
        statuses: Array(M.config.questionsPerLevel).fill(null),
        earned: Array(M.config.questionsPerLevel).fill(null),
        questionEntry: '',
        questionHintIndex: null,
        finalEntry: '',
        defeatContext: null
      };
      return this.attempt;
    },

    resetProgress() {
      this.progress = M.core.storage.defaultProgress();
      M.core.storage.saveProgress(this.progress);
    }
  };
})();
