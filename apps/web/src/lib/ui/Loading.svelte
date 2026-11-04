<script lang="ts">
  // Khung chờ (đợt 10): khung xương nhấp nháy thay chữ "Đang tải…". Giữ class `loading` (e2e và CSS cũ dựa vào nó),
  // chữ cho trình đọc màn hình ở role=status. Khung chỉ hiện sau 150 ms (tải nhanh thì không nháy). Vệt sáng chạy bằng transform.
  let { rows = 3 }: { rows?: number } = $props();
</script>

<div class="loading skel" role="status">
  <span class="sr-only">Đang tải…</span>
  <span class="skel-h" aria-hidden="true"></span>
  {#each Array(rows) as _, i (i)}<span class="skel-card" aria-hidden="true"><i></i><i></i><i></i></span>{/each}
</div>
