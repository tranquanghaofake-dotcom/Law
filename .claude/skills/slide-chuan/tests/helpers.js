// Hàm dùng chung cho test: chạy build.js, tạo deck tạm.
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "engine", "build.js");

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), "slide-chuan-")); }
function build(args, opt = {}) {
  const r = spawnSync("node", [BUILD, ...args], { encoding: "utf8", cwd: opt.cwd || ROOT, env: Object.assign({}, process.env, { SLIDE_CHUAN_NO_PREP: opt.prep ? "" : "1" }) });
  return { code: r.status, out: r.stdout || "", err: r.stderr || "", all: (r.stdout || "") + (r.stderr || "") };
}
// Dựng deck từ object; trả về { dir, deck, pptx, ...kết quả }
function buildDeck(deck, extra = [], dir = tmpdir(), opt = {}) {
  const deckPath = path.join(dir, "deck.json");
  fs.writeFileSync(deckPath, typeof deck === "string" ? deck : JSON.stringify(deck));
  const pptx = path.join(dir, "out.pptx");
  return Object.assign({ dir, deckPath, pptx }, build([deckPath, pptx, ...extra], opt));
}
const cover = { type: "cover", title: "Tiêu đề thử" };
module.exports = { ROOT, BUILD, tmpdir, build, buildDeck, cover };
