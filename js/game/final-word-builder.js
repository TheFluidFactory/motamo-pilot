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

    let entry = Array(answerLength).fill(null);
    let activeDrag = null;
    let lastPointerHandled = 0;

    const collectedLetters = earnedLetters
      .map(normalizeLettersOnly)
      .filter((letter) => letter.length === 1);

    const collectedSources = collectedLetters.map((letter, index) => ({
      id: `collected-${index}`,
      letter,
      kind: 'collected',
      order: index
    }));

    const alphabetSources = [...M.config.alphabet].map((letter, alphabetIndex) => ({
      id: `alphabet-${letter}`,
      letter,
      kind: 'alphabet',
      order: alphabetIndex
    }));

    const allSources = [...collectedSources, ...alphabetSources];
    const sourceById = new Map(allSources.map((source) => [source.id, source]));

    function firstEmptyIndex() {
      return entry.findIndex((sourceId) => !sourceId);
    }

    function isSourceInUse(sourceId) {
      const source = sourceById.get(sourceId);
      if (!source) return false;

      // Collected (yellow) tiles are finite: once placed, that exact tile is unavailable
      // until it is removed from the answer. Alphabet (white) tiles are reusable, but
      // temporarily disappear while being dragged so the drag never shows a static duplicate.
      if (activeDrag?.sourceId === sourceId) return true;
      return source.kind === 'collected' && entry.includes(sourceId);
    }

    function sourceAt(index) {
      return sourceById.get(entry[index]) || null;
    }

    function clearDragStyles() {
      document.querySelectorAll('.final-answer-slot.drag-over').forEach((slot) => slot.classList.remove('drag-over'));
    }

    function detachDragListeners(drag) {
      if (!drag) return;
      window.removeEventListener('pointermove', drag.move);
      window.removeEventListener('pointerup', drag.up);
      window.removeEventListener('pointercancel', drag.cancel);
    }

    function finishDrag({ render = true } = {}) {
      const drag = activeDrag;
      if (!drag) return;
      detachDragListeners(drag);
      drag.ghost?.remove();
      activeDrag = null;
      clearDragStyles();
      if (render) renderAll();
    }

    function createGhost(sourceElement, source) {
      const rect = sourceElement.getBoundingClientRect();
      const ghost = document.createElement('span');
      ghost.className = `${sourceElement.className.replace(/\bis-used\b|\bis-dragging-source\b/g, '').trim()} final-drag-ghost`;
      ghost.textContent = source.letter;
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

    function placeUnusedSource(sourceId, targetIndex = firstEmptyIndex()) {
      if (!sourceById.has(sourceId) || isSourceInUse(sourceId)) return false;
      if (targetIndex === null || targetIndex < 0 || targetIndex >= entry.length) return false;

      entry[targetIndex] = sourceId;
      message.textContent = '';
      slots.classList.remove('is-error');
      renderAll();
      onChange();
      return true;
    }

    function movePlacedSource(originIndex, targetIndex) {
      const sourceId = entry[originIndex];
      if (!sourceId || targetIndex === null || targetIndex < 0 || targetIndex >= entry.length) return false;
      if (originIndex === targetIndex) return true;

      const displacedSourceId = entry[targetIndex];
      entry[targetIndex] = sourceId;
      entry[originIndex] = displacedSourceId || null;
      message.textContent = '';
      slots.classList.remove('is-error');
      renderAll();
      onChange();
      return true;
    }

    function removeAt(index) {
      if (!entry[index]) return;
      entry[index] = null;
      message.textContent = '';
      slots.classList.remove('is-error');
      renderAll();
      onChange();
    }

    function updateDragTarget(pointerEvent) {
      clearDragStyles();
      const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
      if (targetIndex !== null) slots.querySelector(`[data-index="${targetIndex}"]`)?.classList.add('drag-over');
      return targetIndex;
    }

    function beginSourceDrag(sourceId, sourceElement, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (isSourceInUse(sourceId)) return;
      const source = sourceById.get(sourceId);
      if (!source) return;

      event.preventDefault();
      finishDrag({ render: false });
      lastPointerHandled = performance.now();

      const { ghost, rect } = createGhost(sourceElement, source);
      positionGhost(ghost, rect, event);
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      const move = (pointerEvent) => {
        if (Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) > 6) moved = true;
        positionGhost(ghost, rect, pointerEvent);
        updateDragTarget(pointerEvent);
      };

      const up = (pointerEvent) => {
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        const shouldTapPlace = !moved;
        finishDrag({ render: false });
        if (targetIndex !== null) placeUnusedSource(sourceId, targetIndex);
        else if (shouldTapPlace) placeUnusedSource(sourceId);
        else renderAll();
      };

      const cancel = () => finishDrag();
      activeDrag = { sourceId, ghost, move, up, cancel };
      renderSourceBanks();
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    }

    function beginAnswerDrag(index, sourceElement, event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const sourceId = entry[index];
      const source = sourceById.get(sourceId);
      if (!source) return;

      event.preventDefault();
      finishDrag({ render: false });
      lastPointerHandled = performance.now();

      const { ghost, rect } = createGhost(sourceElement, source);
      sourceElement.classList.add('is-dragging-origin');
      positionGhost(ghost, rect, event);
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;

      const move = (pointerEvent) => {
        if (Math.hypot(pointerEvent.clientX - startX, pointerEvent.clientY - startY) > 6) moved = true;
        positionGhost(ghost, rect, pointerEvent);
        updateDragTarget(pointerEvent);
      };

      const up = (pointerEvent) => {
        const targetIndex = targetIndexAt(pointerEvent.clientX, pointerEvent.clientY);
        finishDrag({ render: false });

        if (!moved) {
          removeAt(index);
          return;
        }
        if (targetIndex !== null) {
          movePlacedSource(index, targetIndex);
          return;
        }
        removeAt(index);
      };

      const cancel = () => finishDrag();
      activeDrag = { sourceId, originIndex: index, ghost, move, up, cancel };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', cancel, { once: true });
    }

    function createSourceButton(source) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `final-source-letter ${source.kind}`;
      button.textContent = source.letter;
      button.dataset.sourceId = source.id;

      const used = isSourceInUse(source.id);
      button.classList.toggle('is-used', used);
      button.disabled = used;
      button.setAttribute('aria-hidden', String(used));
      button.setAttribute('aria-label', `${source.kind === 'collected' ? 'Lettre gagnée' : 'Lettre'} ${source.letter}, toucher ou faire glisser pour ajouter`);

      if (!used) {
        button.addEventListener('pointerdown', (event) => beginSourceDrag(source.id, button, event));
        button.addEventListener('click', (event) => {
          if (performance.now() - lastPointerHandled < 500) {
            event.preventDefault();
            return;
          }
          placeUnusedSource(source.id);
        });
      }
      return button;
    }

    function renderSourceBanks() {
      collectedCount.textContent = `${collectedLetters.length}/${answerLength}`;
      collectedBank.replaceChildren(...collectedSources.map(createSourceButton));
      collectedEmpty.hidden = collectedSources.length > 0;
      alphabetBank.replaceChildren(...alphabetSources.map(createSourceButton));
    }

    function renderAnswerSlots() {
      slots.replaceChildren();
      C.setSlotContainerWidth(slots, answerLength);
      entry.forEach((sourceId, index) => {
        const source = sourceById.get(sourceId);
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'answer-slot final-answer-slot';
        slot.dataset.index = String(index);

        if (source) {
          slot.textContent = source.letter;
          slot.classList.add('filled');
          slot.setAttribute('aria-label', `Lettre ${source.letter}, toucher pour retirer ou faire glisser`);
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

      const placedCount = entry.filter(Boolean).length;
      slots.setAttribute('aria-label', `Mot mystère : ${placedCount} lettre${placedCount > 1 ? 's' : ''} placée${placedCount > 1 ? 's' : ''} sur ${answerLength}`);
    }

    function renderAll() {
      renderAnswerSlots();
      renderSourceBanks();
    }

    function showIncomplete() {
      message.textContent = M.data.copy.completeAllCases;
      slots.classList.add('is-error');
      slots.classList.remove('shake');
      void slots.offsetWidth;
      slots.classList.add('shake');
    }

    function reset() {
      finishDrag({ render: false });
      entry = Array(answerLength).fill(null);
      message.textContent = '';
      slots.classList.remove('is-error', 'shake');
      renderAll();
      onChange();
    }

    renderAll();

    return {
      getAnswer: () => entry.map((sourceId) => sourceById.get(sourceId)?.letter || '').join(''),
      isComplete: () => entry.every(Boolean),
      showIncomplete,
      reset,
      focus: () => {
        const target = collectedBank.querySelector('button:not(:disabled)') || alphabetBank.querySelector('button:not(:disabled)');
        target?.focus({ preventScroll: true });
      },
      destroy: () => {
        finishDrag({ render: false });
        slots.replaceChildren();
        collectedBank.replaceChildren();
        alphabetBank.replaceChildren();
      }
    };
  }

  M.game.createFinalWordBuilder = createFinalWordBuilder;
})();
