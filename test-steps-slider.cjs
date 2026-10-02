const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto((process.env.TEST_URL || 'http://127.0.0.1:8765/') + '?from=order');
    await page.locator('.step-grid').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    assert.equal(await page.locator('.step-status').textContent(), '1 / 4');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('.step-grid').evaluate(track => {
      const box = track.getBoundingClientRect();
      return [...track.children].filter(card => {
        const rect = card.getBoundingClientRect();
        return rect.left >= box.left && rect.right <= box.right;
      }).length;
    }), 1);
    await page.locator('.step-next').click();
    await page.waitForFunction(() => document.querySelector('.step-status').textContent === '2 / 4');
    await page.waitForTimeout(700);
    await page.locator('.step-dots button').last().click();
    await page.waitForFunction(() => document.querySelector('.step-status').textContent === '4 / 4');
    assert.equal(await page.locator('.step-next').isDisabled(), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.step-prev').click();
    await page.waitForFunction(() => document.querySelector('.step-status').textContent === '3 / 4');
    await page.locator('.step-grid').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => document.querySelector('.step-status').textContent === '2 / 4');
    await page.locator('.step-grid').hover();
    await page.mouse.wheel(400, 0);
    await page.waitForTimeout(700);
    assert.notEqual(await page.locator('.step-status').textContent(), '2 / 4');
    await page.setViewportSize({ width: 1440, height: 900 });
    assert.equal(await page.locator('.steps-controls').isVisible(), false);
    assert.equal(await page.locator('.step-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 4);
    assert.deepEqual(errors, []);
    console.log('PASS: one mobile card, arrows, dots, horizontal swipe, keyboard, reduced motion, desktop grid');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
