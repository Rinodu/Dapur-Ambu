import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./order.html', import.meta.url), 'utf8');
assert.match(html, /method="post" action="https:\/\/script\.google\.com\/macros\/s\/[^\"]+\/exec"/);
for (const field of ['orderId', 'neededDate', 'note', 'whatsappText', 'website']) {
  assert.match(html, new RegExp(`name="${field}"`));
}

async function prepareOrder(queryProduct = 'Cake Bento', overrides = {}, shouldFail = false) {
  const values = {
    name: 'Tes Pelanggan', phone: '081234567890', product: '', quantity: '2',
    date: '2026-10-10', time: '14:00', variant: 'Bunga & cokelat', notes: '', ...overrides
  };
  let submit;
  const optionNames = ['', 'Brownies Medium', 'Brownies Besar', 'Cake Bento', 'Cake Sedang', 'Cake Besar', 'Custom Cake'];
  const product = { value: '', options: optionNames.map(value => ({ value })) };
  const elements = {
    product,
    orderId: { value: '' }, neededDate: { value: '' },
    note: { value: '' }, whatsappText: { value: '' }
  };
  const button = { disabled: false };
  const feedback = { hidden: true, textContent: '' };
  const form = {
    action: 'https://script.google.com/macros/s/example/exec', elements,
    querySelector(selector) { return selector === '[type="submit"]' ? button : feedback; },
    addEventListener(type, handler) { if (type === 'submit') submit = handler; }
  };
  let redirected = '';
  let post;
  runInNewContext(readFileSync(new URL('./order.js', import.meta.url), 'utf8'), {
    document: { querySelector: () => form },
    window: { location: { search: `?product=${encodeURIComponent(queryProduct)}`, assign(url) { redirected = url; } } },
    URLSearchParams,
    fetch: async (url, options) => { post = { url, options }; assert.equal(redirected, ''); if (shouldFail) throw new Error('offline'); },
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries({ ...values, product: product.value, orderId: elements.orderId.value, neededDate: elements.neededDate.value, note: elements.note.value, whatsappText: elements.whatsappText.value }); } }
  });
  assert.equal(product.value, queryProduct);
  let prevented = false;
  await submit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  return { elements, button, feedback, post, redirected };
}

const { elements: order, post, redirected } = await prepareOrder();
assert.equal(order.orderId.value, '00000000-0000-4000-8000-000000000001');
assert.equal(order.neededDate.value, '2026-10-10');
assert.equal(order.note.value, 'Jam pengambilan: 14:00 | Ukuran/varian/tema: Bunga & cokelat');
assert.match(order.whatsappText.value, /Produk: Cake Bento/);
assert.match(order.whatsappText.value, /Tanggal pengambilan: 10\/10\/2026/);
assert.match(order.whatsappText.value, /Nomor WhatsApp: 081234567890/);
assert.equal(post.url, 'https://script.google.com/macros/s/example/exec');
assert.equal(post.options.mode, 'no-cors');
assert.equal(post.options.body.get('orderId'), order.orderId.value);
assert.equal(post.options.body.get('note'), order.note.value);
assert.equal(new URL(redirected).hostname, 'wa.me');
assert.match(new URL(redirected).searchParams.get('text'), /Produk: Cake Bento/);

const { elements: custom } = await prepareOrder('Custom Cake', { notes: 'Tulisan ulang tahun' });
assert.match(custom.note.value, /Catatan desain: Tulisan ulang tahun/);
assert.match(custom.whatsappText.value, /Produk: Custom Cake/);
const failed = await prepareOrder('Cake Bento', {}, true);
assert.equal(failed.redirected, '');
assert.equal(failed.button.disabled, false);
assert.equal(failed.feedback.hidden, false);
console.log('Pesanan disimpan sebelum membuka WhatsApp; kegagalan tetap di formulir.');

