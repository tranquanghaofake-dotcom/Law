<!-- Chim lạc cách điệu (hoa văn mặt trống đồng): mỏ dài, đuôi xoè. -->
<script lang="ts">
  let { x, y, deg = 0, s = 1 }: { x: number; y: number; deg?: number; s?: number } = $props();
</script>
<path transform="translate({x} {y}) rotate({deg}) scale({s})" d="M-9 1q4-5 10-3l7-4l-4 5q3 2 0 4q-6 2-13-2zM-9 1l-4 3M-8 2l-3 4" />
