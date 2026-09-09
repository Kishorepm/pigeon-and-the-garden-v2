/* Shared, deterministic choice model. No network, browser or storage access. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GardenData = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const options = {
    place: { garden: 'one with a garden', animals: 'one with animals nearby', indoors: 'quiet and indoors', any: 'his choice' },
    day: { fri: 'Friday', sat: 'Saturday', next: 'next week', any: 'his choice' },
    hour: { morning: 'morning', afternoon: 'afternoon', evening: 'evening', any: 'his choice' },
    duration: { short: 'forty-five minutes', relaxed: 'an hour or two', open: 'until one of us has to go', any: 'his choice' },
    food: { sweet: 'something sweet', savoury: 'something savoury', both: 'both, obviously', any: 'his choice' },
    crown: { gold: 'the gold one', small: 'the small one', flowers: 'one made of flowers', none: 'no crown needed' },
    escort: { alone: 'no one, just her', topaz: 'Topaz', ruby: 'Ruby', duck: 'the duck', chicken: 'the chicken', all: 'all of them' },
    tortoise: { later: 'a later stop', now: 'at stop 02', surprise: 'unannounced' }
  };
  const initial = () => ({ place: null, day: null, hour: null, duration: 'any', food: null, crown: 'none', escort: 'alone', tortoise: 'later' });
  function choose(picks, field, value) {
    if (!Object.hasOwn(options, field) || !Object.hasOwn(options[field], value)) return false;
    picks[field] = value;
    return true;
  }
  function payload(picks) {
    const result = {};
    for (const field of Object.keys(options)) {
      const value = picks[field];
      result[field] = options[field][value] || options[field].any || options[field][Object.keys(options[field])[0]];
    }
    result.drink = 'iced';
    result.banned = 'the first ban still stands';
    result.build = 'a table for two; the castle is still unfinished';
    return result;
  }
  function fingerprint(picks) { return JSON.stringify(payload(picks)); }
  function planReady(picks) { return !!(options.day[picks.day] && options.hour[picks.hour]); }
  function ready(picks) { return !!(options.place[picks.place] && planReady(picks) && options.food[picks.food]); }
  return { options, initial, choose, payload, fingerprint, planReady, ready };
});
