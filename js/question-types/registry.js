(() => {
  'use strict';
  const M = window.Motamo;
  const factories = new Map();

  function register(name, factory) {
    if (!name || typeof factory !== 'function') throw new TypeError('Question type registration requires a name and factory.');
    factories.set(name, factory);
  }

  function create(name, context) {
    const factory = factories.get(name);
    if (!factory) throw new Error(`Question interaction not registered: ${name}`);
    const controller = factory(context);
    const requiredMethods = ['getAnswer','isComplete','showIncomplete','destroy'];
    requiredMethods.forEach((method) => {
      if (typeof controller?.[method] !== 'function') throw new Error(`${name} question controller is missing ${method}().`);
    });
    return controller;
  }

  M.game.questionTypes = Object.freeze({ register, create, has: (name) => factories.has(name) });
})();
