(() => {
  'use strict';
  const M = window.Motamo;

  M.data.tutorial = Object.freeze({
    steps: Object.freeze([
      Object.freeze({ number: 1, title: 'Répondez', visual: 'question' }),
      Object.freeze({ number: 2, title: 'Gagnez une lettre', visual: 'reward' }),
      Object.freeze({ number: 3, title: 'Collectionnez', visual: 'rack' }),
      Object.freeze({ number: 4, title: 'Trouvez le mot', visual: 'final' })
    ]),
    badges: Object.freeze(['7 questions', '3 vies', 'Accents facultatifs'])
  });
})();
