<script lang="ts">
  // Hash không khớp route nào: hiện trong Shell như trang thường, không đổi URL.
  import { hashFor } from '$lib/router.svelte';
  import SubjectArt from '$lib/art/SubjectArt.svelte';
  import { PAGE_ART } from '$lib/art/registry';
  document.title = 'Không tìm thấy · Luyện Luật';
</script>

<section class="card">
  <SubjectArt name={PAGE_ART.notfound} class="empty-art" />
  <h1>Không tìm thấy trang</h1>
  <p class="muted">Địa chỉ này không tồn tại hoặc đã đổi. Bạn có thể quay lại trang chính hoặc chọn môn để học.</p>
  <p>
    <a class="btn" href="#/">Về Hôm nay</a>
    <a class="btn ghost" href={hashFor('subjects')}>Môn học</a>
  </p>
</section>
