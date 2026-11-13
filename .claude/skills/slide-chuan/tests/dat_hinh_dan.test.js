// P5 (loi-da-biet-2026-11.md mục E, N7–N8): hình dán ở bìa / statement / section / end
//   N7 — đặt chỗ cố định (section: l 1050, t 560) đè dấu hỏi của tiêu đề 2 dòng → tự tìm chỗ trống sau khi font nạp (trừ khi ghi emojiPos);
//   N8 — mang tên deco-* nên không Morph với hình cùng tên ở slide kề (picks → section) → tên hd-<hình> như cảnh, đích Morph không có hiệu ứng vào.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { dungHtml } = require("../hinh/dung");
const { kiemDeTrongTrang } = require("../hinh/kiem_de");

const picks = { type: "picks", title: "Ba câu hỏi", items: [{ q: "Luật quốc tế khác luật trong nước ở đâu?", emoji: "globe-showing-asia-australia", go: "p1" }, { q: "Hai?", emoji: "scroll" }] };
const chuong = (extra = {}) => ({ type: "section", id: "p1", num: 1, title: "Luật quốc tế khác luật trong nước ở đâu?", sub: "Ai làm ra luật, ai chịu luật, ai bảo đảm thi hành", emoji: "globe-showing-asia-australia", ...extra });
const emoOf = (html, name) => (html.match(new RegExp(`<div class="emo" data-l="deco-[^"]*" data-m="hd-${name}"[^>]*>`)) || [""])[0];

test("hình dán của section mang tên Morph hd-<hình>; trùng hình với slide trước → không có hiệu ứng vào", () => {
  const sau = dungHtml({ meta: {}, slides: [picks, chuong()] }).html, rieng = dungHtml({ meta: {}, slides: [{ type: "cover", title: "Bìa" }, chuong()] }).html;
  const a = emoOf(sau, "globe-showing-asia-australia"), b = emoOf(rieng, "globe-showing-asia-australia");
  assert.ok(a && !/data-a=/.test(a), "nối từ picks: đích Morph, không pop");
  assert.ok(b && /data-a="pop"/.test(b), "không có cặp: vẫn pop vào");
});

test("hình dán section tự tránh chữ của tiêu đề 2 dòng; ghi emojiPos thì giữ nguyên chỗ", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dat-")), f = path.join(dir, "deck.html");
  fs.writeFileSync(f, dungHtml({ meta: {}, slides: [chuong(), chuong({ id: "p2", emojiPos: { s: 300, l: 1050, t: 560, r: -8 } })] }, { deckDir: dir }).html);
  const { chromium } = require("playwright");
  const browser = await (process.env.PW_CHROMIUM ? chromium.launch({ executablePath: process.env.PW_CHROMIUM }) : chromium.launch().catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })));
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto("file://" + f); await page.evaluate(() => window.hinhSanSang);
    const de = await page.evaluate(kiemDeTrongTrang);
    assert.ok(!de.some((m) => /slide 1 /.test(m)), de.join("\n"));
    const pos = await page.evaluate(() => [...document.querySelectorAll("section.s")].map((s) => { const e = s.querySelector(".emo"); return [e.style.left, e.style.top]; }));
    assert.notDeepEqual(pos[0], ["1050px", "560px"], "slide 1 phải dời khỏi chỗ mặc định (đè dấu hỏi)");
    assert.deepEqual(pos[1], ["1050px", "560px"], "slide 2 ghi emojiPos: giữ nguyên");
  } finally { await browser.close(); }
});
