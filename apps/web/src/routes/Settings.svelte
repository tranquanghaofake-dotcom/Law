<script lang="ts">
  import { settings, saveSetting } from '$lib/store/settings.svelte';
  import { repo } from '$lib/store/progress-repo';
  import { storage } from '$lib/store/status.svelte';
  import { tts } from '$lib/fx/tts.svelte';
  import { sfx } from '$lib/fx/sfx';
  const ttsOk = $derived(tts.available);
</script>

<section class="card settings">
  <h2 style="margin-top:0">Cài đặt</h2>
  {#if !storage.available}<p class="muted">⚠ Trình duyệt đang chặn lưu trữ (chế độ riêng tư?). Tiến độ sẽ không được lưu.</p>{/if}
  <label class="setting"><span>Âm thanh</span><input type="checkbox" checked={settings.sound} onchange={(e) => { saveSetting('sound', e.currentTarget.checked); if (e.currentTarget.checked) sfx.play('select'); }} /></label>
  <label class="setting"><span>Đọc đáp án (giọng vi-VN của trình duyệt)</span><input type="checkbox" checked={settings.tts} onchange={(e) => saveSetting('tts', e.currentTarget.checked)} /></label>
  {#if ttsOk}<button class="btn ghost" type="button" onclick={() => tts.speak('Hiến pháp là luật cơ bản của nước Cộng hòa xã hội chủ nghĩa Việt Nam.')}>Nghe thử</button>
  {:else}<p class="muted small">Trình duyệt này không có giọng tiếng Việt; nút nghe sẽ được ẩn.</p>{/if}
  <label class="setting"><span>Giảm chuyển động</span>
    <select value={settings.reducedMotion} onchange={(e) => saveSetting('reducedMotion', e.currentTarget.value as 'auto' | 'on' | 'off')}>
      <option value="auto">Theo hệ thống</option><option value="on">Bật</option><option value="off">Tắt</option>
    </select></label>
  <label class="setting"><span>Mục tiêu nhớ (retention) <b>{Math.round(settings.retention * 100)}%</b></span>
    <input type="range" min="0.8" max="0.95" step="0.01" value={settings.retention} onchange={(e) => saveSetting('retention', Number(e.currentTarget.value))} /></label>
  <p class="muted small">Cao hơn = ôn dày hơn nhưng nhớ chắc hơn. Mặc định 90%.</p>
  <label class="setting"><span>Giao diện</span>
    <select value={settings.theme} onchange={(e) => saveSetting('theme', e.currentTarget.value as 'auto' | 'light' | 'dark')}>
      <option value="auto">Theo hệ thống</option><option value="light">Sáng</option><option value="dark">Tối</option>
    </select></label>
</section>
