// Cỡ chữ đọc được khi chiếu trên lớp (người dùng 14/11/2026: "chữ có dễ nhìn không" → một nửa chữ thân chỉ 9–13,5 pt).
// 1 px ở khung 1920 = 0,5 pt PowerPoint. Ngưỡng: không chữ hiện nào < 12 pt (trừ số trang, dải đầu trang, ghi công ảnh — điều hướng / chú thích nhỏ có chủ ý);
// chữ thân (không tính chữ trưng bày Anton, nhãn, dòng nguồn) ≥ 14 pt ở ít nhất 85% số tiếng.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
process.env.SLIDE_CHUAN_NO_PREP = "1";
const R = path.join(__dirname, "..");
const { dungHtml } = require("../hinh/dung");
let coPw = true; try { require.resolve("playwright"); } catch { coPw = false; }

test("deck mẫu so-bhxh: không chữ hiện < 12 pt (trừ số trang / dải đầu / ghi công ảnh), chữ thân ≥ 14 pt ≥ 85%", { skip: !coPw && "không có Playwright", timeout: 120000 }, async () => {
  const deck = JSON.parse(fs.readFileSync(path.join(R, "examples", "so-bhxh", "deck.json"), "utf8"));
  const q = console.log; console.log = () => {}; let r; try { r = dungHtml(deck, { deckDir: path.join(R, "examples", "so-bhxh") }); } finally { console.log = q; }
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cochu-")), "deck.html"); fs.writeFileSync(f, r.html);
  const { chromium } = require("playwright"), exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p));
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  try {
    const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
    await page.goto("file://" + f); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.hinhSanSang || null);
    const m = await page.evaluate(() => [...document.querySelectorAll("section.s")].flatMap((S, si) => { const B = S.getBoundingClientRect(), k = 1920 / B.width, out = [];
      const tw = document.createTreeWalker(S, NodeFilter.SHOW_TEXT);
      for (let n; (n = tw.nextNode());) { const t = n.textContent.replace(/\s+/g, " ").trim(), p = n.parentElement; if (!t || !p || p.closest("svg,script,style")) continue;
        const cs = getComputedStyle(p); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) continue;
        const rg = document.createRange(); rg.selectNodeContents(n); const rr = rg.getBoundingClientRect(); if (!rr.width) continue;
        const x = (rr.left - B.left) * k, y = (rr.top - B.top) * k; if (x > 1915 || y > 1075 || x + rr.width * k < 5 || y + rr.height * k < 5) continue;   // bản ghép Morph ngoài khung
        const host = p.closest("[data-t]"); out.push({ s: si + 1, pt: parseFloat(cs.fontSize) / 2, t, cls: ((host || p).className || "").split(" ")[0], anton: /Anton/.test(cs.fontFamily) }); }
      return out; }));
    const MIEN = /^bh-(hdp|hdn|cr)$/, NHAN = /^bh-(hdp|hdn|cr|src|kk|rr|sot|th|bk|mkn|nhan|tabt|sh|refh|ctg|anhtag|kick)$/;
    const nho = m.filter((x) => x.pt < 12 && !MIEN.test(x.cls));
    assert.deepEqual(nho.slice(0, 8).map((x) => `slide ${x.s} ${x.cls} ${x.pt}pt “${x.t.slice(0, 30)}”`), [], "chữ < 12 pt");
    let tu = 0, lon = 0; for (const x of m) if (!x.anton && !NHAN.test(x.cls)) { const w = x.t.split(" ").length; tu += w; if (x.pt >= 14) lon += w; }
    assert.ok(lon / tu >= 0.85, `chữ thân ≥ 14 pt chỉ ${(100 * lon / tu).toFixed(1)}%`);
  } finally { await b.close(); }
});
