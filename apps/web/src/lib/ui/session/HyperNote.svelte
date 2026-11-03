<script lang="ts">
  // Phản hồi riêng cho lỗi "chắc mà sai" (hypercorrection): lỗi tin chắc sửa tốt nhất khi được nhìn kỹ ngay lúc này.
  let { term, answer = '', confusableTerms = [], retry = false }: { term: string; answer?: string; confusableTerms?: string[]; retry?: boolean } = $props();
</script>

<div class="hyper-note" role="status">
  <p class="hyper-h"><b>Bạn rất chắc nhưng sai.</b> Đây là lỗi dễ sửa nhất nếu nhìn kỹ ngay bây giờ.</p>
  <p class="hyper-b">«{term}»{#if answer}: đáp án đúng <b>{answer}</b>{/if}.{#if confusableTerms.length}{' '}Dễ nhầm với <b>{confusableTerms.join(', ')}</b>.{/if}</p>
  {#if !retry}<p class="muted small">Câu này sẽ quay lại đầu vòng sửa sai cuối phiên.</p>{/if}
</div>
