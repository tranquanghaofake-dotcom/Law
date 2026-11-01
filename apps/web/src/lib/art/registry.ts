// Bảng tra: môn nào dùng hình kiến trúc nào. Môn chưa có hình riêng dùng cổng tam quan.
export type ArtName = 'khue-van-cac' | 'quoc-hoi' | 'tam-quan';

const SUBJECT_ART: Record<string, ArtName> = {
  'hien-phap': 'quoc-hoi',
};

export function artFor(subjectId: string): ArtName {
  return SUBJECT_ART[subjectId] ?? 'tam-quan';
}
