<script lang="ts">
  // Icon điều hướng vẽ bằng nét (stroke = currentColor), thay emoji để đồng bộ phong cách nét kiến trúc.
  import type { NavName } from '$lib/ui/nav';
  let { name }: { name: NavName } = $props();
</script>

<svg class="icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'home'}
    <path d="M3 19h18M6.5 19a5.5 5.5 0 0 1 11 0M12 7.5v2M6.3 10.3l1.4 1.4M17.7 10.3l-1.4 1.4M3.5 15H5M19 15h1.5" />
  {:else if name === 'subjects'}
    <path d="M12 7c-2.6-1.8-5.6-2.2-9-1.4V19c3.4-.8 6.4-.4 9 1.4c2.6-1.8 5.6-2.2 9-1.4V5.6c-3.4-.8-6.4-.4-9 1.4zM12 7v13.4" />
  {:else if name === 'quizzes'}
    <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h4.5" />
  {:else}
    <rect x="4.5" y="3.5" width="15" height="17" rx="1.5" /><circle cx="12" cy="10" r="2.8" /><path d="M7.5 17.5c.8-2.4 2.6-3.6 4.5-3.6s3.7 1.2 4.5 3.6" />
  {/if}
</svg>
