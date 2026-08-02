(() => {
  'use strict';
  const M = window.Motamo;
  const state = M.core.state;
  const { renderStars, createMissionCard, createTutorialCard } = M.ui.components;

  function completedCount() {
    return M.data.levels.filter((level) => Number(state.progress.stars[level.id] || 0) > 0).length;
  }

  function renderLevels() {
    const dom = M.ui.dom;
    const completed = completedCount();
    dom.globalProgressText.textContent = `${completed}/${M.data.levels.length} terminés`;
    dom.globalProgressFill.style.width = `${(completed / M.data.levels.length) * 100}%`;
    dom.globalProgressTrack.setAttribute('aria-valuenow', String(completed));
    dom.difficultyList.replaceChildren();

    M.config.difficultyGroups.forEach((group) => {
      const level = M.data.levels.find((candidate) => candidate.difficulty === group.key);
      if (!level) return;
      const stars = Number(state.progress.stars[level.id] || 0);

      const section = document.createElement('section');
      section.className = `difficulty-section ${group.className}`;
      const head = document.createElement('div');
      head.className = 'difficulty-head';
      const title = document.createElement('h3');
      title.innerHTML = `<span>${group.label}</span> · ${level.title}`;
      const starsBox = document.createElement('div');
      starsBox.className = 'difficulty-stars';
      renderStars(starsBox, stars);
      const description = document.createElement('p');
      description.textContent = M.data.copy.levelsPreview;
      head.append(title, starsBox, description);

      const grid = document.createElement('div');
      grid.className = 'level-grid';
      for (let number = 1; number <= M.config.levelsPerDifficulty; number += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'level-tile';
        button.textContent = String(number);
        if (number === 1) {
          button.classList.add('is-playable');
          if (stars > 0) button.classList.add('is-complete');
          button.setAttribute('aria-label', `${group.label}, niveau 1 : ${level.title}`);
          button.addEventListener('click', () => M.game.engine.startLevel(level.id));
        } else {
          button.disabled = true;
          button.setAttribute('aria-label', `${group.label}, niveau ${number}, bientôt disponible`);
        }
        grid.append(button);
      }
      section.append(head, grid);
      dom.difficultyList.append(section);
    });
  }

  function renderMissions() {
    const dom = M.ui.dom;
    const data = M.data.missions;
    dom.missionTotal.textContent = `${data.hero.completed}/${data.hero.total}`;
    dom.missionList.replaceChildren(...data.items.map((item) => createMissionCard(item, state.progress.missionClaimed)));
  }

  function renderTutorial() {
    const dom = M.ui.dom;
    dom.howGrid.replaceChildren(...M.data.tutorial.steps.map(createTutorialCard));
    dom.howBadges.replaceChildren(...M.data.tutorial.badges.map((label) => {
      const badge = document.createElement('span');
      badge.textContent = label;
      return badge;
    }));
  }

  function showToast(message) {
    const dom = M.ui.dom;
    window.clearTimeout(state.toastTimer);
    dom.toast.textContent = message;
    dom.toast.classList.add('show');
    state.toastTimer = window.setTimeout(() => dom.toast.classList.remove('show'), M.config.toastDurationMs);
  }

  function focusScreen(name) {
    const dom = M.ui.dom;
    if (name === 'game') dom.answerSlots.focus({ preventScroll: true });
    else if (name === 'final') dom.finalSlots.focus({ preventScroll: true });
    else dom.screens.find((screen) => screen.dataset.screen === name)?.querySelector('button:not([disabled]), [tabindex="0"]')?.focus({ preventScroll: true });
  }

  function showScreen(name, options = {}) {
    const dom = M.ui.dom;
    state.activeScreen = name;
    dom.screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });
    if (name === 'levels') renderLevels();
    if (name === 'missions') renderMissions();
    M.game.engine?.updateQuestionSubmitButton?.();
    if (options.focus !== false) window.requestAnimationFrame(() => focusScreen(name));
  }

  M.ui.screens = Object.freeze({ completedCount, renderLevels, renderMissions, renderTutorial, showToast, showScreen, focusScreen });
})();
