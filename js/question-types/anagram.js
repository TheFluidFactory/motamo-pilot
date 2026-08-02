(() => {
  'use strict';
  const M = window.Motamo;
  const { normalizeLettersOnly } = M.core.utils;
  const C = M.ui.components;

  M.game.questionTypes.register('anagram', (context) => {
    const { question, host, inputMessage, answerAreaLabel, onChange } = context;
    const source = [...normalizeLettersOnly(question.letterBank)];
    const tokens = source.map((letter, index) => Object.freeze({ id: `${question.id}-${index}`, letter }));
    let placed = Array(tokens.length).fill(null);
    let activeDrag = null;

    answerAreaLabel.textContent = 'Remettez les lettres dans l’ordre';
    host.className = 'question-interaction anagram-interaction';
    host.removeAttribute('role');
    host.removeAttribute('tabindex');

    const slots = document.createElement('div');
    slots.className = 'answer-slots anagram-slots';
    C.setSlotContainerWidth(slots, tokens.length);
    const instruction = document.createElement('p');
    instruction.className = 'anagram-instruction';
    instruction.textContent = 'Glissez ou touchez les lettres pour les placer.';
    const bank = document.createElement('div');
    bank.className = 'anagram-bank';
    const actions = document.createElement('div');
    actions.className = 'anagram-actions';
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'anagram-reset';
    resetButton.textContent = 'Recommencer';
    actions.append(resetButton);
    host.replaceChildren(slots, instruction, bank, actions);

    function firstEmptyIndex() {
      return placed.findIndex((item) => item === null);
    }

    function tokenIsPlaced(tokenId) {
      return placed.some((item) => item?.id === tokenId);
    }

    function placeToken(token, targetIndex = firstEmptyIndex()) {
      if (!token || targetIndex < 0 || targetIndex >= placed.length) return;
      const previousIndex = placed.findIndex((item) => item?.id === token.id);
      if (previousIndex >= 0) placed[previousIndex] = null;
      if (placed[targetIndex]) {
        const empty = firstEmptyIndex();
        if (empty >= 0 && empty !== targetIndex) placed[empty] = placed[targetIndex];
        else if (previousIndex >= 0) placed[previousIndex] = placed[targetIndex];
      }
      placed[targetIndex] = token;
      inputMessage.textContent = '';
      slots.classList.remove('is-error');
      render();
      onChange();
    }

    function removeAt(index) {
      if (!placed[index]) return;
      placed[index] = null;
      inputMessage.textContent = '';
      slots.classList.remove('is-error');
      render();
      onChange();
    }

    function endDrag() {
      if (!activeDrag) return;
      activeDrag.ghost?.remove();
      window.removeEventListener('pointermove', activeDrag.move);
      window.removeEventListener('pointerup', activeDrag.up);
      window.removeEventListener('pointercancel', activeDrag.cancel);
      activeDrag = null;
    }

    function beginDrag(token, sourceButton, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      endDrag();
      const rect = sourceButton.getBoundingClientRect();
      const ghost = sourceButton.cloneNode(true);
      ghost.classList.add('drag-ghost');
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      document.body.append(ghost);
      let moved = false;
      const positionGhost = (pointerEvent) => {
        ghost.style.left = `${pointerEvent.clientX - rect.width / 2}px`;
        ghost.style.top = `${pointerEvent.clientY - rect.height / 2}px`;
      };
      positionGhost(event);

      const move = (pointerEvent) => {
        moved = true;
        positionGhost(pointerEvent);
        document.querySelectorAll('.anagram-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
        document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.anagram-slot')?.classList.add('drag-over');
      };
      const up = (pointerEvent) => {
        const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.anagram-slot');
        document.querySelectorAll('.anagram-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
        const targetIndex = target ? Number(target.dataset.index) : firstEmptyIndex();
        endDrag();
        if (target || !moved) placeToken(token, targetIndex);
      };
      const cancel = () => endDrag();
      activeDrag = { ghost, move, up, cancel };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    }

    function render() {
      slots.replaceChildren();
      placed.forEach((token, index) => {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'answer-slot anagram-slot';
        slot.dataset.index = String(index);
        slot.setAttribute('aria-label', token ? `Lettre ${token.letter}, toucher pour retirer` : `Case ${index + 1} vide`);
        if (token) {
          slot.textContent = token.letter;
          slot.classList.add('filled');
          slot.addEventListener('click', () => removeAt(index));
        } else if (index === firstEmptyIndex()) {
          slot.classList.add('next');
        }
        slots.append(slot);
      });

      bank.replaceChildren();
      tokens.forEach((token) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'drag-letter';
        button.textContent = token.letter;
        button.setAttribute('aria-label', `Lettre ${token.letter}`);
        if (tokenIsPlaced(token.id)) {
          button.classList.add('is-used');
          button.disabled = true;
        } else {
          button.addEventListener('pointerdown', (event) => beginDrag(token, button, event));
          button.addEventListener('click', () => placeToken(token));
        }
        bank.append(button);
      });
    }

    function showIncomplete() {
      inputMessage.textContent = M.data.copy.completeAllCases;
      slots.classList.add('is-error');
      slots.classList.remove('shake');
      void slots.offsetWidth;
      slots.classList.add('shake');
    }

    resetButton.addEventListener('click', () => {
      placed = Array(tokens.length).fill(null);
      inputMessage.textContent = '';
      slots.classList.remove('is-error');
      render();
      onChange();
    });

    render();

    return {
      usesKeyboard: false,
      getAnswer: () => placed.map((token) => token?.letter || '').join(''),
      isComplete: () => placed.every(Boolean),
      showIncomplete,
      reset: () => { placed = Array(tokens.length).fill(null); render(); onChange(); },
      focus: () => bank.querySelector('button:not([disabled])')?.focus({ preventScroll: true }),
      destroy: () => { endDrag(); host.replaceChildren(); }
    };
  });
})();
