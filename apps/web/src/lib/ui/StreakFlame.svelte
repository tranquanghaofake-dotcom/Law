<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  let { count = 0 }: { count?: number } = $props();
</script>

<a class="flame" class:cold={count === 0} href="#/toi" aria-label={`Chuỗi ${count} ngày`} title={`Chuỗi ${count} ngày`}>
  <Glyph name="flame" /><span>{count}</span>
</a>
