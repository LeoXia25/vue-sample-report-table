const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\Administrator\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe' });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1920, height: 1080 });
  const errors = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  p.on('pageerror', err => errors.push(err.message));
  try {
    await p.goto('http://localhost:3004/', { waitUntil: 'networkidle', timeout: 15000 });
    const btn = await p.$('.layout-toggle-btn:first-child');
    if (btn) { await btn.click(); await p.waitForTimeout(400); }
    await p.waitForTimeout(300);
    const searchBtn = await p.$('.btn-search');
    if (searchBtn) { await searchBtn.click(); await p.waitForTimeout(2000); }

    // Check actual computed values
    const tableStyleW = await p.$eval('.table-area table:first-child', el => el.style.width);
    const tableOffsetW = await p.$eval('.table-area table:first-child', el => el.offsetWidth);
    const col0Width = await p.$eval('.table-area table:first-child colgroup col:first-child', el => el.width);
    const col0ComputedW = await p.$eval('.table-area table:first-child colgroup col:first-child', el => getComputedStyle(el).width);
    const th0OffsetW = await p.$eval('.table-area table:first-child th:first-child', el => el.offsetWidth);
    const th0StyleW = await p.$eval('.table-area table:first-child th:first-child', el => el.style.width);
    const containerW = await p.$eval('.table-area', el => el.clientWidth);

    console.log('=== 精确诊断 ===');
    console.log('table style.width:', tableStyleW || '(未设置)');
    console.log('table offsetWidth:', tableOffsetW);
    console.log('col[0] width attr:', col0Width || '(无)');
    console.log('col[0] computed width:', col0ComputedW);
    console.log('th[0] offsetWidth:', th0OffsetW);
    console.log('th[0] style.width:', th0StyleW || '(无)');
    console.log('table-area clientWidth:', containerW);
    console.log('Console Errors:', errors.length ? errors : '无');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await b.close();
})();
