<script lang="ts">
  // Chuỗi ngày hiển thị bằng thẻ chuyên cần thu nhỏ (thay ngọn lửa — spec thăng chức §1.4).
  import StreakCard from '$lib/art/StreakCard.svelte';
  let { count = 0, longest = 0 }: { count?: number; longest?: number } = $props();
</script>

<a class="flame" class:cold={count === 0} href="#/toi" aria-label={`Chuỗi ${count} ngày`} title={`Chuỗi ${count} ngày`}>
  <StreakCard {count} {longest} size="mini" /><span>{count}</span>
</a>
