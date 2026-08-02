(() => {
  'use strict';
  const M = window.Motamo;

  M.data.shop = Object.freeze({
    hero: Object.freeze({
      eyebrow: 'Boutique pilote',
      title: 'De nouveaux défis',
      copy: 'Aperçu visuel uniquement : aucun paiement ni déblocage réel n’est activé.'
    }),
    packs: Object.freeze([
      Object.freeze({ id: 'escapade', title: 'Escapade', subtitle: '20 niveaux faciles', price: '1,99 €', icon: 'i-compass', theme: 'green', badge: 'Découverte' }),
      Object.freeze({ id: 'curieux', title: 'Curieux', subtitle: '30 niveaux variés', price: '3,99 €', icon: 'i-bulb', theme: 'blue', badge: 'Populaire' }),
      Object.freeze({ id: 'expert', title: 'Expert', subtitle: '45 niveaux corsés', price: '6,99 €', icon: 'i-crown', theme: 'purple', badge: 'Challenge' }),
      Object.freeze({ id: 'premium', title: 'Premium', subtitle: '60 niveaux exclusifs', price: '9,99 €', icon: 'i-diamond', theme: 'gold', badge: 'Meilleure valeur' })
    ])
  });
})();
