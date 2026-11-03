<script lang="ts">
  // Chuỗi ngày hiển thị bằng thẻ chuyên cần thu nhỏ (thay ngọn lửa — spec thăng chức §1.4).
  import StreakCard from '$lib/art/StreakCard.svelte';
  let { count = 0, longest = 0 }: { count?: number; longest?: number } = $props();
</script>

<!-- Không dùng aria-label khác chữ hiển thị (axe: label-content-name-mismatch); tên truy cập ghép từ chữ thật + sr-only. -->
<a class="flame" class:cold={count === 0} href="#/toi" title={`Chuỗi ${count} ngày`}>
  <StreakCard {count} {longest} size="mini" /><span><span class="sr-only">Chuỗi </span>{count}<span class="sr-only"> ngày</span></span>
</a>
