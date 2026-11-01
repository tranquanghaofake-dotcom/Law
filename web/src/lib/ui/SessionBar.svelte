<script lang="ts">
  let { done = 0, total = 1, onexit }: { done?: number; total?: number; onexit?: () => void } = $props();
  const pct = $derived(total ? Math.min(100, (done / total) * 100) : 0);
</script>

<div class="session-bar">
  <button class="exit" type="button" onclick={onexit} aria-label="Thoát phiên, giữ tiến độ">←</button>
  <div class="progress" role="progressbar" aria-label="Tiến độ phiên" aria-valuemin="0" aria-valuemax={total} aria-valuenow={done}><span style="width:{pct}%"></span></div>
  <span class="count">{done}/{total}</span>
</div>
