import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

let submit;
const orderForm = {
  addEventListener(type, handler) { if (type === 'submit') submit = handler; }
};
const element = { addEventListener() {} };
const document = {
  body: {},
  querySelector(selector) { return selector === '#order-form' ? orderForm : element; },
  querySelectorAll() { return []; }
};
const window = {
  location: { href: '' },
  matchMedia() { return { matches: true }; }
};
const values = {
  name: 'Tes Pelanggan',
  phone: '081234567890',
  product: 'Cake Bento',
  quantity: '2',
  date: '2026-10-10',
  time: '14:00',
  variant: 'Bunga & cokelat',
  notes: ''
};
runInNewContext(readFileSync(new URL('./app.js', import.meta.url), 'utf8'), {
  document, window,
  FormData: class { *[Symbol.iterator]() { yield* Object.entries(values); } }
});
submit({ preventDefault() {} });
const url = new URL(window.location.href);
assert.equal(url.hostname, 'wa.me');
assert.equal(url.pathname, '/6281210028857');
assert.match(url.searchParams.get('text'), /Produk: Cake Bento/);
assert.match(url.searchParams.get('text'), /Tanggal pengambilan: 10\/10\/2026/);
assert.match(url.searchParams.get('text'), /Ukuran\/varian\/tema: Bunga & cokelat/);
