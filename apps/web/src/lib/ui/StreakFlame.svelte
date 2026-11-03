<script lang="ts">
  // Chuỗi ngày hiển thị bằng huy hiệu ngọn lửa theo màu chu kỳ (cùng số liệu với rail và sidebar: streakView).
  import StreakBadge from '$lib/art/StreakBadge.svelte';
  import { streakView } from './streakView';
  let { count = 0, longest = 0 }: { count?: number; longest?: number } = $props();
  const sv = $derived(streakView(count, longest));
</script>

<!-- Không dùng aria-label khác chữ hiển thị (axe: label-content-name-mismatch); tên truy cập ghép từ chữ thật + sr-only. -->
<a class="flame" class:cold={count === 0} href="#/toi" title={`Chuỗi ${count} ngày · ${sv.label}`} style="--fire:{sv.flame}; --glow:{sv.glow}">
  <StreakBadge {count} {longest} size={28} /><span><span class="sr-only">Chuỗi </span>{count}<span class="sr-only"> ngày</span></span>
</a>
