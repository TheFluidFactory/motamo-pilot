(() => {
  'use strict';
  const M = window.Motamo;
  const { normalizeLettersOnly, countLetters } = M.core.utils;

  function validateData(levels) {
    if (!levels.length) throw new Error('Aucun niveau MOTAMO chargé.');

    levels.forEach((level) => {
      const word = [...normalizeLettersOnly(level.word)];
      const scramble = level.scramble.map(normalizeLettersOnly);
      const rewards = level.questions.map((question) => normalizeLettersOnly(question.rewardLetter));

      if (word.length !== M.config.questionsPerLevel) throw new Error(`Le niveau ${level.id} doit avoir un mot de ${M.config.questionsPerLevel} lettres.`);
      if (new Set(word).size !== M.config.questionsPerLevel) throw new Error(`Le mot ${level.word} contient une lettre répétée.`);
      if (level.questions.length !== M.config.questionsPerLevel) throw new Error(`Le niveau ${level.id} doit contenir ${M.config.questionsPerLevel} questions.`);
      if (scramble.length !== M.config.questionsPerLevel || scramble.some((letter) => letter.length !== 1)) throw new Error(`Mélange invalide au niveau ${level.id}.`);
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

  function normalizedAnswers(question) {
    return [question.answer, ...(question.acceptedAnswers || [])].map(normalizeLettersOnly);
  }

  function chooseHintIndex(question) {
    const length = countLetters(question.answer);
    return length > 1 ? 1 + Math.floor(Math.random() * (length - 1)) : null;
  }

  function answerPosition(entryIndex, hintIndex) {
    if (hintIndex === null || hintIndex === undefined) return entryIndex;
    return entryIndex >= hintIndex ? entryIndex + 1 : entryIndex;
  }

  function matchingAnswers(question, entry, hintIndex) {
    const typed = [...entry];
    return normalizedAnswers(question).filter((answer) =>
      typed.every((letter, entryIndex) => answer[answerPosition(entryIndex, hintIndex)] === letter)
    );
  }

  function hintLetter(question, entry, hintIndex) {
    if (hintIndex === null || hintIndex === undefined) return '';
    const answer = matchingAnswers(question, entry, hintIndex)[0] || normalizedAnswers(question)[0] || '';
    return answer[hintIndex] || '';
  }

  function isAcceptedQuestionEntry(question, entry, hintIndex) {
    return normalizedAnswers(question).some((answer) => {
      if (hintIndex === null || hintIndex === undefined) return answer === entry;
      return answer.slice(0, hintIndex) + answer.slice(hintIndex + 1) === entry;
    });
  }

  M.game.answers = Object.freeze({
    validateData,
    normalizedAnswers,
    chooseHintIndex,
    answerPosition,
    matchingAnswers,
    hintLetter,
    isAcceptedQuestionEntry
  });
})();
