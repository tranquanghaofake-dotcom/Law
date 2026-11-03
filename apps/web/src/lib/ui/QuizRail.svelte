<script lang="ts">
  // Rail phải của Luyện đề (≥ 1440 px): tiến độ theo kệ (số liệu tổng và gợi ý đã nằm ở đầu trang).
  let { byShelf }: { byShelf: { id: string; name: string; color: string; done: number; total: number }[] } = $props();
</script>

<section class="rail-block">
  <p class="kicker">Tiến độ theo kệ</p>
  <ul class="qr-shelves">
    {#each byShelf as k (k.id)}
      <li style="--shelf:{k.color}">
        <span class="qr-name"><span class="dot" aria-hidden="true"></span>{k.name}</span>
        <span class="qr-n">{k.done}/{k.total}</span>
        <span class="qr-bar" aria-hidden="true"><span style="width:{k.total ? (k.done / k.total) * 100 : 0}%"></span></span>
      </li>
    {/each}
  </ul>
</section>
