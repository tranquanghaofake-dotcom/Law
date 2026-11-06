// Sinh src/storyboard.json cho video giới thiệu (bản 4, mạch A) — số liệu và nội dung khái niệm lấy từ src/stats.json (scripts/stats.mjs),
// để video không bao giờ lệch dữ liệu thật. Chạy: node scripts/stats.mjs && node scripts/storyboard.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const st = JSON.parse(fs.readFileSync(path.join(here, '..', 'src', 'stats.json'), 'utf8'));
const memo = st.featured.memo;
const icons = memo.tree.map((t) => t.icon);

const sb = {
  title: 'Luyện Luật — giới thiệu (mạch A: một câu hỏi đặt cọc xuyên suốt)',
  format: { width: 1080, height: 1920, fps: 60 },
  music: { bpm: 111, offsetSec: 0, phraseBars: 8, gapBeats: 1.5, file: null },
  theme: {
    ground: '#f7f4ee', ground2: '#ffffff', ink: '#14213d', inkSoft: '#5b6475', accent: '#d97a1e', accent2: '#1f7a4d',
    display: 'noto-serif-display', ui: 'be-vietnam-pro', decor: { particles: false, rays: false },
    cutMark: { text: '§', color: '#b3261e', ink: '#f7f4ee' },
  },
  scenes: [
    // ── cụm 1 ──
    { id: 'hook', type: 'TitleSlam', bars: 2, bg: '#d97a1e', props: {
      // khung 0 đã đọc được (ảnh bìa): "Đặt cọc / 20 TRIỆU" đã đáp từ trước khung 0; phần sau nện theo phách
      lines: [
        { text: 'Đặt cọc', at: -2.2, color: '#14213d' },
        { text: '20 TRIỆU', at: -2.2, size: 'hero', color: '#ffffff' },
        { text: 'chủ nhà bán người khác', at: 2, color: '#14213d' },
        { text: 'được trả bao nhiêu?', at: 4.5, color: '#ffffff' },
      ] } },
    { id: 'logo', type: 'LogoReveal', bars: 2, props: {
      mark: { text: '§' }, markColor: '#b3261e', name: 'Luyện Luật', tagline: 'Học luật kiểu nhớ lâu',
      art: { kind: 'image', src: 'cap/art-khue-van-cac.png' }, hits: [0] } },
    { id: 'the', type: 'KnowledgeCard', bars: 4, props: {
      kicker: 'Hiểu nhanh · Điều 328 BLDS', term: st.featured.term,
      branches: memo.tree.map((t, i) => ({ label: t.label, icon: icons[i], children: i >= 2 ? (t.children ?? []).slice(0, 1) : [], tone: ['accent', 'accent2', 'warn', 'accent'][i] })),
      hook: memo.hook.replace(' bằng số tiền cọc', ''), at: { branches: 1, hook: 6 } } },
    // ── cụm 2 ──
    { id: 'dap', type: 'StatCount', bars: 2, bg: 'dark', props: {
      kicker: 'Chủ nhà bỏ cuộc phải trả', stats: [{ value: 40, from: 20, label: 'triệu', at: 1 }], hits: [1],
      sub: { text: 'Trả cọc + khoản tương đương', at: 4 } } },
    { id: 'de', type: 'DeviceDemo', bars: 3, props: {
      kicker: 'Luyện ngay trên web', title: 'Cùng luật, tình huống khác', accentWords: [0, 1], device: 'phone',
      media: { kind: 'video', src: 'cap/quiz-6tr.mp4' }, poster: 'cap/quiz-6tr-0.png', syncSec: 0.6, syncBeat: 2, hits: [2],
      chips: [{ text: '3 triệu + 3 triệu = 6 triệu', at: 3, x: 70, y: 980, tone: 'accent2' }, { text: 'Căn cứ Khoản 2 Điều 328', at: 5, x: 300, y: 1130, tone: 'accent' }] } },
    { id: 'bac', type: 'FeatureSteps', bars: 3, props: {
      kicker: 'Mỗi khái niệm đi qua', title: '6 bậc ghi nhớ', accentWords: [2, 3], start: 1, every: 1.5,
      steps: [
        { label: 'Gặp', icon: 'eye' }, { label: 'Nhận biết', icon: 'search' }, { label: 'Phân biệt', icon: 'compare' },
        { label: 'Điền', icon: 'pen' }, { label: 'Tình huống', icon: 'puzzle' }, { label: 'Tự trả lời', icon: 'idea' },
      ] } },
    // ── cụm 3 ──
    { id: 'fsrs', type: 'LineReveal', bars: 2, bg: 'dark', props: {
      kicker: 'Lịch ôn tự động', title: 'Ôn đúng lúc sắp quên', accentWords: [3, 4], drawBeats: 6, axisX: 'ngày', axisY: 'nhớ',
      points: forgetting(), marks: [{ x: 0.16, label: 'ôn 1' }, { x: 0.38, label: 'ôn 2' }, { x: 0.7, label: 'ôn 3' }] } },
    { id: 'chuoi', type: 'MediaHero', bars: 4, bg: 'dark', props: {
      kicker: 'Thẻ chuyên cần', media: { kind: 'video', src: 'cap/ignite-75.mp4' }, poster: 'cap/ignite-75-0.png',
      syncSec: 3.865, hitBeat: 8, focus: { x: 0.5, y: 0.435 }, darkIntroSec: 1.2, hits: [8], pushIn: 2.3, cutBottom: 600,
      lines: [{ text: 'Học mỗi ngày,', at: 0 }, { text: 'thắp một ký hoạ', at: 2, color: '#d8b4ff' }], linesOut: 6 } },
    { id: 'chuky', type: 'CardCycle', bars: 2, bg: '#08080c', props: {
      kicker: 'Hết chu kỳ, thẻ đổi màu', every: 2,
      items: [
        { image: 'cap/card-25.png', label: 'Chuỗi 25 · Đỏ', color: '#ff6a3d' }, { image: 'cap/card-50.png', label: 'Chuỗi 50 · Xanh lam', color: '#4aa3ff' },
        { image: 'cap/card-75.png', label: 'Chuỗi 75 · Tím', color: '#b77bff' }, { image: 'cap/card-100.png', label: 'Chuỗi 100 · Trắng – đen', color: '#e8e8e8' },
      ] } },
    // ── cụm 4 (nửa) ──
    { id: 'chuc', type: 'Ladder', bars: 2, bg: '#1a120a', props: {
      kicker: `${st.chapters} chương = ${st.chapters} cuốn sách`,
      titles: { climb: 'Đủ sách thì thăng chức', finale: 'Lên tới đỉnh' },
      climb: [['cong-dan', 'Công dân'], ['chu-tich-tinh', 'Chủ tịch UBND tỉnh'], ['bo-truong', 'Bộ trưởng'], ['thu-tuong', 'Thủ tướng']]
        .map(([id, label]) => ({ image: `cap/post-${id}.png`, label })),
      finale: { media: { kind: 'video', src: 'cap/post-celebrate.webm', alpha: true }, at: 4 }, finaleLabel: 'CHỦ TỊCH NƯỚC', hits: [4],
      note: 'Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật.' } },
    { id: 'ket', type: 'EndCard', bars: 2, props: {
      mark: { text: '§' }, name: 'Luyện Luật', tags: ['Miễn phí', 'Không cần tài khoản'], cta: 'Link ở bio',
      url: 'tranquanghaofake-dotcom.github.io/Law', disclaimer: 'Thông tin pháp luật chung, không phải tư vấn.' } },
  ],
  cues: [
    { sfx: 'drop_002', beat: 8, volume: 0.35 },
    ...[0, 1, 2, 3].map((i) => ({ sfx: 'select_001', beat: 17 + i, volume: 0.22 })),
    { sfx: 'maximize_006', beat: 30.5, volume: 0.3 },
    { sfx: 'confirmation_001', beat: 42, volume: 0.45 },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ sfx: 'select_001', beat: 53 + i * 1.5, volume: 0.2 })),
    { sfx: 'maximize_006', beat: 62.5, volume: 0.3 },
    { sfx: 'bong_001', beat: 80, volume: 0.45 },
    ...[0, 1, 2, 3].map((i) => ({ sfx: 'drop_002', beat: 88 + i * 2, volume: 0.3 })),
    { sfx: 'maximize_006', beat: 94.5, volume: 0.3 },
    ...[1, 2, 3].map((i) => ({ sfx: 'select_001', beat: 96 + i, volume: 0.2 })),
    { sfx: 'bong_001', beat: 100, volume: 0.45 },
  ],
};

// đường quên minh hoạ: sau mỗi lần ôn trí nhớ về đỉnh và rơi chậm dần (hình minh hoạ, không phải số đo)
function forgetting() {
  const reviews = [0, 0.16, 0.38, 0.7];
  return Array.from({ length: 121 }, (_, i) => {
    const x = i / 120;
    let last = 0, k = 0;
    reviews.forEach((r, j) => { if (x >= r) { last = r; k = j; } });
    return [x, 0.04 + 0.92 * Math.exp(-(x - last) / (0.05 * 2.6 ** k))];
  });
}

fs.writeFileSync(path.join(here, '..', 'src', 'storyboard.json'), JSON.stringify(sb, null, 1) + '\n');
const bars = sb.scenes.reduce((n, s) => n + s.bars, 0);
console.log(`storyboard: ${sb.scenes.length} cảnh · ${bars} ô · ${((bars * 4 * 60) / sb.music.bpm).toFixed(1)} s`);
