(() => {
  'use strict';
  const M = window.Motamo;
  const C = M.ui.components;
  const { normalizeLettersOnly } = M.core.utils;

  function createFinalWordBuilder(context) {
    const {
      slots,
      collectedBank,
      alphabetBank,
      collectedCount,
      collectedEmpty,
      message,
      answerLength,
      earnedLetters,
      onChange
    } = context;

    let entry = Array(answerLength).fill('');
    let activeDrag = null;
    let lastPointerHandled = 0;

    const collected = earnedLetters
      .map(normalizeLettersOnly)
      .filter((letter) => letter.length === 1);
    const collectedSet = new Set(collected);
    const alphabet = [...M.config.alphabet].filter((letter) => !collectedSet.has(letter));

    function firstEmptyIndex() {
      return entry.findIndex((letter) => !letter);
    }

    function endDrag() {
      if (!activeDrag) return;
      activeDrag.source?.classList.remove('is-dragging-source');
      activeDrag.ghost?.remove();
      window.removeEventListener('pointermove', activeDrag.move);
      window.removeEventListener('pointerup', activeDrag.up);
      window.removeEventListener('pointercancel', activeDrag.cancel);
      activeDrag = null;
      document.querySelectorAll('.final-answer-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
    }

    function createGhost(source, letter) {
      const rect = source.getBoundingClientRect();
      const ghost = document.createElement('span');
      ghost.className = 'final-source-letter final-drag-ghost';
      ghost.textContent = letter;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      document.body.append(ghost);
      return { ghost, rect };
    }

    function positionGhost(ghost, rect, event) {
      ghost.style.left = `${event.clientX - rect.width / 2}px`;
      ghost.style.top = `${event.clientY - rect.height / 2}px`;
    }

    function targetIndexAt(x, y) {
      const target = document.elementFromPoint(x, y)?.closest('.final-answer-slot');
      if (!target || !slots.contains(target)) return null;
      return Number(target.dataset.index);
    }

    function setLetterAt(letter, targetIndex = firstEmptyIndex(), originIndex = null) {
      if (!letter || targetIndex === null || targetIndex < 0 || targetIndex >= entry.length) return false;
      const displaced = entry[targetIndex];
      if (displaced && originIndex !== null && originIndex !== targetIndex) entry[originIndex] = displaced;
      else if (displaced && originIndex === null) {
        const empty = firstEmptyIndex();
        if (empty >= 0 && empty !== targetIndex) entry[empty] = displaced;
      }
      entry[targetIndex] = letter;
      message.textContent = '';
      slots.classList.remove('is-error');
      renderAnswerSlots();
      onChange();
      return true;
    }

    function removeAt(index) {
      if (!entry[index]) return;
      entry[index] = '';
      message.textContent = '';
      slots.classList.remove('is-error');
      renderAnswerSlots();
      onChange();
    }

    function beginSourceDrag(letter, source, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      endDrag();
      lastPointerHandled = performance.now();
      source.classList.add('is-dragging-source');
      const { ghost, rect } = createGhost(source, letter);
      positionGhost(ghost, rect, event);
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      const move = (pointerEvent) => {
        if (Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) > 6) moved = true;
        positionGhost(ghost, rect, pointerEvent);
        document.querySelectorAll('.final-answer-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        if (targetIndex !== null) slots.querySelector(`[data-index="${targetIndex}"]`)?.classList.add('drag-over');
      };
      const up = (pointerEvent) => {
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        endDrag();
        if (targetIndex !== null) setLetterAt(letter, targetIndex);
        else if (!moved) setLetterAt(letter);
      };
      const cancel = () => endDrag();
      activeDrag = { source, ghost, move, up, cancel };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    }

    function beginAnswerDrag(index, source, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const letter = entry[index];
      if (!letter) return;
      event.preventDefault();
      endDrag();
      lastPointerHandled = performance.now();
      const { ghost, rect } = createGhost(source, letter);
      positionGhost(ghost, rect, event);
      entry[index] = '';
      renderAnswerSlots();
      onChange();

      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;
      const move = (pointerEvent) => {
        if (Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) > 6) moved = true;
        positionGhost(ghost, rect, pointerEvent);
        document.querySelectorAll('.final-answer-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        if (targetIndex !== null) slots.querySelector(`[data-index="${targetIndex}"]`)?.classList.add('drag-over');
      };
      const up = (pointerEvent) => {
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        endDrag();
        if (targetIndex !== null) setLetterAt(letter, targetIndex, index);
        else if (!moved) {
          message.textContent = '';
          slots.classList.remove('is-error');
        }
      };
      const cancel = () => endDrag();
      activeDrag = { source: null, ghost, move, up, cancel };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    }

    function createSourceButton(letter, kind, index) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `final-source-letter ${kind}`;
      button.textContent = letter;
      button.dataset.sourceIndex = String(index);
      button.setAttribute('aria-label', `${kind === 'collected' ? 'Lettre gagnée' : 'Lettre'} ${letter}, toucher ou faire glisser pour ajouter`);
      button.addEventListener('pointerdown', (event) => beginSourceDrag(letter, button, event));
      button.addEventListener('click', (event) => {
        if (performance.now() - lastPointerHandled < 500) {
          event.preventDefault();
          return;
        }
        setLetterAt(letter);
      });
      return button;
    }

    function renderSourceBanks() {
      collectedCount.textContent = `${collected.length}/${answerLength}`;
      collectedBank.replaceChildren(...collected.map((letter, index) => createSourceButton(letter, 'collected', index)));
      collectedEmpty.hidden = collected.length > 0;
      alphabetBank.replaceChildren(...alphabet.map((letter, index) => createSourceButton(letter, 'alphabet', index)));
    }

    function renderAnswerSlots() {
      slots.replaceChildren();
      C.setSlotContainerWidth(slots, answerLength);
      entry.forEach((letter, index) => {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'answer-slot final-answer-slot';
        slot.dataset.index = String(index);
        if (letter) {
          slot.textContent = letter;
          slot.classList.add('filled');
          slot.setAttribute('aria-label', `Lettre ${letter}, toucher ou faire glisser hors des cases pour retirer`);
          slot.addEventListener('pointerdown', (event) => beginAnswerDrag(index, slot, event));
          slot.addEventListener('click', (event) => {
            if (performance.now() - lastPointerHandled < 500) {
              event.preventDefault();
              return;
            }
            removeAt(index);
          });
        } else {
          slot.setAttribute('aria-label', `Case ${index + 1} vide`);
          if (index === firstEmptyIndex()) slot.classList.add('next');
        }
        slots.append(slot);
      });
      slots.setAttribute('aria-label', `Mot mystère : ${entry.filter(Boolean).length} lettre${entry.filter(Boolean).length > 1 ? 's' : ''} placée${entry.filter(Boolean).length > 1 ? 's' : ''} sur ${answerLength}`);
    }

    function showIncomplete() {
      message.textContent = M.data.copy.completeAllCases;
      slots.classList.add('is-error');
      slots.classList.remove('shake');
      void slots.offsetWidth;
      slots.classList.add('shake');
    }

    function reset() {
      entry = Array(answerLength).fill('');
      message.textContent = '';
      slots.classList.remove('is-error', 'shake');
      renderAnswerSlots();
      onChange();
    }

    renderSourceBanks();
    renderAnswerSlots();

    return {
      getAnswer: () => entry.join(''),
      isComplete: () => entry.every(Boolean),
      showIncomplete,
      reset,
      focus: () => {
        const target = collectedBank.querySelector('button') || alphabetBank.querySelector('button');
        target?.focus({ preventScroll: true });
      },
      destroy: () => { endDrag(); slots.replaceChildren(); collectedBank.replaceChildren(); alphabetBank.replaceChildren(); }
    };
  }

  M.game.createFinalWordBuilder = createFinalWordBuilder;
})();
