<script lang="ts">
  let { count = 0 }: { count?: number } = $props();
</script>

<a class="flame" class:cold={count === 0} href="#/toi" aria-label={`Chuỗi ${count} ngày`} title={`Chuỗi ${count} ngày`}>
  <span aria-hidden="true">🔥</span><span>{count}</span>
</a>
