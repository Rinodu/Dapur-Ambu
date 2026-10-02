const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:8765/');
      await page.waitForTimeout(3300);
      assert.equal(await page.evaluate(() => gsap.version), '3.13.0');
      assert.equal(await page.locator('.intro').evaluate(el => getComputedStyle(el).visibility), 'hidden');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const cake = page.locator('.cake-one');
      const box = await cake.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 25);
      assert.equal(await cake.evaluate(el => el.classList.contains('dragging')), true);
      await page.mouse.up();
      assert.equal(await cake.evaluate(el => el.classList.contains('dragging')), false);
      await page.locator('.motion-control').click();
      assert.equal(await page.evaluate(() => ScrollTrigger.getAll().length), 0);
      await page.locator('.motion-control').click();
      assert.ok(await page.evaluate(() => ScrollTrigger.getAll().length) > 0);
      // Sample every animation frame while crossing the catalog trigger.
      await page.evaluate(() => {
        window.catalogOpacities = [];
        window.sampleCatalog = true;
        const sample = () => {
          document.querySelectorAll('.product-card').forEach(card =>
            window.catalogOpacities.push(Number(getComputedStyle(card).opacity)));
          if (window.sampleCatalog) requestAnimationFrame(sample);
        };
        sample();
      });
      await page.locator('.product-card').first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      assert.equal(await page.evaluate(() => {
        window.sampleCatalog = false;
        return window.catalogOpacities.every(opacity => opacity === 1);
      }), true, 'Catalog must never flash transparent during scroll');
      assert.equal(await page.locator('.product-card').first().evaluate(el => getComputedStyle(el).opacity), '1');
      await page.locator('.product-zoom').first().click();
      assert.equal(await page.locator('.product-preview').evaluate(el => el.open), true);
      await page.waitForTimeout(350);
      assert.equal(await page.locator('.product-preview').evaluate(el => getComputedStyle(el).opacity), '1');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      assert.equal(await page.locator('.product-preview').evaluate(el => el.open), false);
      if (width === 1440) {
        await page.locator('.product-card').first().hover();
        await page.waitForTimeout(500);
        assert.ok(await page.locator('.product-photo img').first().evaluate(el => Number(gsap.getProperty(el, 'scale'))) > 1);
      }
      assert.equal(await page.locator('.heading-line').count(), 4);
      assert.equal(await page.locator('.step-connector').count(), 4);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(() => ScrollTrigger.getAll().length === 0);
      assert.equal(await page.evaluate(() => ScrollTrigger.getAll().length), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8765/?from=order');
    assert.equal(await page.locator('.intro').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    await page.route('**/vendor/**', route => route.abort());
    await page.goto('http://127.0.0.1:8765/');
    await page.waitForTimeout(3700);
    assert.equal(await page.locator('.intro').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    assert.equal(await page.locator('.product-card').first().evaluate(el => getComputedStyle(el).opacity), '1');
    console.log('PASS: desktop/mobile, GSAP, pause, reduced motion, drag, zoom, return, library failure');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
