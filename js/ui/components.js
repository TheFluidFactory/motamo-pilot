(() => {
  'use strict';
  const M = window.Motamo;
  const { svgUse } = M.core.utils;

  function renderLives(container, lives) {
    container.replaceChildren();
    container.setAttribute('aria-label', `${lives} vie${lives > 1 ? 's' : ''} restante${lives > 1 ? 's' : ''}`);
    for (let index = 0; index < M.config.livesPerLevel; index += 1) {
      const heart = svgUse('i-heart', 'life');
      if (index >= lives) heart.classList.add('empty');
      container.append(heart);
    }
  }

  function createLetterTile(letter, tileState = 'known') {
    const tile = document.createElement('span');
    tile.className = 'letter-tile';
    if (tileState === 'unknown') tile.classList.add('unknown');
    if (tileState === 'future') tile.classList.add('unknown', 'future');
    tile.textContent = tileState === 'known' ? letter : tileState === 'unknown' ? '?' : '';
    return tile;
  }

  function renderWord(container, word) {
    container.replaceChildren();
    [...word].forEach((letter) => container.append(createLetterTile(letter)));
  }

  function renderStars(container, amount, large = false) {
    container.replaceChildren();
    for (let index = 0; index < M.config.livesPerLevel; index += 1) {
      const star = svgUse('i-star', 'star');
      if (index >= amount) star.classList.add('empty');
      if (large) star.classList.add('large');
      container.append(star);
    }
  }

  function setSlotContainerWidth(container, count) {
    container.style.setProperty('--slot-count', String(count));
    container.style.maxWidth = `${Math.min(M.config.answerSlotsMaxWidthPx, count * M.config.answerSlotWidthPx)}px`;
  }

  function renderSlots(container, count, value, ariaPrefix) {
    container.replaceChildren();
    setSlotContainerWidth(container, count);
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

  function buildKeyboard(container, mode, onKey) {
    container.replaceChildren();
    M.config.keyboardRows.forEach((row) => {
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
          button.textContent = '‹';
        } else {
          button.textContent = key;
          button.setAttribute('aria-label', `Lettre ${key}`);
        }

        let lastPointerHandled = 0;
        button.addEventListener('pointerdown', (event) => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          event.preventDefault();
          lastPointerHandled = performance.now();
          button.classList.add('is-pressed');
          window.setTimeout(() => button.classList.remove('is-pressed'), 90);
          onKey(mode, key);
        });
        button.addEventListener('click', (event) => {
          if (performance.now() - lastPointerHandled < 500) {
            event.preventDefault();
            return;
          }
          onKey(mode, key);
        });
        rowElement.append(button);
      });
      container.append(rowElement);
    });
  }

  function createMissionReward(reward) {
    const box = document.createElement('div');
    box.className = 'mission-reward';
    if (reward.kind === 'letter') {
      const letter = document.createElement('span');
      letter.className = 'mini-letter';
      letter.textContent = reward.letter;
      box.append(letter);
    } else {
      box.append(svgUse(reward.icon));
    }
    if (reward.text) {
      const strong = document.createElement('strong');
      strong.textContent = reward.text;
      box.append(strong);
    }
    return box;
  }

  function createMissionCard(item, missionClaimed) {
    const isClaimed = item.claimable && missionClaimed;
    const stateName = isClaimed ? 'claimed' : item.state;
    const article = document.createElement('article');
    article.className = `mission-card state-${stateName}`;
    if (item.claimable) article.id = 'claimable-mission';

    const icon = document.createElement('div');
    icon.className = 'mission-icon';
    icon.append(svgUse(item.icon));

    const body = document.createElement('div');
    body.className = 'mission-body';
    const top = document.createElement('div');
    top.className = 'mission-top';
    const title = document.createElement('h3');
    title.textContent = item.title;
    const status = document.createElement('span');
    status.textContent = isClaimed ? 'Réclamé' : item.status;
    top.append(title, status);

    const progress = document.createElement('div');
    progress.className = 'mission-progress';
    const fill = document.createElement('span');
    fill.style.width = `${item.progress}%`;
    progress.append(fill);
    body.append(top, progress);

    if (item.claimable) {
      const claim = document.createElement('button');
      claim.className = 'mission-claim';
      claim.id = 'claim-mission';
      claim.type = 'button';
      claim.textContent = isClaimed ? 'Réclamé' : 'Réclamer';
      claim.disabled = isClaimed;
      body.append(claim);
    }

    article.append(icon, body, createMissionReward(item.reward));
    return article;
  }

  function tutorialVisual(type) {
    const visual = document.createElement('div');
    visual.className = 'mini-shot';
    if (type === 'question') {
      visual.classList.add('mini-question-shot');
      visual.innerHTML = '<div class="mini-shot-top"><i></i><i></i><i></i></div><div class="mini-question-line"></div><div class="mini-answer-blocks"><b></b><b></b><b></b><b></b><b></b><b></b></div><div class="mini-keys"><i>A</i><i>Z</i><i>E</i><i>R</i><i>T</i><i>Y</i><i>U</i><i>I</i></div>';
    } else if (type === 'reward') {
      visual.classList.add('mini-reward-shot');
      visual.innerHTML = '<div class="mini-correct">✓</div><div class="mini-big-letter">F</div><div class="mini-spark">✦ ✦ ✦</div>';
    } else if (type === 'rack') {
      visual.classList.add('mini-rack-shot');
      visual.innerHTML = '<div class="mini-rack"><b>U</b><b>F</b><b>?</b><b>R</b><b>L</b><b>·</b><b>O</b></div><div class="mini-progress-line"><span></span></div>';
    } else {
      visual.classList.add('mini-final-shot');
      visual.innerHTML = '<div class="mini-hearts">♥ ♥ ♡</div><div class="mini-answer-blocks final"><b>F</b><b>O</b><b>R</b><b>M</b><b>U</b><b>L</b><b>E</b></div><div class="mini-confirm">✓</div>';
    }
    return visual;
  }

  function createTutorialCard(step) {
    const article = document.createElement('article');
    article.className = 'how-step-card';
    const heading = document.createElement('div');
    heading.className = 'how-heading';
    const number = document.createElement('span');
    number.textContent = String(step.number);
    const title = document.createElement('h3');
    title.textContent = step.title;
    heading.append(number, title);
    article.append(heading, tutorialVisual(step.visual));
    return article;
  }

  M.ui.components = Object.freeze({
    renderLives,
    createLetterTile,
    renderWord,
    renderStars,
    setSlotContainerWidth,
    renderSlots,
    buildKeyboard,
    createMissionCard,
    createTutorialCard
  });
})();
