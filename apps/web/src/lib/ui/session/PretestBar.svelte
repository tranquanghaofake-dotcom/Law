<script lang="ts">
  // Thanh trên câu "Đoán trước": nói rõ đây là đoán, sai không sao, và cho Bỏ qua.
  let { onskip, answered = false }: { onskip: () => void; answered?: boolean } = $props();
</script>

<div class="pretest-bar" role="note">
  {#if answered}
    <span>Đoán sai không sao — xem thẻ giới thiệu ngay sau đây để thấy vì sao.</span>
  {:else}
    <span>Đoán trước khi đọc: sai cũng không ghi vào tiến độ.</span>
    <button type="button" class="btn ghost plain small" onclick={onskip}>Bỏ qua</button>
  {/if}
</div>
