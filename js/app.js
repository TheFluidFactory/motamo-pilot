(() => {
  'use strict';
  const M = window.Motamo;

  M.core.state.initialise();
  M.ui.collectDom();
  M.game.answers.validateData(M.data.levels);
  M.ui.screens.renderTutorial();
  M.ui.screens.renderMissions();
  M.ui.screens.renderShop();
  M.ui.screens.renderLevels();
  M.ui.components.buildKeyboard(document.querySelector('#game-keyboard'), 'question', M.game.engine.handleKey);
  M.ui.components.buildKeyboard(document.querySelector('#final-keyboard'), 'final', M.game.engine.handleKey);
  M.game.engine.setupEvents();
  M.ui.screens.showScreen('home', { focus: false });
})();
