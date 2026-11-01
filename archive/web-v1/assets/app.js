// Luyện Luật — web trắc nghiệm tĩnh. Dữ liệu: data/catalog.json + data/sets/<id>.json (xem web/README.md).
const SITE = {
  author: "Trần Quang Hào, sinh viên Luật Kinh tế",
  reportUrl: "", // link Google Form "báo lỗi câu hỏi"; để trống thì ẩn
};
const GROUPS = { pldc: "Pháp luật đại cương", "dan-su": "Luật Dân sự", "lao-dong": "Luật Lao động", "hinh-su": "Luật Hình sự" };
const KEYS = ["A", "B", "C", "D"];

const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* chế độ riêng tư: bỏ qua */ } },
};
const best = (id) => store.get("best:" + id);

async function load(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(path + " " + r.status);
  return r.json();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function basisHtml(q) {
  const link = q.url ? ` · <a href="${esc(q.url)}" target="_blank" rel="noopener">Xem điều luật</a>` : "";
  return `<p class="basis">Căn cứ: ${esc(q.basis)}${link}</p>`;
}

async function home() {
  document.title = "Luyện Luật";
  const { sets } = await load("data/catalog.json");
  const groups = Object.keys(GROUPS).map((g) => {
    const items = sets.filter((s) => s.group === g);
    if (!items.length) return "";
    return `<h2 class="section-title"><b>${GROUPS[g]}</b> ${items.length} bộ</h2>
      <div class="sets">${items.map(card).join("")}</div>`;
  }).join("");
  app.innerHTML = `<section class="hero">
      <h1>Luyện luật qua tình huống thật.</h1>
      <p>Mỗi bộ 10 câu, chấm ngay, có giải thích và điều luật gốc. Chọn một chủ đề và kiểm tra mình nhớ được bao nhiêu.</p>
    </section>${groups}`;
}

function card(s) {
  const b = best(s.id);
  const chip = GROUPS[s.group] || s.group;
  const meta = b != null ? `<span class="best">${b}/${s.count}</span>điểm cao nhất` : `${s.count} câu`;
  return `<a class="set" href="#/bo/${encodeURIComponent(s.id)}">
      <div><span class="chip ${esc(s.group)}">${esc(chip)}</span><h3>${esc(s.title)}</h3></div>
      <span class="meta">${meta}</span>
      <p>${esc(s.subtitle)}</p>
    </a>`;
}

async function quiz(id) {
  const set = await load(`data/sets/${encodeURIComponent(id)}.json`);
  document.title = `${set.title} · Luyện Luật`;
  // xáo thứ tự phương án mỗi lượt, giữ thứ tự câu theo người soạn
  const qs = set.questions.map((q) => {
    const order = shuffle([0, 1, 2, 3]);
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
  });
  const state = { i: 0, score: 0, wrong: [] };

  const render = () => {
    const q = qs[state.i];
    app.innerHTML = `<div class="quiz-head">
        <button class="back" data-act="home" aria-label="Về trang chủ">←</button><h2>${esc(set.title)}</h2>
      </div>
      <div class="progress" aria-hidden="true"><span style="width:${(state.i / qs.length) * 100}%"></span></div>
      <p class="counter">Câu ${state.i + 1}/${qs.length}</p>
      <p class="question">${esc(q.q)}</p>
      <div class="options">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><span class="key">${KEYS[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div id="fb"></div>`;
    app.focus();
  };

  const answer = (k) => {
    const q = qs[state.i];
    const ok = k === q.answer;
    if (ok) state.score++; else state.wrong.push(q);
    app.querySelectorAll(".opt").forEach((b) => {
      const n = +b.dataset.k;
      b.disabled = true;
      b.classList.add(n === q.answer ? "correct" : n === k ? "wrong" : "dim");
    });
    const last = state.i === qs.length - 1;
    app.querySelector("#fb").innerHTML = `<div class="feedback">
        <p class="verdict ${ok ? "ok" : "bad"}">${ok ? "Chính xác." : `Chưa đúng. Đáp án: ${KEYS[q.answer]}`}</p>
        <p>${esc(q.explain)}</p>${basisHtml(q)}
      </div>
      <button class="btn" data-act="next">${last ? "Xem kết quả" : "Câu tiếp →"}</button>`;
    app.querySelector('[data-act="next"]').focus();
  };

  const finish = () => {
    const n = qs.length, s = state.score;
    if (s > (best(set.id) ?? -1)) store.set("best:" + set.id, s);
    const msg = s === n ? "Tuyệt đối. Bạn nắm chắc phần này." : s >= n * 0.7 ? "Khá chắc. Xem lại vài câu sai bên dưới." : "Nên đọc lại giải thích bên dưới và thử lần nữa.";
    app.innerHTML = `<div class="quiz-head"><button class="back" data-act="home" aria-label="Về trang chủ">←</button><h2>${esc(set.title)}</h2></div>
      <section class="result">
        <p class="score">${s}<small>/${n}</small></p><p class="msg">${msg}</p>
      </section>
      <div class="row">
        <button class="btn" data-act="retry">Làm lại</button>
        <button class="btn ghost" data-act="share">Chia sẻ</button>
      </div>
      <a class="btn ghost" href="#/">Chọn bộ khác</a>
      ${state.wrong.length ? `<section class="review"><h3>Các câu cần xem lại</h3>${state.wrong.map((q) => `<div class="item">
          <b>${esc(q.q)}</b><span class="ans">Đáp án: ${esc(q.options[q.answer])}</span><p>${esc(q.explain)}</p>${basisHtml(q)}
        </div>`).join("")}</section>` : ""}`;
    app.focus();
  };

  app.onclick = async (e) => {
    const opt = e.target.closest(".opt");
    if (opt && !opt.disabled) return answer(+opt.dataset.k);
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "next") { state.i++; return state.i < qs.length ? render() : finish(); }
    if (act === "retry") return quiz(id);
    if (act === "home") { location.hash = "#/"; return; }
    if (act === "share") {
      const data = { title: set.title, text: `Mình được ${state.score}/${qs.length} câu "${set.title}". Thử xem bạn được mấy câu?`, url: location.href };
      try {
        if (navigator.share) await navigator.share(data);
        else { await navigator.clipboard.writeText(`${data.text} ${data.url}`); e.target.textContent = "Đã chép link"; }
      } catch { /* người dùng hủy */ }
    }
  };
  render();
}

async function route() {
  app.onclick = null;
  const m = location.hash.match(/^#\/bo\/([\w-]+)/);
  try {
    if (m) await quiz(decodeURIComponent(m[1]));
    else await home();
  } catch (err) {
    app.innerHTML = `<p class="error">Không tải được dữ liệu (${esc(err.message)}). Nếu đang mở file trực tiếp trên máy, hãy chạy <code>python -m http.server</code> trong thư mục web/.</p>`;
  }
  window.scrollTo(0, 0);
}

document.getElementById("author").textContent = SITE.author;
if (SITE.reportUrl) document.getElementById("report").innerHTML = `Thấy câu sai? <a href="${esc(SITE.reportUrl)}" target="_blank" rel="noopener">Báo lỗi tại đây</a>.`;
window.addEventListener("hashchange", route);
route();
