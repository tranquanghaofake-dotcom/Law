// P6 (loi-da-biet-2026-11.md mục E, N10): find_images.py treo hơn 12 phút ở phiên 13/11/2026 — Wikimedia 429, Openverse 504,
// mỗi lỗi thử lại 4 lần (2+4+8 s), và chạy qua "| tail" thì không thấy tiến độ. Không gọi mạng thật: thay urlopen bằng hàm giả.
const test = require("node:test"), assert = require("node:assert"), path = require("path");
const { spawnSync } = require("child_process");
const SCRIPTS = path.join(__dirname, "..", "scripts");
const py = (body) => spawnSync("python3", ["-c", `import sys, io, urllib.request, urllib.error; sys.path.insert(0, ${JSON.stringify(SCRIPTS)})\nimport find_images as f\n${body}`], { encoding: "utf8" });

test("đầu ra in ngay từng dòng khi chạy qua ống (| tail)", () => {
  const r = py("print(sys.stdout.line_buffering)"); assert.strictEqual(r.stdout.trim(), "True", r.stderr);
});

test("429: không thử lại, và máy chủ đó bị bỏ qua cho hết lượt chạy", () => {
  const r = py(`n = [0]
def gia(req, timeout=0):
    n[0] += 1; raise urllib.error.HTTPError(req.full_url, 429, "Too Many Requests", {}, None)
urllib.request.urlopen = gia; f.time.sleep = lambda s: None
for u in ["https://commons.wikimedia.org/a", "https://commons.wikimedia.org/b"]:
    try: f.get(u)
    except Exception as e: print("loi", type(e).__name__)
print("goi", n[0])`);
  assert.match(r.stdout, /goi 1\b/, r.stdout + r.stderr);
  assert.strictEqual((r.stdout.match(/loi/g) || []).length, 2);
});

test("lỗi 5xx: thử lại tối đa 1 lần; máy chủ khác không bị ảnh hưởng", () => {
  const r = py(`n = {}
def gia(req, timeout=0):
    h = req.full_url.split("/")[2]; n[h] = n.get(h, 0) + 1
    if "openverse" in h: raise urllib.error.HTTPError(req.full_url, 504, "Gateway Timeout", {}, None)
    return io.BytesIO(b"ok")
urllib.request.urlopen = gia; f.time.sleep = lambda s: None
try: f.get("https://api.openverse.org/x")
except Exception: pass
print(f.get("https://www.loc.gov/y"), n)`);
  assert.match(r.stdout, /'api\.openverse\.org': 2/, r.stdout + r.stderr);
  assert.match(r.stdout, /b'ok'/);
});

test("ngân sách thời gian mỗi máy chủ (FIND_IMAGES_NGAN_SACH giây): hết thì bỏ qua máy chủ đó", () => {
  const r = spawnSync("python3", ["-c", `import sys, io, urllib.request; sys.path.insert(0, ${JSON.stringify(SCRIPTS)})
import find_images as f
t = [0.0]
f.time.monotonic = lambda: t[0]
def cham(req, timeout=0):
    t[0] += 50; return io.BytesIO(b"ok")
urllib.request.urlopen = cham
out = []
for i in range(4):
    try: f.get("https://api.openverse.org/q%d" % i); out.append("ok")
    except Exception as e: out.append("bo")
print(out)`], { encoding: "utf8", env: { ...process.env, FIND_IMAGES_NGAN_SACH: "90" } });
  assert.match(r.stdout, /\['ok', 'ok', 'bo', 'bo'\]/, r.stdout + r.stderr);
});
