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

    // Top layout
    const btn = await p.$('.layout-toggle-btn:first-child');
    if (btn) { await btn.click(); await p.waitForTimeout(400); }
    await p.waitForTimeout(300);

    // Search
    const searchBtn = await p.$('.btn-search');
    if (searchBtn) { await searchBtn.click(); await p.waitForTimeout(2000); }

    // Check dimensions
    const tableAreaW = await p.$eval('.table-area', el => el.clientWidth);
    const tableAreaH = await p.$eval('.table-area', el => el.clientHeight);
    const theadTableW = await p.$eval('.data-table thead', el => el.offsetWidth);
    const tbodyTableW = await p.$eval('.table-body-wrapper table', el => el.offsetWidth);
    const wrapperW = await p.$eval('.table-wrapper', el => el.clientWidth);

    console.log('=== TOP 布局 ===');
    console.log('table-wrapper 宽度:', wrapperW);
    console.log('table-area 宽x高:', tableAreaW + 'x' + tableAreaH);
    console.log('thead table 宽度:', theadTableW, '(应=tableWidth 固定值)');
    console.log('tbody table 宽度:', tbodyTableW, '(应=thead table 相同)');
    console.log('列宽之和(15列x50px):', 15 * 50, 'px');

    // Check if horizontal scroll works
    const areaOverflowX = await p.$eval('.table-area', el => getComputedStyle(el).overflowX);
    const tbodyOverflowY = await p.$eval('.table-body-wrapper', el => getComputedStyle(el).overflowY);
    const tbodyScrollH = await p.$eval('.table-body-wrapper', el => el.scrollHeight);
    const tbodyClientH = await p.$eval('.table-body-wrapper', el => el.clientHeight);
    console.log('table-area overflow-x:', areaOverflowX);
    console.log('tbody overflow-y:', tbodyOverflowY, '(' + tbodyScrollH + ' > ' + tbodyClientH + ' = ' + (tbodyScrollH > tbodyClientH) + ')');

    // Test with 50 rows
    const pageSizeSelect = await p.$('.page-size-select select');
    if (pageSizeSelect) { await pageSizeSelect.selectOption('50'); await p.waitForTimeout(200); }
    if (searchBtn) { await searchBtn.click(); await p.waitForTimeout(2000); }
    const tbodyScrollH2 = await p.$eval('.table-body-wrapper', el => el.scrollHeight);
    const tbodyClientH2 = await p.$eval('.table-body-wrapper', el => el.clientHeight);
    console.log('50条数据: tbody scrollH=' + tbodyScrollH2 + ' clientH=' + tbodyClientH2 + ' 纵向可滚动:' + (tbodyScrollH2 > tbodyClientH2));

    console.log('Console Errors:', errors.length ? errors : '无');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await b.close();
})();
