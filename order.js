(() => {
  const form = document.querySelector('#order-form');
  const product = new URLSearchParams(window.location.search).get('product');
  if ([...form.elements.product.options].some(option => option.value === product)) form.elements.product.value = product;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const [year, month, day] = data.date.split('-');
    const lines = [
      data.product === 'Custom Cake' ? '*🎂 PESANAN CUSTOM*' : '*PESANAN KUE*',
      'Halo Dapur Ambu, saya ingin konsultasi pesanan kue.',
      '',
      `Nama: ${data.name.trim()}`,
      `Nomor WhatsApp: ${data.phone.trim()}`,
      `Produk: ${data.product}`,
      `Jumlah: ${data.quantity}`,
      `Tanggal pengambilan: ${day}/${month}/${year}`,
      `Jam pengambilan: ${data.time}`,
      data.variant?.trim() ? `Ukuran/varian/tema: ${data.variant.trim()}` : '',
      data.notes?.trim() ? `Catatan desain: ${data.notes.trim()}` : '',
      '',
      'Mohon informasi ketersediaan dan harga akhirnya. Terima kasih!'
    ].filter(Boolean);
    window.location.href = `https://wa.me/6281210028857?text=${encodeURIComponent(lines.join('\n'))}`;
  });
})();
