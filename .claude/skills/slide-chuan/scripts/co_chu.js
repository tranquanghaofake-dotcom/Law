// Cỡ chữ đọc được khi chiếu — chạy trong `hinh/dung.js --soat` cho MỌI deck (không riêng bộ bh*).
// 1 px ở khung 1920 = 0,5 pt PowerPoint. Báo: mẩu chữ < 12 pt theo slide; tỉ lệ số tiếng ≥ 14 pt trong chữ thường (không tính chữ trưng bày ≥ 30 pt).
// Miễn: dải đầu trang (đỉnh chữ < 70 px — tên phần, thanh tiến độ), số trang dạng "n / N", dòng ghi công ảnh ("Ảnh: …"), bản ghép Morph ngoài khung.
// Gợi ý, không chặn: nhãn 1–3 tiếng 12 pt là bình thường; chữ thân nên ≥ 14 pt (references/nguyen-tac-bo-cuc.md "Cỡ chữ đọc được khi chiếu").
//   node scripts/co_chu.js <deck.html>
const fs = require("fs");

async function coChu(html) {
  const { chromium } = require("playwright"), exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  try {
    const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
    await page.goto("file://" + html); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.hinhSanSang || null);
    const m = await page.evaluate(() => [...document.querySelectorAll("section.s")].flatMap((S, si) => { const B = S.getBoundingClientRect(), k = 1920 / (B.width || 1920), out = [];
      const tw = document.createTreeWalker(S, NodeFilter.SHOW_TEXT);
      for (let n; (n = tw.nextNode());) { const t = n.textContent.replace(/\s+/g, " ").trim(), p = n.parentElement; if (!t || !p || p.closest("svg,script,style")) continue;
        const cs = getComputedStyle(p); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const rr = rg.getBoundingClientRect(); if (!rr.width) continue;
        const x = (rr.left - B.left) * k, y = (rr.top - B.top) * k; if (x > 1915 || y > 1075 || x + rr.width * k < 5 || y + rr.height * k < 5) continue;
        out.push({ slide: si + 1, px: parseFloat(cs.fontSize) * k, y, t }); }
      return out; }));
    const mien = (x) => x.y < 70 || /^\d+\s*\/\s*\d+$/.test(x.t) || /^(Ảnh|Nguồn ảnh|Photo)\s*:/i.test(x.t);
    const nho = [], da = new Set(); let tu = 0, lon = 0;
    for (const x of m) { if (mien(x)) continue; const pt = Math.round(x.px / 2 * 10) / 10, w = x.t.split(" ").length;
      if (pt < 30) { tu += w; if (pt >= 14) lon += w; }
      if (pt < 12) { const key = `${x.slide}|${x.t}`; if (!da.has(key)) { da.add(key); nho.push({ slide: x.slide, pt, chu: x.t.slice(0, 50) }); } } }
    return { nho, than: tu ? lon / tu : 1, tu };
  } finally { await b.close(); }
}

if (require.main === module) coChu(require("path").resolve(process.argv[2])).then((r) => {
  console.log(`Chữ ≥ 14 pt: ${(100 * r.than).toFixed(1)}% số tiếng; chữ < 12 pt: ${r.nho.length} mẩu`);
  for (const x of r.nho.slice(0, 30)) console.log(`  slide ${x.slide}: ${x.pt} pt “${x.chu}”`);
});
module.exports = { coChu };
