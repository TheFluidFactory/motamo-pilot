(() => {
  'use strict';
  const M = window.Motamo;

  function normalizeLettersOnly(value) {
    return String(value ?? '')
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/gi, '')
      .toUpperCase();
  }

  function countLetters(value) {
    return normalizeLettersOnly(value).length;
  }

  function svgUse(id, className = 'icon') {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 24 24');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  M.core.utils = Object.freeze({ normalizeLettersOnly, countLetters, svgUse });
})();
