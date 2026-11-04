<script lang="ts">
  import { tick } from 'svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  import { settings, saveSetting } from '$lib/store/settings.svelte';
  import { repo, parseExport } from '$lib/store/progress-repo';
  import { storage } from '$lib/store/status.svelte';
  import { tts } from '$lib/fx/tts.svelte';
  import { sfx } from '$lib/fx/sfx';
  import { refreshHeader } from '$lib/ui/header.svelte';
  import { refreshSidenav } from '$lib/ui/sidenav.svelte';
  import { refreshShelf } from '$lib/ui/shelf.svelte';
  import { getPref, setPref } from '$lib/ui/session/prefs';
  const ttsOk = $derived(tts.available);
  let prefPre = $state(getPref('pretest'));
  let msg = $state('');
  async function exportData() {
    const json = await repo.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `luyen-luat-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  }
  // Nhập dữ liệu hai bước: đọc + tóm tắt file trước, chỉ ghi khi người dùng xác nhận (ghi đè không hoàn tác được).
  let pending = $state<{ json: string; name: string; concepts: number; reviews: number; overwrite: number } | null>(null);
  let err = $state('');
  let confirmBox = $state<HTMLElement | null>(null);
  async function pickFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    input.value = ''; // chọn lại cùng file vẫn kích hoạt change
    if (!f) return;
    msg = ''; err = ''; pending = null;
    try {
      const json = await f.text();
      const d = parseExport(json);
      const ids = new Set((d.concepts ?? []).map((c) => c.conceptId));
      const overwrite = (await repo.all()).filter((c) => ids.has(c.conceptId)).length;
      pending = { json, name: f.name, concepts: ids.size, reviews: d.reviews?.length ?? 0, overwrite };
      await tick();
      confirmBox?.focus(); // báo cho bàn phím/trình đọc màn hình biết có bước xác nhận
    } catch (x) {
      // chỉ hiện lỗi tiếng Việt do parseExport ném ra; lỗi JS khác (TypeError…) quy về câu chung
      err = x instanceof SyntaxError ? 'File không đúng định dạng JSON.'
        : x instanceof TypeError || !(x as Error).message ? 'File không đúng cấu trúc dữ liệu Luyện Luật.'
        : (x as Error).message;
    }
  }
  async function confirmImport() {
    if (!pending) return;
    const p = pending;
    try {
      await repo.importAll(p.json);
      // làm mới các số liệu đang hiển thị (header, thanh bên, tủ sách) để không phải tải lại trang
      await Promise.all([refreshHeader(), refreshSidenav(), refreshShelf()]);
      pending = null;
      msg = `Đã nhập ${p.concepts} khái niệm, ${p.reviews} lượt ôn.`;
    } catch { pending = null; err = 'Không ghi được dữ liệu vào trình duyệt. Tiến độ cũ chưa bị đổi — thử lại hoặc tải lại trang.'; }
  }
</script>

<section class="card settings">
  <h2 style="margin-top:0">Cài đặt</h2>
  {#if !storage.available}<p class="muted"><Glyph name="warn" size={16} /> Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Tiến độ sẽ không được lưu.</p>{/if}
  <label class="setting"><span>Âm thanh</span><input type="checkbox" checked={settings.sound} onchange={(e) => { saveSetting('sound', e.currentTarget.checked); if (e.currentTarget.checked) sfx.play('select'); }} /></label>
  <label class="setting"><span>Tự đọc phản hồi sau khi chọn đáp án</span><input type="checkbox" checked={settings.tts} onchange={(e) => saveSetting('tts', e.currentTarget.checked)} /></label>
  <p class="muted small">Dùng giọng đọc dựng sẵn nếu có, không thì giọng tiếng Việt của trình duyệt.</p>
  {#if ttsOk}<button class="btn ghost" type="button" onclick={() => tts.speak('Hiến pháp là luật cơ bản của nước Cộng hòa xã hội chủ nghĩa Việt Nam.')}>Nghe thử</button>
  {:else}<p class="muted small">Trình duyệt này không có giọng tiếng Việt; nút nghe sẽ được ẩn.</p>{/if}
  <label class="setting"><span>Giảm chuyển động</span>
    <select value={settings.reducedMotion} onchange={(e) => saveSetting('reducedMotion', e.currentTarget.value as 'auto' | 'on' | 'off')}>
      <option value="auto">Theo hệ thống</option><option value="on">Bật</option><option value="off">Tắt</option>
    </select></label>
  <label class="setting"><span>Mục tiêu nhớ <b>{Math.round(settings.retention * 100)}%</b></span>
    <input class="range" type="range" min="0.8" max="0.95" step="0.01" value={settings.retention} aria-describedby="retention-help" onchange={(e) => saveSetting('retention', Number(e.currentTarget.value))} /></label>
  <p class="muted small" id="retention-help">Cao hơn = ôn dày hơn nhưng nhớ chắc hơn. Mặc định 90%.</p>
  <h3 class="settings-h">Cách học</h3>
  <label class="setting"><span>Đoán trước 1–2 câu ở đầu đợt học mới, trước khi đọc thẻ giới thiệu</span><input type="checkbox" checked={prefPre} onchange={(e) => { prefPre = e.currentTarget.checked; setPref('pretest', prefPre); }} /></label>
  <p class="muted small">Tuỳ chọn này lưu riêng trong trình duyệt (không nằm trong file xuất dữ liệu).</p>
  <h3 class="settings-h">Dữ liệu</h3>
  <p class="muted small">Tiến độ lưu trong trình duyệt này. Xuất file để chuyển máy hoặc lưu dự phòng.</p>
  <div class="row">
    <button class="btn ghost plain" type="button" onclick={exportData}>Xuất dữ liệu</button>
    <label class="btn ghost plain">Nhập dữ liệu<input type="file" accept="application/json" class="sr-only" onchange={pickFile} /></label>
  </div>
  {#if pending}
    <div class="import-confirm" role="group" aria-label="Xác nhận nhập dữ liệu" tabindex="-1" bind:this={confirmBox}>
      <p>File <b>{pending.name}</b> có <b>{pending.concepts} khái niệm</b> và <b>{pending.reviews} lượt ôn</b>.</p>
      <p class="small"><Glyph name="warn" size={16} /> Dữ liệu trong file sẽ thay dữ liệu trên máy này: tiến độ của {pending.overwrite} khái niệm trùng, lịch sử ôn, XP và chuỗi ngày, cài đặt (kể cả khái niệm đánh dấu sao). Không hoàn tác được — nên <button type="button" class="linklike" onclick={exportData}>xuất bản sao lưu</button> trước.</p>
      <div class="row">
        <button type="button" class="btn" onclick={confirmImport}>Nhập và ghi đè</button>
        <button type="button" class="btn ghost plain" onclick={() => (pending = null)}>Huỷ</button>
      </div>
    </div>
  {/if}
  {#if err}<p role="alert" class="import-err"><Glyph name="warn" size={16} /> {err}</p>{/if}
  {#if msg}<p role="status">{msg}</p>{/if}
</section>
