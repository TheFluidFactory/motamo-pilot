(() => {
  'use strict';
  const M = window.Motamo;
  const { normalizeLettersOnly } = M.core.utils;
  const C = M.ui.components;

  M.game.questionTypes.register('text', (context) => {
    const { question, host, keyboard, inputMessage, answerAreaLabel, onChange } = context;
    const answer = normalizeLettersOnly(question.answer);
    const hintIndex = answer.length > 1 && Number.isInteger(question.hintIndex) ? question.hintIndex : null;
    const maxEntryLength = answer.length - (hintIndex === null ? 0 : 1);
    let entry = '';

    answerAreaLabel.textContent = 'Votre réponse';
    host.className = 'question-interaction text-interaction';
    host.setAttribute('role', 'textbox');
    host.setAttribute('tabindex', '0');

    const slots = document.createElement('div');
    slots.className = 'answer-slots';
    host.replaceChildren(slots);

    function fullAnswer() {
      if (hintIndex === null) return entry;
      return entry.slice(0, hintIndex) + answer[hintIndex] + entry.slice(hintIndex);
    }

    function render() {
      slots.replaceChildren();
      C.setSlotContainerWidth(slots, answer.length);
      const typed = [...entry];
      for (let index = 0; index < answer.length; index += 1) {
        const slot = document.createElement('span');
        slot.className = 'answer-slot';
        if (index === hintIndex) {
          slot.textContent = answer[index];
          slot.classList.add('filled', 'hint-letter');
          slot.setAttribute('aria-label', `Lettre indice : ${answer[index]}`);
        } else {
          const entryIndex = hintIndex === null || index < hintIndex ? index : index - 1;
          const letter = typed[entryIndex];
          if (letter) {
            slot.textContent = letter;
            slot.classList.add('filled');
          } else if (entryIndex === typed.length) {
            slot.classList.add('next');
          }
        }
        slots.append(slot);
      }
      const hintCopy = hintIndex === null ? '' : ', une lettre indice offerte';
      host.setAttribute('aria-label', `Réponse${hintCopy}, ${entry.length} lettre${entry.length > 1 ? 's' : ''} saisie${entry.length > 1 ? 's' : ''}`);
      onChange();
    }

    function setEntry(value) {
      entry = normalizeLettersOnly(value).slice(0, maxEntryLength);
      inputMessage.textContent = '';
      slots.classList.remove('is-error');
      render();
    }

    function handleKey(key) {
      if (key === 'BACKSPACE') {
        setEntry(entry.slice(0, -1));
        return true;
      }
      if (/^[A-Z]$/.test(key)) {
        if (entry.length >= maxEntryLength) {
          slots.classList.remove('shake');
          void slots.offsetWidth;
          slots.classList.add('shake');
          return true;
        }
        setEntry(entry + key);
        return true;
      }
      return false;
    }

    function showIncomplete() {
      inputMessage.textContent = M.data.copy.completeAllCases;
      slots.classList.add('is-error');
      slots.classList.remove('shake');
      void slots.offsetWidth;
      slots.classList.add('shake');
    }

    render();

    return {
      usesKeyboard: true,
      handleKey,
      getAnswer: fullAnswer,
      isComplete: () => entry.length === maxEntryLength,
      showIncomplete,
      reset: () => setEntry(''),
      focus: () => host.focus({ preventScroll: true }),
      destroy: () => host.replaceChildren()
    };
  });
})();
