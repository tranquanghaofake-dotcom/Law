// Hàm dùng chung cho test: dựng deck tạm bằng hinh/dung.js (tầng hình ảnh — tầng Office cũ đã bỏ 11/2026).
// build([deck, out.pptx, ...cờ]): mặc định --html (chỉ kiểm nội dung + sinh deck.html, không cần trình duyệt); opt.pptx = true thì dựng PPTX thật.
// Cờ của tầng Office cũ (--theme X, --transition X, --native, --build, --motion, --raster) bị bỏ qua.
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const BUILD = path.join(ROOT, "hinh", "dung.js");
const BO_CO_GIA_TRI = new Set(["--theme", "--transition"]), BO_CO = new Set(["--native", "--build", "--motion", "--raster"]);

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), "slide-chuan-")); }
function build(args, opt = {}) {
  const a = []; for (let i = 0; i < args.length; i++) { if (BO_CO_GIA_TRI.has(args[i])) { i++; continue; } if (BO_CO.has(args[i]) || /^--(theme|transition)=/.test(args[i])) continue; a.push(args[i]); }
  if (!opt.pptx && !a.includes("--titles")) a.push("--html");
  const r = spawnSync("node", [BUILD, ...a], { encoding: "utf8", cwd: opt.cwd || ROOT, env: Object.assign({}, process.env, { SLIDE_CHUAN_NO_PREP: opt.prep ? "" : "1" }) });
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
