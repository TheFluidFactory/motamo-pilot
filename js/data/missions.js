(() => {
  'use strict';
  const M = window.Motamo;

  M.data.missions = Object.freeze({
    hero: Object.freeze({ eyebrow: 'Aperçu pilote', title: 'Objectifs & récompenses', completed: 2, total: 5 }),
    disclaimer: 'Exemples visuels : les récompenses ne modifient pas encore le jeu pilote.',
    items: Object.freeze([
      Object.freeze({ id: 'answer-five', state: 'progress', icon: 'i-target', title: 'Répondre à 5 questions', status: '3/5', progress: 60, reward: Object.freeze({ kind: 'icon', icon: 'i-star', text: '20' }) }),
      Object.freeze({ id: 'mystery-word', state: 'ready', icon: 'i-gift', title: 'Trouver un mot mystère', status: '1/1', progress: 100, claimable: true, reward: Object.freeze({ kind: 'letter', letter: 'A', text: '+1' }) }),
      Object.freeze({ id: 'perfect-level', state: 'claimed', icon: 'i-medal', title: 'Finir sans perdre de vie', status: 'Réclamé', progress: 100, reward: Object.freeze({ kind: 'icon', icon: 'i-check' }) }),
      Object.freeze({ id: 'finish-three', state: 'progress', icon: 'i-trophy', title: 'Terminer 3 niveaux', status: '1/3', progress: 33, reward: Object.freeze({ kind: 'icon', icon: 'i-star', text: '60' }) }),
      Object.freeze({ id: 'three-day-streak', state: 'locked', icon: 'i-lock', title: 'Série de 3 jours', status: 'Verrouillé', progress: 0, reward: Object.freeze({ kind: 'icon', icon: 'i-gift' }) })
    ])
  });
})();
