const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist', OUT = path.join(__dirname, 's4');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream'); r.end(d); }); });
const log = (...a) => console.log(...a);
(async () => {
  await new Promise((r) => s.listen(0, r)); const base = `http://localhost:${s.address().port}/`;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push('PAGEERR ' + e));
  pg.on('response', (x) => { if (x.status() >= 400) errs.push(x.status() + ' ' + x.url().replace(base, '')); });
  await pg.goto(base + '#/hoc/hien-phap/hp-1'); await pg.waitForTimeout(1200);
  await pg.focus('.intro-toggle');
  await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
  log('after Enter on toggle: card aria =', await pg.evaluate(() => document.querySelector('.step-wrap article')?.getAttribute('aria-label')), 'verbatim open?', await pg.evaluate(() => !!document.querySelector('#intro-verbatim')));
  await pg.reload(); await pg.waitForTimeout(1200);
  await pg.screenshot({ path: OUT + '/lesson-start-390.png' });
  log('hint present', !!(await pg.$('.session-hint')));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  log('esc dialog', await pg.evaluate(() => { const d = document.querySelector('.confirm'); return d ? d.getBoundingClientRect().top + ' focus=' + document.activeElement.tagName : null; }));
  await pg.screenshot({ path: OUT + '/lesson-confirm-390.png' });
  await pg.keyboard.press('Escape');
  log('small targets', JSON.stringify(await pg.evaluate(() => [...document.querySelectorAll('button,a,[tabindex="0"]')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 20)]; }).filter((x) => x[1] && x[1] < 44))));
  const seen = new Set(); let n = 0;
  while (n++ < 60) {
    await pg.waitForTimeout(250);
    if (await pg.$('.session-end')) break;
    const aria = await pg.evaluate(() => document.querySelector('.step-wrap article')?.getAttribute('aria-label') || document.querySelector('.step-wrap')?.className || '?');
    const fbk = await pg.$('.feedback');
    if (!fbk) {
      if (!seen.has(aria)) { seen.add(aria); await pg.screenshot({ path: OUT + `/lesson-card-${seen.size}-390.png` }); log('CARD', seen.size, aria); }
      const hint = await pg.$('.session-hint .btn'); if (hint) await hint.click();
      const ok = await pg.$('.step-wrap .btn.primary');
      if (ok && /hiểu/.test(await ok.textContent())) { await ok.click(); continue; }
      const btns = await pg.$$('.step-wrap button:not(.speak):not(.exit):not([disabled])');
      for (const bt of btns) { if (await pg.$('.feedback')) break; try { await bt.click({ timeout: 500 }); } catch { /* skip */ } await pg.waitForTimeout(120); }
    } else {
      if (!seen.has('FB' + aria)) { seen.add('FB' + aria); await pg.screenshot({ path: OUT + `/lesson-fb-${seen.size}-390.png`, fullPage: true }); }
      await (await pg.$('.feedback .btn')).click();
    }
  }
  await pg.waitForTimeout(800);
  log('ended?', !!(await pg.$('.session-end')), 'n', n);
  await pg.screenshot({ path: OUT + '/lesson-end-390.png', fullPage: true });
  log('end focus', await pg.evaluate(() => document.activeElement.tagName + ' ' + document.activeElement.className));
  log('end text', (await pg.evaluate(() => document.querySelector('.session-end')?.innerText))?.replace(/\n/g, ' | ').slice(0, 500));
  log('ERRS', JSON.stringify(errs));
  await pg.evaluate(() => new Promise((res, rej) => { const o = indexedDB.open('luyen-luat'); o.onsuccess = () => { const db = o.result; const tx = db.transaction('concepts', 'readwrite'); const st = tx.objectStore('concepts'); st.getAll().onsuccess = (e) => { for (const r of e.target.result) { r.card.due = new Date(Date.now() - 86400000); st.put(r); } }; tx.oncomplete = () => res(); tx.onerror = rej; }; }));
  await pg.goto(base + '#/on'); await pg.reload(); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: OUT + '/review-390.png' });
  log('review h1', await pg.evaluate(() => document.querySelector('h1')?.textContent), await pg.evaluate(() => document.querySelector('.step-wrap article')?.getAttribute('aria-label')));
  await pg.setViewportSize({ width: 1280, height: 800 }); await pg.waitForTimeout(500); await pg.screenshot({ path: OUT + '/review-1280.png' });
  await pg.setViewportSize({ width: 390, height: 844 });
  await pg.goto(base + '#/toi'); await pg.reload(); await pg.waitForTimeout(1500);
  await pg.screenshot({ path: OUT + '/profile-after-390.png', fullPage: true });
  await b.close(); s.close();
})();
