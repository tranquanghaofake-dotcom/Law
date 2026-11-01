<script lang="ts">
  // Icon nét nhỏ thay emoji màu (🔥 🔊 ⚙) để đồng bộ phong cách nét vẽ. stroke = currentColor.
  let { name, size = 18 }: { name: 'flame' | 'speaker' | 'gear'; size?: number } = $props();
</script>

<svg class="glyph" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'flame'}
    <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1c0-3.6 2.7-5.4 3.6-8.9c2.4 1.4 3.4 3.6 3.2 5.6c1-.5 1.7-1.6 1.9-2.8c2 1.6 2.8 3.6 2.8 6.1c0 3.5-2.6 6.1-5 6.1z" />
    <path d="M12 21c-1.5 0-2.6-1.1-2.6-2.6c0-1.6 1.2-2.4 1.8-4c1.6 1 2.6 2.4 2.6 4c0 1.5-.8 2.6-1.8 2.6z" />
  {:else if name === 'speaker'}
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  {:else}
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  {/if}
</svg>
