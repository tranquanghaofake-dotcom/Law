<script lang="ts">
  // 7 ngày gần nhất (cũ → hôm nay); có chữ cho trình đọc màn hình, không chỉ dựa vào màu.
  // `todayLabel`: thêm nhãn "Hôm nay" và vòng nổi bật ở chấm cuối (rail Hôm nay).
  let { days, todayLabel = false }: { days: boolean[]; todayLabel?: boolean } = $props();
  const NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const labels = $derived.by(() => { const today = (new Date().getDay() + 6) % 7; return days.map((_, i) => NAMES[(today - 6 + i + 7) % 7]); });
</script>

<ol class="week" class:with-today={todayLabel} aria-label="7 ngày gần nhất">
  {#each days as on, i (i)}<li class:on class:today={todayLabel && i === days.length - 1}>{#if todayLabel && i === days.length - 1}<span class="today-tag small">Hôm nay</span>{/if}<span class="dot" aria-hidden="true"></span><span class="small">{labels[i]}</span><span class="sr-only">{on ? 'có học' : 'không học'}</span></li>{/each}
</ol>
