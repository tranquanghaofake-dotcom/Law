// Kiểm tra deck.json trước khi dựng: lỗi (dừng, exit 2) và cảnh báo (nội dung/bố cục).
// Mô tả trường: 's' chuỗi tuỳ chọn, 's!' chuỗi bắt buộc, 'b' true/false, 'icon' tên icon fa6, [ 'a'|'a!', phần tử ] = mảng.
const fa = require("react-icons/fa6");

const ART = ["justice", "gcn", "courthouse", "scales", "document", "house", "gavel", "land", "umbrella", "shield", "fund", "book", "quiz", "passbook", "idcard", "pension", "receipt", "bankbook", "orgchart", "sealed", "harbor", "none"];
const TONE = ["good", "bad", "muted"];
const MOTIFS = ["none", "cadastral", "certificate", "landscape", "contour", "dots", "lines", "waves", "blobs", "grid"];
// art: tên hình vẽ (ART) hoặc "3d:vật1,vật2,…" = hình lớn ghép từ vật 3D trong hinh/f3d (vật đầu là vai chính)
const tone = { enum: TONE }, art = { art3d: true };
const pair = { pair: true };
const stats = ["a", { label: "s!", value: "s!", desc: "s", tone }];

const SCHEMA = {
  checklist: { kicker: "s", title: "s!", items: ["a!", { ok: { enum: ["yes", "no", "maybe", "na"] }, head: "s!", text: "s", src: "s" }], verdict: { ok: { enum: ["yes", "no", "maybe"] }, text: "s!" }, note: "s" },
  bento: { kicker: "s", title: "s!", cells: ["a!", { icon: "icon", value: "s", head: "s", text: "s", items: ["a", "s"] }], note: "s" },
  formula: { kicker: "s", title: "s!", result: { sym: "s!", label: "s" }, terms: ["a!", { sym: "s!", label: "s!", note: "s", op: { enum: ["×", "÷", "+", "−", "x", "*", "/", "-"] } }], focus: "n", example: "s", note: "s" },
  calc: { kicker: "s", title: "s!", given: ["a", { label: "s!", value: "s!" }], steps: ["a!", { label: "s!", expr: "s", value: "s" }], answer: { value: "s!", unit: "s", label: "s" }, note: "s" },
  exercise: { kicker: "s", title: "s!", label: "s", prompt: "s!", given: ["a", { label: "s!", value: "s!" }], ask: "s", hint: "s" },
  funnel: { kicker: "s", title: "s!", unit: "s", inLabel: "s", outLabel: "s", sources: ["a!", { label: "s!", value: "n", display: "s", focus: "b" }], pool: { label: "s!", sub: "s", icon: "icon" }, uses: ["a", { label: "s!", value: "n", display: "s", focus: "b" }], note: "s" },
  match: { kicker: "s", title: "s!", colL: "s", colR: "s", pairs: ["a!", { left: "s!", right: "s!", note: "s" }], focus: "n", note: "s" },
  changelog: { kicker: "s", title: "s!", colTopic: "s", colOld: "s", colNew: "s", rows: ["a!", { topic: "s!", old: "s", new: "s!", status: { enum: ["new", "changed", "removed", "kept"] } }], focus: "n", note: "s" },
  journey: { kicker: "s", title: "s!", who: { name: "s", sub: "s", icon: "icon" }, stages: ["a!", { when: "s", event: "s!", link: "s", icon: "icon" }], focus: "n", note: "s" },
  cheatsheet: { kicker: "s", title: "s!", rows: ["a!", { label: "s!" }], cols: ["a!", { icon: "icon", name: "s!", cells: ["a!", "s"] }], focus: "n", note: "s" },
  quiz: { kicker: "s", title: "s!", stem: "s", options: ["a!", "s"], answer: "n", reveal: "b", why: "s", whyNot: ["a", "s"], note: "s" },
  timeline: { kicker: "s", title: "s!", items: ["a!", { when: "s", head: "s!", text: "s" }], focus: "n", note: "s" },
  photo: { side: { enum: ["left", "right"] }, photoFocus: { enum: ["top", "center", "bottom"] }, kicker: "s", title: "s!", sub: "s", photo: "s!", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoMark: { x: "n", y: "n", label: "s" }, callouts: ["a", { x: "n", y: "n", label: "s!" }] },
  split: { photoFocus: { enum: ["top", "center", "bottom"] }, kicker: "s", title: "s!", sub: "s", side: { enum: ["left", "right"] }, items: ["a", { icon: "icon", head: "s!", text: "s" }], photo: "s!", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoMark: { x: "n", y: "n", label: "s" } },
  gallery: { kicker: "s", title: "s!", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photos: ["a!", { photo: "s!", caption: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }], note: "s" },
  map: { kicker: "s", title: "s!", admin: { enum: [34, 63] }, route: "b", places: ["a", { name: "s!", label: "s", note: "s" }],
    groups: ["a", { label: "s!", preset: { enum: ["merged", "kept"] }, provinces: ["a", "s"], note: "s", tone }], stat: { value: "s", label: "s" }, note: "s" },
  share: { offTone: { enum: ["bad", "muted"] }, kicker: "s", title: "s!", pct: "n", style: { enum: ["parcels", "grid"] }, label: "s", legend: ["a", "s"], items: ["a", { icon: "icon", head: "s!", text: "s" }], note: "s" },
  cover: { mark: "s", textSide: { enum: ["left", "right", "auto"] }, frame: { enum: ["rect", "arch", "circle", "ogee", "none"] }, layout: { enum: ["art", "typo", "paper", "band", "full", "split", "frame", "poster"] }, facts: ["a", "s"], date: "s", photoFocus: { enum: ["top", "center", "bottom"] }, photo: "s", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoMark: { x: "n", y: "n", label: "s" }, photoLayout: { enum: ["full", "split"] }, kicker: "s", title: "s!", subtitle: "s", author: "s", authorSub: "s", initials: "s", art },
  section: { part: "s", photoLayout: { enum: ["side", "backdrop"] }, frame: { enum: ["rect", "arch", "circle", "ogee", "none"] }, style: { enum: ["giant", "block", "dark"] }, inside: ["a", "s!"], textSide: { enum: ["left", "right", "auto"] }, cutout: "s", cutoutAlt: "s", photo: "s", photoAlt: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] }, photoCredit: "s", photoSource: "s", num: "s", title: "s!", sub: "s", art },
  statement: { cutout: "s", cutoutAlt: "s", photoCredit: "s", photoSource: "s", kicker: "s", title: "s!", sub: "s", stats, art, stamp: "s", artCaption: "s" },
  table: { kicker: "s", title: "s!", cols: ["a!", { label: "s!", align: { enum: ["left", "center", "right"] } }], rows: ["a!", ["a", "s"]], focus: "n", note: "s" },
  cards: { photoFocus: { enum: ["top", "center", "bottom"] }, kicker: "s", title: "s!", sub: "s", labels: ["a", "s"], chain: "b", focus: "n", items: ["a!", { icon: "icon", name: "s!", who: "s", tag: "s", desc: "s", photo: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }] },
  scene: { year: "s!", title: "s!", sum: "s", events: ["a", { date: "s!", text: "s!" }], timeline: { ref: "s", active: ["a", "n"] } },
  duel: { kicker: "s", title: "s!", focus: { enum: ["left", "right"] }, paired: "b", left: { tag: "s!", sub: "s", items: ["a", "s!"] }, right: { tag: "s!", sub: "s", items: ["a", "s!"] } },
  stats: { kicker: "s", title: "s!", sub: "s", items: ["a!", { label: "s!", value: "s!", desc: "s", tone }] },
  agenda: { frame: { enum: ["rect", "arch", "circle", "ogee", "none"] }, photo: "s", photoAlt: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] }, cutout: "s", cutoutAlt: "s", photoCredit: "s", photoSource: "s", kicker: "s", title: "s!", items: ["a!", "s!"], art },
  evidence: { quoteDoc: "s", kicker: "s", title: "s!", listTitle: "s", items: ["a!", { head: "s!", desc: "s" }], quote: "s!", quoteBy: "s", foot: "s" },
  compare: { kicker: "s", title: "s!", focus: { enum: ["left", "right"] }, left: { title: "s!", tag: "s", value: "s!", text: "s", note: "s", tone }, right: { title: "s!", tag: "s", value: "s!", text: "s", note: "s", tone }, footer: "s" },
  fork: { kicker: "s", title: "s!", axis: ["a", pair], checklist: { title: "s", items: ["a", { ok: "b", text: "s!" }], q: "s" }, branches: ["a!", { tag: "s!", head: "s!", text: "s!", src: "s", pick: "b" }], footer: "s" },
  chart: { annotate: { item: "n", text: "s" }, kicker: "s", title: "s!", kind: { enum: ["bar", "donut", "span", "slope", "column", "step", "line", "waterfall", "gantt", "progress"] }, base: "n", unit: "s", center: "s", ends: ["a", "s"], series: ["a", "s"], stack: "b",
    items: ["a!", { label: "s!", value: "n", value2: "n", after: "n", target: "n", total: "b", display: "s", display2: "s", from: "s", to: "s", focus: "b", hatch: "b", why: "s", tone }], markers: ["a", { date: "s!", label: "s!" }],
    bands: ["a", { from: "s!", to: "s!", label: "s" }],
    insight: { value: "s", unit: "s", text: "s" }, note: "s" },
  bignum: { days: ["a", "s"], daysLabels: ["a", "s"], kicker: "s", title: "s!", num: "s!", unit: "s", numDesc: "s", condTitle: "s", conds: ["a", { ok: { enum: ["yes", "no", "maybe", "na"] }, head: "s!", desc: "s", verdict: "s" }], note: "s" },
  panelrows: { cutout: "s", cutoutAlt: "s", photoCredit: "s", photoSource: "s", kicker: "s", title: "s!", icon: "icon", art, stamp: "s", artCaption: "s", rows: ["a!", { head: "s!", text: "s!", note: "s", tone }] },
  scorecard: { kicker: "s", title: "s!", colA: "s", colB: "s", rows: ["a!", { q: "s!", a: "s", b: "s" }], footer: "s" },
  flow: { kicker: "s", title: "s!", nodes: ["a!", { id: "s!", icon: "icon", name: "s!", who: "s", tag: "s" }], edges: ["a!", { from: "s!", to: "s!", label: "s!", tone, dash: "b", side: { enum: ["above", "below"] } }], note: "s" },
  ledger: { kicker: "s", title: "s!", unit: "s", rows: ["a!", { name: "s!", sub: "s", focus: "b", result: "s", steps: ["a!", { label: "s!", value: "n" }] }], note: "s" },
  pyramid: { kicker: "s", title: "s!", levels: ["a!", { head: "s!", text: "s", tone }], focus: "n", note: "s" },
  steps: { kicker: "s", title: "s!", steps: ["a!", { head: "s!", when: "s", text: "s" }], focus: "n", note: "s" },
  hub: { kicker: "s", title: "s!", center: { icon: "icon", label: "s" }, items: ["a!", { icon: "icon", head: "s!", text: "s" }], focus: "n", note: "s" },
  matrix: { kicker: "s", title: "s!", x: { label: "s", lo: "s", hi: "s" }, y: { label: "s", lo: "s", hi: "s" }, cells: ["a!", { head: "s!", text: "s", tone }], focus: "n", note: "s" },
  venn: { kicker: "s", title: "s!", left: { label: "s!", items: ["a", "s!"] }, both: { label: "s", items: ["a", "s!"] }, right: { label: "s!", items: ["a", "s!"] }, note: "s" },
  tree: { kicker: "s", title: "s!", root: { q: "s!", src: "s" }, branches: ["a!", { when: "s!", head: "s!", text: "s", tone }], focus: "n", note: "s" },
  quote: { kicker: "s", quote: "s!", by: "s", role: "s", note: "s", cutout: "s", cutoutAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["natural", "bw"] } },
  frame: { kicker: "s", title: "s!", side: { enum: ["left", "right"] }, photo: "s!", photoAlt: "s", photoCredit: "s", photoSource: "s", photoFocus: { enum: ["top", "center", "bottom"] }, photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, points: ["a", { x: "n", y: "n", head: "s!", text: "s" }], note: "s" },
  beforeafter: { kicker: "s", title: "s!", before: { photo: "s!", label: "s", date: "s", caption: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }, after: { photo: "s!", label: "s", date: "s", caption: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }, note: "s" },
  end: { frame: { enum: ["rect", "arch", "circle", "ogee", "none"] }, style: { enum: ["bookend", "classic", "poster"] }, message: "s", textSide: { enum: ["left", "right", "auto"] }, kicker: "s", title: "s!", sub: "s", team: ["a", { name: "s!", role: "s" }], teamTitle: "s", contact: "s", art, cutout: "s", cutoutAlt: "s", photo: "s", photoAlt: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] }, photoCredit: "s", photoSource: "s" },
  mosaic: { photoFocus: { enum: ["top", "center", "bottom"] }, kicker: "s", title: "s!", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photos: ["a!", { photo: "s!", caption: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }], note: "s" },
  photostats: { kicker: "s", title: "s!", side: { enum: ["left", "right"] }, photo: "s!", photoAlt: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] }, photoCredit: "s", photoSource: "s", stats: ["a!", { value: "s!", label: "s!", desc: "s", tone }], note: "s" },
  photostrip: { photoFocus: { enum: ["top", "center", "bottom"] }, kicker: "s", title: "s!", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, items: ["a!", { photo: "s!", date: "s", head: "s!", text: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }], focus: "n", note: "s" },
  isotype: { kicker: "s", title: "s!", icon: { enum: ["note", "person", "house", "parcel", "day"] }, unit: { value: "n!", label: "s!", short: "s" }, lostLabel: "s", rows: ["a!", { label: "s!", value: "n!", lost: "n", display: "s", tone }], note: "s" },
  iso: { kicker: "s", title: "s!", objects: ["a!", { kind: { enum: ["parcel", "house", "building", "bank", "court", "tree", "person"] }, x: "n", y: "n", w: "n", d: "n", focus: "b", pin: "b", label: "s", sub: "s" }], note: "s" },
  hero: { kicker: "s", num: "s!", unit: "s", title: "s!", sub: "s", note: "s", photo: "s", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] } },
  sheet: { kicker: "s", title: "s!", cols: ["a", "s"], unit: "s", rows: ["a!", { label: "s!", value: "n!", display: "s", note: "s", tone: { enum: ["good", "bad", "muted"] }, focus: "b", hatch: "b" }], note: "s" },
  calendar: { kicker: "s", title: "s!", month: "s", startDay: "n", days: "n", marks: ["a!", { from: "n!", to: "n!", label: "s!", tone: { enum: ["good", "bad", "muted"] } }], note: "s" },
  riskbar: { kicker: "s", title: "s!", stages: ["a!", "s!"], rows: ["a!", { label: "s!", sub: "s", at: "n!", pay: "n" }], legend: ["a", "s"], note: "s" },
  receipt: { kicker: "s", title: "s!", head: "s", unit: "s", items: ["a!", { label: "s!", display: "s!", tone: { enum: ["good", "bad", "muted"] }, focus: "b" }], sub: { label: "s!", display: "s!" }, tax: { label: "s!", display: "s!" }, total: { label: "s!", display: "s!" }, points: ["a", { head: "s!", text: "s" }], note: "s" },
  account: { kicker: "s", title: "s!", cols: ["a", "s"], unit: "s", open: "s", close: "s", rows: ["a!", { date: "s!", desc: "s!", amount: "n!", display: "s", balance: "s", focus: "b" }], note: "s" },
  captable: { kicker: "s", title: "s!", company: "s!", holders: ["a!", { name: "s!", pct: "n!", sub: "s", focus: "b" }], thresholds: ["a", { pct: "n!", label: "s!" }], note: "s" },
  record: { kicker: "s", title: "s!", head: "s", fields: ["a!", { label: "s!", value: "s!", tone: { enum: ["good", "bad", "muted"] } }], signs: ["a", { role: "s!", state: { enum: ["signed", "refused", "absent"] } }], points: ["a", { head: "s!", text: "s" }], note: "s" },
  plan: { kicker: "s", title: "s!", width: "s", height: "s", ratio: "n", zones: ["a", { label: "s!", x: "n!", y: "n!", w: "n!", h: "n!", tone: { enum: ["good", "bad", "muted"] }, dash: "b" }], items: ["a", { head: "s!", text: "s" }], note: "s" },
  headline: { kicker: "s", lines: ["a!", "s!"], sub: "s", side: { enum: ["left", "right"] }, photo: "s!", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photoFocus: { enum: ["top", "center", "bottom"] }, note: "s" },
  lens: { kicker: "s", title: "s!", photo: "s!", photoAlt: "s", photoCredit: "s", photoSource: "s", focus: { x: "n!", y: "n!", r: "n", label: "s" }, items: ["a", { head: "s!", text: "s" }], note: "s" },
  collage: { kicker: "s", title: "s!", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, photos: ["a!", { photo: "s!", caption: "s", alt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] } }], items: ["a", { head: "s!", text: "s" }], note: "s" },
  redline: { kicker: "s", title: "s!", old: { label: "s", text: "s" }, new: { label: "s", text: "s" }, note: "s" },
  deadline: { kicker: "s", title: "s!", from: "s!", to: "s!", today: "s", display: "s", label: "s", fromLabel: "s", toLabel: "s", markers: ["a", { date: "s!", label: "s!" }], note: "s" },
  closing: { photo: "s", photoAlt: "s", photoCredit: "s", photoSource: "s", photoStyle: { enum: ["tint", "natural", "bw", "duotone"] }, kicker: "s", title: "s!", answers: ["a", { q: "s!", a: "s!", tone: { enum: ["good", "bad", "muted"] } }], verdict: "s", lessons: ["a", { icon: "icon", head: "s", text: "s!" }], rec: { title: "s", items: ["a", "s!"] }, thanks: "s", art },
};
const KINDS = ["lecture", "case", "report"]; // loại bài (meta.kind) — quyết định khung slide, hình mặc định; ghi ở bước 0 (prep.json)
// id, toc, trans, dur, emoji…: trường của tầng hình ảnh (hinh/dung.js)
const COMMON = ["type", "id", "emoji", "emoji2", "emojiPos", "toc", "trans", "dur", "mode", "notes", "covers", "transition", "build", "motion", "takeaway", "pin", "activitySec", "basis", "scopeOk", "phong", "dien", "cam", "noi", "tienCanh", "bieuDo"]; // basis: [số slide] — hạn chế / nhận định dựa trên slide số liệu nào ở phần thực trạng // scopeOk: true — slide được phép nhắc nội dung ngoài phạm vi (meta.scopeOut), vd. bảng tổng đầu tiên; // activitySec: số giây lớp tự làm (exercise / quiz) — cộng vào thời lượng ước tính; // pin: câu / số chính trên tờ giấy ghim (chuỗi hoặc { text, by }) // takeaway: câu chốt của slide → dải "Ghi nhớ" ở đáy, cùng vị trí mọi slide // transition: fade | push | morph | none — riêng slide này // covers: các đề mục của tài liệu mà slide này trình bày (đối chiếu với meta.outline)
// Số mục tối đa engine hiển thị; vượt thì bị cắt im lặng.
const CAPS = {
  quiz: { options: 4, whyNot: 4 }, timeline: { items: 6 },
  formula: { terms: 5 }, checklist: { items: 6 }, bento: { cells: 5 }, calc: { given: 5, steps: 4 }, exercise: { given: 5 }, funnel: { sources: 4, uses: 4 }, changelog: { rows: 6 }, match: { pairs: 6 }, journey: { stages: 6 }, cheatsheet: { rows: 3, cols: 5 },
  sheet: { rows: 12, cols: 3 }, calendar: { marks: 4 }, riskbar: { stages: 7, rows: 8, legend: 3 }, plan: { zones: 5, items: 3 }, receipt: { items: 6, points: 3 }, account: { rows: 8, cols: 5 }, captable: { holders: 5, thresholds: 3 }, record: { fields: 6, signs: 3, points: 3 }, headline: { lines: 3 }, lens: { items: 3 }, collage: { photos: 3, items: 3 }, isotype: { rows: 3 }, section: { inside: 4 }, deadline: { markers: 4 }, iso: { objects: 8 }, statement: { stats: 3 }, cards: { items: 4 }, scene: { events: 3 }, duel: { "left.items": 4, "right.items": 4 },
  stats: { items: 4 }, agenda: { items: 4 }, evidence: { items: 3 }, fork: { branches: 2, "checklist.items": 3 },
  bignum: { conds: 2 }, panelrows: { rows: 3 }, scorecard: { rows: 3 }, closing: { lessons: 3, answers: 4, "rec.items": 2 },
  flow: { nodes: 5, edges: 6 }, ledger: { rows: 4 }, chart: { items: 12 }, table: { cols: 5, rows: 6 }, split: { items: 3 }, gallery: { photos: 3 }, map: { places: 4, groups: 3 }, photo: { callouts: 3 }, share: { items: 3 },
  pyramid: { levels: 5 }, end: { team: 6 }, mosaic: { photos: 5 }, photostats: { stats: 3 }, photostrip: { items: 5 }, steps: { steps: 5 }, hub: { items: 6 }, matrix: { cells: 4 }, venn: { "left.items": 3, "both.items": 3, "right.items": 3 }, tree: { branches: 3 }, frame: { points: 4 },
};
const RICH_FIELDS = /(^|\.)(title|footer|foot|note|text|q|a|b|items\[\d+\]|left\.items\[\d+\]|right\.items\[\d+\])$/;

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" || typeof v === "number";
const empty = (v) => v == null || (isStr(v) && String(v).trim() === "");
const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);

const pi = require("react-icons/pi"), lu = require("react-icons/lu"), tb = require("react-icons/tb");
function checkIcon(name) {
  if (fa[name] || pi[name] || lu[name] || tb[name]) return null;
  const near = Object.keys(fa).filter(k => k.startsWith(name) || (name.length > 4 && k.toLowerCase().includes(name.slice(2).toLowerCase()))).slice(0, 4);
  return `icon "${name}" không tồn tại (đã tìm trong Phosphor Pi…, Lucide Lu…, Tabler Tb…, Font Awesome Fa…)${near.length ? ` (gần giống: ${near.join(", ")})` : ""} — xem references/icons.md`;
}

// Duyệt theo mô tả; gọi err(đường dẫn, thông báo)
function walk(val, spec, p, err, req) {
  const label = p || "(gốc)";
  if (typeof spec === "string") {
    const need = spec.endsWith("!"), kind = spec.replace("!", "");
    if (empty(val)) { if (need && req) err(label, "thiếu (bắt buộc)"); return; }
    if (kind === "s" && !isStr(val)) err(label, "phải là chuỗi chữ");
    else if (kind === "n" && typeof val !== "number") err(label, "phải là số");
    else if (kind === "b" && typeof val !== "boolean") err(label, "phải là true/false");
    else if (kind === "icon") { if (!isStr(val)) err(label, "phải là tên icon"); else { const m = checkIcon(String(val)); if (m) err(label, m); } }
    return;
  }
  if (Array.isArray(spec)) {
    const need = spec[0] === "a!";
    if (val == null) { if (need && req) err(label, "thiếu (bắt buộc, phải là danh sách)"); return; }
    if (!Array.isArray(val)) { err(label, "phải là danh sách [...]"); return; }
    if (need && !val.length && req) err(label, "danh sách rỗng");
    val.forEach((x, i) => walk(x, spec[1], `${p}[${i}]`, err, true));
    return;
  }
  if (spec.art3d) { if (val == null) return; if (typeof val === "string" && val.startsWith("ve:")) { const { coVe } = require("../hinh/ve_bh"); const thieu = val.slice(3).split(",").filter((v) => !coVe(v.trim()));
      if (thieu.length || !val.slice(3).trim()) err(label, `vật tự vẽ không có trong hinh/ve_bh.js: ${thieu.join(", ") || "(trống)"}`); return; } if (typeof val === "string" && val.startsWith("3d:")) { const { coF3d } = require("../hinh/f3d"); const thieu = val.slice(3).split(",").filter((v) => !coF3d(v.trim()));
      if (thieu.length || !val.slice(3).trim()) err(label, `vật 3D không có trong hinh/f3d: ${thieu.join(", ") || "(trống)"}`); return; }
    if (!ART.includes(val)) err(label, `giá trị "${val}" không hợp lệ (chọn: ${ART.join(" | ")} | 3d:vật1,vật2)`); return; }
  if (spec.enum) { if (val != null && !spec.enum.includes(val)) err(label, `giá trị "${val}" không hợp lệ (chọn: ${spec.enum.join(" | ")})`); return; }
  if (spec.pair) { if (!Array.isArray(val) || val.length < 2 || !isStr(val[0]) || !isStr(val[1])) err(label, 'phải có dạng ["mốc", "nhãn"]'); return; }
  // đối tượng
  if (val != null && !isObj(val)) { err(label, "phải là đối tượng {...}"); return; }
  for (const [k, sp] of Object.entries(spec)) walk(val == null ? undefined : val[k], sp, p ? `${p}.${k}` : k, err, req && val != null); // đối tượng con vắng mặt (tuỳ chọn) → trường con không bắt buộc
}

// ---------- kiểm tra "người nghe hiểu được gì" ----------
// Đây là cảnh báo về CÁCH VIẾT, không phải lỗi kỹ thuật: tiêu đề phải là câu trả lời, chữ phải ít.
const MAX_WORDS = 110;           // đếm theo TIẾNG (âm tiết, tách bằng khoảng trắng). Quá ngưỡng này người nghe không đọc kịp khi đang nghe giảng (mục tiêu ≤ 80; ~100 tiếng ≈ 50 từ tiếng Anh)
const NO_WORDS = new Set(["covers", "url", "cutout", "cutoutAlt", "photo", "photoAlt", "photoCredit", "photoSource", "photoStyle", "photoLayout", "photoMark", "alt", "route", "side", "name", "quoteDoc", "pick", "id", "from", "to", "type", "mode", "notes", "icon", "art", "tone", "ok", "ref", "active", "chain", "dash", "focus", "value", "initials", /* không hiện trên CHÍNH slide này: nhãn ở mục lục, đích liên kết, tên hình dán */ "toc", "go", "next", "emoji", "emoji2", "emojis"]);
const FILLER = ["có thể thấy", "nhìn chung", "như đã biết", "bên cạnh đó", "ngoài ra", "đáng chú ý là", "cần lưu ý rằng", "không thể phủ nhận", "vô cùng", "hết sức", "một cách", "trong đó có", "đối với vấn đề", "về cơ bản"];
const LABEL_TITLE = /^(giới thiệu|tổng quan|nội dung|khái quát|khái niệm|cơ sở lý luận|thực trạng|kết luận|phân tích|bình luận|tóm tắt|một số|vấn đề)\b/i;
const QUESTION_OK = new Set(["agenda", "section", "cover", "end", "quiz"]); // quiz: tiêu đề CHÍNH LÀ câu hỏi // end: "Câu hỏi?" là lời mời thảo luận
// cảnh / bộ hình được hỏi ở tiêu đề: bìa, chương, kết (như cover / section / end) và slide mà câu hỏi CHÍNH LÀ nội dung (đố, chọn câu hỏi, bài tập)
["bcbia", "bhbia", "qtbia", "bcchuong", "bhchuong", "qtchuong", "bccamon", "bhket", "quizgo", "bigq", "picks", "bhdo", "bhba", "bhhoi", "bccauhoi", "bchoi"].forEach((t) => QUESTION_OK.add(t));
function words(v, k) {
  if (NO_WORDS.has(k)) return 0;
  if (typeof v === "string") return v.replace(/[\[\]]/g, "").split(/\s+/).filter(Boolean).length;
  if (Array.isArray(v)) return v.reduce((a, x) => a + words(x), 0);
  if (isObj(v)) return Object.entries(v).reduce((a, [kk, x]) => a + words(x, kk), 0);
  return 0;
}
// Nhận định (đánh giá) phải đi kèm dẫn chứng NGAY TRÊN SLIDE: số liệu, điều luật, trích dẫn, ví dụ.
// "sai" trong "sai sót", "sai lệch" là danh từ mô tả, không phải nhận định → loại trừ
const JUDGE = /(?<![\p{L}\p{N}])(đúng|sai(?! sót| lệch| số)|thiếu|hợp lý|không hợp lý|bất cập|tùy tiện|tuỳ tiện|vượt quá|nghiêm trọng|hiệu quả|kém|tốt|xấu|thiệt|lỗ hổng|phù hợp|vi phạm|thoả đáng|thỏa đáng|tiêu cực|tích cực|ảnh hưởng|đầy đủ|kịp thời|đáng kể|ổn định|chặt chẽ|bền vững|minh bạch|nhanh chóng|vững chắc|rõ rệt|mạnh mẽ|vượt bậc|đồng bộ)(?![\p{L}\p{N}])/iu;
const PROOF = /\d|Điều|khoản|điểm [a-zđ]\b|Bản án|BA |Án lệ|Công văn|Nghị quyết|Nghị định|Thông tư|Luật|BLDS|BLTTDS|BLHS|ví dụ|VD|“|"/u;
function textOf(v, k) {
  if (NO_WORDS.has(k)) return "";
  if (typeof v === "string") return v + " ";
  if (Array.isArray(v)) return v.map(x => textOf(x)).join(" ");
  if (isObj(v)) return Object.entries(v).map(([kk, x]) => textOf(x, kk)).join(" ");
  return "";
}
function clarity(sl, n, warnings) {
  if (!["cover", "section", "agenda"].includes(sl.type)) {
    const all = textOf(sl).replace(/[\[\]]/g, ""), m = all.match(JUDGE);
    const hasProof = PROOF.test(all) || /"value":\s*-?\d/.test(JSON.stringify(sl)) || sl.quote || (Array.isArray(sl.items) && sl.items.some(x => x && (x.value != null || x.from)));
    if (m && !hasProof) warnings.push(`Slide ${n} (${sl.type}): có nhận định "${m[1]}" nhưng không có dẫn chứng nào trên slide (số liệu, điều luật, trích bản án, ví dụ) — thêm dẫn chứng, hoặc bỏ nhận định`);
  }
  const W = (m) => warnings.push(`Slide ${n} (${sl.type}): ${m}`);
  const t = typeof sl.title === "string" ? sl.title.replace(/[\[\]]/g, "").trim() : "";
  if (t && !QUESTION_OK.has(sl.type) && /\?\s*$/.test(t)) W(`tiêu đề là câu hỏi ("${t.slice(0, 40)}") — người nghe nhớ câu trả lời chứ không nhớ câu hỏi: viết thành câu kết luận, đưa câu hỏi vào kicker`);
  if (t && !["cover", "section", "end"].includes(sl.type) && LABEL_TITLE.test(t) && t.split(/\s+/).length <= 5) W(`tiêu đề là nhãn ("${t}") — viết thành một câu kết luận`);
  // match: ô trái trùng nhau ở các hàng liền nhau được GỘP thành một ô trên slide → chỉ đếm một lần
  const wc = sl.type === "match" && Array.isArray(sl.pairs) ? words(Object.assign({}, sl, { pairs: sl.pairs.map((p, j) => (j && isObj(p) && isObj(sl.pairs[j - 1]) && p.left === sl.pairs[j - 1].left ? Object.assign({}, p, { left: "" }) : p)) })) : ["quizgo", "bhhoi"].includes(sl.type) ? words(Object.assign({}, sl, { whyNot: null, right: null, wrong: null })) /* phản hồi đúng / sai là slide KHÁC, không cộng vào slide hỏi */ : words(sl);
  if (wc > MAX_WORDS && !["redline", "book", "lawquote"].includes(sl.type) /* nguyên văn điều luật: không được cắt chữ */) W(`${wc} tiếng trên slide (tối đa ${MAX_WORDS}, nên ≤ 80) — giữ ý chính, chuyển phần giải thích vào notes`);
  // ký tự phải có nghĩa: chỉ dùng bộ ký hiệu chuẩn (→ hệ quả · ngăn cách — đối lập/giải thích ≈ xấp xỉ “ ” trích nguyên văn ? chưa rõ)
  const raw = textOf(sl);
  const deco = raw.match(/[\u2600-\u27BF\u{1F300}-\u{1FAFF}★☆●○■□◆◇►▶•❖✦✧✔✘✓✗]/u);
  if (deco) W(`ký tự trang trí "${deco[0]}" — không mang nghĩa trên slide; dùng icon/đánh dấu của engine (ok, verdict, tone) hoặc bỏ`);
  if (/->|=>/.test(raw)) W('dùng "→" (hệ quả, dẫn đến) thay cho "->" / "=>"');
  if (/"[^"]+"/.test(raw)) W('dùng ngoặc kép “ ” cho trích dẫn nguyên văn, không dùng " "');
  const seen = new Set();
  const scan = (v, p) => {
    if (typeof v === "string") { if (/(^|\.)quote$/.test(p)) return; /* trích NGUYÊN VĂN: không được sửa chữ */ const low = v.toLowerCase(); for (const f of FILLER) if (low.includes(f) && !seen.has(f)) { seen.add(f); W(`${p} có cụm đệm "${f}" — xoá đi, câu vẫn đủ nghĩa`); } }
    else if (Array.isArray(v)) v.forEach((x, j) => scan(x, `${p}[${j}]`));
    else if (isObj(v)) for (const [k, x] of Object.entries(v)) if (!NO_WORDS.has(k)) scan(x, p ? `${p}.${k}` : k);
  };
  scan(sl, "");
}

// extraTypes: kiểu của bộ cảnh / bộ hình (hinh/canh.js, bang_chung.js, hoi_nghi.js) — ở đây chỉ bỏ qua phần SCHEMA của chúng
// slide mở phần: section của engine và slide chương của các bộ hình
const CHUONG = ["section", "bcchuong", "qtchuong", "bhchuong"];
/** LÀM TRÒN XUỐNG THÀNH SỐ KHÁC: trong các đoạn chữ (mỗi phần tử một slide), tỉ lệ có 2 chữ số thập phân (1,57 lần) mà chỗ khác ghi
 *  "1,5×" / "1,5 lần" không kèm "hơn / gần / khoảng" → người nghe nhớ một con số sai (bộ BHXH 11/2026: thẻ Ghi nhớ "1,5×").
 *  Làm tròn đúng (1,6) không báo. Trả [{ i, text }] — i là chỉ số đoạn. Gợi ý, không chặn. */
function kiemLamTron(txt) {
  const chinhXac = new Set(); txt.forEach((t) => { for (const m of String(t).matchAll(/(?<![\d.,])(\d+),(\d{2})(?![\d])/g)) chinhXac.add(+`${m[1]}.${m[2]}`); });
  const out = [], da = new Set();
  txt.forEach((t0, i) => { const t = String(t0); for (const m of t.matchAll(/(?<![\d.,])(\d+),(\d)(?![\d,])\s*(×|x\b|lần)/g)) { const v = +`${m[1]}.${m[2]}`;
    const goc = [...chinhXac].find((x) => Math.floor(x * 10 + 1e-9) / 10 === v && Math.round(x * 10) / 10 !== v); if (goc == null) continue;
    if (/(hơn|gần|khoảng|trên|xấp xỉ|~|≈)\s*$/i.test(t.slice(Math.max(0, m.index - 12), m.index))) continue;
    const k = `${i}|${m[0]}`; if (da.has(k)) continue; da.add(k);
    out.push({ i, text: `"${m[0].replace(/\s+/g, " ")}" là làm tròn xuống của ${String(goc).replace(".", ",")} ở slide khác — ghi đúng chữ số, hoặc thêm "hơn" / "khoảng" (người nghe nhớ một con số sai)` }); } });
  return out;
}

function validate(deck, { extraTypes = [] } = {}) {
  const hints = []; // gợi ý (ℹ) — in ra nhưng không tính vào --strict
  const errors = [], warnings = [];
  const E = (slide, type, path, msg) => errors.push(slide ? `Slide ${slide} (${type}): ${path} — ${msg}` : `${path} — ${msg}`);
  if (!isObj(deck)) return { errors: ["deck.json phải là một đối tượng { ... }"], warnings };
  if (!Array.isArray(deck.slides) || !deck.slides.length) return { errors: ['deck.json thiếu mảng "slides" (cần ít nhất 1 slide)'], warnings };
  if (deck.theme != null) warnings.push(`"theme": "${deck.theme}" là trường của tầng Office cũ (đã bỏ 11/2026) — màu theo da (meta.da, hinh/da.js); xoá trường này`);
  if (deck.meta && deck.meta.chromeIcon) { const m = checkIcon(String(deck.meta.chromeIcon)); if (m) E(0, "", "meta.chromeIcon", m); }
  if (deck.meta != null && !isObj(deck.meta)) E(0, "", "meta", "phải là đối tượng {...}");
  if (deck.meta && deck.meta.imagePolicy != null && !["open", "classroom"].includes(deck.meta.imagePolicy)) E(0, "", "meta.imagePolicy", 'chọn "classroom" (mặc định — cho phép ảnh web có ghi nguồn, chỉ chiếu trên lớp) hoặc "open" (chỉ ảnh giấy phép mở — khi đăng công khai, nộp cuộc thi)');
  if (deck.meta && deck.meta.motif != null) { const ms = Array.isArray(deck.meta.motif) ? deck.meta.motif : [deck.meta.motif];
    if (ms.length > 2 || !ms.length) E(0, "", "meta.motif", "một tên, hoặc mảng 2 tên (tên đầu cho bìa/chuyển phần/kết) — nhiều hơn thì rối mắt");
    for (const m of ms) if (!MOTIFS.includes(m)) E(0, "", "meta.motif", `"${m}" không hợp lệ (chọn theo chủ đề: ${MOTIFS.join(" | ")})`); }
  if (deck.meta && deck.meta.motion != null && typeof deck.meta.motion !== "boolean") E(0, "meta", "meta.motion", "chỉ nhận true | false (các ý tự lộ dần khi vào slide)");
  if (deck.meta && deck.meta.thread != null && typeof deck.meta.thread !== "boolean") E(0, "meta", "meta.thread", "chỉ nhận true | false (Morph nối mạch trong chương)");
  { const DA = require("../hinh/da"), ok = [...DA.NAMES, ...Object.keys(DA.ALIAS), "none", "auto"];
    if (deck.meta && deck.meta.da != null && ![...DA.NAMES, "none"].includes(deck.meta.da)) E(0, "meta", "meta.da", `"${deck.meta.da}" không có — chọn: ${DA.NAMES.join(" | ")} | none (chất liệu theo môn: hinh/da.js)`);
    if (deck.meta && deck.meta.kit != null && !ok.includes(deck.meta.kit)) E(0, "meta", "meta.kit", `"${deck.meta.kit}" không có (meta.kit là tên cũ của meta.da — chọn: ${DA.NAMES.join(" | ")})`); }
  if (deck.meta && deck.meta.frame != null && !["rect", "arch", "circle", "ogee", "none"].includes(deck.meta.frame)) E(0, "meta", "meta.frame", "chỉ nhận rect | arch | circle | ogee | none (khung ảnh: engine/shapes.js)");
  if (deck.meta && deck.meta.paper != null && typeof deck.meta.paper !== "boolean") E(0, "meta", "meta.paper", "chỉ nhận true | false (nền vân giấy)");
  if (deck.meta && deck.meta.style != null && !["dossier", "cadastral", "portico"].includes(deck.meta.style)) E(0, "meta", "meta.style", "chỉ nhận dossier | cadastral | portico");
  if (deck.meta && deck.meta.motifLabel && [].concat(deck.meta.motif)[0] !== "cadastral") warnings.push('meta.motifLabel chỉ dùng với motif "cadastral" (nhãn thửa đất trên bản đồ) — bị bỏ qua');
  if (deck.meta && deck.meta.motifLabel && String(deck.meta.motifLabel).length > 30) warnings.push(`meta.motifLabel dài ${String(deck.meta.motifLabel).length} ký tự (tối đa 30)`);
  if (deck.meta && deck.meta.native != null && typeof deck.meta.native !== "boolean") E(0, "", "meta.native", "true | false — true: biểu đồ (bar/column/line/donut) và bảng thành đối tượng PowerPoint gốc, sửa số bằng Edit Data");
  if (deck.meta && deck.meta.kind != null && !KINDS.includes(deck.meta.kind)) E(0, "", "meta.kind", `"${deck.meta.kind}" không hợp lệ (chọn: ${KINDS.join(" | ")} — bài giảng | bình luận bản án/vụ việc | báo cáo)`);
  if (deck.meta && deck.meta.art != null && !ART.includes(deck.meta.art)) E(0, "", "meta.art", `"${deck.meta.art}" không hợp lệ (chọn: ${ART.join(" | ")})`);
  const tls = deck.timelines || {};

  deck.slides.forEach((sl, i) => {
    const n = i + 1;
    if (!isObj(sl)) { E(n, "?", "slide", "phải là đối tượng { type: ..., ... }"); return; }
    const spec = SCHEMA[sl.type];
    if (["quizgo", "bhhoi"].includes(sl.type) && sl.whyNot != null) {   // quizgo (hinh/canh.js), bhhoi (hinh/so_bhxh.js): whyNot[k] → slide phản hồi riêng cho phương án sai k
      if (!Array.isArray(sl.whyNot)) warnings.push(`Slide ${n} (${sl.type}): "whyNot" phải là mảng song song với options (null ở phương án đúng)`);
      else (sl.options || []).forEach((o, k) => { const w = sl.whyNot[k];
        if (o && o.ok && w) warnings.push(`Slide ${n} (${sl.type}): whyNot[${k}] là phương án ĐÚNG — lời giải ghi ở right.text`);
        else if (typeof w === "string" && w.replace(/[\[\]]/g, "").length > 130) warnings.push(`Slide ${n} (${sl.type}): whyNot[${k}] ${w.replace(/[\[\]]/g, "").length}/130 ký tự — slide phản hồi chỉ đủ 3 dòng dưới phương án vừa chọn`); }); }
    // cảnh / bộ hình: không kiểm SCHEMA ở đây, nhưng VẪN lint nội dung (quá 110 tiếng, cụm đệm, tiêu đề là câu hỏi, ký tự trang trí) — trước 13/11/2026 bị bỏ qua cả phần này
    if (!spec && extraTypes.includes(sl.type)) { clarity(sl, n, warnings); return; }
    if (sl.type === "refs") { E(n, "refs", "type", 'kiểu "refs" (slide tài liệu + mã QR) đã bỏ khỏi skill — nguồn ghi trong bản Word đi kèm, không ghi trên slide'); return; }
    if (!spec) { E(n, sl.type == null ? "?" : sl.type, "type", sl.type == null ? `thiếu "type" (chọn: ${Object.keys(SCHEMA).join(", ")})` : `kiểu "${sl.type}" không tồn tại (chọn: ${[...Object.keys(SCHEMA), ...extraTypes].join(", ")})`); return; }
    if (sl.mode != null && !["d", "l", "a"].includes(sl.mode)) E(n, sl.type, "mode", `"${sl.mode}" không hợp lệ (d = nền tối, l = nền sáng, a = nền màu nhấn)`);
    walk(sl, spec, "", (p, m) => E(n, sl.type, p, m), true);
    if (sl.source != null) warnings.push(`Slide ${n} (${sl.type}): trường "source" đã bỏ — slide không ghi nguồn (nguồn nằm trong bản Word đi kèm); xoá trường này`);
    // cảnh phim (hinh/dung.js dungPhim): phông nền theo giờ + diễn viên tự vẽ có tên Morph + máy quay
    if (sl.phong != null) { const G = Object.keys(require("../hinh/ve_bh").GIO); if (typeof sl.phong !== "object" || (sl.phong.gio && !G.includes(sl.phong.gio))) errors.push(`Slide ${n} (${sl.type}): phong — {gio: ${G.join(" | ")}, pan: 0–1}`); }
    if (sl.dien != null) { const { coVe } = require("../hinh/ve_bh"); if (!Array.isArray(sl.dien)) errors.push(`Slide ${n} (${sl.type}): dien — phải là danh sách [{ve, x, y, w, m}]`);
      else sl.dien.forEach((d, j) => { if (!d || !coVe(d.ve)) errors.push(`Slide ${n} (${sl.type}): dien[${j}].ve "${d && d.ve}" không có trong hinh/ve_bh.js`); }); }
    if (sl.cam != null && !/^(pan:-?[\d.]+,-?[\d.]+|zoom:[\d.]+(,[\d.]+,[\d.]+)?)$/.test(String(sl.cam))) errors.push(`Slide ${n} (${sl.type}): cam — "pan:dx,dy" hoặc "zoom:k,x,y" (hinh/may_quay.js)`);
    for (const k of Object.keys(sl)) if (k !== "source" && !(k in spec) && !COMMON.includes(k)) warnings.push(`Slide ${n} (${sl.type}): trường lạ "${k}" (engine bỏ qua — gõ sai tên?)`);
    if (sl.type === "scene" && sl.timeline) {
      const tl = sl.timeline;
      if (tl.ref) { const pts = tls[tl.ref]; if (!Array.isArray(pts)) E(n, sl.type, "timeline.ref", `"${tl.ref}" không có trong "timelines" của deck`); else if (pts.length < 2) E(n, sl.type, "timeline.ref", `dòng thời gian "${tl.ref}" cần ít nhất 2 điểm`); else if (!pts.every(q => Array.isArray(q) && q.length >= 2)) E(n, sl.type, "timeline.ref", `điểm của "${tl.ref}" phải có dạng ["mốc", "nhãn"]`); }
      const P = tl.ref ? tls[tl.ref] : tl.points;
      if (Array.isArray(P)) P.forEach((q, j) => { if (Array.isArray(q) && String(q[1] || "").length > 16) warnings.push(`Slide ${n} (scene): mốc ${j} "${q[1]}" dài ${String(q[1]).length} ký tự (tối đa 16 — nhãn mốc chỉ 1 dòng dưới trục)`); });
      if (tl.ref) {} else if (!Array.isArray(tl.points) || tl.points.length < 2) E(n, sl.type, "timeline", 'cần "ref" trỏ tới "timelines", hoặc "points" với ít nhất 2 điểm');
    }
    if (sl.type === "flow" && Array.isArray(sl.nodes) && Array.isArray(sl.edges)) {
      const ids = new Set(sl.nodes.map(x => x && x.id));
      sl.edges.forEach((e, j) => { for (const k of ["from", "to"]) if (e && e[k] != null && !ids.has(e[k])) E(n, sl.type, `edges[${j}].${k}`, `"${e[k]}" không khớp id nào trong nodes (có: ${[...ids].join(", ")})`); });
    }
    if (sl.type === "map") {
      const VN = require("./assets/vn_provinces.json"), fold = (x) => String(x).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/^(tinh|thanh pho|tp\.?)\s+/, "").trim();
      const a34 = sl.admin !== 63, names = Object.keys(a34 ? VN.provinces34 : VN.provinces), lay = a34 ? "34 tỉnh, thành từ 01/7/2025 — NQ 202/2025/QH15" : "63 tỉnh trước sắp xếp 2025";
      const chk = (nm, path) => { if (nm && !names.some(x => fold(x) === fold(nm))) E(n, sl.type, path, `"${nm}" không phải tên tỉnh/thành (${lay}), vd: ${names.slice(0, 4).join(", ")}...${a34 ? ' — vụ việc trước 07/2025 thì đặt "admin": 63' : ""}`); };
      (Array.isArray(sl.places) ? sl.places : []).forEach((p, j) => p && chk(p.name, `places[${j}].name`));
      (Array.isArray(sl.groups) ? sl.groups : []).forEach((g, j) => { if (!g) return;
        (Array.isArray(g.provinces) ? g.provinces : []).forEach((nm, k) => chk(nm, `groups[${j}].provinces[${k}]`));
        if (g.preset && !a34) E(n, sl.type, `groups[${j}].preset`, 'preset "merged"/"kept" chỉ dùng với bản đồ 34 tỉnh (bỏ "admin": 63)');
        if (!g.preset && !(Array.isArray(g.provinces) && g.provinces.length)) E(n, sl.type, `groups[${j}]`, 'cần "preset" hoặc danh sách "provinces"'); });
      if (!(sl.places || []).length && !(sl.groups || []).length) E(n, sl.type, "places", 'cần "places" (ghim địa điểm) hoặc "groups" (tô màu nhóm tỉnh)');
      if ((sl.places || []).length && (sl.groups || []).length) warnings.push(`Slide ${n} (map): dùng cả places và groups — chỉ vẽ groups (một bản đồ một câu chuyện)`);
    }
    if (sl.type === "calendar") { const dd = Math.min(31, Math.max(28, +sl.days || 30)); if (sl.startDay != null && !(Number.isInteger(sl.startDay) && sl.startDay >= 1 && sl.startDay <= 7)) E(n, sl.type, "startDay", "thứ của ngày 1: 1 = thứ Hai … 7 = Chủ nhật");
      (sl.marks || []).forEach((m, j) => { if (m && (+m.from < 1 || +m.to > dd || +m.to < +m.from)) E(n, sl.type, `marks[${j}]`, `from ≤ to, trong 1–${dd}`); }); }
    if (sl.type === "riskbar") { const ns = (sl.stages || []).length; (sl.rows || []).forEach((r, j) => { if (r && (r.at < 0 || r.at > ns)) E(n, sl.type, `rows[${j}].at`, `vạch chuyển 0–${ns} (đếm theo ranh giới chặng)`); if (r && r.pay != null && (r.pay < r.at || r.pay > ns)) E(n, sl.type, `rows[${j}].pay`, `at ≤ pay ≤ ${ns}`); }); }
    if (sl.type === "receipt" && !isObj(sl.total)) E(n, sl.type, "total", "thiếu (bắt buộc) — hoá đơn phải có dòng tổng { label, display }");
    if (sl.type === "account" && Array.isArray(sl.rows)) sl.rows.forEach((r, j) => { if (r && typeof r.display === "string" && typeof r.amount === "number" && r.amount !== 0 && /^\s*[−-]/.test(r.display) !== r.amount < 0) E(n, sl.type, `rows[${j}].display`, `dấu của display ("${r.display}") khác dấu của amount (${r.amount}) — cột nợ / có xếp theo amount`); });
    if (sl.type === "captable" && Array.isArray(sl.holders)) { const sm = sl.holders.reduce((a, h) => a + (+(h && h.pct) || 0), 0); if (sm > 100.05) E(n, sl.type, "holders", `tổng tỉ lệ ${sm}% > 100%`);
      sl.holders.forEach((h, j) => { if (h && typeof h.pct === "number" && (h.pct < 0 || h.pct > 100)) E(n, sl.type, `holders[${j}].pct`, "tỉ lệ phải trong khoảng 0–100"); });
      (sl.thresholds || []).forEach((t, j) => { if (t && (t.pct <= 0 || t.pct >= 100)) E(n, sl.type, `thresholds[${j}].pct`, "ngưỡng phải trong khoảng 0–100"); }); }
    if (sl.type === "account" && Array.isArray(sl.rows) && sl.rows.filter(r => r && r.focus).length > 1) warnings.push(`Slide ${n} (account): nhiều dòng focus — chỉ MỘT giao dịch cần người xem nhìn vào`);
    if (sl.type === "record" && Array.isArray(sl.signs) && sl.signs.filter(g => g && g.state === "refused").length > 1) warnings.push(`Slide ${n} (record): nhiều ô "TỪ CHỐI KÝ" — chỉ một con dấu nhấn mỗi slide`);
    if (sl.type === "plan") (sl.zones || []).forEach((z, j) => { if (z && (z.x < 0 || z.y < 0 || z.x + z.w > 1.001 || z.y + z.h > 1.001)) E(n, sl.type, `zones[${j}]`, "x, y, w, h là tỉ lệ 0–1 trong khung, x + w ≤ 1, y + h ≤ 1"); });
    if (sl.type === "lens" && isObj(sl.focus)) { for (const k of ["x", "y"]) if (typeof sl.focus[k] === "number" && (sl.focus[k] < 0.05 || sl.focus[k] > 0.95)) E(n, sl.type, `focus.${k}`, "cần 0.05–0.95 (tỉ lệ trên ảnh, 0 = mép trái/trên)");
      if (sl.focus.r != null && (typeof sl.focus.r !== "number" || sl.focus.r < 0.05 || sl.focus.r > 0.3)) E(n, sl.type, "focus.r", "cần 0.05–0.3 (bán kính vùng phóng, tỉ lệ bề ngang ảnh)"); }
    if (sl.type === "headline" && Array.isArray(sl.lines) && sl.lines.filter(t => /\[.+\]/.test(String(t))).length > 1) warnings.push(`Slide ${n} (headline): nhiều dòng có [ ] — chỉ MỘT dòng mang dải màu nhấn`);
    if (sl.type === "photo" && Array.isArray(sl.callouts)) { const rt = sl.side === "right", [lo, hi] = rt ? [0.03, 0.5] : [0.5, 0.97];
      sl.callouts.forEach((co, j) => { if (co && (co.x < lo || co.x > hi || co.y < 0.12 || co.y > 0.92)) warnings.push(`Slide ${n} (photo): callouts[${j}] (x ${co.x}, y ${co.y}) — đặt trong vùng ảnh không có chữ (x ${lo}–${hi}, y 0.12–0.92); chữ nằm bên ${rt ? "phải" : "trái"}`); }); }
    { // bố cục bổ sung: số mục tối thiểu để hình có nghĩa + focus đúng chỉ số
      const MIN = { sheet: ["rows", 3, "tờ rời cần ≥ 3 dòng — ít hơn dùng compare / bignum"], receipt: ["items", 2, "hoá đơn cần ≥ 2 dòng hàng — một khoản dùng bignum"], account: ["rows", 3, "sao kê cần ≥ 3 giao dịch — ít hơn dùng compare"], captable: ["holders", 2, "cơ cấu cần ≥ 2 chủ sở hữu — một chủ dùng bignum"], record: ["fields", 2, "biên bản cần ≥ 2 trường"], riskbar: ["rows", 2, "≥ 2 phương án để so điểm chuyển — một phương án dùng steps"], collage: ["photos", 2, "cắt dán cần 2–3 ảnh — 1 ảnh dùng split / lens"], mosaic: ["photos", 4, "mosaic cần 4–5 ảnh — 2–3 ảnh dùng gallery"], photostrip: ["items", 3, "dải ảnh cần ≥ 3 mốc — 2 mốc dùng beforeafter"], photostats: ["stats", 2, "≥ 2 con số — 1 con số dùng bignum hoặc split"], pyramid: ["levels", 3, "tháp < 3 tầng không có thứ bậc để thấy — dùng compare/duel"], steps: ["steps", 3, "quy trình < 3 bước — dùng flow hoặc compare"], hub: ["items", 4, "hub cần 4–6 yếu tố — 2–3 yếu tố dùng cards hoặc venn"], matrix: ["cells", 4, "ma trận 2×2 cần đủ 4 ô (ô trống thì ghi rõ \"không có trường hợp\")"], tree: ["branches", 2, "cây điều kiện cần ≥ 2 nhánh"], match: ["pairs", 2, "đối ứng cần ≥ 2 cặp — 1 cặp dùng compare"] }[sl.type];
      if (MIN && Array.isArray(sl[MIN[0]]) && sl[MIN[0]].length < MIN[1]) E(n, sl.type, MIN[0], `cần ít nhất ${MIN[1]} mục — ${MIN[2]}`);
      if (MIN && sl.focus != null && Array.isArray(sl[MIN[0]]) && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(sl[MIN[0]].length, CAPS[sl.type][MIN[0]]))) E(n, sl.type, "focus", `phải là chỉ số 0…${sl[MIN[0]].length - 1} (đếm từ 0)`);
      if (sl.type === "frame") (Array.isArray(sl.points) ? sl.points : []).forEach((q, j) => { for (const k of ["x", "y"]) if (q && (typeof q[k] !== "number" || q[k] < 0.04 || q[k] > 0.96)) E(n, sl.type, `points[${j}].${k}`, "cần số 0.04–0.96 (tỉ lệ theo khung ảnh, 0 = mép trái/trên)"); });
      if (sl.type === "venn" && !((sl.both || {}).items || []).length) E(n, sl.type, "both.items", "venn cần ít nhất 1 điểm chung — không có điểm chung thì dùng compare/duel");
    }
    if (sl.type === "checklist") { const ni = Array.isArray(sl.items) ? sl.items.length : 0;
      if (ni && ni < 2) E(n, sl.type, "items", "cần ≥ 2 điều kiện — một điều kiện dùng bignum");
      if (!sl.verdict) warnings.push(`Slide ${n} (checklist): thiếu "verdict" — kiểm điều kiện xong phải ra một kết luận (đủ/không đủ → hệ quả)`);
      if (sl.verdict && sl.verdict.ok === "yes" && (sl.items || []).some(q => q && q.ok === "no")) warnings.push(`Slide ${n} (checklist): có điều kiện "no" nhưng verdict "yes" — kết luận mâu thuẫn với các điều kiện`); }
    if (sl.type === "bento") { const nc = Array.isArray(sl.cells) ? sl.cells.length : 0;
      (sl.cells || []).forEach((q, j) => { const cap = j === 0 ? 4 : 3; if (q && Array.isArray(q.items) && q.items.length > cap) warnings.push(`Slide ${n} (bento): cells[${j}].items có ${q.items.length} ý nhưng chỉ vẽ ${cap} — ${q.items.length - cap} ý cuối bị cắt`); });
      if (nc && nc < 3) E(n, sl.type, "cells", "cần 3–5 thẻ — ít hơn dùng compare/stats");
      (sl.cells || []).forEach((q, j) => { if (q && !q.head && !q.value) E(n, sl.type, `cells[${j}]`, 'cần "head" hoặc "value"'); }); }
    if (sl.type === "chart" && sl.kind === "gantt") (sl.items || []).forEach((it, j) => { if (it && (typeof it.from !== "number" || typeof it.to !== "number" || it.to < it.from)) E(n, sl.type, `items[${j}]`, 'gantt cần "from", "to" là SỐ (ngày thứ…), to ≥ from — có ngày dd/mm/yyyy thì dùng kind "span"'); });
    if (sl.type === "chart" && sl.kind === "progress") (sl.items || []).forEach((it, j) => { if (it && (typeof it.value !== "number" || it.value < 0 || it.value > 100)) E(n, sl.type, `items[${j}].value`, "progress cần tỉ lệ 0–100"); });
    if (sl.type === "chart" && sl.kind === "waterfall" && Array.isArray(sl.items) && !sl.items.some(it => it && it.total)) warnings.push(`Slide ${n} (chart waterfall): không có cột "total": true — thác nước phải kết ở một con số tổng (số cuối cùng người nghe cần nhớ)`);
    if (sl.type === "formula") { const nt = Array.isArray(sl.terms) ? sl.terms.length : 0;
      if (nt && nt < 2) E(n, sl.type, "terms", "cần ≥ 2 biến — một biến thì không phải công thức (dùng bignum)");
      if (!sl.result) E(n, sl.type, "result", 'thiếu vế trái, vd {"sym": "TC", "label": "Trợ cấp ốm đau"}');
      if (sl.focus != null && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(nt, 5))) E(n, sl.type, "focus", `phải là chỉ số 0…${Math.min(nt, 5) - 1} (đếm trong terms)`); }
    if (sl.type === "calc") { if (!sl.answer) E(n, sl.type, "answer", 'thiếu đáp số, vd {"value": "1.125.000", "unit": "đồng"}');
      if (Array.isArray(sl.steps) && sl.steps.length && sl.steps.every(q => q && !q.value)) warnings.push(`Slide ${n} (calc): không bước nào có "value" — bài giải phải cho thấy số trung gian để người học đối chiếu`); }
    if (sl.type === "isotype" && sl.unit && +sl.unit.value > 0 && Array.isArray(sl.rows)) sl.rows.forEach((r, j) => { if (!r) return; const k = (+r.value || 0) / sl.unit.value;
      if (k > 120) warnings.push(`Slide ${n} (isotype): rows[${j}] = ${Math.round(k)} hình (tối đa 120) — tăng unit.value để mỗi hình đại diện nhiều hơn`);
      else if (k < 2) warnings.push(`Slide ${n} (isotype): rows[${j}] chỉ ${Math.round(k)} hình — không có gì để đếm; giảm unit.value hoặc dùng bignum`);
      if (Math.abs(k - Math.round(k)) > 0.01) warnings.push(`Slide ${n} (isotype): rows[${j}].value ${r.value} không chia hết cho unit.value ${sl.unit.value} — hình đếm sẽ làm tròn, lệch số thật; chọn đơn vị chia hết`);
      if (+r.lost > +r.value) warnings.push(`Slide ${n} (isotype): rows[${j}].lost lớn hơn value — phần mất nằm TRONG tổng, không cộng thêm`); });
    if (sl.type === "chart" && sl.annotate) { const k = sl.kind || "bar", it = sl.annotate.item;
      if (!sl.annotate.text) E(n, sl.type, "annotate.text", "thiếu câu chú thích (≤ 40 ký tự)");
      if (!["bar", "column", "span"].includes(k)) warnings.push(`Slide ${n} (chart ${k}): "annotate" chỉ vẽ cho kind bar / column / span — bỏ hoặc đổi kind`);
      else if (!Number.isInteger(it) || it < 0 || it >= (sl.items || []).length) warnings.push(`Slide ${n} (chart): annotate.item = ${it} không trỏ tới mục nào (đếm từ 0, có ${(sl.items || []).length} mục)`); }
    if (sl.transition != null && !["fade", "push", "morph", "none"].includes(sl.transition)) E(n, sl.type, "transition", "chỉ nhận fade | push | morph | none");
    if (sl.type === "iso" && Array.isArray(sl.objects)) { const lab = sl.objects.filter(o => o && o.label).length;
      if (sl.objects.some(o => o && !o.kind)) E(n, sl.type, "objects[].kind", "mỗi vật cần kind: parcel | house | building | bank | court | tree | person");
      if (lab > 5) warnings.push(`Slide ${n} (iso): ${lab} nhãn — cột nhãn chỉ đủ chỗ 5; vật phụ (cây, thửa bên cạnh) bỏ label`);
      if (!lab) warnings.push(`Slide ${n} (iso): không vật nào có label — hình isometric không nói được ai ở đâu; ghi label cho 2–4 vật chính`); }
    if (sl.type === "hero" && sl.num != null && !/\d/.test(String(sl.num))) warnings.push(`Slide ${n} (hero): num "${sl.num}" không có chữ số — hero dành cho MỘT con số bước ngoặt; câu chữ thì dùng statement / quote`);
    if (sl.build != null && typeof sl.build !== "boolean") E(n, sl.type, "build", "phải là true/false");
    if (sl.motion != null && typeof sl.motion !== "boolean") E(n, sl.type, "motion", "phải là true/false");
    if (sl.build === true && !["steps", "cards", "checklist", "timeline"].includes(sl.type)) warnings.push(`Slide ${n} (${sl.type}): "build" chỉ có tác dụng ở steps, cards, checklist, timeline — bỏ đi`);
    if (sl.type === "redline") {
      if (!(sl.old || {}).text || !(sl.new || {}).text) E(n, sl.type, "old.text / new.text", "cần NGUYÊN VĂN cả hai bản để so");
      if (!(sl.old || {}).label || !(sl.new || {}).label) warnings.push(`Slide ${n} (redline): thiếu old.label / new.label (vd. "BLDS 2005 · k2 Đ138") — người xem không biết bản nào cũ, bản nào mới`);
      else if ((sl.old || {}).text && (sl.new || {}).text && sl.old.text.trim() === sl.new.text.trim()) warnings.push(`Slide ${n} (redline): hai bản giống hệt nhau — không có gì để so`); }
    if (sl.type === "deadline") { const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, P = (t) => { const m = String(t || "").match(re); return m ? Date.UTC(+m[3], +m[2] - 1, +m[1]) : null; };
      const a = P(sl.from), b = P(sl.to);
      if (sl.from && a == null) E(n, sl.type, "from", "phải là ngày dd/mm/yyyy");
      if (sl.to && b == null) E(n, sl.type, "to", "phải là ngày dd/mm/yyyy — engine KHÔNG tự tính ngày hết hạn, ghi rõ ngày theo căn cứ pháp lý");
      if (a != null && b != null && b < a) E(n, sl.type, "to", "ngày hết hạn trước ngày bắt đầu");
      if (a != null && b != null && b - a > 6 * 366 * 864e5) warnings.push(`Slide ${n} (deadline): thời hạn > 6 năm — lịch chỉ vẽ 6 hàng năm; dùng chart span`);
      if (a != null && b != null && b - a < 45 * 864e5) warnings.push(`Slide ${n} (deadline): thời hạn < 45 ngày — dùng bignum + days (lịch từng ngày) cho rõ hơn`); }
    if (sl.type === "exercise" && !sl.ask) warnings.push(`Slide ${n} (exercise): thiếu "ask" (yêu cầu của đề) — người học cần biết phải tính/trả lời gì`);
    if (sl.type === "funnel") { const ns = Array.isArray(sl.sources) ? sl.sources.length : 0;
      if (ns && ns < 2) E(n, sl.type, "sources", "cần ≥ 2 nguồn — một nguồn đổ vào một nơi thì dùng flow");
      if (!sl.pool) E(n, sl.type, "pool", 'thiếu nút giữa, vd {"label": "Quỹ BHXH"}'); }
    if (sl.type === "changelog") { const nr = Array.isArray(sl.rows) ? sl.rows.length : 0;
      if (nr && nr < 2) E(n, sl.type, "rows", "cần ≥ 2 quy định — một thay đổi dùng compare");
      if (sl.focus != null && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(nr, 6))) E(n, sl.type, "focus", `phải là chỉ số 0…${Math.min(nr, 6) - 1}`); }
    if (sl.type === "journey") { const ns = Array.isArray(sl.stages) ? sl.stages.length : 0;
      if (ns && ns < 3) E(n, sl.type, "stages", "cần 3–6 chặng — ít hơn dùng compare/steps");
      if (sl.focus != null && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(ns, 6))) E(n, sl.type, "focus", `phải là chỉ số 0…${Math.min(ns, 6) - 1}`); }
    if (sl.type === "cheatsheet") { const nc = Array.isArray(sl.cols) ? sl.cols.length : 0, nr = Array.isArray(sl.rows) ? sl.rows.length : 0;
      if (nc && nc < 3) E(n, sl.type, "cols", "cần 3–5 cột — 2 đối tượng dùng compare/duel");
      if (nr && nr < 2) E(n, sl.type, "rows", "cần 2–3 hàng (câu hỏi cố định: ai / khi nào / bao nhiêu)");
      (sl.cols || []).forEach((cl, j) => { if (cl && Array.isArray(cl.cells) && cl.cells.length !== Math.min(nr, 3)) E(n, sl.type, `cols[${j}].cells`, `cần đúng ${Math.min(nr, 3)} ô (bằng số hàng)`); });
      if (sl.focus != null && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(nc, 5))) E(n, sl.type, "focus", `phải là chỉ số cột 0…${Math.min(nc, 5) - 1}`); }
    if (sl.type === "quiz" && sl.whyNot != null) {
      if (sl.reveal !== true) warnings.push(`Slide ${n} (quiz): "whyNot" chỉ hiện ở slide đáp án (reveal: true) — slide hỏi không được lộ đáp án`);
      else if (Array.isArray(sl.whyNot) && Number.isInteger(sl.answer) && sl.whyNot[sl.answer]) warnings.push(`Slide ${n} (quiz): whyNot[${sl.answer}] là phương án ĐÚNG — lý do đúng ghi ở "why"`); }
    if (sl.type === "chart" && sl.base != null && !["step", "line"].includes(sl.kind)) warnings.push(`Slide ${n} (chart): "base" chỉ dùng cho kind "step", "line" — cột/thanh phải bắt đầu từ 0`);
    if (sl.type === "chart" && sl.kind === "step" && Array.isArray(sl.items) && sl.items.length < 3) E(n, sl.type, "items", "step cần ≥ 3 mốc");
    if (sl.type === "quiz") {
      const no = Array.isArray(sl.options) ? sl.options.length : 0;
      if (no < 2) E(n, sl.type, "options", "cần 2–4 phương án (A–D) — người học phải thấy đủ phương án trên slide");
      if (sl.answer != null && !(Number.isInteger(sl.answer) && sl.answer >= 0 && sl.answer < Math.min(no, 4))) E(n, sl.type, "answer", `phải là chỉ số 0…${Math.min(no, 4) - 1} (0 = A)`);
      if (sl.reveal === true && !Number.isInteger(sl.answer)) E(n, sl.type, "answer", 'slide đáp án (reveal: true) cần "answer"');
      if (sl.reveal === true && !sl.why) warnings.push(`Slide ${n} (quiz): slide đáp án thiếu "why" — một câu vì sao đúng, kèm căn cứ (slide/khái niệm đã học)`);
      if (sl.reveal !== true && sl.why) warnings.push(`Slide ${n} (quiz): "why" chỉ hiện ở slide đáp án (reveal: true) — slide hỏi không được lộ đáp án`);
      // PHƯƠNG ÁN LỘ ĐÁP ÁN: (1) phương án đúng chứa sẵn cụm từ của lý do ("why") mà câu hỏi và các phương án khác không có
      // — vd. "Được — giả tạo không hạn chế thời hiệu" khi why = "… là giả tạo …": người học chọn theo chữ, không theo kiến thức;
      // (2) phương án đúng dài hơn hẳn các phương án khác (mẹo "chọn câu dài nhất")
      if (sl.reveal === true && Number.isInteger(sl.answer) && Array.isArray(sl.options) && sl.options[sl.answer] != null && no >= 3) {
        const tok = (x) => String(x || "").toLowerCase().replace(/[\[\]]/g, "").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
        const bi = (x) => { const w = tok(x), o = new Set(); for (let j = 0; j + 1 < w.length; j++) o.add(w[j] + " " + w[j + 1]); return o; };
        const right = bi(String(sl.options[sl.answer]).split("—").slice(1).join(" ")), /* chỉ phần LÝ DO sau "—": phương án chỉ nêu kết luận thì không lộ gì */ others = new Set(sl.options.filter((_, j) => j !== sl.answer).flatMap(x => [...bi(x)])), qb = bi(sl.title);
        // chỉ so với VẾ ĐẦU của why (trước ; : ( —) = căn cứ / phân loại ("… là giả tạo"); vế sau là kết luận, trùng với phương án đúng là bình thường
        const ground = String(sl.why || "").split(/[;:(—]/)[0];
        const leak = [...bi(ground)].filter(b => right.has(b) && !others.has(b) && !qb.has(b));
        if (leak.length) warnings.push(`Slide ${n} (quiz): phương án đúng chứa sẵn "${leak[0]}" — cụm từ của lời giải mà các phương án khác không có; người học đoán được theo chữ → viết lại phương án cho trung tính (hoặc đưa cụm đó vào cả phương án sai)`);
        const L = sl.options.map(x => tok(x).length), mo = L.filter((_, j) => j !== sl.answer), avg = mo.reduce((a, b) => a + b, 0) / Math.max(1, mo.length);
        if (L[sl.answer] >= Math.max(avg * 1.5, avg + 4)) warnings.push(`Slide ${n} (quiz): phương án đúng dài ${L[sl.answer]} tiếng, các phương án khác trung bình ${avg.toFixed(0)} — mẹo "chọn câu dài nhất" lộ đáp án; cân độ dài`);
      }
    }
    if (sl.type === "timeline") {
      const ni = Array.isArray(sl.items) ? sl.items.length : 0;
      if (ni && ni < 3) E(n, sl.type, "items", "cần ≥ 3 mốc — 2 mốc dùng compare/beforeafter");
      if (sl.focus != null && !(Number.isInteger(sl.focus) && sl.focus >= 0 && sl.focus < Math.min(ni, 6))) E(n, sl.type, "focus", `phải là chỉ số 0…${Math.min(ni, 6) - 1}`);
      (sl.items || []).forEach((x, j) => { if (x && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(String(x.when || ""))) hints.push(`Slide ${n} (timeline): items[${j}].when là ngày chính xác — nếu mọi mốc đều có ngày, scene + timelines (hoặc chart span) vẽ đúng tỉ lệ thời gian`); });
    }
    if (sl.type === "share" && (typeof sl.pct !== "number" || sl.pct <= 0 || sl.pct >= 100)) E(n, sl.type, "pct", "cần số trong khoảng (0, 100), vd 75");
    if (sl.type === "chart") {
      if (!sl.kind) E(n, sl.type, "kind", 'thiếu (chọn: bar | donut | span | slope | column | step | line | waterfall | gantt | progress)');
      if (sl.kind === "slope" && !(Array.isArray(sl.ends) && sl.ends.length === 2)) E(n, sl.type, "ends", 'slope cần 2 nhãn mốc, vd ["Luật 2024", "NQ 254"]');
      const DT = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      (Array.isArray(sl.items) ? sl.items : []).forEach((it, j) => { if (!it) return;
        if (sl.kind === "span") { for (const k of ["from", "to"]) if (!DT.test(String(it[k] || ""))) E(n, sl.type, `items[${j}].${k}`, 'span cần ngày dạng "dd/mm/yyyy"'); }
        else if (sl.kind !== "gantt" && !(sl.kind === "waterfall" && it.total) && typeof it.value !== "number") E(n, sl.type, `items[${j}].value`, `${sl.kind} cần value là số`);
        if (sl.kind === "slope" && typeof it.after !== "number") E(n, sl.type, `items[${j}].after`, "slope cần after là số (giá trị ở mốc sau)"); });
      (Array.isArray(sl.markers) ? sl.markers : []).forEach((m, j) => { if (m && !DT.test(String(m.date || ""))) E(n, sl.type, `markers[${j}].date`, 'cần ngày dạng "dd/mm/yyyy"'); });
      if (!sl.insight) warnings.push(`Slide ${n} (chart): thiếu "insight" — biểu đồ cần một câu kết luận lớn bên cạnh (người nghe đọc kết luận trước, biểu đồ là bằng chứng)`);
    }
    if (sl.type === "bignum" && sl.days != null) {
      const DT = /^\d{1,2}\/\d{1,2}\/\d{4}$/, dd = sl.days;
      if (!Array.isArray(dd) || dd.length !== 2 || !dd.every(x => DT.test(String(x)))) E(n, sl.type, "days", 'phải là ["dd/mm/yyyy", "dd/mm/yyyy"]');
      else { const p = (x) => { const [a, b, c] = x.split("/").map(Number); return Date.UTC(c, b - 1, a); }, len = (p(dd[1]) - p(dd[0])) / 864e5 + 1;
        if (len < 2 || len > 31) warnings.push(`Slide ${n} (bignum): days dài ${len} ngày — lịch chỉ vẽ 2–31 ngày, bỏ qua`); }
    }
    if (sl.type === "ledger" && Array.isArray(sl.rows)) sl.rows.forEach((r, j) => { if (r && Array.isArray(r.steps) && r.steps.length > 3) warnings.push(`Slide ${n} (ledger): rows[${j}].steps có ${r.steps.length} mục nhưng chỉ hiển thị 3`); });
    // mảng bị cắt im lặng
    for (const [path, cap0] of Object.entries(CAPS[sl.type] || {})) {
      const a = get(sl, path), cap = sl.type === "chart" && path === "items" ? ({ step: 20, waterfall: 8, line: 12 }[sl.kind] || cap0) : cap0;
      if (Array.isArray(a) && a.length > cap) warnings.push(`Slide ${n} (${sl.type}): ${path} có ${a.length} mục nhưng chỉ hiển thị ${cap} — ${a.length - cap} mục cuối bị cắt bỏ`);
    }
    // ngoặc nhấn mạnh
    const brackets = (v, p) => {
      if (typeof v === "string") { if (RICH_FIELDS.test(p) && ((v.match(/\[/g) || []).length !== (v.match(/\]/g) || []).length)) warnings.push(`Slide ${n} (${sl.type}): ${p} có ngoặc [ ] không cân ("${v.slice(0, 40)}") — sẽ in nguyên ký tự [ ]`); }
      else if (Array.isArray(v)) v.forEach((x, j) => brackets(x, `${p}[${j}]`));
      else if (isObj(v)) for (const [k, x] of Object.entries(v)) if (k !== "notes") brackets(x, p ? `${p}.${k}` : k);
    };
    brackets(sl, "");
    clarity(sl, n, warnings);
  });

  // BẢNG & BIỂU ĐỒ — mỗi cái phải có việc riêng (không dùng vô tội vạ):
  //  bảng  = người đọc cần TRA CỨU giá trị chính xác theo nhiều thuộc tính (≥ 3 hàng × ≥ 2 cột) và phải chỉ chỗ cần nhìn (focus / note);
  //  biểu đồ = người đọc cần THẤY HÌNH DẠNG (to–nhỏ, trước–sau, dài–ngắn) và phải có câu kết luận (insight).
  //  Cùng một dữ liệu không trình bày hai lần (bảng rồi biểu đồ liền nhau) — chọn một; số liệu gốc chi tiết để ở notes.
  const cellsOf = (sl) => sl.type === "table" ? (Array.isArray(sl.rows) ? sl.rows.flat().map(String) : [])
    : [...(Array.isArray(sl.items) ? sl.items.flatMap(it => it ? [it.label, it.from, it.to, it.value, it.after, it.display] : []) : []), ...(Array.isArray(sl.markers) ? sl.markers.map(m => m && m.date) : [])].filter(v => v != null && v !== "").map(String);
  const normC = (v) => String(v).replace(/[\[\]]/g, "").trim().toLowerCase();
  deck.slides.forEach((sl, i) => {
    if (!sl || !["chart", "table"].includes(sl.type)) return;
    const n = i + 1;
    if (sl.type === "table") {
      const nr = Array.isArray(sl.rows) ? sl.rows.length : 0, nc = Array.isArray(sl.cols) ? sl.cols.length : 0;
      if (nr < 3 || nc < 2) warnings.push(`Slide ${n} (table): bảng chỉ ${nr} hàng × ${nc} cột — ít dữ liệu thì bảng không giúp tra cứu gì; dùng bignum (1 con số), compare (2 phía) hoặc cards`);
      if (sl.focus == null && !sl.note) warnings.push(`Slide ${n} (table): bảng không chỉ người đọc nhìn vào đâu — đặt "focus" (hàng then chốt) hoặc "note" (kết luận rút từ bảng)`);
    }
    if (sl.type === "chart") {
      const k = Array.isArray(sl.items) ? sl.items.length : 0;
      if (["bar", "donut"].includes(sl.kind) && k < 2) warnings.push(`Slide ${n} (chart ${sl.kind}): chỉ ${k} giá trị — không có gì để so; dùng bignum`);
      if (!["column", "step", "line", "waterfall"].includes(sl.kind) && k > 6) warnings.push(`Slide ${n} (chart ${sl.kind}): ${k} mục — ${sl.kind} chỉ vẽ 6; chuỗi theo năm dùng kind "column" (tối đa 12)`);
      const yrs = (Array.isArray(sl.items) ? sl.items : []).filter(it => it && /^(19|20)\d\d$/.test(String(it.label).trim())).length;
      if (sl.kind === "bar" && yrs >= 3) warnings.push(`Slide ${n} (chart bar): nhãn là các năm — chuỗi thời gian phải đọc từ trái sang phải: dùng kind "column" (đủ các năm, tối đa 12) hoặc "step" (giá trị giữ nguyên giữa các mốc, tối đa 20), không chọn lọc vài năm`);
      if ((sl.kind === "column" || sl.kind === "step") && (Array.isArray(sl.items) ? sl.items : []).some(it => it && it.value2 != null) && !(Array.isArray(sl.series) && sl.series.length === 2)) warnings.push(`Slide ${n} (chart column): có value2 nhưng thiếu "series": ["tên chuỗi 1", "tên chuỗi 2"] — người xem không biết màu nào là gì`);
      if (sl.kind === "donut" && k > 4) warnings.push(`Slide ${n} (chart donut): ${k} phần — mắt người không so được góc của > 4 lát; dùng bar`);
    }
    // trùng dữ liệu với slide bảng/biểu đồ liền kề
    const nb = deck.slides[i + 1];
    if (nb && ["chart", "table"].includes(nb.type) && nb.type !== sl.type) {
      const A = new Set(cellsOf(sl).map(normC)), B = cellsOf(nb).map(normC), same = B.filter(x => A.has(x)).length;
      if (B.length && same / B.length >= 0.4) warnings.push(`Slide ${n}–${n + 1} (${sl.type} rồi ${nb.type}): trình bày cùng một dữ liệu hai lần (${same}/${B.length} giá trị trùng) — giữ MỘT: bảng nếu người nghe cần tra số chính xác, biểu đồ nếu cần thấy hình dạng; số liệu gốc đưa vào notes`);
    }
  });
  // mốc ngày lặp lại trên nhiều hình (bảng, biểu đồ, dòng thời gian, lịch): gợi ý, không chặn --strict
  const seenD = {}, add = (dt, n) => { const k = String(dt).trim(); if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(k)) return; (seenD[k] = seenD[k] || new Set()).add(n); };
  deck.slides.forEach((sl, i) => { if (!isObj(sl)) return; const n = i + 1;
    if (sl.type === "table" && Array.isArray(sl.rows)) sl.rows.flat().forEach(v => add(v, n));
    if (sl.type === "chart") { (sl.items || []).forEach(it => it && [it.from, it.to].forEach(v => add(v, n))); (sl.markers || []).forEach(m => m && add(m.date, n)); }
    if (sl.type === "fork" && Array.isArray(sl.axis)) sl.axis.forEach(a => Array.isArray(a) && add(a[0], n));
    if (sl.type === "bignum" && Array.isArray(sl.days)) sl.days.forEach(v => add(v, n));
    /* dòng thời gian chung của các slide scene là "bản đồ" câu chuyện — không tính là vẽ lại */ });
  { // một ảnh chỉ dùng cho MỘT slide: lặp ảnh = người xem thấy "hết ảnh", và thường là ảnh không thật sự khớp slide thứ hai
    const use = {};
    (deck.slides || []).forEach((sl, i) => { if (!sl) return;
      const ps = [sl.photo, ...(Array.isArray(sl.photos) ? sl.photos.map(x => x && x.photo) : []), ...(Array.isArray(sl.items) ? sl.items.map(x => x && x.photo) : []), sl.before && sl.before.photo, sl.after && sl.after.photo];
      for (const p of new Set(ps.filter(Boolean).map(String))) (use[p] = use[p] || []).push(i + 1); });
    for (const [p, ss] of Object.entries(use)) if (ss.length > 1) warnings.push(`Ảnh "${p}" dùng ở ${ss.length} slide (${ss.join(", ")}) — mỗi slide một ảnh riêng, đúng brief của slide đó (SKILL.md bước 5); thiếu ảnh hợp thì dùng hình vẽ của engine`);
  }
  { // ảnh thật: deck dài mà không có ảnh nào → gợi ý (không chặn); ảnh làm bài nói có bối cảnh, người nghe nhớ lâu hơn
    const PH = new Set(["photo", "split", "gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip"]);
    const has = (deck.slides || []).some(sl => sl && (PH.has(sl.type) || sl.photo || sl.cutout || (Array.isArray(sl.items) && sl.items.some(x => x && x.photo))));
    const veTay = (deck.slides || []).filter(sl => sl && extraTypes.includes(sl.type)).length;   // bộ hình tự vẽ (bh*, bc*, qt*…) thay ảnh thật bằng vật của môn
    if ((deck.slides || []).length >= 10 && !has && veTay * 2 < (deck.slides || []).length) hints.push(`Deck ${deck.slides.length} slide chưa có ảnh thật nào — tìm 3–5 ảnh đúng chủ đề (scripts/find_images.py): bìa band/split, mở chương có ảnh, photostats, mosaic, frame (SKILL.md bước 5)`);
  }
  // BÀI TẬP LUẬT: đề có năm / ngày mà lời giải (slide ngay sau) không nhắc thời hiệu / thời hạn / luật áp dụng theo thời điểm
  // → dễ bỏ sót bước "còn thời hiệu không?" (vd. hợp đồng sai hình thức: 2 năm từ ngày xác lập — khoản 1 Điều 132 BLDS 2015)
  (deck.slides || []).forEach((sl, i) => { if (!isObj(sl) || sl.type !== "exercise") return; const nx = deck.slides[i + 1];
    if (!/\b(1[89]|20)\d{2}\b|\d{1,2}\/\d{1,2}\/\d{4}/.test(String(sl.prompt || "") + JSON.stringify(sl.given || []))) return;
    const txt = (o) => typeof o === "string" ? o : Array.isArray(o) ? o.map(txt).join(" ") : isObj(o) ? Object.entries(o).filter(([k]) => k !== "notes").map(([, v]) => txt(v)).join(" ") : "";
    if (nx && isObj(nx) && !/thời hiệu|thời hạn|hiệu lực từ|luật áp dụng|áp dụng (bộ )?luật/i.test(txt(nx))) hints.push(`Slide ${i + 2} (${nx.type}): đề Slide ${i + 1} có năm / ngày nhưng lời giải không nhắc thời hiệu, thời hạn hay luật áp dụng theo thời điểm — kiểm ba bước này trước khi kết luận (SKILL.md: "Bài tập tình huống luật")`); });
  for (const [dt, ss] of Object.entries(seenD)) if (ss.size >= 3) hints.push(`Mốc ${dt} được vẽ lại trên ${ss.size} slide (${[...ss].join(", ")}) — mỗi lần phải thêm điều mới; không thì bỏ bớt một hình`);
  { // BÀI GIẢNG: phải có câu hỏi kiểm tra hiểu bài; slide đáp án đứng ngay sau slide hỏi cùng câu hỏi
    const kind = deck.meta && deck.meta.kind, qz = deck.slides.map((sl, i) => (sl && sl.type === "quiz" ? i : -1)).filter(i => i >= 0);
    if (kind === "lecture" && !qz.length) warnings.push('Bài giảng (meta.kind = "lecture") chưa có slide "quiz" — thêm ít nhất 1 câu hỏi kiểm tra hiểu bài (slide hỏi + slide đáp án)');
    for (const i of qz) { const sl = deck.slides[i]; if (sl.reveal !== true) continue; const prev = deck.slides[i - 1];
      if (!(prev && prev.type === "quiz" && prev.reveal !== true && String(prev.title) === String(sl.title))) warnings.push(`Slide ${i + 1} (quiz): slide đáp án phải đứng ngay sau slide hỏi cùng câu hỏi (cùng title) — người học trả lời trước, xem đáp án sau`); }
    const cl0 = deck.slides.find(sl => sl && sl.type === "closing");
    if (kind === "lecture" && cl0 && cl0.verdict) hints.push('Bài giảng: "verdict" của closing vốn là nhận định về bản án — bài giảng có thể bỏ, hoặc dùng làm câu chốt của chương');
  }
  // KẾT LUẬN phải trả lời đúng các câu hỏi đã đặt ở mục lục câu hỏi (agenda)
  const cl = deck.slides.find(sl => sl && sl.type === "closing"), agQ = deck.slides.find(sl => sl && sl.type === "agenda" && Array.isArray(sl.items) && sl.items.some(q => /\?\s*$/.test(String(q))));
  if (cl && agQ) {
    const na = Array.isArray(cl.answers) ? cl.answers.length : 0, nq = agQ.items.length;
    if (!na) warnings.push(`Slide ${deck.slides.indexOf(cl) + 1} (closing): bài đặt ${nq} câu hỏi (slide ${deck.slides.indexOf(agQ) + 1}) nhưng kết luận không trả lời — thêm "answers": [{ "q": "…", "a": "câu trả lời một dòng" }] theo đúng thứ tự câu hỏi`);
    else if (na !== nq) warnings.push(`Slide ${deck.slides.indexOf(cl) + 1} (closing): ${na} câu trả lời nhưng mục lục có ${nq} câu hỏi — phải khớp từng câu`);
  }
  if (cl && Array.isArray(cl.answers) && cl.answers.length && Array.isArray(cl.lessons) && cl.lessons.length)
    warnings.push(`Slide ${deck.slides.indexOf(cl) + 1} (closing): vừa "answers" vừa "lessons" — quá nhiều cho một slide; chuyển bài học cho các bên sang một slide "cards" đứng trước`);
  if (cl && /[.。]\s*$/.test(String(cl.title || ""))) warnings.push(`Slide ${deck.slides.indexOf(cl) + 1} (closing): tiêu đề kết thúc bằng dấu chấm — các tiêu đề khác không có, bỏ đi cho thống nhất`);
  // điều hướng: mỗi phần có slide mở đầu; mục lục khớp số phần
  const partOf = (sl) => { const m = String((sl && sl.kicker) || "").match(/^(Câu|Phần|Chương|Mục)\s*(\d+)/i); return m ? +m[2] : null; };
  const parts = [...new Set([...deck.slides.map(partOf), ...deck.slides.map(sl => sl && sl.type === "section" && /^\d+$/.test(String(sl.num || "").trim()) ? +sl.num : null)].filter(x => x != null))]; // phần = kicker "Phần N" hoặc slide section có num
  // chỉ "Phần"/"Chương" cần slide mở đầu; "Câu"/"Mục" là chuỗi câu hỏi đã nêu ở mục lục
  const big = new Set(deck.slides.map(sl => String((sl && sl.kicker) || "").match(/^(Phần|Chương)\s*(\d+)/i)).filter(Boolean).map(m => +m[2]));
  for (const p of parts) if (big.has(p) && !deck.slides.some(sl => sl && ((sl.type === "photo" && partOf(sl) === p) || (CHUONG.includes(sl.type) && +(sl.num ?? 1) === p))))
    warnings.push(`Phần ${p} không có slide mở đầu (section, hoặc photo có kicker "Phần ${p} · …") — người xem không nhận ra đã sang phần mới`);
  const ag = deck.slides.find(sl => sl && sl.type === "agenda");
  if (ag && parts.length > 1 && Array.isArray(ag.items) && ag.items.length !== parts.length)
    warnings.push(`Mục lục (agenda) có ${ag.items.length} mục nhưng bài chia ${parts.length} phần — mục lục phải liệt kê đúng các phần, theo đúng thứ tự`);
  // nhấn: mỗi slide tối đa 2 chỗ [ ] ngoài tiêu đề — nhấn mọi dòng = không nhấn dòng nào
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || ["cover", "section", "closing"].includes(sl.type)) return;
    const body = JSON.stringify(Object.fromEntries(Object.entries(sl).filter(([k]) => !["title", "notes"].includes(k))));
    const k = (body.match(/\[[^\]"]+\]/g) || []).length;
    if (k > 2) warnings.push(`Slide ${i + 1} (${sl.type}): ${k} chỗ nhấn [ ] ngoài tiêu đề (tối đa 2) — chỉ nhấn con số/ý người nói sẽ chỉ vào`); });
  // khối nền đậm (statement, bignum, compare, duel, slide mode "d" không phải ảnh): là "chỗ nhấn mạnh nhất" — nhiều quá thì loãng
  const dark = deck.slides.map((sl, i) => (sl && (["statement", "bignum", "compare", "duel", "hero"].includes(sl.type) || (sl.mode === "d" && sl.type !== "photo")) ? i + 1 : 0)).filter(Boolean);
  const darkMax = Math.max(3, Math.ceil(deck.slides.length / 6));
  if (dark.length > darkMax) warnings.push(`Deck có ${dark.length} slide mang khối nền đậm (slide ${dark.join(", ")}) — tối đa ${darkMax} (~1 trên 6 slide): giữ cho điều cần nhấn nhất, đổi slide còn lại sang type nền sáng (cards, panelrows, table...)`);
  // nhịp: nền màu nhấn chỉ có tác dụng khi hiếm
  const accent = deck.slides.filter(sl => sl && (sl.mode === "a" || (sl.mode == null && sl.type === "section"))).length;
  if (accent > 4) warnings.push(`Deck có ${accent} slide nền màu nhấn (mode "a" / section) — nhiều quá thì mất tác dụng nhấn; nên ≤ 3–4`);
  const lone = deck.slides.map((sl, i) => (sl && sl.mode === "a" && sl.type !== "section" ? i + 1 : 0)).filter(Boolean);
  if (lone.length === 1) warnings.push(`Slide ${lone[0]}: slide nội dung duy nhất nền màu nhấn (mode "a") — trông lạc tông; dùng nền sáng, để màu nhấn cho section`);
  // nhịp: cùng type quá 3 slide liền
  let run = 1;
  for (let i = 1; i <= deck.slides.length; i++) {
    const a = deck.slides[i - 1] && deck.slides[i - 1].type, b = deck.slides[i] && deck.slides[i].type;
    if (i < deck.slides.length && a === b) { run++; continue; }
    if (run > 3 && !["scene", "quiz"].includes(a)) warnings.push(`Slide ${i - run + 1}–${i}: ${run} slide "${a}" liền nhau (tối đa 3) — xen kiểu khác cho đỡ đơn điệu`);
    run = 1;
  }
  // takeaway: câu chốt một dòng (dải "Ghi nhớ" ở đáy)
  // chỉ các bố cục vẽ hàng chú thích chung (foot) mới có chỗ cho dải "Ghi nhớ"; bố cục khác tự vẽ chú thích ở chỗ riêng → sẽ đè
  const TAKE_OK = new Set(["match", "share", "isotype", "iso", "redline", "deadline", "gallery", "map", "table", "flow", "ledger", "pyramid", "steps", "matrix", "venn", "tree", "quote", "frame", "beforeafter", "mosaic", "photostrip", "quiz", "timeline", "formula", "calc", "funnel", "changelog", "journey", "cheatsheet", "checklist", "bento", "hub"]);
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || sl.takeaway == null) return;
    if (!TAKE_OK.has(sl.type)) E(i + 1, sl.type, "takeaway", `kiểu "${sl.type}" có chỗ chú thích riêng — đưa câu chốt vào đó (note / foot / footer), hoặc dùng takeaway ở: ${[...TAKE_OK].join(", ")}`);
    else if (sl.note) E(i + 1, sl.type, "takeaway", "slide đã có note — hàng đáy chỉ chứa một câu: giữ takeaway (câu chốt) và chuyển note vào notes, hoặc bỏ takeaway");
    if (typeof sl.takeaway !== "string") E(i + 1, sl.type, "takeaway", "phải là chuỗi");
    else if (sl.takeaway.length > 110) warnings.push(`Slide ${i + 1}: takeaway dài ${sl.takeaway.length} ký tự (tối đa 110) — câu chốt phải đọc một hơi`); });
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || sl.pin == null) return; const n = i + 1, t = typeof sl.pin === "string" ? sl.pin : isObj(sl.pin) ? sl.pin.text : null;
    if (["cover", "section", "end"].includes(sl.type)) E(n, sl.type, "pin", "pin chỉ dùng ở slide nội dung");
    if (typeof t !== "string" || !t.trim()) E(n, sl.type, "pin", 'cần chuỗi, hoặc { "text": "...", "by": "..." }');
    else if (t.length > 90) warnings.push(`Slide ${n}: pin dài ${t.length} ký tự (tối đa 90) — tờ giấy ghim chỉ chứa MỘT câu hoặc một con số`);
    if (isObj(sl.pin) && sl.pin.by != null && typeof sl.pin.by !== "string") E(n, sl.type, "pin.by", "phải là chuỗi (người nói / nguồn)");
    // câu trích (có ngoặc kép) mà không ghi ai nói / điều luật nào → không kiểm chứng được (vd. câu của Rousseau bị ghi là của Aristotle)
    if (typeof t === "string" && /["“”«»]/.test(t) && !(isObj(sl.pin) && typeof sl.pin.by === "string" && sl.pin.by.trim())) warnings.push(`Slide ${n}: pin là câu trích (có ngoặc kép) nhưng thiếu "by" — ghi người nói / văn bản, điều khoản để người nghe kiểm chứng được`); });
  deck.slides.forEach((sl, i) => { if (isObj(sl) && sl.type === "quote" && !(typeof sl.by === "string" && sl.by.trim())) warnings.push(`Slide ${i + 1} (quote): thiếu "by" — câu trích phải ghi người nói / văn bản, điều khoản để người nghe kiểm chứng được`); });
  // NHỊP (gợi ý, không chặn): người nghe mệt khi nhiều slide liền nhau cùng một dáng hoặc cùng dày chữ
  { const HERO = new Set(["cover", "section", "end", "closing", "agenda"]), txt = (o) => typeof o === "string" ? o.length : Array.isArray(o) ? o.reduce((a, x) => a + txt(x), 0) : isObj(o) ? Object.entries(o).reduce((a, [k, x]) => a + (["notes", "photo", "photoAlt", "photoCredit", "icon", "type", "url", "alt", "covers"].includes(k) ? 0 : txt(x)), 0) : 0;
    let run = 0, dense = 0;
    deck.slides.forEach((sl, i) => { if (!isObj(sl) || HERO.has(sl.type)) { run = 0; dense = 0; return; }
      const p = deck.slides[i - 1]; run = p && isObj(p) && p.type === sl.type && !(sl.type === "quiz" || sl.type === "scene") ? run + 1 : 1; // quiz hỏi → đáp, scene nối dòng thời gian: lặp có chủ đích
      if (run === 3) hints.push(`Nhịp: slide ${i - 1}–${i + 1} cùng là "${sl.type}" — xen một slide khác dáng (ảnh, số lớn, trích dẫn, sơ đồ) để người nghe không thấy lặp`);
      dense = txt(sl) > 520 ? dense + 1 : 0;
      if (dense === 3) hints.push(`Nhịp: slide ${i - 1}–${i + 1} đều dày chữ (> 520 ký tự) — chen một slide thưa (một con số, một câu trích, một ảnh) để người nghe thở`); }); }

  // ===== BÀI BÁO CÁO SỐ LIỆU / THỰC TRẠNG (học từ nhận xét giảng viên BNK405, 11/2026) =====
  // bài report: cảnh báo (chặn --strict); loại bài khác: gợi ý ℹ (không chặn) — luật học từ bài báo cáo số liệu
  const REP = !!(deck.meta && deck.meta.kind === "report"), RW = (m) => (REP ? warnings : hints).push(m);
  const plain = (sl) => textOf(sl).replace(/[\[\]]/g, " ");
  const hasNum = (sl) => isObj(sl) && (/\d/.test(plain(sl).replace(/\b(Phần|Chương|Câu|Mục)\s*\d+/gi, "")) || ["chart", "table", "stats", "bignum", "hero", "isotype", "photostats"].includes(sl.type));
  const head = (sl) => String((sl.kicker || "") + " " + (sl.title || "")).replace(/[\[\]]/g, "");
  // (1)+(3) NGUYÊN NHÂN ĐẶT TẠI NĂM: cột theo năm đổi chiều (tăng → giảm, giảm → tăng) hoặc âm (chi vượt thu) phải có items[].why
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || sl.type !== "chart") return; const n = i + 1, its = Array.isArray(sl.items) ? sl.items : [];
    const whys = its.filter(it => it && it.why);
    if (whys.length && sl.kind !== "column") warnings.push(`Slide ${n} (chart ${sl.kind}): "why" (nguyên nhân tại từng năm) chỉ vẽ cho kind "column" — đổi kind hoặc bỏ why`);
    if (whys.length > 4) warnings.push(`Slide ${n} (chart): ${whys.length} mục có "why" nhưng chỉ vẽ 4 — tách giai đoạn thành 2 slide biểu đồ`);
    // thẻ càng nhiều càng hẹp (tổng bề ngang 7.85 in): 1–2 thẻ 70 ký tự, 3 thẻ 55, 4 thẻ 45
    const wmax = whys.length >= 4 ? 45 : whys.length === 3 ? 55 : 70;
    its.forEach((it, j) => { if (it && it.why && String(it.why).length > wmax) warnings.push(`Slide ${n} (chart): items[${j}].why dài ${String(it.why).length} ký tự (tối đa ${wmax} khi có ${Math.min(4, whys.length)} thẻ) — một nguyên nhân chính kèm số; giải thích thêm để ở notes`); });
    if (sl.kind !== "column") return;
    const yrs = its.filter(it => it && /^(19|20)\d\d$/.test(String(it.label).trim()) && typeof it.value === "number");
    if (yrs.length < 4 || yrs.length !== its.length) return;
    const need = [];
    for (let j = 0; j < yrs.length; j++) { const v = yrs[j].value, d1 = j ? Math.sign(v - yrs[j - 1].value) : 0, d0 = j > 1 ? Math.sign(yrs[j - 1].value - yrs[j - 2].value) : 0;
      if (v < 0 || (d1 && d0 && d1 !== d0)) need.push(yrs[j]); }
    const miss = need.filter(it => !it.why).map(it => it.label);
    if (miss.length) RW(`Slide ${n} (chart column): năm ${miss.join(", ")} đổi chiều hoặc âm nhưng không có "why" — nêu nguyên nhân NGAY TẠI năm đó (items[].why, ≤ 70 ký tự, kèm số / văn bản), không gom vào một slide nguyên nhân chung`); });
  // slide "nguyên nhân" chung cho cả một giai đoạn dài (≥ 4 năm) → nguyên nhân đã rời khỏi năm nó giải thích
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || ["chart", "section", "cover", "agenda", "end"].includes(sl.type)) return; const h = head(sl), m = h.match(/((?:19|20)\d\d)\s*[–—-]\s*((?:19|20)\d\d)/);
    if (/nguyên nhân/i.test(h) && m && +m[2] - +m[1] >= 4) RW(`Slide ${i + 1} (${sl.type}): một slide nguyên nhân chung cho cả ${m[1]}–${m[2]} — đặt nguyên nhân tại từng năm tăng / giảm (chart column + items[].why) hoặc tách theo giai đoạn ngắn`); });
  // (4) BÁO CÁO: nhận định về kết quả ("chi trả đầy đủ, kịp thời", "tăng mạnh") phải truy được về báo cáo của cơ quan / báo chí —
  // slide không ghi nguồn (nguồn ở bản Word), nên ghi chú thuyết trình (notes) phải nêu nguồn của nhận định để người nói trả lời được khi bị hỏi
  if (deck.meta && deck.meta.kind === "report") deck.slides.forEach((sl, i) => { if (!isObj(sl) || ["cover", "section", "agenda", "end"].includes(sl.type)) return;
    const m = plain(sl).match(JUDGE); if (!m) return;
    if (!/nguồn|báo cáo|theo\s|số liệu (của|từ)|https?:/i.test(String(sl.notes || ""))) warnings.push(`Slide ${i + 1} (${sl.type}): nhận định "${m[1]}" chưa có nguồn trong notes — ghi "Nguồn: báo cáo … của BHXH Việt Nam / bài báo …, ngày …" để chứng minh khi bị hỏi`); });
  // TIÊU ĐỀ PHẢI ĐỌC RIÊNG VẪN HIỂU (người dùng 11/2026: "tiêu đề tối nghĩa") — câu kết luận bị nén thường mất CHỦ NGỮ
  // ("Tăng đều, chỉ giảm năm 2020" — cái gì tăng?) hoặc thành nhãn ("Bốn phần"). Luật: chủ ngữ + vị ngữ + phạm vi (thời gian / đối tượng).
  const NOSUBJ = /^(tăng|giảm|thu luôn|chi luôn|chỉ|luôn|cần|phải|được|bị|có thể|không|đã|đang|sẽ|mở rộng|chững|đi ngang|vượt|đạt|gắn với|chiếm|chuyển sang|còn)(?![\p{L}\p{N}])/iu;
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || ["cover", "end", "quote", "quiz", ...CHUONG].includes(sl.type)) return;
    const t = String(sl.title || "").replace(/[\[\]]/g, "").trim(); if (!t) return;
    if (NOSUBJ.test(t)) RW(`Slide ${i + 1} (${sl.type}): tiêu đề "${t.slice(0, 50)}" thiếu chủ ngữ — người xem không biết CÁI GÌ ${t.split(/\s+/)[0].toLowerCase()}; viết chủ ngữ + vị ngữ + phạm vi (vd. "Số người đóng BHXH bắt buộc chỉ giảm năm 2020")`);
    else if (sl.type !== "agenda" && t.split(/\s+/).length <= 3) RW(`Slide ${i + 1} (${sl.type}): tiêu đề "${t}" chỉ ${t.split(/\s+/).length} tiếng — là nhãn, không phải câu; viết điều người nghe cần nhớ ở slide này`); });
  // ẢNH: một kiểu bố cục ảnh dùng > 2 lần → deck trông lặp (người dùng 11/2026: "4 slide mở chương cùng ảnh nửa phải + thẻ")
  { const key = (sl) => { if (!isObj(sl)) return null;
      if (sl.type === "section" && sl.photo) return sl.photoLayout === "backdrop" ? "section nền ảnh mờ (backdrop)" : (sl.frame || (deck.meta && deck.meta.frame)) && (sl.frame || deck.meta.frame) !== "none" ? "section ảnh trong khung" : "section ảnh nửa phải";
      if (sl.type === "end" && sl.photo) return "end có ảnh";
      if (["photo", "split", "photostats", "frame", "gallery", "mosaic", "photostrip", "beforeafter", "headline", "lens", "collage"].includes(sl.type)) return sl.type;
      if (sl.type === "hero" && sl.photo) return "hero trên ảnh";
      return null; };
    const cnt = {}; deck.slides.forEach((sl, i) => { const k = key(sl); if (k) (cnt[k] = cnt[k] || []).push(i + 1); });
    for (const [k, ns] of Object.entries(cnt)) if (ns.length > 2) RW(`Bố cục ảnh "${k}" dùng ${ns.length} lần (slide ${ns.join(", ")}) — tối đa 2: đổi xen kiểu khác (backdrop, khung arch/circle, split, photostats, frame) hoặc bỏ ảnh ở slide ít cần ảnh nhất`); }
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || sl.type !== "section") return; const nm = String(sl.part || sl.title || "");
    if (nm.length > 22) RW(`Slide ${i + 1} (section): tên chương "${nm.slice(0, 30)}…" dài ${nm.length} ký tự — hiện ở thanh điều hướng và dải tiến độ mọi slide; thêm "part" (≤ 22 ký tự, vd "Thực trạng") khi title là câu hỏi dài`); });
  // MẠCH BÀI (người dùng 11/2026: "tiêu đề + slide đã dễ theo dõi chưa?")
  { const tok = (x) => String(x || "").toLowerCase().replace(/[\[\]]/g, "").split(/[^\p{L}\p{N}]+/u).filter(w => w.length > 1);
    // (a) nhãn trên tiêu đề lặp lại chữ của tiêu đề — nhãn phải cho NGỮ CẢNH (phần, câu hỏi), không nhắc lại tiêu đề
    deck.slides.forEach((sl, i) => { if (!isObj(sl) || !sl.kicker || !sl.title || ["cover", "section", "end"].includes(sl.type)) return;
      const k = tok(String(sl.kicker).replace(/^(Phần|Chương|Câu|Mục)\s*\d+\s*[·:.-]\s*/i, "")), t = new Set(tok(sl.title));
      if (k.length >= 1 && k.filter(w => t.has(w)).length / k.length >= 0.6) RW(`Slide ${i + 1} (${sl.type}): nhãn "${sl.kicker}" lặp lại chữ của tiêu đề — nhãn nên là ngữ cảnh / câu hỏi người nghe đang có (vd. "Phần 3 · Vì sao quỹ thâm hụt?"), không nhắc lại tiêu đề`); });
    // (b) MỘT con số xuất hiện ở > 2 slide → người nghe thấy lặp, không thấy bài đi tiếp (năm, số điều luật không tính)
    const numsOf = (sl) => { const out = new Set(), txt = textOf(Object.fromEntries(Object.entries(sl).filter(([k]) => !["notes", "covers", "basis", "items"].includes(k) || (k === "items" && sl.type !== "chart"))));
      for (const m of txt.replace(/(Điều|khoản|điểm|Đ\.)\s*\d+/gi, "").matchAll(/(?<![\d.,\p{L}])(\d{1,3}(?:[.,]\d+)+|\d{3,})(?![\d.,\p{L}])/gu)   /* số dính chữ (mã môn BNK405) không phải số liệu */) { const v = m[1]; if (/^(19|20)\d\d$/.test(v) || v.replace(/\D/g, "").length < 3 /* "1,5", "12": số nhỏ hay trùng ngẫu nhiên, khác nghĩa */) continue; out.add(v); } return out; };
    const where = {}; deck.slides.forEach((sl, i) => { if (!isObj(sl) || ["cover", "end"].includes(sl.type)) return; for (const v of numsOf(sl)) (where[v] = where[v] || []).push(i + 1); });
    for (const [v, ss] of Object.entries(where)) if (ss.length > 2) RW(`Số "${v}" xuất hiện ở ${ss.length} slide (${ss.join(", ")}) — mỗi slide nên thêm thông tin MỚI; giữ con số ở slide chứng minh nó, slide sau chỉ nhắc kết luận`);
    // (c) mục lục dùng đúng tên / câu hỏi của từng chương (section) — người nghe nhận ra chương khi tới
    const secs = deck.slides.filter(sl => isObj(sl) && sl.type === "section" && /^\d+$/.test(String(sl.num || "")));
    const agd = deck.slides.find(sl => isObj(sl) && sl.type === "agenda" && Array.isArray(sl.items));
    if (agd && secs.length >= 2) secs.forEach((sc, j) => { const it = String((agd.items || [])[j] || ""), q = String(sc.title || "").replace(/[\[\]]/g, "").trim();
      if (q && it.replace(/[\[\]]/g, "").trim() !== q) RW(`Mục lục mục ${j + 1} "${it.slice(0, 40)}" khác tiêu đề chương ${sc.num} "${q.slice(0, 40)}" — dùng ĐÚNG câu chữ của chương (chương là câu hỏi thì mục lục là câu hỏi đó; kết luận trả lời theo đúng thứ tự)`); }); }
  // DA THEO MÔN (hinh/da.js): da đang dùng có hợp đề tài không (từ khoá fits của da có trong tiêu đề bìa / meta.short / tiêu đề chương)
  { const DA = require("../hinh/da"), m = deck.meta || {}, kn = m.da || (m.kit && (DA.ALIAS[m.kit] || m.kit)), K = kn && DA.DA[kn], CHUNG = ["ho-so", "giay", "kinh"];
    const topic = [m.short, m.title, ...deck.slides.filter(sl => isObj(sl) && ["cover", "section", "bcbia", "qtbia"].includes(sl.type)).map(sl => sl.title)].join(" ").toLowerCase();
    if (K && !CHUNG.includes(kn) && !["bc", "qt"].includes(kn) && topic.trim() && !K.fits.some(f => topic.includes(f))) hints.push(`Da "${kn}" (${K.mon}) có vẻ không hợp đề tài — xem lại bước 0 "thế giới hình ảnh" (references/the-gioi-hinh-anh.md) rồi chọn da hợp, hoặc thêm da mới vào hinh/da.js`);
    if ((!kn || CHUNG.includes(kn)) && topic.trim()) { const hit = Object.entries(DA.DA).find(([k, d]) => !CHUNG.includes(k) && d.fits.some(f => topic.includes(f)));
      if (hit) hints.push(`Đề tài có vẻ hợp da "${hit[0]}" (${hit[1].mon}) — đặt "meta": { "da": "${hit[0]}" } để cả deck mang chất của môn, thay vì da chung theo loại bài`); } }
  // (2) PHẠM VI: meta.scopeOut = cụm từ ngoài phạm vi bài (vd. "bảo hiểm y tế", "BHYT"); slide được phép nhắc thì ghi "scopeOk": true
  const outs = deck.meta && Array.isArray(deck.meta.scopeOut) ? deck.meta.scopeOut.filter(x => typeof x === "string" && x.trim()) : [];
  if (deck.meta && deck.meta.scopeOut != null && !Array.isArray(deck.meta.scopeOut)) E(0, "", "meta.scopeOut", 'phải là danh sách cụm từ, vd ["bảo hiểm y tế", "BHYT"]');
  if (outs.length) deck.slides.forEach((sl, i) => { if (!isObj(sl) || sl.scopeOk === true) return; const low = plain(sl).toLowerCase();
    const hit = outs.find(o => new RegExp(`(?<![\\p{L}\\p{N}])${o.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "u").test(low));
    if (hit) warnings.push(`Slide ${i + 1} (${sl.type}): nhắc "${hit}" — ngoài phạm vi bài (meta.scopeOut); bỏ đi, hoặc ghi "scopeOk": true nếu slide này cố ý nêu tổng (vd. bảng đầu tiên)`); });
  // (5) HẠN CHẾ phải dựa trên số liệu đã trình bày ở phần thực trạng: "basis": [số slide]
  deck.slides.forEach((sl, i) => { if (!isObj(sl) || !SCHEMA[sl.type] /* recap: basis là chuỗi căn cứ */ || ["section", "cover", "agenda", "end", "closing"].includes(sl.type)) return; const n = i + 1;
    if (sl.basis != null && !(Array.isArray(sl.basis) && sl.basis.every(Number.isInteger))) { E(n, sl.type, "basis", "phải là danh sách số slide, vd [7, 9]"); return; }
    const lim = /hạn chế|tồn tại|bất cập|yếu kém/i.test(head(sl));
    if (lim && !(sl.basis || []).length) RW(`Slide ${n} (${sl.type}): slide hạn chế không có "basis" — mỗi hạn chế phải dựa trên số liệu đã trình bày ở phần thực trạng; ghi "basis": [số slide chứa số liệu đó]`);
    for (const b of sl.basis || []) { const ref = deck.slides[b - 1];
      if (!ref) warnings.push(`Slide ${n} (${sl.type}): basis ${b} — không có slide số ${b}`);
      else if (b >= n) warnings.push(`Slide ${n} (${sl.type}): basis ${b} đứng SAU slide này — số liệu chứng minh phải được trình bày trước khi nêu hạn chế`);
      else if (!hasNum(ref)) warnings.push(`Slide ${n} (${sl.type}): basis ${b} (${ref.type}) không có số liệu nào — trỏ tới slide có biểu đồ / bảng / con số`); } });
  // (6) KIẾN NGHỊ HOÀN THIỆN PHÁP LUẬT phải chỉ ra điều, khoản cụ thể chưa hợp lý
  const LAWREF = /Điều\s*\d+|\bĐ\.?\s*\d+|khoản\s*\d+|\bk\.?\s*\d+\s*(Điều|Đ)|điểm\s+[a-zđ]\s+khoản/iu;
  const unitText = (u) => (typeof u === "string" ? u : isObj(u) ? textOf(u) : "");
  deck.slides.forEach((sl, i) => { if (!isObj(sl)) return; const n = i + 1;
    if (sl.type === "closing" && sl.rec && Array.isArray(sl.rec.items)) sl.rec.items.forEach((t, j) => { if (!LAWREF.test(String(t))) RW(`Slide ${n} (closing): rec.items[${j}] không chỉ ra điều, khoản nào — kiến nghị hoàn thiện pháp luật phải nêu quy định cụ thể đang chưa hợp lý (vd. "sửa k1 Điều 60 Luật BHXH 2014")`); });
    if (["section", "cover", "agenda", "end", "closing"].includes(sl.type) || !/hoàn thiện pháp luật|kiến nghị|sửa đổi|bổ sung quy định/i.test(head(sl))) return;
    const key = ["items", "rows", "cells", "steps", "branches", "pairs", "levels"].find(k => Array.isArray(sl[k]) && sl[k].length);
    if (key) sl[key].forEach((u, j) => { if (!LAWREF.test(unitText(u))) RW(`Slide ${n} (${sl.type}): ${key}[${j}] là kiến nghị nhưng không chỉ ra điều, khoản nào — nêu quy định cụ thể chưa hợp lý và hướng sửa`); }); });
  // CÙNG MỘT CON SỐ HAI CÁCH GHI trên một slide ("800.000" ở tiêu đề, "0,8" + "triệu" ở số lớn): người nghe phải đổi đơn vị
  // trong đầu; chọn một cách ghi cho cả slide (references/nguyen-tac-bo-cuc.md mục 8). Chỉ xét số ≥ 1.000 (số đếm), bỏ năm, số điều luật.
  { const BO = new Set(["notes", "covers", "id", "photo", "photoAlt", "photoCredit", "photoSource", "cutout", "url", "go", "next", "icon", "emoji", "emoji2", "art", "type", "basis"]);
    const chu = (v, k) => (BO.has(k) ? "" : typeof v === "string" ? v + " " : typeof v === "number" ? v + " " : Array.isArray(v) ? v.map((x) => chu(x)).join(" ") : isObj(v) ? Object.entries(v).filter(([kk]) => !(kk === "value" && "display" in v)).map(([kk, x]) => chu(x, kk)).join(" ") : "");   // có display thì số thô không hiện
    const NHAN = { nghìn: 1e3, ngàn: 1e3, triệu: 1e6, tỷ: 1e9, tỉ: 1e9 };
    deck.slides.forEach((sl, i) => { if (!isObj(sl)) return; const t = chu(sl).replace(/[[\]]/g, "").replace(/(Điều|khoản|điểm|Đ\.)\s*\d+/gi, ""), so = [];
      for (const m of t.matchAll(/(?<![\d\p{L}.,])(\d{1,3}(?:\.\d{3})+|\d+(?:,\d+)?)(?:\s*(nghìn|ngàn|triệu|tỷ|tỉ)(?!\p{L}))?/gu)) {
        const raw = m[1], dv = (m[2] || "").toLowerCase(), v = parseFloat(raw.replace(/\.(?=\d{3})/g, "").replace(",", ".")) * (NHAN[dv] || 1);
        if (v >= 1000 && !(!dv && /^(19|20)\d\d$/.test(raw))) so.push({ v, ghi: m[0].trim().replace(/\s+/g, " "), dv }); }
      const da = new Set(); for (const a of so) for (const b of so) if (a.dv !== b.dv && Math.abs(a.v - b.v) / a.v < 0.005) { const k = [a.ghi, b.ghi].sort().join("|"); if (da.has(k)) continue; da.add(k);
        warnings.push(`Slide ${i + 1} (${sl.type}): cùng một con số hai cách ghi — "${a.ghi}" và "${b.ghi}"; chọn một cách ghi cho cả slide (người nghe không phải đổi đơn vị trong đầu)`); } }); }
  // "slide N" trong chữ của deck ("Số liệu: slide 16", "xem slide 9–10") phải trỏ tới slide có thật — thêm / bớt slide làm lệch số là lỗi hay gặp
  { const BO = new Set(["notes", "covers", "id", "photo", "url", "go", "next", "basis"]), M = deck.slides.length;
    const chu = (v, k) => (BO.has(k) ? "" : typeof v === "string" ? v + " " : Array.isArray(v) ? v.map((x) => chu(x)).join(" ") : isObj(v) ? Object.entries(v).map(([k2, x]) => chu(x, k2)).join(" ") : "");
    deck.slides.forEach((sl, i) => { if (!isObj(sl)) return;
      for (const m of chu(sl).matchAll(/\bslide\s+(\d+)(?:\s*[–-]\s*(\d+))?/gi)) for (const v of [m[1], m[2]].filter(Boolean).map(Number))
        if (v < 1 || v > M) warnings.push(`Slide ${i + 1} (${sl.type}): nhắc "${m[0]}" nhưng deck chỉ có ${M} slide — sửa số sau khi thêm / bớt slide`); }); }
  // LÀM TRÒN XUỐNG THÀNH SỐ KHÁC (kiemLamTron, dùng chung với hinh/dung.js — chạy lại trên chữ đã dựng, vì có số do mẫu tự tính, vd. bhtang "1,57")
  { const BO = new Set(["notes", "covers", "id", "photo", "url", "go", "next", "icon", "emoji", "type"]);
    const chu = (v, k) => (BO.has(k) ? "" : typeof v === "string" ? v + " " : typeof v === "number" ? v + " " : Array.isArray(v) ? v.map((x) => chu(x)).join(" ") : isObj(v) ? Object.entries(v).map(([k2, x]) => chu(x, k2)).join(" ") : "");
    hints.push(...kiemLamTron(deck.slides.map((sl) => (isObj(sl) ? chu(sl).replace(/[[\]]/g, "") : ""))).map((h) => `Slide ${h.i + 1}: ${h.text}`)); }
  // CĂN CỨ SỐ LIỆU: một khối ghi "Số liệu: slide N" (hoặc N–M) kèm con số → con số đó phải có trên slide N…M (chữ hoặc ghi chú)
  // — "mỗi hạn chế phải dựa trên số liệu đã trình bày"; gợi ý, không chặn (số có thể được làm tròn khác cách ghi)
  { const txt = (v) => (typeof v === "string" ? v + " " : Array.isArray(v) ? v.map(txt).join(" ") : isObj(v) ? Object.values(v).map(txt).join(" ") : typeof v === "number" ? v + " " : "");
    const so = (t) => [...t.replace(/(Điều|khoản|điểm|Đ\.|slide)\s*\d+([–-]\d+)?/gi, "").matchAll(/(?<![\d\p{L}])\d+(?:[.,]\d+)*(?:\s?%)?/gu)].map((m) => m[0].replace(/\s/g, "")).filter((x) => !/^(19|20)\d\d$/.test(x) && x.replace(/[^\d]/g, "").length >= 2);
    const di = (o, i) => { if (Array.isArray(o)) return o.forEach((x) => di(x, i)); if (!isObj(o)) return;
      const t = txt(o), m = t.match(/Số liệu:\s*slide\s+(\d+)(?:\s*[–-]\s*(\d+))?/i);
      if (m && !Object.values(o).some((v) => isObj(v) || Array.isArray(v))) { const a = +m[1], b = +(m[2] || m[1]), noi = deck.slides.slice(a - 1, b).map((x) => txt(x)).join(" ").replace(/\s/g, "");
        for (const x of so(t)) if (noi && !noi.includes(x)) hints.push(`Slide ${i + 1} (${deck.slides[i].type}): "${x}" dẫn "Số liệu: slide ${m[1]}${m[2] ? "–" + m[2] : ""}" nhưng không thấy trên slide đó — kiểm lại số hoặc số slide`); }
      else Object.values(o).forEach((v) => di(v, i)); };
    deck.slides.forEach((sl, i) => { if (isObj(sl)) Object.entries(sl).forEach(([k, v]) => k !== "notes" && di(v, i)); }); }
  return { errors, warnings, hints };
}

module.exports = { validate, SCHEMA, CAPS, checkIcon, words, MAX_WORDS, kiemLamTron };
