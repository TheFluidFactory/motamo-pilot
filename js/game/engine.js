(() => {
  'use strict';
  const M = window.Motamo;
  const state = M.core.state;
  const { normalizeLettersOnly, svgUse } = M.core.utils;
  const C = M.ui.components;
  const S = M.ui.screens;
  const A = M.game.answers;

  function currentQuestion() {
    return state.attempt?.level.questions[state.attempt.questionIndex] || null;
  }

  function updateQuestionSubmitButton() {
    const button = document.querySelector('#submit-question');
    if (!button) return;
    const ready = Boolean(state.attempt && currentQuestion() && state.questionController?.isComplete());
    button.disabled = !ready;
    button.classList.toggle('is-ready', ready);
    button.setAttribute('aria-disabled', String(!ready));
  }

  function renderLiveCollection() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    dom.liveLetterRack.replaceChildren();
    let collected = 0;
    for (let index = 0; index < M.config.questionsPerLevel; index += 1) {
      const status = attempt.statuses[index];
      if (status === 'correct') {
        collected += 1;
        dom.liveLetterRack.append(C.createLetterTile(attempt.earned[index], 'known'));
      } else if (status === 'missed') {
        dom.liveLetterRack.append(C.createLetterTile('?', 'unknown'));
      } else {
        dom.liveLetterRack.append(C.createLetterTile('', 'future'));
      }
    }
    dom.collectionCount.textContent = `${collected}/${M.config.questionsPerLevel}`;
  }

  function mountQuestionInteraction(question) {
    const dom = M.ui.dom;
    state.questionController?.destroy?.();
    state.questionController = null;
    dom.inputMessage.textContent = '';
    dom.questionInteractionCard.classList.remove('is-error');

    const interaction = question.interaction || M.config.defaultQuestionInteraction;
    const controller = M.game.questionTypes.create(interaction, {
      question,
      host: dom.questionInteraction,
      keyboard: dom.gameKeyboard,
      inputMessage: dom.inputMessage,
      answerAreaLabel: dom.answerAreaLabel,
      onChange: () => updateQuestionSubmitButton()
    });
    state.questionController = controller;

    dom.gameKeyboard.hidden = !controller.usesKeyboard;
    dom.gamePlayLayout.classList.toggle('no-keyboard', !controller.usesKeyboard);
    dom.questionInteractionCard.dataset.interaction = interaction;
    updateQuestionSubmitButton();
  }

  function renderQuestion() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;

    dom.hudLevel.textContent = `${attempt.level.difficultyLabel} · ${attempt.level.levelNumber}`;
    dom.hudQuestion.textContent = `Question ${attempt.questionIndex + 1}/${M.config.questionsPerLevel}`;
    dom.questionDifficulty.textContent = `Difficulté ${question.difficulty || 1}`;
    dom.gameQuestion.textContent = question.prompt;
    C.renderLives(dom.lives, attempt.lives);
    mountQuestionInteraction(question);
    renderLiveCollection();
  }

  function startLevel(levelId) {
    const level = M.data.levels.find((item) => String(item.id) === String(levelId));
    if (!level) return;
    state.startAttempt(level);
    renderQuestion();
    S.showScreen('game');
  }

  function updateFinalSubmitButton() {
    const button = document.querySelector('#submit-final');
    if (!button) return;
    const ready = Boolean(state.finalController?.isComplete());
    button.disabled = !ready;
    button.classList.toggle('is-ready', ready);
    button.setAttribute('aria-disabled', String(!ready));
  }

  function handleKey(mode, key) {
    const dom = M.ui.dom;
    if (!state.attempt || dom.feedbackOverlay.hidden === false || dom.confirmOverlay.hidden === false) return;
    if ((mode === 'question' && state.activeScreen !== 'game') || (mode === 'final' && state.activeScreen !== 'final')) return;

    if (mode === 'question') {
      if (key === 'ENTER') {
        submitQuestion();
        return;
      }
      state.questionController?.handleKey?.(key);
      updateQuestionSubmitButton();
      return;
    }

    if (key === 'ENTER') submitFinalWord();
  }

  function submitQuestion() {
    const attempt = state.attempt;
    const question = currentQuestion();
    const controller = state.questionController;
    if (!attempt || !question || !controller) return;

    if (!controller.isComplete()) {
      controller.showIncomplete();
      updateQuestionSubmitButton();
      return;
    }

    const value = controller.getAnswer();
    if (A.isAcceptedAnswer(question, value)) {
      attempt.statuses[attempt.questionIndex] = 'correct';
      attempt.earned[attempt.questionIndex] = question.rewardLetter;
      renderLiveCollection();
      openFeedback({
        correct: true,
        title: M.data.copy.correctTitle,
        copy: `${question.answer} est accepté.`,
        letter: question.rewardLetter,
        detail: `${attempt.earned.filter(Boolean).length} lettre${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} gagnée${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} sur ${M.config.questionsPerLevel}`
      }, advanceAfterQuestion);
    } else {
      missQuestion(false);
    }
  }

  function missQuestion(skipped) {
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;
    attempt.statuses[attempt.questionIndex] = 'missed';
    attempt.earned[attempt.questionIndex] = null;
    attempt.lives -= 1;
    attempt.defeatContext = { type: 'question' };
    C.renderLives(M.ui.dom.lives, attempt.lives);
    renderLiveCollection();

    openFeedback({
      correct: false,
      title: skipped ? M.data.copy.skippedTitle : M.data.copy.wrongTitle,
      copy: skipped ? M.data.copy.skippedCopy : M.data.copy.wrongCopy,
      letter: null,
      detail: attempt.lives > 0 ? `Il vous reste ${attempt.lives} vie${attempt.lives > 1 ? 's' : ''}.` : M.data.copy.noLives
    }, attempt.lives > 0 ? advanceAfterQuestion : showDefeat);
  }

  function advanceAfterQuestion() {
    const attempt = state.attempt;
    attempt.questionIndex += 1;
    if (attempt.questionIndex >= M.config.questionsPerLevel) showFinalStage();
    else {
      renderQuestion();
      S.showScreen('game');
    }
  }

  function showFinalStage() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    state.questionController?.destroy?.();
    state.finalController?.destroy?.();
    state.questionController = null;
    attempt.finalEntry = '';
    C.renderLives(dom.finalLives, attempt.lives);
    dom.finalMessage.textContent = '';
    dom.finalSlots.classList.remove('is-error', 'shake');
    state.finalController = M.game.createFinalWordBuilder({
      slots: dom.finalSlots,
      collectedBank: dom.finalLetterRack,
      alphabetBank: dom.finalAlphabetRack,
      collectedCount: dom.finalCollectedCount,
      collectedEmpty: dom.finalCollectedEmpty,
      message: dom.finalMessage,
      answerLength: M.config.questionsPerLevel,
      earnedLetters: attempt.earned.filter(Boolean),
      requiredWord: attempt.level.word,
      onChange: updateFinalSubmitButton
    });
    updateFinalSubmitButton();
    S.showScreen('final');
  }

  function submitFinalWord() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const controller = state.finalController;
    if (!attempt || !controller) return;
    if (!controller.isComplete()) {
      controller.showIncomplete();
      updateFinalSubmitButton();
      return;
    }

    const finalEntry = controller.getAnswer();
    attempt.finalEntry = finalEntry;
    if (normalizeLettersOnly(finalEntry) === normalizeLettersOnly(attempt.level.word)) {
      completeLevel();
      return;
    }

    attempt.lives -= 1;
    C.renderLives(dom.finalLives, attempt.lives);
    if (attempt.lives <= 0) {
      attempt.defeatContext = { type: 'final' };
      showDefeat();
      return;
    }

    dom.finalMessage.textContent = M.data.copy.finalWrong;
    dom.finalSlots.classList.add('is-error');
    dom.finalSlots.classList.remove('shake');
    void dom.finalSlots.offsetWidth;
    dom.finalSlots.classList.add('shake');
    window.setTimeout(() => {
      attempt.finalEntry = '';
      controller.reset();
      dom.finalSlots.classList.remove('is-error');
      updateFinalSubmitButton();
    }, M.config.finalRetryResetMs);
  }

  function nextLevelAfter(level) {
    const currentIndex = M.data.levels.findIndex((item) => item.id === level.id);
    return currentIndex >= 0 ? M.data.levels[currentIndex + 1] || null : null;
  }

  function completeLevel() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const stars = attempt.lives;
    const previous = Number(state.progress.stars[attempt.level.id] || 0);
    state.progress.stars[attempt.level.id] = Math.max(previous, stars);
    M.core.storage.saveProgress(state.progress);
    C.renderWord(dom.victoryWord, attempt.level.word);
    C.renderStars(dom.victoryStars, stars, true);
    dom.victoryCopy.textContent = `${stars} étoile${stars > 1 ? 's' : ''} · ${attempt.earned.filter(Boolean).length} lettre${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} collectée${attempt.earned.filter(Boolean).length > 1 ? 's' : ''}`;

    const next = nextLevelAfter(attempt.level);
    dom.nextLevel.hidden = !next;
    dom.nextLevel.dataset.levelId = next ? String(next.id) : '';
    populateConfetti();
    S.renderLevels();
    S.showScreen('victory');
  }

  function showDefeat() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    if (!attempt) return;
    const fromQuestion = attempt.defeatContext?.type === 'question';
    dom.defeatReason.textContent = fromQuestion ? 'Vous avez perdu vos trois vies pendant les questions.' : 'Vos propositions du mot mystère ont épuisé vos vies.';
    dom.defeatAnswer.textContent = '';
    C.renderWord(dom.defeatWord, attempt.level.word);
    populateRain();
    S.showScreen('defeat');
  }

  function openFeedback(config, action) {
    const dom = M.ui.dom;
    state.feedbackAction = action;
    dom.feedbackIcon.className = `feedback-icon${config.correct ? '' : ' wrong'}`;
    dom.feedbackIcon.replaceChildren(svgUse(config.correct ? 'i-check' : 'i-x'));
    dom.feedbackTitle.textContent = config.title;
    dom.feedbackCopy.textContent = config.copy;
    dom.feedbackDetail.textContent = config.detail || '';
    if (config.letter) {
      dom.earnedLetter.hidden = false;
      dom.earnedLetter.textContent = config.letter;
    } else {
      dom.earnedLetter.hidden = true;
      dom.earnedLetter.textContent = '';
    }
    dom.feedbackOverlay.hidden = false;
    window.requestAnimationFrame(() => dom.feedbackContinue.focus());
  }

  function closeFeedback() {
    M.ui.dom.feedbackOverlay.hidden = true;
    const action = state.feedbackAction;
    state.feedbackAction = null;
    action?.();
  }

  function populateConfetti() {
    const container = document.querySelector('.confetti');
    if (!container || container.childElementCount) return;
    const colours = ['#ffc83d','#f13a48','#0b83ef','#8434ef','#22ad5a','#ffffff'];
    for (let index = 0; index < 28; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--rotate', `${Math.random() * 180}deg`);
      piece.style.setProperty('--duration', `${2.7 + Math.random() * 2.4}s`);
      piece.style.setProperty('--delay', `${-Math.random() * 4}s`);
      piece.style.setProperty('--color', colours[index % colours.length]);
      container.append(piece);
    }
  }

  function populateRain() {
    const container = document.querySelector('.rain');
    if (!container || container.childElementCount) return;
    for (let index = 0; index < 28; index += 1) {
      const drop = document.createElement('span');
      drop.className = 'rain-drop';
      drop.style.setProperty('--x', `${Math.random() * 100}%`);
      drop.style.setProperty('--duration', `${.8 + Math.random() * .9}s`);
      drop.style.setProperty('--delay', `${-Math.random() * 2}s`);
      container.append(drop);
    }
  }

  function dismissSplash() {
    const splash = M.ui.dom.splash;
    if (splash.hidden || splash.classList.contains('is-leaving')) return;
    splash.classList.add('is-leaving');
    window.setTimeout(() => { splash.hidden = true; }, M.config.splashExitMs);
  }

  function resetProgress() {
    const dom = M.ui.dom;
    state.resetProgress();
    S.renderLevels();
    S.renderMissions();
    dom.confirmOverlay.hidden = true;
    S.showScreen('home');
    S.showToast(M.data.copy.resetToast);
  }

  function claimMission() {
    state.progress.missionClaimed = true;
    M.core.storage.saveProgress(state.progress);
    S.renderMissions();
    S.showToast(M.data.copy.missionToast);
  }

  function setupEvents() {
    const dom = M.ui.dom;
    document.querySelector('#play-button').addEventListener('click', () => S.showScreen('levels'));
    document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => S.showScreen(button.dataset.nav)));
    document.querySelector('#quit-level').addEventListener('click', () => S.showScreen('levels'));
    document.querySelector('#final-quit').addEventListener('click', () => S.showScreen('levels'));
    document.querySelector('#skip-question').addEventListener('click', () => missQuestion(true));
    document.querySelector('#submit-question').addEventListener('click', submitQuestion);
    document.querySelector('#submit-final').addEventListener('click', submitFinalWord);
    dom.feedbackContinue.addEventListener('click', closeFeedback);
    document.querySelector('#replay-level').addEventListener('click', () => startLevel(state.attempt.level.id));
    document.querySelector('#retry-level').addEventListener('click', () => startLevel(state.attempt.level.id));
    dom.nextLevel.addEventListener('click', () => startLevel(dom.nextLevel.dataset.levelId));

    document.querySelector('#home-reset').addEventListener('click', () => { dom.confirmOverlay.hidden = false; document.querySelector('#cancel-reset').focus(); });
    document.querySelector('#cancel-reset').addEventListener('click', () => { dom.confirmOverlay.hidden = true; });
    document.querySelector('#confirm-reset').addEventListener('click', resetProgress);

    dom.missionList.addEventListener('click', (event) => {
      if (event.target.closest('#claim-mission')) claimMission();
    });
    dom.shopGrid.addEventListener('click', (event) => {
      if (event.target.closest('[data-shop-pack]')) S.showToast(M.data.copy.shopToast);
    });

    dom.splash.addEventListener('click', dismissSplash);
    window.setTimeout(dismissSplash, M.config.splashDurationMs);

    document.addEventListener('keydown', (event) => {
      if (!dom.feedbackOverlay.hidden) {
        if (event.key === 'Enter') { event.preventDefault(); closeFeedback(); }
        return;
      }
      if (!dom.confirmOverlay.hidden) {
        if (event.key === 'Escape') { event.preventDefault(); dom.confirmOverlay.hidden = true; }
        return;
      }
      if (!state.attempt || !['game','final'].includes(state.activeScreen)) return;

      if (state.activeScreen === 'final') {
        if (event.key === 'Enter') {
          event.preventDefault();
          submitFinalWord();
        }
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKey('question', 'BACKSPACE');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleKey('question', 'ENTER');
      } else {
        const letter = normalizeLettersOnly(event.key);
        if (letter.length === 1) {
          event.preventDefault();
          handleKey('question', letter);
        }
      }
    });
  }

  M.game.engine = Object.freeze({
    currentQuestion,
    startLevel,
    renderQuestion,
    renderLiveCollection,
    updateQuestionSubmitButton,
    updateFinalSubmitButton,
    handleKey,
    submitQuestion,
    submitFinalWord,
    setupEvents,
    dismissSplash
  });
})();
