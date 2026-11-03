/** Nhánh thăng chức người học đang theo (settings 'career'); trạng thái chức danh suy từ tủ sách (sách không tụt cấp nên chức không tụt). */
import { LuyenLuatDB } from '$lib/store/db';
import { BRANCHES, careerState, displayTitle, type Branch } from '$lib/game/career';
import { shelf } from './shelf.svelte';

const KEY = 'career';
export const career = $state<{ branch: Branch }>({ branch: 'hanh-phap' });

function db(): LuyenLuatDB | null { try { return typeof indexedDB === 'undefined' ? null : new LuyenLuatDB(); } catch { return null; } }

export async function loadCareer(): Promise<void> {
  try { const row = await db()?.settings.get(KEY); const b = (row?.value as { branch?: string } | undefined)?.branch; if (b && (BRANCHES as readonly string[]).includes(b)) career.branch = b as Branch; } catch { /* bỏ qua */ }
}
export async function setBranch(b: Branch): Promise<void> {
  career.branch = b;
  try { await db()?.settings.put({ key: KEY, value: { branch: b } }); } catch { /* bỏ qua */ }
}
/** Chức danh hiện tại (không phản ứng — dùng trong hàm). */
export function currentTitle(): string { return displayTitle(careerState(shelf.books), career.branch).title; }
loadCareer();
