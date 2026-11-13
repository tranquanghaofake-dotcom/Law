// Test: đo chữ lúc dựng phải bắt được ca đè (cards tên chữ hoa 18 ký tự) mà giới hạn ký tự bỏ lọt.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ROOT, build, buildDeck, cover } = require("./helpers");

const STRESS = path.join(__dirname, "stress.json");
const THEMES = ["mặc định"];   // theme Office đã bỏ (11/2026): chạy một lần với da mặc định

test("banan142 --strict xanh", () => {
  for (const t of THEMES) {
    const r = build([path.join(ROOT, "examples", "banan142.json"), path.join(require("os").tmpdir(), `b_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
    assert.ok(!/cần \d+ dòng/.test(r.all), `${t}:\n${r.all}`);
  }
});