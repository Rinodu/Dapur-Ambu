const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:8765/?from=order');
      await page.locator('.product-bottom a').nth(2).click();
      await page.waitForURL('**/order.html?product=**');
      await page.waitForTimeout(650);
      assert.equal(await page.locator('[name=product]').inputValue(), 'Cake Bento');
      assert.equal(await page.locator('.form-transition').count(), 0);
      await page.locator('[name=name]').fill('Tes transisi');
      await page.locator('.order-back').click();
      await page.waitForURL('**/?from=order#kreasi');
      await page.waitForTimeout(650);
      assert.equal(await page.locator('.intro').evaluate(el => getComputedStyle(el).visibility), 'hidden');
      await page.goBack();
      await page.waitForTimeout(650);
      assert.equal(await page.locator('[name=product]').inputValue(), 'Cake Bento');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('.order-back').click();
      await page.waitForURL('**/?from=order#kreasi');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS: form navigation, product query, return, history, reduced motion on desktop/mobile; no orders submitted');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
