(() => {
  'use strict';
  const M = window.Motamo;

  function defaultProgress() {
    return { stars: {}, missionClaimed: false };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(M.config.storageKey);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return {
        stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {},
        missionClaimed: Boolean(parsed.missionClaimed)
      };
    } catch (error) {
      console.warn('Progression locale illisible, réinitialisation.', error);
      return defaultProgress();
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(M.config.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.warn('Impossible de sauvegarder la progression.', error);
    }
  }

  M.core.storage = Object.freeze({ defaultProgress, loadProgress, saveProgress });
})();
