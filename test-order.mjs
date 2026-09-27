import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./order.html', import.meta.url), 'utf8');
assert.match(html, /method="post" action="https:\/\/script\.google\.com\/macros\/s\/[^\"]+\/exec"/);
for (const field of ['orderId', 'neededDate', 'note', 'whatsappText', 'website']) {
  assert.match(html, new RegExp(`name="${field}"`));
}

function prepareOrder(queryProduct = 'Cake Bento', overrides = {}) {
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
  const form = { elements, addEventListener(type, handler) { if (type === 'submit') submit = handler; } };
  runInNewContext(readFileSync(new URL('./order.js', import.meta.url), 'utf8'), {
    document: { querySelector: () => form },
    window: { location: { search: `?product=${encodeURIComponent(queryProduct)}` } },
    URLSearchParams,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-000000000001' },
    FormData: class { *[Symbol.iterator]() { yield* Object.entries({ ...values, product: product.value }); } }
  });
  assert.equal(product.value, queryProduct);
  submit();
  return elements;
}

const order = prepareOrder();
assert.equal(order.orderId.value, '00000000-0000-4000-8000-000000000001');
assert.equal(order.neededDate.value, '2026-10-10');
assert.equal(order.note.value, 'Jam pengambilan: 14:00 | Ukuran/varian/tema: Bunga & cokelat');
assert.match(order.whatsappText.value, /Produk: Cake Bento/);
assert.match(order.whatsappText.value, /Tanggal pengambilan: 10\/10\/2026/);
assert.match(order.whatsappText.value, /Nomor WhatsApp: 081234567890/);

const custom = prepareOrder('Custom Cake', { notes: 'Tulisan ulang tahun' });
assert.match(custom.note.value, /Catatan desain: Tulisan ulang tahun/);
assert.match(custom.whatsappText.value, /Produk: Custom Cake/);
console.log('Form pesanan siap dikirim ke Spreadsheet.');

