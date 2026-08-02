(() => {
  'use strict';
  const M = window.Motamo;

  M.core.state = {
    progress: null,
    attempt: null,
    activeScreen: 'home',
    feedbackAction: null,
    toastTimer: null,
    questionController: null,
    finalController: null,

    initialise() {
      this.progress = M.core.storage.loadProgress();
    },

    startAttempt(level) {
      this.questionController?.destroy?.();
      this.finalController?.destroy?.();
      this.questionController = null;
      this.finalController = null;
      this.attempt = {
        level,
        questionIndex: 0,
        lives: M.config.livesPerLevel,
        statuses: Array(M.config.questionsPerLevel).fill(null),
        earned: Array(M.config.questionsPerLevel).fill(null),
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
