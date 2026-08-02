(() => {
  'use strict';

  const LEVELS = Array.isArray(window.MOTAMO_LEVELS) ? window.MOTAMO_LEVELS : [];
  const STORAGE_KEY = 'motamo-pilot-v2-progress';
  const KEYBOARD_ROWS = [
    ['A','Z','E','R','T','Y','U','I','O','P'],
    ['Q','S','D','F','G','H','J','K','L','M'],
    ['BACKSPACE','W','X','C','V','B','N','ENTER']
  ];

  const screens = [...document.querySelectorAll('[data-screen]')];
  const toast = document.querySelector('#toast');
  const feedbackOverlay = document.querySelector('#feedback-overlay');
  const confirmOverlay = document.querySelector('#confirm-overlay');
  const splash = document.querySelector('#splash');

  const elements = {
    difficultyList: document.querySelector('#difficulty-list'),
    globalProgressText: document.querySelector('#global-progress-text'),
    globalProgressFill: document.querySelector('#global-progress-fill'),
    globalProgressTrack: document.querySelector('#global-progress-track'),
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

  let progress = loadProgress();
  let attempt = null;
  let activeScreen = 'home';
  let feedbackAction = null;
  let toastTimer = null;

  function defaultProgress() {
    return { stars: {}, missionClaimed: false };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn('Impossible de sauvegarder la progression.', error);
    }
  }

  function normalizeLettersOnly(value) {
    return String(value ?? '')
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/gi, '')
      .toUpperCase();
  }

  function countLetters(value) {
    return normalizeLettersOnly(value).length;
  }

  function validateData() {
    if (!LEVELS.length) throw new Error('Aucun niveau MOTAMO chargé.');

    LEVELS.forEach((level) => {
      const word = [...normalizeLettersOnly(level.word)];
      const scramble = level.scramble.map(normalizeLettersOnly);
      const rewards = level.questions.map((question) => normalizeLettersOnly(question.rewardLetter));

      if (word.length !== 7) throw new Error(`Le niveau ${level.id} doit avoir un mot de 7 lettres.`);
      if (new Set(word).size !== 7) throw new Error(`Le mot ${level.word} contient une lettre répétée.`);
      if (level.questions.length !== 7) throw new Error(`Le niveau ${level.id} doit contenir 7 questions.`);
      if (scramble.length !== 7 || scramble.some((letter) => letter.length !== 1)) throw new Error(`Mélange invalide au niveau ${level.id}.`);
      if ([...scramble].sort().join('') !== [...word].sort().join('')) throw new Error(`Le mélange du niveau ${level.id} ne correspond pas au mot.`);
      if (scramble.join('') === word.join('')) throw new Error(`Le mélange du niveau ${level.id} n'est pas mélangé.`);
      if (rewards.join('') !== scramble.join('')) throw new Error(`Les récompenses du niveau ${level.id} ne suivent pas le mélange.`);

      level.questions.forEach((question) => {
        const expected = countLetters(question.answer);
        if (!expected) throw new Error(`Réponse vide : ${question.id}.`);
        (question.acceptedAnswers || []).forEach((variant) => {
          if (countLetters(variant) !== expected) {
            throw new Error(`La variante « ${variant} » n'a pas la même longueur que « ${question.answer} » (${question.id}).`);
          }
        });
      });
    });
  }

  function isAcceptedAnswer(question, value) {
    const entered = normalizeLettersOnly(value);
    const valid = [question.answer, ...(question.acceptedAnswers || [])].map(normalizeLettersOnly);
    return valid.includes(entered);
  }

  function svgUse(id, className = 'icon') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 24 24');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function showScreen(name, options = {}) {
    activeScreen = name;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });
    if (name === 'levels') renderLevels();
    if (name === 'missions') renderMissionState();
    if (options.focus !== false) window.requestAnimationFrame(() => focusScreen(name));
  }

  function focusScreen(name) {
    if (name === 'game') elements.answerSlots.focus({ preventScroll: true });
    else if (name === 'final') elements.finalSlots.focus({ preventScroll: true });
    else screens.find((screen) => screen.dataset.screen === name)?.querySelector('button:not([disabled]), [tabindex="0"]')?.focus({ preventScroll: true });
  }

  function renderLives(container, lives) {
    container.replaceChildren();
    container.setAttribute('aria-label', `${lives} vie${lives > 1 ? 's' : ''} restante${lives > 1 ? 's' : ''}`);
    for (let index = 0; index < 3; index += 1) {
      const heart = svgUse('i-heart', 'life');
      if (index >= lives) heart.classList.add('empty');
      container.append(heart);
    }
  }

  function createLetterTile(letter, state = 'known') {
    const tile = document.createElement('span');
    tile.className = 'letter-tile';
    if (state === 'unknown') tile.classList.add('unknown');
    if (state === 'future') tile.classList.add('unknown', 'future');
    tile.textContent = state === 'known' ? letter : state === 'unknown' ? '?' : '';
    return tile;
  }

  function renderWord(container, word) {
    container.replaceChildren();
    [...word].forEach((letter) => container.append(createLetterTile(letter)));
  }

  function renderStars(container, amount, large = false) {
    container.replaceChildren();
    for (let index = 0; index < 3; index += 1) {
      const star = svgUse('i-star', 'star');
      if (index >= amount) star.classList.add('empty');
      if (large) star.classList.add('large');
      container.append(star);
    }
  }

  function completedCount() {
    return LEVELS.filter((level) => Number(progress.stars[level.id] || 0) > 0).length;
  }

  function renderLevels() {
    const groups = [
      { key: 'easy', label: 'Facile', className: 'easy' },
      { key: 'medium', label: 'Intermédiaire', className: 'medium' },
      { key: 'hard', label: 'Difficile', className: 'hard' }
    ];

    const completed = completedCount();
    elements.globalProgressText.textContent = `${completed}/3 terminés`;
    elements.globalProgressFill.style.width = `${(completed / 3) * 100}%`;
    elements.globalProgressTrack.setAttribute('aria-valuenow', String(completed));
    elements.difficultyList.replaceChildren();

    groups.forEach((group) => {
      const level = LEVELS.find((candidate) => candidate.difficulty === group.key);
      if (!level) return;
      const stars = Number(progress.stars[level.id] || 0);

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
      description.textContent = `Niveau 1 jouable · niveaux 2 à 20 en aperçu`;
      head.append(title, starsBox, description);

      const grid = document.createElement('div');
      grid.className = 'level-grid';
      for (let number = 1; number <= 20; number += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'level-tile';
        button.textContent = String(number);
        if (number === 1) {
          button.classList.add('is-playable');
          if (stars > 0) button.classList.add('is-complete');
          button.setAttribute('aria-label', `${group.label}, niveau 1 : ${level.title}`);
          button.addEventListener('click', () => startLevel(level.id));
        } else {
          button.disabled = true;
          button.setAttribute('aria-label', `${group.label}, niveau ${number}, bientôt disponible`);
        }
        grid.append(button);
      }

      section.append(head, grid);
      elements.difficultyList.append(section);
    });
  }

  function renderMissionState() {
    const card = document.querySelector('#claimable-mission');
    const button = document.querySelector('#claim-mission');
    if (!card || !button) return;
    if (progress.missionClaimed) {
      card.classList.remove('state-ready');
      card.classList.add('state-claimed');
      button.textContent = 'Réclamé';
      button.disabled = true;
    } else {
      card.classList.add('state-ready');
      card.classList.remove('state-claimed');
      button.textContent = 'Réclamer';
      button.disabled = false;
    }
  }

  function startLevel(levelId) {
    const level = LEVELS.find((item) => item.id === Number(levelId));
    if (!level) return;
    attempt = {
      level,
      questionIndex: 0,
      lives: 3,
      statuses: Array(7).fill(null),
      earned: Array(7).fill(null),
      questionEntry: '',
      finalEntry: '',
      defeatContext: null
    };
    renderQuestion();
    showScreen('game');
  }

  function currentQuestion() {
    return attempt?.level.questions[attempt.questionIndex] || null;
  }

  function renderSlots(container, count, value, ariaPrefix) {
    container.replaceChildren();
    container.style.setProperty('--slot-count', String(count));
    container.style.maxWidth = `${Math.min(360, count * 46)}px`;
    const letters = [...value];
    for (let index = 0; index < count; index += 1) {
      const slot = document.createElement('span');
      slot.className = 'answer-slot';
      if (letters[index]) {
        slot.textContent = letters[index];
        slot.classList.add('filled');
      } else if (index === letters.length) {
        slot.classList.add('next');
      }
      container.append(slot);
    }
    container.setAttribute('aria-label', `${ariaPrefix} : ${value || 'vide'}, ${value.length} lettre${value.length > 1 ? 's' : ''} saisie${value.length > 1 ? 's' : ''} sur ${count}`);
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!attempt || !question) return;
    attempt.questionEntry = '';

    elements.hudLevel.textContent = `${attempt.level.difficultyLabel} · 1`;
    elements.hudQuestion.textContent = `Question ${attempt.questionIndex + 1}/7`;
    elements.questionType.textContent = question.type;
    elements.questionDifficulty.textContent = `Difficulté ${question.difficulty || 1}`;
    elements.gameQuestion.textContent = question.prompt;
    elements.inputMessage.textContent = '';
    elements.answerSlots.classList.remove('is-error', 'shake');
    renderLives(elements.lives, attempt.lives);
    renderSlots(elements.answerSlots, countLetters(question.answer), '', 'Réponse');
    renderLiveCollection();
  }

  function renderLiveCollection() {
    elements.liveLetterRack.replaceChildren();
    let collected = 0;
    for (let index = 0; index < 7; index += 1) {
      const status = attempt.statuses[index];
      if (status === 'correct') {
        collected += 1;
        elements.liveLetterRack.append(createLetterTile(attempt.earned[index], 'known'));
      } else if (status === 'missed') {
        elements.liveLetterRack.append(createLetterTile('?', 'unknown'));
      } else {
        elements.liveLetterRack.append(createLetterTile('', 'future'));
      }
    }
    elements.collectionCount.textContent = `${collected}/7`;
  }

  function renderFinalRack() {
    elements.finalLetterRack.replaceChildren();
    attempt.earned.forEach((letter, index) => {
      elements.finalLetterRack.append(createLetterTile(letter || '?', attempt.statuses[index] === 'correct' ? 'known' : 'unknown'));
    });
  }

  function keyboardModeMax(mode) {
    if (mode === 'question') return countLetters(currentQuestion()?.answer || '');
    if (mode === 'final') return 7;
    return 0;
  }

  function currentEntry(mode) {
    return mode === 'question' ? attempt?.questionEntry || '' : attempt?.finalEntry || '';
  }

  function setEntry(mode, nextValue) {
    if (!attempt) return;
    const max = keyboardModeMax(mode);
    const clean = normalizeLettersOnly(nextValue).slice(0, max);
    if (mode === 'question') {
      attempt.questionEntry = clean;
      elements.inputMessage.textContent = '';
      elements.answerSlots.classList.remove('is-error');
      renderSlots(elements.answerSlots, max, clean, 'Réponse');
    } else {
      attempt.finalEntry = clean;
      elements.finalMessage.textContent = '';
      elements.finalSlots.classList.remove('is-error');
      renderSlots(elements.finalSlots, max, clean, 'Mot mystère');
    }
  }

  function handleKey(mode, key) {
    if (!attempt || feedbackOverlay.hidden === false || confirmOverlay.hidden === false) return;
    if ((mode === 'question' && activeScreen !== 'game') || (mode === 'final' && activeScreen !== 'final')) return;

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
        const target = mode === 'question' ? elements.answerSlots : elements.finalSlots;
        target.classList.remove('shake');
        void target.offsetWidth;
        target.classList.add('shake');
        return;
      }
      setEntry(mode, value + key);
    }
  }

  function buildKeyboard(container, mode) {
    container.replaceChildren();
    KEYBOARD_ROWS.forEach((row) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'keyboard-row';
      row.forEach((key) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'key';
        button.dataset.key = key;
        if (key === 'BACKSPACE') {
          button.classList.add('action');
          button.setAttribute('aria-label', 'Effacer la dernière lettre');
          button.append(svgUse('i-delete'));
        } else if (key === 'ENTER') {
          button.classList.add('confirm');
          button.setAttribute('aria-label', 'Valider la réponse');
          button.append(svgUse('i-check'));
        } else {
          button.textContent = key;
          button.setAttribute('aria-label', `Lettre ${key}`);
        }
        button.addEventListener('click', () => handleKey(mode, key));
        rowElement.append(button);
      });
      container.append(rowElement);
    });
  }

  function submitQuestion() {
    const question = currentQuestion();
    if (!attempt || !question) return;
    const expected = countLetters(question.answer);
    const value = attempt.questionEntry;

    if (value.length < expected) {
      elements.inputMessage.textContent = 'Complétez toutes les cases.';
      elements.answerSlots.classList.add('is-error');
      elements.answerSlots.classList.remove('shake');
      void elements.answerSlots.offsetWidth;
      elements.answerSlots.classList.add('shake');
      return;
    }

    if (isAcceptedAnswer(question, value)) {
      attempt.statuses[attempt.questionIndex] = 'correct';
      attempt.earned[attempt.questionIndex] = question.rewardLetter;
      renderLiveCollection();
      openFeedback({
        correct: true,
        title: 'Bonne réponse !',
        copy: `${question.answer} est accepté.`,
        letter: question.rewardLetter,
        detail: `${attempt.earned.filter(Boolean).length} lettre${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} gagnée${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} sur 7`
      }, advanceAfterQuestion);
    } else {
      missQuestion(false);
    }
  }

  function missQuestion(skipped) {
    const question = currentQuestion();
    if (!attempt || !question) return;
    attempt.statuses[attempt.questionIndex] = 'missed';
    attempt.earned[attempt.questionIndex] = null;
    attempt.lives -= 1;
    attempt.defeatContext = { type: 'question', answer: question.answer };
    renderLives(elements.lives, attempt.lives);
    renderLiveCollection();

    openFeedback({
      correct: false,
      title: skipped ? 'Question passée' : 'Mauvaise réponse',
      copy: `La réponse était : ${question.answer}`,
      letter: null,
      detail: attempt.lives > 0 ? `Il vous reste ${attempt.lives} vie${attempt.lives > 1 ? 's' : ''}.` : 'Vous n’avez plus de vie.'
    }, attempt.lives > 0 ? advanceAfterQuestion : showDefeat);
  }

  function advanceAfterQuestion() {
    attempt.questionIndex += 1;
    if (attempt.questionIndex >= 7) {
      showFinalStage();
    } else {
      renderQuestion();
      showScreen('game');
    }
  }

  function showFinalStage() {
    attempt.finalEntry = '';
    renderLives(elements.finalLives, attempt.lives);
    renderFinalRack();
    elements.finalMessage.textContent = '';
    elements.finalSlots.classList.remove('is-error', 'shake');
    renderSlots(elements.finalSlots, 7, '', 'Mot mystère');
    showScreen('final');
  }

  function submitFinalWord() {
    if (!attempt) return;
    if (attempt.finalEntry.length < 7) {
      elements.finalMessage.textContent = 'Complétez les sept cases.';
      elements.finalSlots.classList.add('is-error');
      elements.finalSlots.classList.remove('shake');
      void elements.finalSlots.offsetWidth;
      elements.finalSlots.classList.add('shake');
      return;
    }

    if (normalizeLettersOnly(attempt.finalEntry) === normalizeLettersOnly(attempt.level.word)) {
      completeLevel();
      return;
    }

    attempt.lives -= 1;
    renderLives(elements.finalLives, attempt.lives);
    if (attempt.lives <= 0) {
      attempt.defeatContext = { type: 'final' };
      showDefeat();
      return;
    }

    elements.finalMessage.textContent = `Ce n’est pas le mot. Vous perdez une vie.`;
    elements.finalSlots.classList.add('is-error');
    elements.finalSlots.classList.remove('shake');
    void elements.finalSlots.offsetWidth;
    elements.finalSlots.classList.add('shake');
    window.setTimeout(() => {
      attempt.finalEntry = '';
      renderSlots(elements.finalSlots, 7, '', 'Mot mystère');
      elements.finalSlots.classList.remove('is-error');
    }, 520);
  }

  function completeLevel() {
    const stars = attempt.lives;
    const previous = Number(progress.stars[attempt.level.id] || 0);
    progress.stars[attempt.level.id] = Math.max(previous, stars);
    saveProgress();
    renderWord(elements.victoryWord, attempt.level.word);
    renderStars(elements.victoryStars, stars, true);
    elements.victoryCopy.textContent = `${stars} étoile${stars > 1 ? 's' : ''} · ${attempt.earned.filter(Boolean).length} lettre${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} collectée${attempt.earned.filter(Boolean).length > 1 ? 's' : ''}`;

    const next = LEVELS.find((level) => level.id === attempt.level.id + 1);
    elements.nextLevel.hidden = !next;
    elements.nextLevel.dataset.levelId = next ? String(next.id) : '';
    populateConfetti();
    renderLevels();
    showScreen('victory');
  }

  function showDefeat() {
    if (!attempt) return;
    const fromQuestion = attempt.defeatContext?.type === 'question';
    elements.defeatReason.textContent = fromQuestion ? 'Vous avez perdu vos trois vies pendant les questions.' : 'Vos propositions du mot mystère ont épuisé vos vies.';
    elements.defeatAnswer.textContent = fromQuestion && attempt.defeatContext.answer ? `Dernière réponse : ${attempt.defeatContext.answer}` : '';
    renderWord(elements.defeatWord, attempt.level.word);
    populateRain();
    showScreen('defeat');
  }

  function openFeedback(config, action) {
    feedbackAction = action;
    elements.feedbackIcon.className = `feedback-icon${config.correct ? '' : ' wrong'}`;
    elements.feedbackIcon.replaceChildren(svgUse(config.correct ? 'i-check' : 'i-x'));
    elements.feedbackTitle.textContent = config.title;
    elements.feedbackCopy.textContent = config.copy;
    elements.feedbackDetail.textContent = config.detail || '';
    if (config.letter) {
      elements.earnedLetter.hidden = false;
      elements.earnedLetter.textContent = config.letter;
    } else {
      elements.earnedLetter.hidden = true;
      elements.earnedLetter.textContent = '';
    }
    feedbackOverlay.hidden = false;
    window.requestAnimationFrame(() => elements.feedbackContinue.focus());
  }

  function closeFeedback() {
    feedbackOverlay.hidden = true;
    const action = feedbackAction;
    feedbackAction = null;
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
    if (splash.hidden || splash.classList.contains('is-leaving')) return;
    splash.classList.add('is-leaving');
    window.setTimeout(() => { splash.hidden = true; }, 460);
  }

  function resetProgress() {
    progress = defaultProgress();
    saveProgress();
    renderLevels();
    renderMissionState();
    confirmOverlay.hidden = true;
    showScreen('home');
    showToast('Progression réinitialisée');
  }

  function setupEvents() {
    document.querySelector('#play-button').addEventListener('click', () => showScreen('levels'));
    document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => showScreen(button.dataset.nav)));
    document.querySelector('#quit-level').addEventListener('click', () => showScreen('levels'));
    document.querySelector('#final-quit').addEventListener('click', () => showScreen('levels'));
    document.querySelector('#skip-question').addEventListener('click', () => missQuestion(true));
    elements.feedbackContinue.addEventListener('click', closeFeedback);
    document.querySelector('#replay-level').addEventListener('click', () => startLevel(attempt.level.id));
    document.querySelector('#retry-level').addEventListener('click', () => startLevel(attempt.level.id));
    elements.nextLevel.addEventListener('click', () => startLevel(Number(elements.nextLevel.dataset.levelId)));

    document.querySelector('#home-reset').addEventListener('click', () => { confirmOverlay.hidden = false; document.querySelector('#cancel-reset').focus(); });
    document.querySelector('#cancel-reset').addEventListener('click', () => { confirmOverlay.hidden = true; });
    document.querySelector('#confirm-reset').addEventListener('click', resetProgress);

    document.querySelector('#claim-mission').addEventListener('click', () => {
      progress.missionClaimed = true;
      saveProgress();
      renderMissionState();
      showToast('Récompense réclamée · aperçu');
    });

    elements.answerSlots.addEventListener('click', () => elements.answerSlots.focus());
    elements.finalSlots.addEventListener('click', () => elements.finalSlots.focus());

    splash.addEventListener('click', dismissSplash);
    window.setTimeout(dismissSplash, 2100);

    document.addEventListener('keydown', (event) => {
      if (!feedbackOverlay.hidden) {
        if (event.key === 'Enter') { event.preventDefault(); closeFeedback(); }
        return;
      }
      if (!confirmOverlay.hidden) {
        if (event.key === 'Escape') { event.preventDefault(); confirmOverlay.hidden = true; }
        return;
      }
      if (!attempt || !['game','final'].includes(activeScreen)) return;

      if (event.key === 'Backspace') {
        event.preventDefault();
        handleKey(activeScreen === 'game' ? 'question' : 'final', 'BACKSPACE');
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleKey(activeScreen === 'game' ? 'question' : 'final', 'ENTER');
      } else {
        const letter = normalizeLettersOnly(event.key);
        if (letter.length === 1) {
          event.preventDefault();
          handleKey(activeScreen === 'game' ? 'question' : 'final', letter);
        }
      }
    });
  }

  validateData();
  buildKeyboard(document.querySelector('#game-keyboard'), 'question');
  buildKeyboard(document.querySelector('#final-keyboard'), 'final');
  renderLevels();
  renderMissionState();
  setupEvents();
  showScreen('home', { focus: false });
})();
