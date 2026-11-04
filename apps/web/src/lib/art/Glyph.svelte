<script lang="ts">
  // Icon nét nhỏ thay emoji màu (🔥 🔊 ⚙) và ký tự Unicode (★ ▸ ← ⚠ ✓, HT14) để đồng bộ phong cách nét vẽ. stroke = currentColor.
  let { name, size = 18 }: { name: 'flame' | 'speaker' | 'gear' | 'star' | 'star-fill' | 'chevron-right' | 'chevron-down' | 'back' | 'warn' | 'check' | 'close' | 'lock' | 'dot' | 'dot-empty' | 'external'; size?: number } = $props();
</script>

<svg class="glyph" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'flame'}
    <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1c0-3.6 2.7-5.4 3.6-8.9c2.4 1.4 3.4 3.6 3.2 5.6c1-.5 1.7-1.6 1.9-2.8c2 1.6 2.8 3.6 2.8 6.1c0 3.5-2.6 6.1-5 6.1z" />
    <path d="M12 21c-1.5 0-2.6-1.1-2.6-2.6c0-1.6 1.2-2.4 1.8-4c1.6 1 2.6 2.4 2.6 4c0 1.5-.8 2.6-1.8 2.6z" />
  {:else if name === 'speaker'}
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  {:else if name === 'star' || name === 'star-fill'}
    <path d="M12 3.5l2.6 5.3l5.9.9l-4.3 4.1l1 5.8L12 16.9l-5.2 2.7l1-5.8l-4.3-4.1l5.9-.9z" fill={name === 'star-fill' ? 'currentColor' : 'none'} />
  {:else if name === 'chevron-right'}
    <path d="M9.5 6l6 6l-6 6" />
  {:else if name === 'chevron-down'}
    <path d="M6 9.5l6 6l6-6" />
  {:else if name === 'back'}
    <path d="M19 12H5M11 6l-6 6l6 6" />
  {:else if name === 'warn'}
    <path d="M12 4l9 16H3zM12 10v4.5M12 17.5v.01" />
  {:else if name === 'check'}
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6L6 18" />
  {:else if name === 'lock'}
    <path d="M6.5 11h11v9h-11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
  {:else if name === 'external'}
    <path d="M14 5h5v5M19 5l-8 8M17 14v4.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H10" />
  {:else if name === 'dot' || name === 'dot-empty'}
    <circle cx="12" cy="12" r="5" fill={name === 'dot' ? 'currentColor' : 'none'} />
  {:else}
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
  {/if}
</svg>
