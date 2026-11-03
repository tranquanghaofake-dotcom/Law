<script lang="ts">
  import { settings, saveSetting } from '$lib/store/settings.svelte';
  import { repo } from '$lib/store/progress-repo';
  import { storage } from '$lib/store/status.svelte';
  import { tts } from '$lib/fx/tts.svelte';
  import { sfx } from '$lib/fx/sfx';
  import { refreshHeader } from '$lib/ui/header.svelte';
  import { refreshSidenav } from '$lib/ui/sidenav.svelte';
  import { refreshShelf } from '$lib/ui/shelf.svelte';
  const ttsOk = $derived(tts.available);
  let msg = $state('');
  async function exportData() {
    const json = await repo.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `luyen-luat-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  }
  async function importData(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try {
      await repo.importAll(await f.text());
      // làm mới các số liệu đang hiển thị (header, thanh bên, tủ sách) để không phải tải lại trang
      await Promise.all([refreshHeader(), refreshSidenav(), refreshShelf()]);
      msg = 'Đã nhập dữ liệu.';
    } catch { msg = 'File không hợp lệ.'; }
  }
</script>

<section class="card settings">
  <h2 style="margin-top:0">Cài đặt</h2>
  {#if !storage.available}<p class="muted">⚠ Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Tiến độ sẽ không được lưu.</p>{/if}
  <label class="setting"><span>Âm thanh</span><input type="checkbox" checked={settings.sound} onchange={(e) => { saveSetting('sound', e.currentTarget.checked); if (e.currentTarget.checked) sfx.play('select'); }} /></label>
  <label class="setting"><span>Tự đọc phản hồi sau khi chọn đáp án (giọng vi-VN của trình duyệt)</span><input type="checkbox" checked={settings.tts} onchange={(e) => saveSetting('tts', e.currentTarget.checked)} /></label>
  {#if ttsOk}<button class="btn ghost" type="button" onclick={() => tts.speak('Hiến pháp là luật cơ bản của nước Cộng hòa xã hội chủ nghĩa Việt Nam.')}>Nghe thử</button>
  {:else}<p class="muted small">Trình duyệt này không có giọng tiếng Việt; nút nghe sẽ được ẩn.</p>{/if}
  <label class="setting"><span>Giảm chuyển động</span>
    <select value={settings.reducedMotion} onchange={(e) => saveSetting('reducedMotion', e.currentTarget.value as 'auto' | 'on' | 'off')}>
      <option value="auto">Theo hệ thống</option><option value="on">Bật</option><option value="off">Tắt</option>
    </select></label>
  <label class="setting"><span>Mục tiêu nhớ (retention) <b>{Math.round(settings.retention * 100)}%</b></span>
    <input type="range" min="0.8" max="0.95" step="0.01" value={settings.retention} onchange={(e) => saveSetting('retention', Number(e.currentTarget.value))} /></label>
  <p class="muted small">Cao hơn = ôn dày hơn nhưng nhớ chắc hơn. Mặc định 90%.</p>
  <h3 class="settings-h">Dữ liệu</h3>
  <p class="muted small">Tiến độ lưu trong trình duyệt này. Xuất file để chuyển máy hoặc lưu dự phòng.</p>
  <div class="row">
    <button class="btn ghost plain" type="button" onclick={exportData}>Xuất dữ liệu</button>
    <label class="btn ghost plain">Nhập dữ liệu<input type="file" accept="application/json" class="sr-only" onchange={importData} /></label>
  </div>
  {#if msg}<p role="status">{msg}</p>{/if}
</section>
