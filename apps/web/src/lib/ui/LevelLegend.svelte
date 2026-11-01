<script lang="ts">
  import { LEVEL_NAMES } from '$lib/game/levels';
</script>

<ul class="legend" aria-label="Chú giải bậc ghi nhớ">
  {#each LEVEL_NAMES as name, i (i)}<li><span class="cell lv{i}" aria-hidden="true"></span>{i} {name}</li>{/each}
</ul>
