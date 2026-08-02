(() => {
  'use strict';
  const M = window.Motamo;
  const { normalizeLettersOnly, countLetters } = M.core.utils;

  function normalizedAnswers(question) {
    return [question.answer, ...(question.acceptedAnswers || [])].map(normalizeLettersOnly);
  }

  function sameLetters(left, right) {
    return [...normalizeLettersOnly(left)].sort().join('') === [...normalizeLettersOnly(right)].sort().join('');
  }

  function validateTextQuestion(question) {
    const answers = normalizedAnswers(question);
    const expected = answers[0]?.length || 0;
    if (!expected) throw new Error(`Réponse vide : ${question.id}.`);

    answers.slice(1).forEach((variant) => {
      if (variant.length !== expected) {
        throw new Error(`La variante « ${variant} » n'a pas la même longueur que « ${question.answer} » (${question.id}).`);
      }
    });

    const hintIndex = question.hintIndex;
    if (expected === 1 && hintIndex !== null && hintIndex !== undefined) {
      throw new Error(`Une réponse d'une lettre ne peut pas avoir d'indice (${question.id}).`);
    }
    if (hintIndex !== null && hintIndex !== undefined) {
      if (!Number.isInteger(hintIndex) || hintIndex <= 0 || hintIndex >= expected) {
        throw new Error(`Position d'indice invalide pour ${question.id}.`);
      }
      const hintLetter = answers[0][hintIndex];
      if (answers.some((answer) => answer[hintIndex] !== hintLetter)) {
        throw new Error(`Les variantes de ${question.id} ne partagent pas la lettre indice prédéfinie.`);
      }
    }
  }


  function validateMultipleChoiceQuestion(question) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Choix multiples invalides : ${question.id}.`);
    }
    const values = question.options.map((option) => normalizeLettersOnly(typeof option === 'string' ? option : option.value));
    if (!values.includes(normalizeLettersOnly(question.answer))) {
      throw new Error(`La bonne réponse n'est pas présente dans les choix (${question.id}).`);
    }
  }

  function validateData(levels) {
    if (!Array.isArray(levels) || !levels.length) throw new Error('Aucun niveau MOTAMO chargé.');
    const ids = new Set();

    levels.forEach((level) => {
      if (ids.has(level.id)) throw new Error(`Identifiant de niveau dupliqué : ${level.id}.`);
      ids.add(level.id);

      const word = [...normalizeLettersOnly(level.word)];
      const scramble = (level.scramble || []).map(normalizeLettersOnly);
      const rewards = (level.questions || []).map((question) => normalizeLettersOnly(question.rewardLetter));

      if (word.length !== M.config.questionsPerLevel) throw new Error(`Le niveau ${level.id} doit avoir un mot de ${M.config.questionsPerLevel} lettres.`);
      if (level.questions.length !== M.config.questionsPerLevel) throw new Error(`Le niveau ${level.id} doit contenir ${M.config.questionsPerLevel} questions.`);
      if (scramble.length !== M.config.questionsPerLevel || scramble.some((letter) => letter.length !== 1)) throw new Error(`Mélange invalide au niveau ${level.id}.`);
      if ([...scramble].sort().join('') !== [...word].sort().join('')) throw new Error(`Le mélange du niveau ${level.id} ne correspond pas au mot.`);
      if (scramble.join('') === word.join('')) throw new Error(`Le mélange du niveau ${level.id} n'est pas mélangé.`);
      if (rewards.join('') !== scramble.join('')) throw new Error(`Les récompenses du niveau ${level.id} ne suivent pas le mélange.`);

      level.questions.forEach((question) => {
        const interaction = question.interaction || M.config.defaultQuestionInteraction;
        const primaryAnswer = normalizeLettersOnly(question.answer);
        const rewardLetter = normalizeLettersOnly(question.rewardLetter);
        if (!primaryAnswer) throw new Error(`Réponse vide : ${question.id}.`);
        if (rewardLetter.length !== 1) throw new Error(`Lettre récompense invalide : ${question.id}.`);
        if (M.config.rewardLettersUseAnswerInitial && rewardLetter !== primaryAnswer[0]) {
          throw new Error(`Dans ce pilote, la lettre gagnée doit être l'initiale de la réponse (${question.id}).`);
        }
        if (interaction === 'text') validateTextQuestion(question);
        else if (interaction === 'multipleChoice') validateMultipleChoiceQuestion(question);
        else throw new Error(`Type d'interaction inconnu « ${interaction} » (${question.id}).`);
      });
    });
  }

  function isAcceptedAnswer(question, value) {
    const entered = normalizeLettersOnly(value);
    return normalizedAnswers(question).includes(entered);
  }

  M.game.answers = Object.freeze({
    validateData,
    normalizedAnswers,
    isAcceptedAnswer,
    sameLetters,
    countLetters
  });
})();
