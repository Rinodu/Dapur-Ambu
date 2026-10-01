(() => {
  const form = document.querySelector('#order-form');
  const product = new URLSearchParams(window.location.search).get('product');
  if ([...form.elements.product.options].some(option => option.value === product)) form.elements.product.value = product;

  const theme = new URLSearchParams(window.location.search).get('theme');
  const themes = ['Brownies Celebration', 'A Little Wonderland', 'Hello, Little Friend', 'Pink Lily', 'Purple Birthday'];
  if (themes.includes(theme)) form.elements.variant.value = theme;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
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
    try {
      await fetch(form.action, {
        method: 'POST',
        body: new URLSearchParams(new FormData(form)),
        mode: 'no-cors'
      });
      window.location.assign(`https://wa.me/6281210028857?text=${encodeURIComponent(form.elements.whatsappText.value)}`);
    } catch (error) {
      submitButton.disabled = false;
      const feedback = form.querySelector('#order-feedback');
      feedback.textContent = 'Pesanan belum tersimpan. Periksa koneksi lalu coba lagi.';
      feedback.hidden = false;
    }
  });
})();


