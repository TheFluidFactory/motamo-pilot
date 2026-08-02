(() => {
  'use strict';
  const M = window.Motamo;
  const state = M.core.state;
  const { renderStars, createMissionCard, createTutorialCard, createShopPack } = M.ui.components;
  const { svgUse } = M.core.utils;

  function completedCount() {
    return M.data.levels.filter((level) => Number(state.progress.stars[level.id] || 0) > 0).length;
  }

  function createLevelTile(group, number, level) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'level-tile';

    const numberLabel = document.createElement('span');
    numberLabel.className = 'level-number';
    numberLabel.textContent = String(number);
    button.append(numberLabel);

    const tileStars = document.createElement('span');
    tileStars.className = 'level-tile-stars';
    renderStars(tileStars, level ? Number(state.progress.stars[level.id] || 0) : 0);
    button.append(tileStars);

    if (level) {
      button.classList.add('is-playable');
      if (Number(state.progress.stars[level.id] || 0) > 0) button.classList.add('is-complete');
      button.setAttribute('aria-label', `${group.label}, niveau ${number}`);
      button.addEventListener('click', () => M.game.engine.startLevel(level.id));
    } else {
      button.disabled = true;
      if (group.locked) {
        const lock = svgUse('i-lock', 'level-lock');
        button.append(lock);
        button.setAttribute('aria-label', `${group.label}, niveau ${number}, verrouillé`);
      } else {
        button.setAttribute('aria-label', `${group.label}, niveau ${number}, bientôt disponible`);
      }
    }
    return button;
  }

  function renderLevels() {
    const dom = M.ui.dom;
    const completed = completedCount();
    const total = M.data.levels.length;
    dom.globalProgressText.textContent = `${completed}/${total} terminés`;
    dom.globalProgressFill.style.width = `${total ? (completed / total) * 100 : 0}%`;
    dom.globalProgressTrack.setAttribute('aria-valuemax', String(total));
    dom.globalProgressTrack.setAttribute('aria-valuenow', String(completed));
    dom.difficultyList.replaceChildren();

    M.config.difficultyGroups.forEach((group) => {
      const levels = M.data.levels.filter((level) => level.difficulty === group.key);
      const levelByNumber = new Map(levels.map((level) => [level.levelNumber, level]));

      const section = document.createElement('section');
      section.className = `difficulty-section ${group.className}`;

      const head = document.createElement('div');
      head.className = 'difficulty-head';
      const title = document.createElement('h3');
      const titleText = document.createElement('span');
      titleText.textContent = group.label;
      title.append(titleText);
      if (group.locked) title.append(svgUse('i-lock', 'difficulty-lock'));
      const description = document.createElement('p');
      description.textContent = group.description;
      head.append(title, description);

      const grid = document.createElement('div');
      grid.className = 'level-grid';
      for (let number = 1; number <= M.config.levelsPerDifficulty; number += 1) {
        grid.append(createLevelTile(group, number, levelByNumber.get(number)));
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

  function renderShop() {
    const dom = M.ui.dom;
    dom.shopGrid.replaceChildren(...M.data.shop.packs.map(createShopPack));
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
    if (name === 'game') state.questionController?.focus?.();
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
    if (name === 'shop') renderShop();
    M.game.engine?.updateQuestionSubmitButton?.();
    if (options.focus !== false) window.requestAnimationFrame(() => focusScreen(name));
  }

  M.ui.screens = Object.freeze({
    completedCount,
    renderLevels,
    renderMissions,
    renderTutorial,
    renderShop,
    showToast,
    showScreen,
    focusScreen
  });
})();
