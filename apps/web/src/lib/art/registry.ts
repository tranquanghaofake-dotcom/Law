// Bảng tra tranh: môn → cảnh kiến trúc; trang → cảnh; bộ đề → tranh nhỏ theo đối tượng luật điều chỉnh.
export type ArtName = 'khue-van-cac' | 'quoc-hoi' | 'tam-quan' | 'chua-mot-cot' | 'ha-long' | 'ngo-mon' | 'toa-an' | 'sach-luat';
export type VignetteName = 'quan-he' | 'vi-pham' | 'dat-coc' | 'chuyen-khoan' | 'nghi-viec';

export const ART_NAMES: readonly ArtName[] = ['khue-van-cac', 'quoc-hoi', 'tam-quan', 'chua-mot-cot', 'ha-long', 'ngo-mon', 'toa-an', 'sach-luat'];
export const VIGNETTE_NAMES: readonly VignetteName[] = ['quan-he', 'vi-pham', 'dat-coc', 'chuyen-khoan', 'nghi-viec'];

const SUBJECT_ART: Record<string, ArtName> = {
  'hien-phap': 'quoc-hoi',
  'lich-su-nn-pl': 'ngo-mon',
  'chung-khoan': 'tam-quan',
};

/** Tranh đầu trang cho các màn ngoài môn (spec ngôn ngữ hình khối §2). */
export const PAGE_ART = {
  subjects: 'chua-mot-cot',
  quizzes: 'toa-an',
  concepts: 'sach-luat',
  profile: 'ngo-mon',
  done: 'ha-long',
  due: 'khue-van-cac',
} as const satisfies Record<string, ArtName>;

const SET_ART: Record<string, VignetteName> = {
  'pldc-quan-he-phap-luat': 'quan-he',
  'pldc-vi-pham-phap-luat': 'vi-pham',
  'dat-coc': 'dat-coc',
  'chuyen-khoan-nham': 'chuyen-khoan',
  'nghi-viec-giu-luong': 'nghi-viec',
};
const GROUP_ART: Record<string, VignetteName> = { pldc: 'quan-he', 'dan-su': 'dat-coc', 'lao-dong': 'nghi-viec', 'hinh-su': 'chuyen-khoan', 'hien-phap': 'quan-he' };

export function artFor(subjectId: string): ArtName {
  return SUBJECT_ART[subjectId] ?? 'tam-quan';
}

/** Tranh nhỏ cho bộ đề: theo id, không có thì theo nhóm, cuối cùng là "quan hệ pháp luật". */
export function vignetteFor(set: { id: string; group: string }): VignetteName {
  return SET_ART[set.id] ?? GROUP_ART[set.group] ?? 'quan-he';
}
