<script lang="ts">
  // Hash không khớp route nào: hiện trong Shell như trang thường, không đổi URL.
  import { hashFor } from '$lib/router.svelte';
  document.title = 'Không tìm thấy · Luyện Luật';
</script>

<section class="card">
  <h1>Không tìm thấy trang</h1>
  <p class="muted">Địa chỉ này không tồn tại hoặc đã đổi. Bạn có thể quay lại trang chính hoặc chọn môn để học.</p>
  <p>
    <a class="btn" href="#/">Về Hôm nay</a>
    <a class="btn ghost" href={hashFor('subjects')}>Môn học</a>
  </p>
</section>
