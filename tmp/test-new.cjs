const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\Administrator\\AppData\\Local\\ms-playwright\\chromium-1217\\chrome-win64\\chrome.exe' });
  const p = await b.newPage();
  await p.setViewportSize({ width: 1920, height: 1080 });
  const errors = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  p.on('pageerror', err => errors.push(err.message));
  try {
    await p.goto('http://localhost:3003/', { waitUntil: 'networkidle', timeout: 15000 });

    // Top layout
    const btn = await p.$('.layout-toggle-btn:first-child');
    if (btn) { await btn.click(); await p.waitForTimeout(400); }
    await p.waitForTimeout(300);

    // Check structure
    const tableArea = await p.$('.table-area');
    const thead = await p.$('.data-table thead');
    const tbodyWrapper = await p.$('.table-body-wrapper');
    const tableInTbody = await p.$('.table-body-wrapper table');
    console.log('=== TOP 布局表格结构 ===');
    console.log('table-area 存在:', !!tableArea);
    console.log('thead table 存在:', !!thead);
    console.log('tbody wrapper 存在:', !!tbodyWrapper);
    console.log('tbody 内 table 存在:', !!tableInTbody);

    // Check dimensions
    const tableAreaW = await p.$eval('.table-area', el => el.clientWidth);
    const tableAreaH = await p.$eval('.table-area', el => el.clientHeight);
    const theadW = await p.$eval('.data-table thead', el => el.offsetWidth);
    const tbodyW = await p.$eval('.table-body-wrapper', el => el.offsetWidth);
    const theadH = await p.$eval('.data-table thead', el => el.offsetHeight);
    console.log('table-area 宽x高:', tableAreaW + 'x' + tableAreaH);
    console.log('thead 宽度:', theadW, '(应=tableAreaW)');
    console.log('tbody 宽度:', tbodyW, '(应=tableAreaW)');

    // Check scroll bars (no external scroll, internal only)
    const areaOverflow = await p.$eval('.table-area', el => getComputedStyle(el).overflow);
    const tbodyOverflow = await p.$eval('.table-body-wrapper', el => getComputedStyle(el).overflowY);
    console.log('table-area overflow:', areaOverflow);
    console.log('tbody overflow-y:', tbodyOverflow);

    // Search then test scrolling
    const searchBtn = await p.$('.btn-search');
    if (searchBtn) { await searchBtn.click(); await p.waitForTimeout(2000); }

    // Set 50 rows
    const pageSizeSelect = await p.$('.page-size-select select');
    if (pageSizeSelect) { await pageSizeSelect.selectOption('50'); await page.waitForTimeout(200); }
    if (searchBtn) { await searchBtn.click(); await p.waitForTimeout(2000); }

    const sh = await p.$eval('.table-body-wrapper', el => el.scrollHeight);
    const ch = await p.$eval('.table-body-wrapper', el => el.clientHeight);
    const sw = await p.$eval('.table-body-wrapper', el => el.scrollWidth);
    const cw = await p.$eval('.table-body-wrapper', el => el.clientWidth);
    console.log('50条数据: tbody scrollH=' + sh + ' clientH=' + ch + ' 纵向可滚动:', sh > ch);
    console.log('横向: scrollW=' + sw + ' clientW=' + cw + ' 横向可滚动:', sw > cw);

    console.log('Console Errors:', errors.length ? errors : '无');
    await p.screenshot({ path: 'tmp/table-inside-scroll.png', fullPage: false });
    console.log('截图: tmp/table-inside-scroll.png');

  } catch (e) {
    console.error('Error:', e.message);
  }
  await b.close();
})();
