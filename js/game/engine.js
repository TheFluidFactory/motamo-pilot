(() => {
  'use strict';
  const M = window.Motamo;
  const state = M.core.state;
  const { normalizeLettersOnly, countLetters, svgUse } = M.core.utils;
  const C = M.ui.components;
  const S = M.ui.screens;
  const A = M.game.answers;

  function currentQuestion() {
    return state.attempt?.level.questions[state.attempt.questionIndex] || null;
  }

  function updateQuestionSubmitButton() {
    const button = document.querySelector('#submit-question');
    if (!button) return;
    const ready = Boolean(state.attempt && currentQuestion() && state.attempt.questionEntry.length === keyboardModeMax('question'));
    button.disabled = !ready;
    button.classList.toggle('is-ready', ready);
    button.setAttribute('aria-disabled', String(!ready));
  }

  function renderQuestionSlots() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;

    const total = countLetters(question.answer);
    const hintIndex = attempt.questionHintIndex;
    const hintLetter = A.hintLetter(question, attempt.questionEntry, hintIndex);
    const entry = [...attempt.questionEntry];
    dom.answerSlots.replaceChildren();
    C.setSlotContainerWidth(dom.answerSlots, total);

    for (let index = 0; index < total; index += 1) {
      const slot = document.createElement('span');
      slot.className = 'answer-slot';
      if (index === hintIndex) {
        slot.textContent = hintLetter;
        slot.classList.add('filled', 'hint-letter');
        slot.setAttribute('aria-label', `Lettre indice : ${hintLetter}`);
      } else {
        const entryIndex = hintIndex === null || index < hintIndex ? index : index - 1;
        const letter = entry[entryIndex];
        if (letter) {
          slot.textContent = letter;
          slot.classList.add('filled');
        } else if (entryIndex === entry.length) {
          slot.classList.add('next');
        }
      }
      dom.answerSlots.append(slot);
    }

    dom.answerSlots.setAttribute('aria-label', `Réponse avec une lettre indice, ${attempt.questionEntry.length} lettre${attempt.questionEntry.length > 1 ? 's' : ''} saisie${attempt.questionEntry.length > 1 ? 's' : ''}`);
    updateQuestionSubmitButton();
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

  function renderFinalRack() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    dom.finalLetterRack.replaceChildren();
    attempt.earned.forEach((letter, index) => {
      dom.finalLetterRack.append(C.createLetterTile(letter || '?', attempt.statuses[index] === 'correct' ? 'known' : 'unknown'));
    });
  }

  function renderQuestion() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;
    attempt.questionEntry = '';
    attempt.questionHintIndex = A.chooseHintIndex(question);

    dom.hudLevel.textContent = `${attempt.level.difficultyLabel} · 1`;
    dom.hudQuestion.textContent = `Question ${attempt.questionIndex + 1}/${M.config.questionsPerLevel}`;
    dom.questionType.textContent = question.type;
    dom.questionDifficulty.textContent = `Difficulté ${question.difficulty || 1}`;
    dom.gameQuestion.textContent = question.prompt;
    dom.inputMessage.textContent = '';
    dom.answerSlots.classList.remove('is-error', 'shake');
    C.renderLives(dom.lives, attempt.lives);
    renderQuestionSlots();
    renderLiveCollection();
  }

  function startLevel(levelId) {
    const level = M.data.levels.find((item) => item.id === Number(levelId));
    if (!level) return;
    state.startAttempt(level);
    renderQuestion();
    S.showScreen('game');
  }

  function keyboardModeMax(mode) {
    if (mode === 'question') {
      const total = countLetters(currentQuestion()?.answer || '');
      return Math.max(0, total - (state.attempt?.questionHintIndex === null || state.attempt?.questionHintIndex === undefined ? 0 : 1));
    }
    if (mode === 'final') return M.config.questionsPerLevel;
    return 0;
  }

  function currentEntry(mode) {
    return mode === 'question' ? state.attempt?.questionEntry || '' : state.attempt?.finalEntry || '';
  }

  function setEntry(mode, nextValue) {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    if (!attempt) return;
    const max = keyboardModeMax(mode);
    const clean = normalizeLettersOnly(nextValue).slice(0, max);
    if (mode === 'question') {
      attempt.questionEntry = clean;
      dom.inputMessage.textContent = '';
      dom.answerSlots.classList.remove('is-error');
      renderQuestionSlots();
    } else {
      attempt.finalEntry = clean;
      dom.finalMessage.textContent = '';
      dom.finalSlots.classList.remove('is-error');
      C.renderSlots(dom.finalSlots, max, clean, 'Mot mystère');
    }
  }

  function handleKey(mode, key) {
    const dom = M.ui.dom;
    if (!state.attempt || dom.feedbackOverlay.hidden === false || dom.confirmOverlay.hidden === false) return;
    if ((mode === 'question' && state.activeScreen !== 'game') || (mode === 'final' && state.activeScreen !== 'final')) return;

    const value = currentEntry(mode);
    const max = keyboardModeMax(mode);
    if (key === 'BACKSPACE') {
      setEntry(mode, value.slice(0, -1));
      return;
    }
    if (key === 'ENTER') {
      if (mode === 'question') submitQuestion();
      else submitFinalWord();
      return;
    }
    if (/^[A-Z]$/.test(key)) {
      if (value.length >= max) {
        const target = mode === 'question' ? dom.answerSlots : dom.finalSlots;
        target.classList.remove('shake');
        void target.offsetWidth;
        target.classList.add('shake');
        return;
      }
      setEntry(mode, value + key);
    }
  }

  function submitQuestion() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;
    const expected = keyboardModeMax('question');
    const value = attempt.questionEntry;

    if (value.length < expected) {
      dom.inputMessage.textContent = M.data.copy.completeAllCases;
      dom.answerSlots.classList.add('is-error');
      dom.answerSlots.classList.remove('shake');
      void dom.answerSlots.offsetWidth;
      dom.answerSlots.classList.add('shake');
      return;
    }

    if (A.isAcceptedQuestionEntry(question, value, attempt.questionHintIndex)) {
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
    const dom = M.ui.dom;
    const attempt = state.attempt;
    const question = currentQuestion();
    if (!attempt || !question) return;
    attempt.statuses[attempt.questionIndex] = 'missed';
    attempt.earned[attempt.questionIndex] = null;
    attempt.lives -= 1;
    attempt.defeatContext = { type: 'question', answer: question.answer };
    C.renderLives(dom.lives, attempt.lives);
    renderLiveCollection();

    openFeedback({
      correct: false,
      title: skipped ? M.data.copy.skippedTitle : M.data.copy.wrongTitle,
      copy: `La réponse était : ${question.answer}`,
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
    attempt.finalEntry = '';
    C.renderLives(dom.finalLives, attempt.lives);
    renderFinalRack();
    dom.finalMessage.textContent = '';
    dom.finalSlots.classList.remove('is-error', 'shake');
    C.renderSlots(dom.finalSlots, M.config.questionsPerLevel, '', 'Mot mystère');
    S.showScreen('final');
  }

  function submitFinalWord() {
    const dom = M.ui.dom;
    const attempt = state.attempt;
    if (!attempt) return;
    if (attempt.finalEntry.length < M.config.questionsPerLevel) {
      dom.finalMessage.textContent = M.data.copy.completeSevenCases;
      dom.finalSlots.classList.add('is-error');
      dom.finalSlots.classList.remove('shake');
      void dom.finalSlots.offsetWidth;
      dom.finalSlots.classList.add('shake');
      return;
    }

    if (normalizeLettersOnly(attempt.finalEntry) === normalizeLettersOnly(attempt.level.word)) {
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
      C.renderSlots(dom.finalSlots, M.config.questionsPerLevel, '', 'Mot mystère');
      dom.finalSlots.classList.remove('is-error');
    }, M.config.finalRetryResetMs);
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

    const next = M.data.levels.find((level) => level.id === attempt.level.id + 1);
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
    dom.defeatAnswer.textContent = fromQuestion && attempt.defeatContext.answer ? `Dernière réponse : ${attempt.defeatContext.answer}` : '';
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
    dom.nextLevel.addEventListener('click', () => startLevel(Number(dom.nextLevel.dataset.levelId)));

    document.querySelector('#home-reset').addEventListener('click', () => { dom.confirmOverlay.hidden = false; document.querySelector('#cancel-reset').focus(); });
    document.querySelector('#cancel-reset').addEventListener('click', () => { dom.confirmOverlay.hidden = true; });
    document.querySelector('#confirm-reset').addEventListener('click', resetProgress);

    dom.missionList.addEventListener('click', (event) => {
      if (event.target.closest('#claim-mission')) claimMission();
    });

    dom.answerSlots.addEventListener('click', () => dom.answerSlots.focus());
    dom.finalSlots.addEventListener('click', () => dom.finalSlots.focus());
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

      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKey(state.activeScreen === 'game' ? 'question' : 'final', 'BACKSPACE');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleKey(state.activeScreen === 'game' ? 'question' : 'final', 'ENTER');
      } else {
        const letter = normalizeLettersOnly(event.key);
        if (letter.length === 1) {
          event.preventDefault();
          handleKey(state.activeScreen === 'game' ? 'question' : 'final', letter);
        }
      }
    });
  }

  M.game.engine = Object.freeze({
    currentQuestion,
    startLevel,
    renderQuestion,
    renderQuestionSlots,
    renderLiveCollection,
    updateQuestionSubmitButton,
    keyboardModeMax,
    handleKey,
    submitQuestion,
    submitFinalWord,
    setupEvents,
    dismissSplash
  });
})();
