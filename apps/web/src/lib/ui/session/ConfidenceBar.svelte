<script lang="ts">
  // Ba nút "Bạn chắc đến đâu?" trước khi chọn đáp án. Tuỳ chọn: bỏ qua thì câu vẫn trả lời bình thường.
  // Phím tắt C / T / D (không tranh với 1–4, Enter, Space); bấm lại nút đang chọn để bỏ chọn.
  import { CONFIDENCES, CONF_LABEL, type Confidence } from '$lib/engine/confidence';
  import { isTypingTarget } from '$lib/ui/cards/types';
  let { value = undefined, onpick, disabled = false }: { value?: Confidence; onpick: (c: Confidence | undefined) => void; disabled?: boolean } = $props();
  const KEYCAP: Record<Confidence, string> = { chac: 'C', tam: 'T', doan: 'D' };
  function pick(c: Confidence) { if (!disabled) onpick(value === c ? undefined : c); }
  function onkey(e: KeyboardEvent) {
    if (disabled || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e)) return;
    const k = e.key.toLowerCase();
    const c = CONFIDENCES.find((x) => KEYCAP[x].toLowerCase() === k);
    if (c) { e.preventDefault(); pick(c); }
  }
</script>

<svelte:window onkeydown={onkey} />
<div class="conf-bar" role="group" aria-label="Bạn chắc đến đâu với câu trả lời của mình? (tuỳ chọn)">
  <span class="conf-q">Bạn chắc đến đâu?</span>
  {#each CONFIDENCES as c (c)}
    <button type="button" class="conf-btn conf-{c}" aria-pressed={value === c} {disabled} onclick={() => pick(c)}>
      {CONF_LABEL[c]}<kbd aria-hidden="true">{KEYCAP[c]}</kbd>
    </button>
  {/each}
</div>
