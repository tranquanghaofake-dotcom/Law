// TÀI NGUYÊN HÌNH CÓ GIẤY PHÉP MỞ — tải về bộ nhớ đệm khi cần (không lưu trong skill: giữ skill ≤ 200 file).
//   · Open Peeps (Pablo Stanley, CC0) qua gói @opeepsfun/open-peeps (MIT): nhân vật vẽ tay, 24 dáng đứng, 12 dáng ngồi, 54 tóc, 34 nét mặt, tô màu được.
//   · Tabler Icons (MIT): ~5.000 icon nét.
// Bộ nhớ đệm: $SLIDE_CHUAN_CACHE hoặc ~/.cache/slide-chuan. Lần đầu cần mạng tới registry npm.
const fs = require("fs"), os = require("os"), path = require("path"), { execFileSync } = require("child_process");
const CACHE = process.env.SLIDE_CHUAN_CACHE || path.join(os.homedir(), ".cache", "slide-chuan");
const GOI = { "@opeepsfun/open-peeps": "1.0.6", react: "18.3.1", "react-dom": "18.3.1", esbuild: "0.24.0", "@tabler/icons": "3.19.0" };

function damBao() {
  const nm = path.join(CACHE, "node_modules");
  const thieu = Object.keys(GOI).filter((g) => !fs.existsSync(path.join(nm, g, "package.json")));
  if (!thieu.length) return nm;
  fs.mkdirSync(CACHE, { recursive: true });
  if (!fs.existsSync(path.join(CACHE, "package.json"))) fs.writeFileSync(path.join(CACHE, "package.json"), '{"name":"slide-chuan-cache","private":true}');
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "--prefix", CACHE, ...thieu.map((g) => `${g}@${GOI[g]}`)], { stdio: "pipe" });
  return nm;
}

module.exports = { CACHE, damBao };
