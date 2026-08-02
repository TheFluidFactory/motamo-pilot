(() => {
  'use strict';

  function startPatch() {
    const gameScreen = document.querySelector('[data-screen="game"]');
    const gameQuestion = document.querySelector('#game-question');
    const answerSlots = document.querySelector('#answer-slots');
    const feedbackOverlay = document.querySelector('#feedback-overlay');
    const confirmOverlay = document.querySelector('#confirm-overlay');

    if (!gameScreen || !gameQuestion || !answerSlots) return;

    const style = document.createElement('style');
    style.textContent = `
      .answer-slot.hint-letter{
        border-color:#ffd45a!important;
        background:linear-gradient(180deg,#fff8ca,#f3cf63)!important;
        color:#3a2b06!important;
        box-shadow:0 4px 0 #b88a18,0 0 0 3px rgba(255,200,61,.15),0 7px 12px rgba(0,0,0,.22)!important;
      }
      .answer-slot.hint-letter::after{
        content:"✦";
        position:absolute;
        top:-.35rem;
        right:-.2rem;
        display:grid;
        place-items:center;
        width:.9rem;
        height:.9rem;
        border-radius:999px;
        background:var(--purple-600);
        color:#fff;
        font-size:.52rem;
        box-shadow:0 3px 7px rgba(0,0,0,.28);
      }
      .keyboard-row .key.action{
        order:99;
        flex:1.25!important;
        background:linear-gradient(180deg,#f6be35,#d9820b)!important;
        color:#10244d!important;
        font-size:1.75rem!important;
        line-height:1!important;
        box-shadow:0 4px 0 #8c4e04,inset 0 1px 0 rgba(255,255,255,.38)!important;
      }
      .keyboard-row .key.action:active,
      .keyboard-row .key.action.is-pressed{
        box-shadow:0 1px 0 #8c4e04,inset 0 1px 0 rgba(255,255,255,.3)!important;
      }
    `;
    document.head.append(style);

    const normalize = (value) => String(value ?? '')
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/gi, '')
      .toUpperCase();

    const state = {
      question: null,
      hintIndex: null,
      userEntry: '',
      syncedEntry: '',
      syncing: false
    };

    function configureBackspaceKeys() {
      document.querySelectorAll('.keyboard-panel .key.action').forEach((button) => {
        const row = button.closest('.keyboard-row');
        if (row) row.append(button);
        button.replaceChildren(document.createTextNode('‹'));
        button.setAttribute('aria-label', 'Effacer la dernière lettre');
      });
    }

    function findCurrentQuestion() {
      const prompt = gameQuestion.textContent.trim();
      if (!prompt) return null;
      for (const level of (window.MOTAMO_LEVELS || [])) {
        const question = level.questions.find((item) => item.prompt === prompt);
        if (question) return question;
      }
      return null;
    }

    function acceptedAnswers() {
      if (!state.question) return [];
      return [state.question.answer, ...(state.question.acceptedAnswers || [])].map(normalize);
    }

    function answerPositionForUserIndex(userIndex) {
      return userIndex >= state.hintIndex ? userIndex + 1 : userIndex;
    }

    function matchingAnswers() {
      const typed = [...state.userEntry];
      return acceptedAnswers().filter((answer) =>
        typed.every((letter, userIndex) => answer[answerPositionForUserIndex(userIndex)] === letter)
      );
    }

    function selectedAnswer() {
      return matchingAnswers()[0] || acceptedAnswers()[0] || '';
    }

    function hintLetter() {
      return selectedAnswer()[state.hintIndex] || '';
    }

    function appEntry() {
      if (state.hintIndex === null) return state.userEntry;
      const beforeHint = state.userEntry.slice(0, state.hintIndex);
      if (state.userEntry.length < state.hintIndex) return beforeHint;
      return beforeHint + hintLetter() + state.userEntry.slice(state.hintIndex);
    }

    function dispatchToGame(key) {
      const browserKey = key === 'BACKSPACE' ? 'Backspace' : key;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: browserKey, bubbles: true }));
    }

    function applyHintVisual() {
      if (!state.question || state.hintIndex === null) return;
      const slot = answerSlots.children[state.hintIndex];
      if (!slot) return;
      slot.textContent = hintLetter();
      slot.classList.add('filled', 'hint-letter');
      slot.setAttribute('aria-label', `Lettre indice : ${hintLetter()}`);
    }

    function syncGameEntry() {
      const next = appEntry();
      state.syncing = true;
      for (let index = 0; index < state.syncedEntry.length; index += 1) dispatchToGame('BACKSPACE');
      for (const letter of next) dispatchToGame(letter);
      state.syncedEntry = next;
      state.syncing = false;
      window.requestAnimationFrame(applyHintVisual);
    }

    function initialiseQuestion() {
      const question = findCurrentQuestion();
      if (!question) return;
      const length = normalize(question.answer).length;
      if (state.question?.id === question.id && state.hintIndex !== null) {
        window.requestAnimationFrame(applyHintVisual);
        return;
      }

      state.question = question;
      state.hintIndex = length > 1 ? 1 + Math.floor(Math.random() * (length - 1)) : null;
      state.userEntry = '';
      state.syncedEntry = '';
      window.requestAnimationFrame(applyHintVisual);
    }

    function gameIsActive() {
      return !gameScreen.hidden && gameScreen.classList.contains('is-active');
    }

    document.addEventListener('keydown', (event) => {
      if (state.syncing || !gameIsActive()) return;
      if (feedbackOverlay && !feedbackOverlay.hidden) return;
      if (confirmOverlay && !confirmOverlay.hidden) return;
      if (!state.question) initialiseQuestion();
      if (!state.question || state.hintIndex === null) return;

      let handled = false;
      const requiredLength = normalize(state.question.answer).length - 1;

      if (event.key === 'Backspace') {
        state.userEntry = state.userEntry.slice(0, -1);
        handled = true;
      } else if (event.key === 'Enter') {
        handled = true;
      } else {
        const letter = normalize(event.key);
        if (letter.length === 1) {
          if (state.userEntry.length < requiredLength) state.userEntry += letter;
          handled = true;
        }
      }

      if (!handled) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      syncGameEntry();

      if (event.key === 'Enter') {
        window.setTimeout(() => {
          state.syncing = true;
          dispatchToGame('ENTER');
          state.syncing = false;
        }, 0);
      }
    }, true);

    const questionObserver = new MutationObserver(initialiseQuestion);
    questionObserver.observe(gameQuestion, { childList: true, subtree: true, characterData: true });

    const slotsObserver = new MutationObserver(() => window.requestAnimationFrame(applyHintVisual));
    slotsObserver.observe(answerSlots, { childList: true });

    configureBackspaceKeys();
    initialiseQuestion();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startPatch, { once: true });
  } else {
    startPatch();
  }
})();
