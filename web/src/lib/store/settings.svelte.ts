import { LuyenLuatDB } from './db';

export type Settings = {
  sound: boolean;
  tts: boolean;
  reducedMotion: 'auto' | 'on' | 'off';
  retention: number;
  theme: 'auto' | 'light' | 'dark';
};

export const DEFAULT_SETTINGS: Settings = { sound: true, tts: true, reducedMotion: 'auto', retention: 0.9, theme: 'auto' };

export const settings: Settings = $state({ ...DEFAULT_SETTINGS });

let db: LuyenLuatDB | null = null;
function getDb(): LuyenLuatDB | null {
  if (typeof indexedDB === 'undefined') return null;
  try {
    db ??= new LuyenLuatDB();
    return db;
  } catch {
    return null;
  }
}

export async function loadSettings(): Promise<Settings> {
  const d = getDb();
  if (!d) return settings;
  try {
    const rows = await d.settings.toArray();
    for (const r of rows) if (r.key in DEFAULT_SETTINGS) (settings as Record<string, unknown>)[r.key] = r.value;
  } catch { /* chế độ riêng tư: dùng mặc định */ }
  return settings;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  settings[key] = value;
  const d = getDb();
  if (!d) return;
  try { await d.settings.put({ key, value }); } catch { /* bỏ qua */ }
}
