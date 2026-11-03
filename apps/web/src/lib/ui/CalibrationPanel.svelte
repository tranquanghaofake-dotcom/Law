<script lang="ts">
  // Độ chuẩn tự đánh giá (đề xuất ①): so tỉ lệ đúng thực tế của từng mức Chắc/Tạm/Đoán với mức kỳ vọng,
  // kèm lối vào "Sửa kỹ" các khái niệm từng "chắc mà sai". Dữ liệu từ log ôn 60 ngày gần nhất.
  import { calibration, CONFIDENCES, CONF_LABEL, CONF_PROB } from '$lib/engine/confidence';
  import { repo } from '$lib/store/progress-repo';
  import { hashFor } from '$lib/router.svelte';
  const MIN_N = 10;
  let state = $state<{ cal: ReturnType<typeof calibration>; hyper: number } | null>(null);
  async function load() {
    try {
      const since = new Date(Date.now() - 60 * 86400000);
      const [rows, hyper] = await Promise.all([repo.reviewsSince(since), repo.hypercorrections()]);
      state = { cal: calibration(rows), hyper: hyper.length };
    } catch { state = null; }
  }
  load();
  const pct = (x: number | null) => (x === null ? '–' : `${Math.round(x * 100)}%`);
  const verdict = $derived.by(() => {
    const b = state?.cal.brier;
    if (b === null || b === undefined) return '';
    return b < 0.12 ? 'Bạn đánh giá khá sát khả năng của mình.' : b < 0.2 ? 'Có chỗ lệch: nhìn cột Chắc để biết bạn tự tin quá hay chưa.' : 'Độ tự tin còn lệch nhiều so với kết quả thật.';
  });
</script>

<section class="calib" aria-labelledby="calib-h">
  <h3 id="calib-h">Độ chuẩn tự đánh giá</h3>
  {#if !state || state.cal.n < MIN_N}
    <p class="muted small">Chọn Chắc / Tạm / Đoán ở các câu hỏi để xem bạn tự đánh giá đúng đến đâu{state ? ` (mới có ${state.cal.n}/${MIN_N} lượt).` : '.'}</p>
  {:else}
    <table class="calib-t">
      <caption class="sr-only">Tỉ lệ đúng thực tế theo mức tự tin</caption>
      <thead><tr><th scope="col">Mức</th><th scope="col">Lượt</th><th scope="col">Đúng thực tế</th><th scope="col">Kỳ vọng</th></tr></thead>
      <tbody>
        {#each CONFIDENCES as c (c)}
          {@const b = state.cal.byConf[c]}
          <tr><th scope="row">{CONF_LABEL[c]}</th><td>{b.n}</td>
            <td><span class="calib-bar" aria-hidden="true"><i style="width:{(b.correctRate ?? 0) * 100}%"></i></span> {pct(b.correctRate)}</td>
            <td>{pct(CONF_PROB[c])}</td></tr>
        {/each}
      </tbody>
    </table>
    <p class="small">{verdict} <span class="muted">(chênh lệch bình phương trung bình {state.cal.brier?.toFixed(2)}; 0 là chuẩn, 0,25 là đoán mò)</span></p>
  {/if}
  {#if state && state.hyper > 0}
    <p class="calib-hyper"><b>{state.hyper}</b> khái niệm bạn từng tin chắc mà trả lời sai. <a class="btn ghost" href={hashFor('review', { subject: 'chac-sai' })}>Sửa kỹ ngay</a></p>
  {/if}
</section>
