// Biến thể màu của từng trang phục (look.tone chọn một dòng). Chỉ đổi màu vải/cà vạt, không đổi kiểu may.
// Thứ tự: [0] là màu gốc của GarmentFlat. Số dòng phải khớp TONES trong lib/game/looks.ts (có test).
export type Pal = { body: string; sleeve: string; shirt: string; tie: string | null };

export const TONE_PALETTES: Record<string, Partial<Pal>[]> = {
  'thuong-phuc': [{}, { body: '#9fb59a', sleeve: '#90a88b' }, { body: '#c9a07a', sleeve: '#bb9168' }, { body: '#a9c0d6', sleeve: '#9bb3cb' }],
  'cong-so': [{}, { body: '#d4e5f5', sleeve: '#c4d9ed', shirt: '#d4e5f5' }, { body: '#f3dcd8', sleeve: '#ead0cc', shirt: '#f3dcd8' }, { body: '#d6ecdf', sleeve: '#c6e0d2', shirt: '#d6ecdf' }],
  'vest-xanh': [{}, { body: '#3d6a63', sleeve: '#335a54', tie: '#c99a3a' }, { body: '#4a4f5a', sleeve: '#3f4450', tie: '#2f5d9a' }, { body: '#2b4f86', sleeve: '#244474', tie: '#a63a3a' }],
  'vest-den': [{}, { tie: '#c99a3a' }, { body: '#33343c', sleeve: '#2a2b33', tie: '#2f5d9a' }, { body: '#2b2630', sleeve: '#231f29', tie: '#6a3a7a' }, { body: '#3b2f2a', sleeve: '#322823', tie: '#2f7f78' }, { body: '#1f3a36', sleeve: '#19302d', tie: '#b3282d' }],
  'ao-choang': [{}, { body: '#1b2230', sleeve: '#151b27', tie: '#1b2230' }, { body: '#2b221e', sleeve: '#231b18', tie: '#2b221e' }],
  'ks-xuan-he': [{}, { body: '#8fb4de', sleeve: '#82a8d4' }, { body: '#c3d9ef', sleeve: '#b4cde8' }],
  'ks-thu-dong': [{}, { body: '#1f2f50', sleeve: '#1a2845', tie: '#1f2f50' }, { body: '#33466e', sleeve: '#2c3d62', tie: '#33466e' }],
  'ao-dai': [{}, { body: '#2f7f78', sleeve: '#296f69' }, { body: '#6a3f8c', sleeve: '#5c3579' }, { body: '#c8962b', sleeve: '#b58624' }, { body: '#2f5e9a', sleeve: '#285186' }],
  'ao-dai-nam': [{}, { body: '#7a2433', sleeve: '#6a1e2c' }, { body: '#b88a24', sleeve: '#a67a1e' }, { body: '#1f6f6a', sleeve: '#1a5f5a' }, { body: '#2a2b30', sleeve: '#222328' }],
  'tu-than': [{}, { body: '#7a3a30', sleeve: '#6a3028', shirt: '#f0c070' }, { body: '#9a7a4a', sleeve: '#8a6a3c', shirt: '#d98aa0' }],
  'ba-ba': [{}, { body: '#26262b', sleeve: '#1f1f24', shirt: '#26262b' }, { body: '#6a4a3a', sleeve: '#5c4032', shirt: '#6a4a3a' }, { body: '#4a6a5a', sleeve: '#3f5c4e', shirt: '#4a6a5a' }],
  'nhat-binh': [{}, { body: '#1f6f6a', sleeve: '#1a5f5a', tie: '#e2bf6a' }, { body: '#c8962b', sleeve: '#b58624', tie: '#8f1f2b' }, { body: '#5c3579', sleeve: '#4e2c69', tie: '#e2bf6a' }],
};

/** Phông bầu trời sau phông kiến trúc: gradient dọc từ trên xuống. */
export const SKY_GRADIENTS: Record<string, string> = {
  'ban-mai': 'linear-gradient(180deg, #fde9d2 0%, #fbf3e4 55%, #e9efe3 100%)',
  trua: 'linear-gradient(180deg, #d6e8f5 0%, #eef5f7 55%, #f4efe0 100%)',
  'hoang-hon': 'linear-gradient(180deg, #f6c99a 0%, #f7dcc0 45%, #efd2c4 100%)',
  dem: 'linear-gradient(180deg, #1b2447 0%, #34406e 60%, #4b4f7a 100%)',
};
