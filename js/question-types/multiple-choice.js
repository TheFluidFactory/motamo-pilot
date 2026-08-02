(() => {
  'use strict';
  const M = window.Motamo;

  M.game.questionTypes.register('multipleChoice', (context) => {
    const { question, host, inputMessage, answerAreaLabel, onChange } = context;
    let selected = null;

    answerAreaLabel.textContent = 'Choisissez une réponse';
    host.className = 'question-interaction choice-interaction';
    host.removeAttribute('role');
    host.removeAttribute('tabindex');

    const list = document.createElement('div');
    list.className = 'choice-list';
    host.replaceChildren(list);

    const options = question.options.map((option, index) => {
      if (typeof option === 'string') return { id: `option-${index}`, label: option, value: option };
      return option;
    });

    function render() {
      list.replaceChildren();
      options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-button';
        button.dataset.optionId = option.id;
        button.setAttribute('aria-pressed', String(selected?.id === option.id));
        if (selected?.id === option.id) button.classList.add('is-selected');

        const marker = document.createElement('span');
        marker.className = 'choice-marker';
        marker.textContent = String.fromCharCode(65 + index);
        const label = document.createElement('strong');
        label.textContent = option.label;
        button.append(marker, label);
        button.addEventListener('click', () => {
          selected = option;
          inputMessage.textContent = '';
          list.classList.remove('is-error');
          render();
          onChange();
        });
        list.append(button);
      });
    }

    function showIncomplete() {
      inputMessage.textContent = M.data.copy.chooseAnswer;
      list.classList.add('is-error');
      list.classList.remove('shake');
      void list.offsetWidth;
      list.classList.add('shake');
    }

    render();

    return {
      usesKeyboard: false,
      getAnswer: () => selected?.value || '',
      isComplete: () => Boolean(selected),
      showIncomplete,
      reset: () => { selected = null; render(); onChange(); },
      focus: () => list.querySelector('button')?.focus({ preventScroll: true }),
      destroy: () => host.replaceChildren()
    };
  });
})();
