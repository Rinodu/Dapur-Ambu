(() => {
  const form = document.querySelector('#order-form');
  const product = new URLSearchParams(window.location.search).get('product');
  if ([...form.elements.product.options].some(option => option.value === product)) form.elements.product.value = product;

  form.addEventListener('submit', () => {
    const data = Object.fromEntries(new FormData(form));
    const [year, month, day] = data.date.split('-');
    const lines = [
      'Halo Dapur Ambu, saya ingin konsultasi pesanan kue.',
      '',
      '*Data pemesan*',
      `Nama: ${data.name.trim()}`,
      `Nomor WhatsApp: ${data.phone.trim()}`,
      '',
      '*Detail pesanan*',
      `Produk: ${data.product}`,
      `Jumlah: ${data.quantity}`,
      `Tanggal pengambilan: ${day}/${month}/${year}`,
      `Jam pengambilan: ${data.time}`,
      data.variant?.trim() ? `Ukuran/varian/tema: ${data.variant.trim()}` : null,
      data.notes?.trim() ? `Catatan desain: ${data.notes.trim()}` : null,
      '',
      'Mohon informasi ketersediaan dan harga akhirnya. Terima kasih!'
    ].filter(line => line !== null);
    if (!form.elements.orderId.value) form.elements.orderId.value = crypto.randomUUID();
    form.elements.neededDate.value = data.date;
    form.elements.note.value = [
      `Jam pengambilan: ${data.time}`,
      data.variant?.trim() ? `Ukuran/varian/tema: ${data.variant.trim()}` : null,
      data.notes?.trim() ? `Catatan desain: ${data.notes.trim()}` : null
    ].filter(Boolean).join(' | ');
    form.elements.whatsappText.value = lines.join('\n');
  });
})();


