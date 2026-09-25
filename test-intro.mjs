import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

function loadPage(search, hash = '') {
  let introPlayed = false;
  let replacedUrl;
  let replay;
  const element = { addEventListener() {} };
  const document = {
    body: { offsetWidth: 0, classList: { remove() {}, add(name) { if (name === 'intro-running') introPlayed = true; } } },
    querySelector(selector) {
      if (selector === '.replay') return { addEventListener(_type, handler) { replay = handler; } };
      return element;
    },
    querySelectorAll() { return []; }
  };
  const window = {
    location: { search, pathname: '/Dapur-Ambu/', hash },
    history: { replaceState(_state, _title, url) { replacedUrl = url; } },
    matchMedia() { return { matches: false }; },
    scrollTo() {}
  };
  runInNewContext(script, { document, window, URLSearchParams, clearTimeout() {}, setTimeout() { return 1; } });
  return { get introPlayed() { return introPlayed; }, replacedUrl, replay };
}

assert.equal(loadPage('').introPlayed, true);
const returned = loadPage('?from=order', '#kreasi');
assert.equal(returned.introPlayed, false);
assert.equal(returned.replacedUrl, '/Dapur-Ambu/#kreasi');
returned.replay();
assert.equal(returned.introPlayed, true);
