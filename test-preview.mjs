import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const handlers = {};
const photo = { src: '/assets/cake-bento.webp', alt: 'Cake Bento' };
const button = { querySelector: () => photo, addEventListener: (name, fn) => { handlers[name] = fn; } };
const previewImage = {};
let opened = false;
let closePreview;
const preview = {
  querySelector: selector => selector === 'img' ? previewImage : { addEventListener: (_name, fn) => { closePreview = fn; } },
  addEventListener: (_name, fn) => { handlers.backdrop = fn; },
  showModal: () => { opened = true; },
  close: () => { opened = false; }
};
const empty = { addEventListener() {} };
const document = {
  body: { classList: { contains: () => false } },
  querySelector: selector => selector === '.product-preview' ? preview : empty,
  querySelectorAll: selector => selector === '.product-zoom' ? [button] : []
};
const window = { matchMedia: () => ({ matches: true }), location: { search: '' } };
runInNewContext(readFileSync(new URL('./app.js', import.meta.url), 'utf8'), { document, window, URLSearchParams });

handlers.click();
assert.equal(opened, true);
assert.equal(previewImage.src, photo.src);
assert.equal(previewImage.alt, photo.alt);
closePreview();
assert.equal(opened, false);
handlers.click();
handlers.backdrop({ target: preview });
assert.equal(opened, false);
handlers.click();
handlers.backdrop({ target: previewImage });
assert.equal(opened, false);
