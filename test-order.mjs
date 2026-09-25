import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

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
function orderUrl(selectedProduct, queryProduct) {
  let submit;
  values.product = selectedProduct;
  const optionNames = ['', 'Brownies Medium', 'Brownies Besar', 'Cake Bento', 'Cake Sedang', 'Cake Besar', 'Custom Cake'];
  const product = { value: '', options: optionNames.map(value => ({ value })) };
  const form = { elements: { product }, addEventListener(type, handler) { if (type === 'submit') submit = handler; } };
  const window = { location: { href: '', search: `?product=${encodeURIComponent(queryProduct)}` } };
  runInNewContext(readFileSync(new URL('./order.js', import.meta.url), 'utf8'), {
    document: { querySelector: () => form }, window, URLSearchParams,
    FormData: class { *[Symbol.iterator]() { yield* Object.entries(values); } }
  });
  assert.equal(product.value, queryProduct);
  submit({ preventDefault() {} });
  return new URL(window.location.href);
}
const url = orderUrl('Cake Bento', 'Cake Bento');
assert.equal(url.hostname, 'wa.me');
assert.equal(url.pathname, '/6281210028857');
assert.match(url.searchParams.get('text'), /Produk: Cake Bento/);
assert.match(url.searchParams.get('text'), /Tanggal pengambilan: 10\/10\/2026/);
assert.match(url.searchParams.get('text'), /Ukuran\/varian\/tema: Bunga & cokelat/);
assert.match(url.searchParams.get('text'), /\n\n\*Data pemesan\*\nNama:/);
assert.match(url.searchParams.get('text'), /Nomor WhatsApp:[^\n]*\n\n\*Detail pesanan\*\nProduk:/);
assert.match(url.searchParams.get('text'), /\n\nMohon informasi/);
assert.doesNotMatch(url.searchParams.get('text'), /\n{3,}/);
assert.doesNotMatch(url.searchParams.get('text'), /PESANAN CUSTOM/);
const customText = orderUrl('Custom Cake', 'Custom Cake').searchParams.get('text');
assert.match(customText, /Produk: Custom Cake/);
assert.doesNotMatch(customText, /PESANAN CUSTOM/);
