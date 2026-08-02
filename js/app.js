(() => {
  'use strict';

  const LEVELS = Array.isArray(window.MOTAMO_LEVELS) ? window.MOTAMO_LEVELS : [];
  const STORAGE_KEY = 'motamo-pilot-progress-v1';

  const screens = [...document.querySelectorAll('[data-screen]')];
  const levelList = document.querySelector('#level-list');
  const toast = document.querySelector('#toast');
  const feedbackOverlay = document.querySelector('#feedback-overlay');
  const confirmOverlay = document.querySelector('#confirm-overlay');

  const elements = {
    globalProgressText: document.querySelector('#global-progress-text'),
    globalProgressFill: document.querySelector('#global-progress-fill'),
    globalProgressTrack: document.querySelector('.progress-track'),
    hudLevel: document.querySelector('#hud-level'),
    hudQuestion: document.querySelector('#hud-question'),
    lives: document.querySelector('#lives'),
    finalLives: document.querySelector('#final-lives'),
    questionType: document.querySelector('#question-type'),
    questionDifficulty: document.querySelector('#question-difficulty'),
    gameQuestion: document.querySelector('#game-question'),
    answerLength: document.querySelector('#answer-length'),
    answerForm: document.querySelector('#answer-form'),
    answerInput: document.querySelector('#answer-input'),
    inputMessage: document.querySelector('#input-message'),
    skipQuestion: document.querySelector('#skip-question'),
    collectionCount: document.querySelector('#collection-count'),
    liveLetterRack: document.querySelector('#live-letter-rack'),
    finalLetterRack: document.querySelector('#final-letter-rack'),
    finalForm: document.querySelector('#final-form'),
    finalInput: document.querySelector('#final-input'),
    finalMessage: document.querySelector('#final-message'),
    feedbackIcon: document.querySelector('#feedback-icon'),
    feedbackTitle: document.querySelector('#feedback-title'),
    feedbackCopy: document.querySelector('#feedback-copy'),
    feedbackDetail: document.querySelector('#feedback-detail'),
    earnedLetter: document.querySelector('#earned-letter'),
    feedbackContinue: document.querySelector('#feedback-continue'),
    victoryWord: document.querySelector('#victory-word'),
    victoryStars: document.querySelector('#victory-stars'),
    victoryCopy: document.querySelector('#victory-copy'),
    defeatWord: document.querySelector('#defeat-word'),
    defeatReason: document.querySelector('#defeat-reason'),
    defeatAnswer: document.querySelector('#defeat-answer'),
    nextLevel: document.querySelector('#next-level'),
    replayLevel: document.querySelector('#replay-level'),
    retryLevel: document.querySelector('#retry-level')
  };

  let progress = loadProgress();
  let activeScreen = 'home';
  let attempt = null;
  let pendingFeedbackAction = null;
  let toastTimer = null;
  let lastFocusedBeforeOverlay = null;

  function defaultProgress() {
    return {
      unlockedLevel: 1,
      stars: {},
      tutorialSeen: false
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      return {
        unlockedLevel: Number.isInteger(parsed.unlockedLevel) ? parsed.unlockedLevel : 1,
        stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {},
        tutorialSeen: Boolean(parsed.tutorialSeen)
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

  function validateData() {
    if (LEVELS.length === 0) throw new Error('Aucun niveau MOTAMO chargé.');

    LEVELS.forEach((level) => {
      const wordLetters = [...normalizeLettersOnly(level.word).toUpperCase()];
      const scrambleLetters = level.scramble.map((letter) => normalizeLettersOnly(letter).toUpperCase());
      const rewardLetters = level.questions.map((question) => normalizeLettersOnly(question.rewardLetter).toUpperCase());

      if (wordLetters.length !== 7) throw new Error(`Le niveau ${level.id} doit avoir un mot de 7 lettres.`);
      if (new Set(wordLetters).size !== wordLetters.length) throw new Error(`Le mot ${level.word} contient une lettre répétée.`);
      if (level.questions.length !== 7) throw new Error(`Le niveau ${level.id} doit contenir 7 questions.`);
      if (scrambleLetters.length !== 7) throw new Error(`Le niveau ${level.id} doit contenir 7 lettres mélangées.`);
      if (scrambleLetters.join('') === wordLetters.join('')) throw new Error(`Le mélange du niveau ${level.id} est identique au mot final.`);
      if ([...scrambleLetters].sort().join('') !== [...wordLetters].sort().join('')) throw new Error(`Le mélange du niveau ${level.id} ne correspond pas au mot final.`);
      if (rewardLetters.join('') !== scrambleLetters.join('')) throw new Error(`Les lettres-récompenses du niveau ${level.id} ne suivent pas le mélange prévu.`);
    });
  }

  function normalizeLettersOnly(value) {
    return String(value ?? '')
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/gi, '');
  }

  function normalizeAnswer(value) {
    return String(value ?? '')
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('fr-FR')
      .replace(/[’'`´-]/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function countLetters(value) {
    return normalizeLettersOnly(value).length;
  }

  function answerLengthLabel(question) {
    const values = [question.answer, ...(question.acceptedAnswers || [])];
    const lengths = [...new Set(values.map(countLetters).filter(Boolean))].sort((a, b) => a - b);
    const canonical = countLetters(question.answer);

    if (lengths.length <= 1) return `${canonical} lettre${canonical > 1 ? 's' : ''}`;
    if (lengths.length === 2) return `${lengths[0]} ou ${lengths[1]} lettres`;
    if (lengths.length === 3) return `${lengths[0]}, ${lengths[1]} ou ${lengths[2]} lettres`;
    return `${canonical} lettres · variantes acceptées`;
  }

  function isAcceptedAnswer(question, value) {
    const entered = normalizeAnswer(value);
    if (!entered) return false;
    const validAnswers = [question.answer, ...(question.acceptedAnswers || [])].map(normalizeAnswer);
    return validAnswers.includes(entered);
  }

  function showScreen(name, options = {}) {
    activeScreen = name;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === name;
      screen.hidden = !active;
      screen.classList.toggle('is-active', active);
    });

    if (options.focus !== false) {
      window.requestAnimationFrame(() => focusScreen(name));
    }
  }

  function focusScreen(name) {
    if (name === 'game') elements.answerInput.focus();
    else if (name === 'final') elements.finalInput.focus();
    else {
      const screen = screens.find((item) => item.dataset.screen === name);
      screen?.querySelector('button:not([disabled]), input:not([disabled])')?.focus({ preventScroll: true });
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1900);
  }

  function renderLives(container, lives) {
    container.replaceChildren();
    container.setAttribute('aria-label', `${lives} vie${lives > 1 ? 's' : ''} restante${lives > 1 ? 's' : ''}`);
    for (let index = 0; index < 3; index += 1) {
      const icon = svgUse('i-heart', 'life');
      if (index >= lives) icon.classList.add('empty');
      container.append(icon);
    }
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

  function renderWord(container, word) {
    container.replaceChildren();
    [...word].forEach((letter) => container.append(createLetterTile(letter)));
  }

  function createLetterTile(letter, unknown = false) {
    const tile = document.createElement('span');
    tile.className = 'letter-tile';
    if (unknown) tile.classList.add('unknown');
    tile.textContent = letter;
    return tile;
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
    levelList.replaceChildren();
    const completed = completedCount();
    elements.globalProgressText.textContent = `${completed}/${LEVELS.length} niveaux`;
    elements.globalProgressFill.style.width = `${(completed / LEVELS.length) * 100}%`;
    elements.globalProgressTrack?.setAttribute('aria-valuenow', String(completed));

    LEVELS.forEach((level) => {
      const locked = level.id > progress.unlockedLevel;
      const stars = Number(progress.stars[level.id] || 0);
      const completedLevel = stars > 0;
      const current = !completedLevel && !locked && level.id === progress.unlockedLevel;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'level-card';
      if (completedLevel) button.classList.add('completed');
      else if (current) button.classList.add('current');
      if (locked) button.classList.add('locked');
      button.disabled = locked;
      button.setAttribute('aria-label', locked ? `Niveau ${level.id} verrouillé` : `Jouer le niveau ${level.id} : ${level.title}`);

      const badge = document.createElement('span');
      badge.className = 'level-badge';
      if (locked) badge.append(svgUse('i-lock', 'lock-icon icon'));
      else badge.textContent = String(level.id);

      const copy = document.createElement('span');
      const title = document.createElement('h3');
      title.textContent = `Niveau ${level.id} · ${level.title}`;
      const description = document.createElement('p');
      description.textContent = level.description;
      copy.append(title, description);

      const meta = document.createElement('span');
      meta.className = 'level-meta';
      const starsBox = document.createElement('span');
      starsBox.className = 'stars';
      renderStars(starsBox, stars);
      const status = document.createElement('span');
      status.className = 'eyebrow';
      status.textContent = locked ? 'Verrouillé' : completedLevel ? 'Terminé' : 'Disponible';
      meta.append(starsBox, status);

      button.append(badge, copy, meta);
      button.addEventListener('click', () => startLevel(level.id));
      levelList.append(button);
    });
  }

  function startLevel(levelId) {
    const level = LEVELS.find((item) => item.id === Number(levelId));
    if (!level || level.id > progress.unlockedLevel) return;

    attempt = {
      level,
      questionIndex: 0,
      lives: 3,
      earned: Array(7).fill(null),
      missedAnswers: [],
      finalAttempts: 0,
      defeatContext: null
    };

    renderQuestion();
    showScreen('game');
  }

  function currentQuestion() {
    return attempt?.level.questions[attempt.questionIndex] || null;
  }

  function renderQuestion() {
    const question = currentQuestion();
    if (!attempt || !question) return;

    elements.hudLevel.textContent = `Niveau ${attempt.level.id}`;
    elements.hudQuestion.textContent = `Question ${attempt.questionIndex + 1}/7`;
    elements.questionType.textContent = question.type;
    elements.questionDifficulty.textContent = `Difficulté ${question.difficulty || 1}`;
    elements.gameQuestion.textContent = question.prompt;

    const lengthLabel = answerLengthLabel(question);
    elements.answerLength.textContent = lengthLabel;
    elements.answerInput.value = '';
    elements.answerInput.placeholder = `Réponse · ${lengthLabel}`;
    elements.answerInput.removeAttribute('aria-invalid');
    elements.inputMessage.textContent = '';
    elements.inputMessage.className = 'input-message';

    renderLives(elements.lives, attempt.lives);
    renderLiveCollection();
  }

  function renderLiveCollection() {
    elements.liveLetterRack.replaceChildren();
    const letters = attempt.earned.filter(Boolean);
    elements.collectionCount.textContent = `${letters.length}/7`;

    if (letters.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'empty-collection';
      empty.textContent = 'Votre première lettre apparaîtra ici.';
      elements.liveLetterRack.append(empty);
      return;
    }

    letters.forEach((letter) => elements.liveLetterRack.append(createLetterTile(letter)));
  }

  function submitQuestion(value) {
    const question = currentQuestion();
    if (!attempt || !question) return;

    if (!normalizeAnswer(value)) {
      elements.answerInput.setAttribute('aria-invalid', 'true');
      elements.inputMessage.textContent = 'Saisissez une réponse ou choisissez « Je passe ».';
      elements.answerInput.focus();
      return;
    }

    if (isAcceptedAnswer(question, value)) handleCorrectQuestion(question);
    else handleMissedQuestion(question, false);
  }

  function handleCorrectQuestion(question) {
    attempt.earned[attempt.questionIndex] = question.rewardLetter;
    showFeedback({
      correct: true,
      title: 'Bonne réponse !',
      copy: `${question.answer} est accepté.`,
      detail: `${attempt.earned.filter(Boolean).length} lettre${attempt.earned.filter(Boolean).length > 1 ? 's' : ''} sur 7 collectée${attempt.earned.filter(Boolean).length > 1 ? 's' : ''}.`,
      letter: question.rewardLetter,
      action: advanceAfterQuestion
    });
  }

  function handleMissedQuestion(question, skipped) {
    attempt.lives -= 1;
    attempt.missedAnswers.push({
      questionId: question.id,
      answer: question.answer,
      skipped
    });
    renderLives(elements.lives, attempt.lives);

    if (attempt.lives <= 0) {
      attempt.defeatContext = {
        phase: 'questions',
        answer: question.answer,
        message: skipped
          ? 'Vous avez passé une question alors qu’il ne vous restait qu’une vie.'
          : 'Une troisième réponse incorrecte a épuisé vos vies.'
      };
    }

    showFeedback({
      correct: false,
      title: skipped ? 'Question passée' : 'Mauvaise réponse',
      copy: `La réponse attendue était : ${question.answer}.`,
      detail: attempt.lives > 0
        ? `Vous perdez une vie. Il vous en reste ${attempt.lives}.`
        : 'Vous n’avez plus de vie.',
      action: attempt.lives > 0 ? advanceAfterQuestion : showDefeat
    });
  }

  function advanceAfterQuestion() {
    attempt.questionIndex += 1;
    if (attempt.questionIndex >= attempt.level.questions.length) {
      renderFinalPhase();
      showScreen('final');
    } else {
      renderQuestion();
      showScreen('game');
    }
  }

  function renderFinalPhase() {
    if (!attempt) return;
    renderLives(elements.finalLives, attempt.lives);
    elements.finalLetterRack.replaceChildren();

    attempt.level.scramble.forEach((letter, index) => {
      const earned = Boolean(attempt.earned[index]);
      elements.finalLetterRack.append(createLetterTile(earned ? letter : '?', !earned));
    });

    elements.finalInput.value = '';
    elements.finalInput.placeholder = 'Votre proposition';
    elements.finalInput.removeAttribute('aria-invalid');
    elements.finalMessage.textContent = '';
    elements.finalMessage.className = 'input-message';
  }

  function submitFinalWord(value) {
    if (!attempt) return;
    const entered = normalizeLettersOnly(value).toUpperCase();
    const target = normalizeLettersOnly(attempt.level.word).toUpperCase();

    if (!entered) {
      elements.finalInput.setAttribute('aria-invalid', 'true');
      elements.finalMessage.textContent = 'Saisissez votre proposition.';
      elements.finalInput.focus();
      return;
    }

    if (entered === target) {
      completeLevel();
      return;
    }

    attempt.finalAttempts += 1;
    attempt.lives -= 1;
    renderLives(elements.finalLives, attempt.lives);

    if (attempt.lives <= 0) {
      attempt.defeatContext = {
        phase: 'final',
        answer: null,
        message: 'Votre dernière proposition du mot mystère était incorrecte.'
      };
      showDefeat();
      return;
    }

    elements.finalInput.setAttribute('aria-invalid', 'true');
    elements.finalMessage.textContent = `Mot incorrect. Vous perdez une vie ; il vous en reste ${attempt.lives}.`;
    elements.finalMessage.className = 'input-message';
    elements.finalInput.classList.remove('shake');
    void elements.finalInput.offsetWidth;
    elements.finalInput.classList.add('shake');
    elements.finalInput.select();
  }

  function completeLevel() {
    const stars = attempt.lives;
    const previous = Number(progress.stars[attempt.level.id] || 0);
    progress.stars[attempt.level.id] = Math.max(previous, stars);

    const next = LEVELS.find((level) => level.id === attempt.level.id + 1);
    if (next) progress.unlockedLevel = Math.max(progress.unlockedLevel, next.id);
    saveProgress();
    renderLevels();

    renderWord(elements.victoryWord, attempt.level.word);
    renderStars(elements.victoryStars, stars, true);
    elements.victoryCopy.textContent = stars === 3
      ? 'Parfait : toutes vos vies sont intactes.'
      : `Niveau réussi avec ${stars} vie${stars > 1 ? 's' : ''} restante${stars > 1 ? 's' : ''}.`;

    elements.nextLevel.hidden = !next;
    showScreen('victory');
  }

  function showDefeat() {
    closeFeedback();
    if (!attempt) return;

    renderWord(elements.defeatWord, attempt.level.word);
    const context = attempt.defeatContext || { message: 'Vous n’avez plus de vie.', answer: null };
    elements.defeatReason.textContent = context.message;
    elements.defeatAnswer.textContent = context.answer
      ? `Dernière réponse attendue : ${context.answer}`
      : 'Les lettres collectées n’ont pas suffi cette fois-ci.';
    showScreen('defeat');
  }

  function showFeedback({ correct, title, copy, detail, letter = null, action }) {
    lastFocusedBeforeOverlay = document.activeElement;
    elements.feedbackIcon.className = `feedback-icon${correct ? '' : ' wrong'}`;
    elements.feedbackIcon.replaceChildren(svgUse(correct ? 'i-check' : 'i-x', 'icon'));
    elements.feedbackTitle.textContent = title;
    elements.feedbackCopy.textContent = copy;
    elements.feedbackDetail.textContent = detail;
    elements.earnedLetter.hidden = !letter;
    elements.earnedLetter.textContent = letter || '';
    pendingFeedbackAction = action;
    feedbackOverlay.hidden = false;
    window.requestAnimationFrame(() => elements.feedbackContinue.focus());
  }

  function closeFeedback() {
    feedbackOverlay.hidden = true;
    pendingFeedbackAction = null;
  }

  function handleFeedbackContinue() {
    const action = pendingFeedbackAction;
    closeFeedback();
    if (typeof action === 'function') action();
  }

  function leaveAttempt() {
    attempt = null;
    renderLevels();
    showScreen('levels');
    showToast('Partie quittée.');
  }

  function openResetConfirm() {
    lastFocusedBeforeOverlay = document.activeElement;
    confirmOverlay.hidden = false;
    window.requestAnimationFrame(() => document.querySelector('#confirm-reset').focus());
  }

  function closeResetConfirm() {
    confirmOverlay.hidden = true;
    lastFocusedBeforeOverlay?.focus?.();
  }

  function resetProgress() {
    progress = defaultProgress();
    saveProgress();
    attempt = null;
    renderLevels();
    closeResetConfirm();
    showScreen('home');
    showToast('Progression réinitialisée.');
  }

  function buildConfetti() {
    const container = document.querySelector('.confetti');
    const colours = ['#ffc83d', '#f13a48', '#0b83ef', '#8434ef', '#22ad5a', '#ffffff'];
    for (let index = 0; index < 34; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--rotate', `${Math.random() * 180}deg`);
      piece.style.setProperty('--duration', `${2.8 + Math.random() * 2.5}s`);
      piece.style.setProperty('--delay', `${-Math.random() * 4}s`);
      piece.style.setProperty('--color', colours[index % colours.length]);
      container.append(piece);
    }
  }

  function buildRain() {
    const container = document.querySelector('.rain');
    for (let index = 0; index < 28; index += 1) {
      const drop = document.createElement('span');
      drop.className = 'rain-drop';
      drop.style.setProperty('--x', `${Math.random() * 100}%`);
      drop.style.setProperty('--duration', `${.85 + Math.random() * .85}s`);
      drop.style.setProperty('--delay', `${-Math.random() * 2}s`);
      container.append(drop);
    }
  }

  function wireEvents() {
    document.querySelector('#play-button').addEventListener('click', () => {
      showScreen(progress.tutorialSeen ? 'levels' : 'how');
    });
    document.querySelector('#how-button').addEventListener('click', () => showScreen('how'));
    document.querySelector('#home-reset').addEventListener('click', openResetConfirm);

    document.querySelectorAll('[data-nav]').forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.nav;
        if (target === 'levels' && activeScreen === 'how') {
          progress.tutorialSeen = true;
          saveProgress();
        }
        if (target === 'levels') renderLevels();
        showScreen(target);
      });
    });

    elements.answerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitQuestion(elements.answerInput.value);
    });
    elements.skipQuestion.addEventListener('click', () => handleMissedQuestion(currentQuestion(), true));

    elements.finalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitFinalWord(elements.finalInput.value);
    });

    elements.feedbackContinue.addEventListener('click', handleFeedbackContinue);
    document.querySelector('#quit-level').addEventListener('click', leaveAttempt);
    document.querySelector('#final-quit').addEventListener('click', leaveAttempt);

    elements.nextLevel.addEventListener('click', () => {
      const next = LEVELS.find((level) => level.id === attempt.level.id + 1);
      if (next) startLevel(next.id);
    });
    elements.replayLevel.addEventListener('click', () => startLevel(attempt.level.id));
    elements.retryLevel.addEventListener('click', () => startLevel(attempt.level.id));

    document.querySelector('#confirm-reset').addEventListener('click', resetProgress);
    document.querySelector('#cancel-reset').addEventListener('click', closeResetConfirm);

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!confirmOverlay.hidden) {
        event.preventDefault();
        closeResetConfirm();
      }
    });
  }

  function initialise() {
    try {
      validateData();
    } catch (error) {
      console.error(error);
      document.body.innerHTML = `<main style="padding:2rem;color:white;font-family:sans-serif"><h1>Erreur de données</h1><p>${error.message}</p></main>`;
      return;
    }

    buildConfetti();
    buildRain();
    wireEvents();
    renderLevels();
    showScreen('home', { focus: false });
  }

  initialise();
})();
