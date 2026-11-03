// Lĩnh vực của sách (spec thăng chức §2.2): mỗi chương gắn một lĩnh vực; chức danh đòi sách theo lĩnh vực.
// Lĩnh vực đánh dấu `future` chưa có môn nào — chức danh cần chúng hiện "Chờ môn …".
export const FIELDS = [
  'hien-phap', 'quyen-cong-dan', 'bau-cu', 'lap-phap', 'nguyen-thu', 'hanh-phap', 'tu-phap', 'dia-phuong', 'kinh-te-tai-chinh', 'lich-su',
  'hanh-chinh', 'dan-su', 'hinh-su', 'to-tung', 'lao-dong', 'dat-dai',
] as const;
export type Field = (typeof FIELDS)[number];

export const FIELD_NAMES: Record<Field, string> = {
  'hien-phap': 'Hiến pháp nền tảng', 'quyen-cong-dan': 'Quyền con người, quyền công dân', 'bau-cu': 'Bầu cử', 'lap-phap': 'Lập pháp (Quốc hội)',
  'nguyen-thu': 'Nguyên thủ (Chủ tịch nước)', 'hanh-phap': 'Hành pháp (Chính phủ)', 'tu-phap': 'Tư pháp (Tòa án, Viện kiểm sát)', 'dia-phuong': 'Chính quyền địa phương',
  'kinh-te-tai-chinh': 'Kinh tế – tài chính', 'lich-su': 'Lịch sử nhà nước và pháp luật',
  'hanh-chinh': 'Luật Hành chính', 'dan-su': 'Luật Dân sự', 'hinh-su': 'Luật Hình sự', 'to-tung': 'Luật Tố tụng', 'lao-dong': 'Luật Lao động', 'dat-dai': 'Luật Đất đai',
};

/** Lĩnh vực chưa có chương nào trong nội dung hiện tại (cập nhật khi thêm môn). */
export const FUTURE_FIELDS: readonly Field[] = ['hanh-chinh', 'dan-su', 'hinh-su', 'to-tung', 'lao-dong', 'dat-dai'];

const CHAPTER_FIELD: Record<string, Record<string, Field>> = {
  'hien-phap': {
    'c1-nhung-van-de-chung': 'hien-phap', 'c2-khai-niem-dac-trung': 'hien-phap', 'c3-che-do-chinh-tri': 'hien-phap',
    'c4-quyen-con-nguoi': 'quyen-cong-dan', 'c5-quoc-tich': 'quyen-cong-dan', 'c6-bau-cu': 'bau-cu', 'c7-quoc-hoi': 'lap-phap',
    'c8-chu-tich-nuoc': 'nguyen-thu', 'c9-chinh-phu': 'hanh-phap', 'c10-toa-an-vien-kiem-sat': 'tu-phap', 'c11-chinh-quyen-dia-phuong': 'dia-phuong',
    'nang-cao': 'kinh-te-tai-chinh',
  },
};
const SUBJECT_FIELD: Record<string, Field> = { 'chung-khoan': 'kinh-te-tai-chinh', 'lich-su-nn-pl': 'lich-su', 'hien-phap': 'hien-phap' };

/** Lĩnh vực của chương: theo bảng chương, không có thì theo môn, cuối cùng 'hien-phap'. */
export function fieldOf(subjectId: string, chapterId: string): Field {
  return CHAPTER_FIELD[subjectId]?.[chapterId] ?? SUBJECT_FIELD[subjectId] ?? 'hien-phap';
}
