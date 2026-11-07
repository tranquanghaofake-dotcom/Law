// Bảng tra tranh: môn → cảnh kiến trúc; trang → cảnh; bộ đề → tranh nhỏ theo chủ đề; chương → huy hiệu nội dung.
// Giới hạn lặp (test tests/ui/registry*.test.ts): một cảnh ≤ 2 môn, một tranh nhỏ ≤ 3 bộ đề, huy hiệu không trùng trong một môn.
export type ArtName =
  | 'khue-van-cac' | 'quoc-hoi' | 'tam-quan' | 'chua-mot-cot' | 'ha-long' | 'ngo-mon' | 'toa-an' | 'sach-luat' | 'san-giao-dich' | 'bia-tien-si'
  | 'tru-so-xa' | 'tru-so-tinh' | 'tru-so-bo' | 'vien-kiem-sat' | 'phu-chu-tich'
  | 'nha-lang' | 'hop-dong' | 'cang-bien' | 'pho-hang' | 'nha-may' | 'san-bay' | 'ruong-lua' | 'hoi-an' | 'thien-mu' | 'ruong-bac-thang' | 'nha-hat-lon' | 'dinh-lang' | 'toa-ngan-hang' | 'ngan-sach' | 'tri-tue' | 'phap-dinh' | 'che-cho' | 'cuon-van-ban';
export type VignetteName =
  | 'quan-he' | 'vi-pham' | 'dat-coc' | 'chuyen-khoan' | 'nghi-viec'
  | 'nha-nuoc' | 'thu-tuc' | 'thua-ke' | 'boi-thuong' | 'toi-pham' | 'lao-dong-dac-thu' | 'thua-dat' | 'du-an' | 'ngan-sach-thue' | 'von-dn' | 'canh-tranh' | 'ban-quyen' | 'nhan-hieu'
  | 'bao-hiem' | 'doanh-nghiep' | 'mua-ban' | 'khoi-kien' | 'van-ban';

export const ART_CORE: readonly ArtName[] = ['khue-van-cac', 'tam-quan', 'chua-mot-cot', 'ha-long', 'ngo-mon', 'toa-an', 'sach-luat', 'san-giao-dich', 'bia-tien-si'];
/** Năm phông Việt Nam đợt 8 (vẽ trong ScenesVN.svelte). */
export const ART_VN: readonly ArtName[] = ['hoi-an', 'thien-mu', 'ruong-bac-thang', 'nha-hat-lon', 'dinh-lang'];
/** Cảnh bổ sung (đợt 6) — nạp lười trong ScenesMore.svelte. */
/** Năm phông nơi làm việc đợt 10 (vẽ trong ScenesCongSo.svelte) — chỉ dùng cho tủ trưng bày sự nghiệp. */
export const ART_CS: readonly ArtName[] = ['tru-so-xa', 'tru-so-tinh', 'tru-so-bo', 'vien-kiem-sat', 'phu-chu-tich'];
export const ART_MORE: readonly ArtName[] = ['quoc-hoi', 'nha-lang', 'hop-dong', 'cang-bien', 'pho-hang', 'nha-may', 'san-bay', 'ruong-lua', 'toa-ngan-hang', 'ngan-sach', 'tri-tue', 'phap-dinh', 'che-cho', 'cuon-van-ban', ...ART_VN, ...ART_CS];
export const ART_NAMES: readonly ArtName[] = [...ART_CORE, ...ART_MORE];
export const VIGNETTE_CORE: readonly VignetteName[] = ['quan-he', 'vi-pham', 'dat-coc', 'chuyen-khoan', 'nghi-viec'];
export const VIGNETTE_MORE: readonly VignetteName[] = ['nha-nuoc', 'thu-tuc', 'thua-ke', 'boi-thuong', 'toi-pham', 'lao-dong-dac-thu', 'thua-dat', 'du-an', 'ngan-sach-thue', 'von-dn', 'canh-tranh', 'ban-quyen', 'nhan-hieu', 'bao-hiem', 'doanh-nghiep', 'mua-ban', 'khoi-kien', 'van-ban'];
export const VIGNETTE_NAMES: readonly VignetteName[] = [...VIGNETTE_CORE, ...VIGNETTE_MORE];

/** Cảnh đầu trang của từng môn (24 môn); mỗi cảnh ≤ 2 môn. */
export const SUBJECT_ART: Record<string, ArtName> = {
  'hien-phap': 'quoc-hoi', 'lich-su-nn-pl': 'bia-tien-si', 'chung-khoan': 'san-giao-dich',
  'ly-luan-nn-pl': 'tam-quan', 'hanh-chinh': 'ngo-mon', 'to-tung-dan-su': 'toa-an', 'to-tung-hanh-chinh': 'toa-an',
  'dan-su': 'nha-lang', 'hon-nhan-gia-dinh': 'nha-lang', 'dan-su-2': 'hop-dong', 'thuong-mai': 'cang-bien', 'thuong-mai-1': 'pho-hang', 'canh-tranh': 'pho-hang',
  'lao-dong': 'nha-may', 'dau-tu': 'nha-may', 'lao-dong-2': 'san-bay', 'dat-dai': 'ruong-lua',
  'ngan-hang': 'toa-ngan-hang', 'tai-chinh-doanh-nghiep': 'toa-ngan-hang', 'tai-chinh': 'ngan-sach',
  'so-huu-tri-tue': 'tri-tue', 'tai-san-tri-tue': 'tri-tue', 'hinh-su': 'phap-dinh', 'an-sinh-xa-hoi': 'che-cho', 'xay-dung-vbpl': 'cuon-van-ban',
};

/** Tranh đầu trang cho các màn ngoài môn (spec ngôn ngữ hình khối §2). */
export const PAGE_ART = {
  subjects: 'chua-mot-cot',
  quizzes: 'toa-an',
  concepts: 'sach-luat',
  profile: 'ngo-mon',
  done: 'ha-long',
  due: 'khue-van-cac',
  notfound: 'tam-quan',
} as const satisfies Record<string, ArtName>;

/** Tranh nhỏ của từng bộ đề (47 bộ → 23 tranh, mỗi tranh ≤ 3 bộ). Bộ mới chưa khai báo rơi về nhóm rồi "quan hệ pháp luật". */
export const SET_ART: Record<string, VignetteName> = {
  'pldc-quan-he-phap-luat': 'quan-he', 'ly-luan-nn-pl-de-2': 'quan-he', 'dan-su-de-1': 'quan-he',
  'pldc-vi-pham-phap-luat': 'vi-pham', 'hanh-chinh-de-1': 'vi-pham',
  'dat-coc': 'dat-coc', 'dan-su-2-de-1': 'dat-coc',
  'chuyen-khoan-nham': 'chuyen-khoan', 'ngan-hang-de-2': 'chuyen-khoan', 'ngan-hang-de-1': 'chuyen-khoan',
  'nghi-viec-giu-luong': 'nghi-viec', 'lao-dong-de-1': 'nghi-viec', 'lao-dong-de-2': 'nghi-viec',
  'ly-luan-nn-pl-de-1': 'nha-nuoc',
  'hanh-chinh-de-2': 'thu-tuc', 'hanh-chinh-de-3': 'thu-tuc',
  'dan-su-de-2': 'thua-ke', 'dan-su-2-de-2': 'boi-thuong',
  'hinh-su-de-1': 'toi-pham', 'hinh-su-de-2': 'toi-pham',
  'lao-dong-2-de-1': 'lao-dong-dac-thu', 'lao-dong-2-de-2': 'lao-dong-dac-thu',
  'dat-dai-de-1': 'thua-dat', 'dat-dai-de-2': 'thua-dat',
  'dau-tu-de-1': 'du-an', 'dau-tu-de-2': 'du-an',
  'tai-chinh-de-1': 'ngan-sach-thue', 'tai-chinh-de-2': 'ngan-sach-thue',
  'tai-chinh-doanh-nghiep-de-1': 'von-dn', 'tai-chinh-doanh-nghiep-de-2': 'von-dn',
  'canh-tranh-de-1': 'canh-tranh', 'canh-tranh-de-2': 'canh-tranh',
  'so-huu-tri-tue-de-1': 'ban-quyen', 'tai-san-tri-tue-de-1': 'ban-quyen',
  'so-huu-tri-tue-de-2': 'nhan-hieu', 'tai-san-tri-tue-de-2': 'nhan-hieu',
  'an-sinh-xa-hoi-de-1': 'bao-hiem', 'an-sinh-xa-hoi-de-2': 'bao-hiem',
  'thuong-mai-1-de-1': 'doanh-nghiep', 'thuong-mai-1-de-2': 'doanh-nghiep', 'thuong-mai-1-de-3': 'doanh-nghiep',
  'thuong-mai-de-1': 'mua-ban', 'thuong-mai-de-2': 'mua-ban',
  'to-tung-dan-su-de-1': 'khoi-kien', 'to-tung-dan-su-de-2': 'khoi-kien',
  'xay-dung-vbpl-de-1': 'van-ban', 'xay-dung-vbpl-de-2': 'van-ban',
};
const GROUP_ART: Record<string, VignetteName> = { pldc: 'quan-he', 'dan-su': 'dat-coc', 'lao-dong': 'nghi-viec', 'hinh-su': 'toi-pham', 'hien-phap': 'quan-he', 'hanh-chinh': 'thu-tuc', 'dat-dai': 'thua-dat', 'dau-tu': 'du-an', 'ngan-hang': 'chuyen-khoan' };

export function artFor(subjectId: string): ArtName {
  return SUBJECT_ART[subjectId] ?? 'tam-quan';
}

/** Môn có cảnh vẽ riêng (khác cổng tam quan mặc định); nay đủ 23 môn. */
export const hasOwnArt = (subjectId: string): boolean => subjectId in SUBJECT_ART;

/** Tranh nhỏ cho bộ đề: theo id, không có thì theo nhóm, cuối cùng là "quan hệ pháp luật". */
export function vignetteFor(set: { id: string; group: string }): VignetteName {
  return SET_ART[set.id] ?? GROUP_ART[set.group] ?? 'quan-he';
}

/** Huy hiệu chương (biểu tượng nội dung chương trong vành trống đồng nhỏ). */
export type EmblemName =
  | 'sach' | 'sach-hp' | 'cuon-lap-hien' | 'cot-tru' | 'quyen-nguoi' | 'ho-chieu' | 'hom-phieu' | 'nghi-truong' | 'an-trien' | 'tru-so' | 'can-can' | 'lang-xa' | 'kinh-te'
  | 'nen' | 'co-phieu' | 'bang-dien' | 'luu-ky' | 'van-phong' | 'quy' | 'kinh-lup' | 'bat-tay'
  | 'trong-dong' | 'bia-rua' | 'bo-luat-cu' | 'sac-lenh'
  | 'nguoi' | 'nhom-nguoi' | 'nha' | 'chia-khoa' | 'hop-dong' | 'dong-xu' | 'khien' | 'khoa' | 'dong-ho' | 'lich' | 'di-chuc' | 'gia-pha' | 'ho-so' | 'cong-tay' | 'canh-bao' | 'thu-tuc' | 'bien-ban'
  | 'con-dau' | 'the-id' | 'mu-bao-ho' | 'bao-hiem' | 'y-te' | 'tre-em' | 'nu' | 'may-bay' | 'tau' | 'nha-may' | 'ruong' | 'thue' | 'bieu-do' | 'bong-den' | 'ban-quyen' | 'nhan-hieu' | 'giong-cay'
  | 'ban-do' | 'loa' | 'vuong-mien' | 'sap-nhap' | 'mat-na' | 'huan-chuong' | 'trai-tim' | 'tui-do' | 'tranh-chap' | 'quy-trinh' | 'but-long' | 'dieu-luat' | 'xich' | 'cay' | 'muc-tieu' | 'khoi' | 'ngoai-te' | 'pha-san' | 'cam';
export const EMBLEM_CORE: readonly EmblemName[] = ['sach', 'sach-hp', 'cuon-lap-hien', 'cot-tru', 'quyen-nguoi', 'ho-chieu', 'hom-phieu', 'nghi-truong', 'an-trien', 'tru-so', 'can-can', 'lang-xa', 'kinh-te', 'nen', 'co-phieu', 'bang-dien', 'luu-ky', 'van-phong', 'quy', 'kinh-lup', 'bat-tay', 'trong-dong', 'bia-rua', 'bo-luat-cu', 'sac-lenh'];
/** Huy hiệu bổ sung (đợt 6) — nạp lười trong EmblemMore.svelte. */
export const EMBLEM_MORE: readonly EmblemName[] = ['nguoi', 'nhom-nguoi', 'nha', 'chia-khoa', 'hop-dong', 'dong-xu', 'khien', 'khoa', 'dong-ho', 'lich', 'di-chuc', 'gia-pha', 'ho-so', 'cong-tay', 'canh-bao', 'thu-tuc', 'bien-ban', 'con-dau', 'the-id', 'mu-bao-ho', 'bao-hiem', 'y-te', 'tre-em', 'nu', 'may-bay', 'tau', 'nha-may', 'ruong', 'thue', 'bieu-do', 'bong-den', 'ban-quyen', 'nhan-hieu', 'giong-cay', 'ban-do', 'loa', 'vuong-mien', 'sap-nhap', 'mat-na', 'huan-chuong', 'trai-tim', 'tui-do', 'tranh-chap', 'quy-trinh', 'but-long', 'dieu-luat', 'xich', 'cay', 'muc-tieu', 'khoi', 'ngoai-te', 'pha-san', 'cam'];
export const EMBLEM_NAMES: readonly EmblemName[] = [...EMBLEM_CORE, ...EMBLEM_MORE];

/** Môn đánh số "vN" theo thứ tự chương: ghi gọn thành danh sách tên huy hiệu theo thứ tự. */
const V = (names: EmblemName[]): Record<string, EmblemName> => Object.fromEntries(names.map((n, i) => [`v${i + 1}`, n]));

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
  'to-tung-hanh-chinh': {
    'c1-doi-tuong': 'ho-so', 'c2-tham-quyen': 'tru-so', 'c3-nguoi-tham-gia': 'nhom-nguoi', 'c4-chung-cu': 'kinh-lup', 'c5-khoi-kien': 'thu-tuc', 'c6-xet-xu': 'can-can', 'c7-xem-xet-lai': 'bien-ban',
  },
  'hon-nhan-gia-dinh': {
    'c1-khai-quat': 'gia-pha', 'c2-ket-hon': 'trai-tim', 'c3-tai-san-vo-chong': 'dong-xu', 'c4-ly-hon': 'can-can', 'c5-cha-me-con': 'tre-em', 'c6-cap-duong': 'tui-do',
  },
  'lich-su-nn-pl': { 'c5-co-dai': 'trong-dong', 'c6-trung-dai': 'bia-rua', 'c7-can-dai': 'bo-luat-cu', 'c8-hien-dai': 'sac-lenh' },
  'an-sinh-xa-hoi': V(['bao-hiem', 'quy', 'tui-do', 'y-te', 'huan-chuong', 'trai-tim']),
  'canh-tranh': V(['bieu-do', 'kinh-lup', 'bat-tay', 'vuong-mien', 'sap-nhap', 'mat-na', 'ho-so']),
  'dan-su': V(['sach', 'nguoi', 'nhom-nguoi', 'hop-dong', 'lich', 'dong-xu', 'chia-khoa', 'nha', 'khoa', 'khien', 'gia-pha', 'di-chuc', 'can-can']),
  'dan-su-2': V(['xich', 'dong-ho', 'khien', 'khoa', 'hop-dong', 'dong-xu', 'chia-khoa', 'nha', 'tui-do', 'canh-bao', 'can-can', 'nguoi', 'cay']),
  'dat-dai': V(['sach', 'ban-do', 'ruong', 'con-dau', 'dong-xu', 'nguoi', 'giong-cay', 'tranh-chap']),
  'dau-tu': V(['bieu-do', 'khien', 'thu-tuc', 'tru-so', 'hop-dong', 'nha-may', 'may-bay']),
  'hanh-chinh': V(['tru-so', 'sach', 'cuon-lap-hien', 'cot-tru', 'quy-trinh', 'thu-tuc', 'an-trien', 'lang-xa', 'the-id', 'nhom-nguoi', 'ho-chieu', 'cam', 'bien-ban', 'cong-tay', 'khien']),
  'hinh-su': V(['sach', 'ban-do', 'canh-bao', 'khoi', 'muc-tieu', 'bien-ban', 'nguoi', 'bong-den', 'quy-trinh', 'nhom-nguoi', 'khien', 'ho-so', 'can-can', 'khoa', 'tre-em']),
  'lao-dong-2': V(['bat-tay', 'nu', 'nha', 'ho-chieu', 'may-bay']),
  'lao-dong': V(['sach', 'bat-tay', 'hop-dong', 'nhom-nguoi', 'cuon-lap-hien', 'mu-bao-ho', 'canh-bao', 'tranh-chap', 'loa']),
  'ly-luan-nn-pl': V(['vuong-mien', 'ban-do', 'cot-tru', 'sach', 'dieu-luat', 'bat-tay', 'ho-so', 'canh-bao']),
  'ngan-hang': V(['sach', 'an-trien', 'tru-so', 'quy', 'dong-xu', 'the-id', 'ngoai-te']),
  'so-huu-tri-tue': V(['sach', 'but-long', 'ban-quyen', 'loa', 'hop-dong', 'canh-bao', 'bong-den', 'nhan-hieu', 'ban-do', 'con-dau', 'chia-khoa', 'cam', 'giong-cay', 'khien']),
  'tai-chinh-doanh-nghiep': V(['sach', 'dong-xu', 'bieu-do', 'kinh-lup', 'sap-nhap']),
  'tai-chinh': V(['sach', 'quy-trinh', 'but-long', 'thu-tuc', 'quy', 'thue', 'tau', 'canh-bao', 'bieu-do', 'tui-do', 'nha', 'dong-xu', 'kinh-lup']),
  'tai-san-tri-tue': V(['bong-den', 'quy-trinh', 'dong-xu', 'bat-tay', 'khien']),
  'thuong-mai-1': V(['tui-do', 'nha', 'bat-tay', 'nhom-nguoi', 'co-phieu', 'thu-tuc', 'tru-so', 'sap-nhap', 'nha-may', 'gia-pha', 'ruong', 'pha-san', 'ho-so']),
  'thuong-mai': V(['tui-do', 'bat-tay', 'loa', 'tau', 'ho-so', 'canh-bao', 'tranh-chap', 'can-can']),
  'to-tung-dan-su': V(['sach', 'tru-so', 'nhom-nguoi', 'kinh-lup', 'dong-ho', 'dong-xu', 'ho-so', 'quy-trinh', 'dieu-luat']),
  'xay-dung-vbpl': V(['cuon-lap-hien', 'quy-trinh', 'but-long', 'bien-ban', 'an-trien', 'kinh-lup']),
};

/** Huy hiệu cho chương; chương chưa khai báo dùng hình cuốn sách. */
export function emblemFor(subjectId: string, chapterId: string): EmblemName {
  return CHAPTER_EMBLEM[subjectId]?.[chapterId] ?? 'sach';
}
