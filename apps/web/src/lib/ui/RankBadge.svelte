<script lang="ts">
  import { rankFor } from '$lib/game/rank';
  let { xp = 0, href = '#/toi' }: { xp?: number; href?: string } = $props();
  const info = $derived(rankFor(xp));
</script>

<a class="rank" {href} title={`${info.rank} ${info.tier} · ${xp} XP`} aria-label={`${info.rank} ${info.tier} — bậc khoa cử, ${xp} XP`}>
  <span class="seal" aria-hidden="true">§</span>
  <span>{info.rank}</span> <span class="tier">{info.tier}</span>
</a>
