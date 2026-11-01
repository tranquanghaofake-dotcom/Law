<script lang="ts">
  import type { ItemMcq } from '$lib/content/types';
  import type { CardProps } from './types';
  import CardMcq from './CardMcq.svelte';
  let props: CardProps<ItemMcq> = $props();
</script>

<CardMcq {...props} kind="case" />
