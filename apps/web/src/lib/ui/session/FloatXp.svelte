<script lang="ts">
  // "+10" bay lên ở chỗ vừa bấm. Chỉ là hiệu ứng trang trí: giảm chuyển động thì không vẽ (XP vẫn hiện ở phản hồi).
  import type { XpFloat } from './combo';
  let { floats = [] }: { floats?: XpFloat[] } = $props();
</script>

<div class="xp-floats" aria-hidden="true">
  {#each floats as f (f.id)}
    <span class="xp-float" class:gold={f.golden} class:fire={!!f.fire} class:fly={f.dx !== undefined} style="left:{f.x}px;top:{f.y}px;{f.fire ?? ''}{f.dx !== undefined ? `;--tx:${f.dx}px;--ty:${f.dy}px` : ''}">{f.text}</span>
  {/each}
</div>
