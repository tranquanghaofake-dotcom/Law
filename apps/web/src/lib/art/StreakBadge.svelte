<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Huy hiệu ngọn lửa nhỏ cho chỗ chật (sidebar, topbar, thẻ căn cước): thay thẻ chuyên cần cỡ mini (~40 px, không đọc được).
  // Màu theo chu kỳ (streakView: flame = thân lửa, glow = quầng); chưa có chuỗi thì xám. Số ngày do chỗ dùng hiển thị bằng chữ cạnh bên.
  import { streakView } from '$lib/ui/streakView';
  let { count = 0, longest = 0, size = 40 }: { count?: number; longest?: number; size?: number } = $props();
  const sv = $derived(streakView(count, longest));
  const cold = $derived(count === 0);
  const id = `sb${++seq}`;
</script>

<svg class="sbadge" class:cold viewBox="0 0 48 56" width={size} height={size * 56 / 48} aria-hidden="true" focusable="false" style="--fire:{sv.flame}; --glow:{sv.glow}">
  <defs>
    <linearGradient id="{id}-g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color={sv.glow} /><stop offset="1" stop-color={sv.flame} />
    </linearGradient>
  </defs>
  <!-- dấu triện: nền tròn nhạt phía sau để ngọn lửa nổi cả trên nền sáng lẫn tối -->
  <circle cx="24" cy="32" r="20" fill={sv.glow} opacity=".14" />
  <path d="M24 3c2 8 11 13 11 26a11 11 0 0 1-22 0c0-5 2-8 4-10c.4 4 2 6 4 7c-1-8 0-16 3-23z" fill="url(#{id}-g)" stroke={sv.glow} stroke-width="1.6" stroke-linejoin="round" />
  <path d="M24 24c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 3-5 5-11z" fill="#fff" opacity=".78" />
  <path d="M24 38c.8 2 2.6 2.6 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-2 1.8-2.6 2.6-4.6z" fill={sv.flame} opacity=".9" />
</svg>
