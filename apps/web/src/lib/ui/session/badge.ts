/**
 * Nhãn câu chốt (bước `meta.kind === 'boss'`). Phiên học đợt: tổng hợp đợt vừa học.
 * Phiên ôn: không có "đợt vừa học"; phiên ôn dưới 3 câu tính điểm thì câu cuối chẳng "chốt" gì → không gắn nhãn.
 */
export function bossBadge(isLesson: boolean, scoredSteps: number): string | null {
  if (isLesson) return 'Câu chốt · tổng hợp đợt vừa học';
  return scoredSteps >= 3 ? 'Câu chốt · cuối phiên ôn' : null;
}
