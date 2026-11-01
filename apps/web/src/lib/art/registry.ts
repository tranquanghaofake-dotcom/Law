// Bảng tra tranh: môn → cảnh kiến trúc; trang → cảnh; bộ đề → tranh nhỏ theo đối tượng luật điều chỉnh.
export type ArtName = 'khue-van-cac' | 'quoc-hoi' | 'tam-quan' | 'chua-mot-cot' | 'ha-long' | 'ngo-mon' | 'toa-an' | 'sach-luat' | 'san-giao-dich' | 'bia-tien-si';
export type VignetteName = 'quan-he' | 'vi-pham' | 'dat-coc' | 'chuyen-khoan' | 'nghi-viec';

export const ART_NAMES: readonly ArtName[] = ['khue-van-cac', 'quoc-hoi', 'tam-quan', 'chua-mot-cot', 'ha-long', 'ngo-mon', 'toa-an', 'sach-luat', 'san-giao-dich', 'bia-tien-si'];
export const VIGNETTE_NAMES: readonly VignetteName[] = ['quan-he', 'vi-pham', 'dat-coc', 'chuyen-khoan', 'nghi-viec'];

const SUBJECT_ART: Record<string, ArtName> = {
  'hien-phap': 'quoc-hoi',
  'lich-su-nn-pl': 'bia-tien-si',
  'chung-khoan': 'san-giao-dich',
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

/** Huy hiệu chương (biểu tượng nội dung chương trong vành trống đồng nhỏ). */
export type EmblemName =
  | 'sach' | 'sach-hp' | 'cuon-lap-hien' | 'cot-tru' | 'quyen-nguoi' | 'ho-chieu' | 'hom-phieu' | 'nghi-truong' | 'an-trien' | 'tru-so' | 'can-can' | 'lang-xa' | 'kinh-te'
  | 'nen' | 'co-phieu' | 'bang-dien' | 'luu-ky' | 'van-phong' | 'quy' | 'kinh-lup' | 'bat-tay'
  | 'trong-dong' | 'bia-rua' | 'bo-luat-cu' | 'sac-lenh';
export const EMBLEM_NAMES: readonly EmblemName[] = ['sach', 'sach-hp', 'cuon-lap-hien', 'cot-tru', 'quyen-nguoi', 'ho-chieu', 'hom-phieu', 'nghi-truong', 'an-trien', 'tru-so', 'can-can', 'lang-xa', 'kinh-te', 'nen', 'co-phieu', 'bang-dien', 'luu-ky', 'van-phong', 'quy', 'kinh-lup', 'bat-tay', 'trong-dong', 'bia-rua', 'bo-luat-cu', 'sac-lenh'];

const CHAPTER_EMBLEM: Record<string, Record<string, EmblemName>> = {
  'hien-phap': {
    'c1-nhung-van-de-chung': 'sach-hp', 'c2-khai-niem-dac-trung': 'cuon-lap-hien', 'c3-che-do-chinh-tri': 'cot-tru', 'c4-quyen-con-nguoi': 'quyen-nguoi',
    'c5-quoc-tich': 'ho-chieu', 'c6-bau-cu': 'hom-phieu', 'c7-quoc-hoi': 'nghi-truong', 'c8-chu-tich-nuoc': 'an-trien', 'c9-chinh-phu': 'tru-so',
    'c10-toa-an-vien-kiem-sat': 'can-can', 'c11-chinh-quyen-dia-phuong': 'lang-xa', 'nang-cao': 'kinh-te',
  },
  'chung-khoan': {
    'c1-khai-niem': 'nen', 'c2-chao-ban': 'co-phieu', 'c3-thi-truong-giao-dich': 'bang-dien', 'c4-dang-ky-luu-ky': 'luu-ky', 'c5-cong-ty-chung-khoan': 'van-phong',
    'c6-quy-dau-tu': 'quy', 'c7-quan-ly-quy-giam-sat': 'kinh-lup', 'c8-kinh-doanh-chung-khoan': 'bat-tay', 'c9-quan-ly-nha-nuoc': 'tru-so', 'c10-xu-ly-vi-pham': 'can-can',
  },
  'lich-su-nn-pl': { 'c5-co-dai': 'trong-dong', 'c6-trung-dai': 'bia-rua', 'c7-can-dai': 'bo-luat-cu', 'c8-hien-dai': 'sac-lenh' },
};

/** Huy hiệu cho chương; chương chưa khai báo dùng hình cuốn sách. */
export function emblemFor(subjectId: string, chapterId: string): EmblemName {
  return CHAPTER_EMBLEM[subjectId]?.[chapterId] ?? 'sach';
}
