// Kiểu của storyboard.json — một file duy nhất mô tả cả video: khổ, nhạc, giao diện, danh sách cảnh.
// Mọi mốc thời gian TRONG cảnh tính bằng PHÁCH (beat) kể từ đầu cảnh; cảnh dài theo Ô NHỊP (bar = 4 phách).

export type FontKey = "be-vietnam-pro" | "noto-serif-display" | "inter" | "montserrat" | "lexend" | "playfair-display";

export type Theme = {
  ground: string; // nền chính
  ground2: string; // nền phụ (cảnh tương phản)
  ink: string; // chữ trên nền chính
  inkSoft: string; // chữ phụ
  accent: string; // màu nhấn — dùng dè xẻn: 1 chữ/cảnh, cú chốt, thẻ kết
  accent2: string; // màu nhấn phụ (trạng thái tốt, xác nhận)
  display: FontKey; // font tiêu đề
  ui: FontKey; // font chữ thường
  /** Trang trí bị CẤM mặc định (dấu hiệu video do máy tạo); chỉ bật khi chất liệu thương hiệu có thật. */
  decor?: { particles?: boolean; rays?: boolean; glow?: boolean };
};

export type Music = {
  bpm: number;
  /** Giây trong video nơi phách mạnh đầu tiên của bài rơi vào (thường 0 khi người đăng tự kéo nhạc cho khớp). */
  offsetSec: number;
  /** Độ dài một cụm nhạc (ô nhịp) và số phách bass tắt cuối cụm — lấy từ scripts/do_nhip.py, đừng đoán. */
  phraseBars: number;
  gapBeats: number;
  /** File nhạc trong public/ (đã có quyền dùng) — null nếu ghép nhạc trên nền tảng (TikTok/Reels). */
  file?: string | null;
  volume?: number;
};

export type Enter = "auto" | "cut" | "whip" | "flood" | "iris" | "zoom";

export type Media = { kind: "image" | "video"; src: string; alpha?: boolean };

export type Scene = {
  id: string;
  type: SceneType;
  bars: number;
  /** Cách vào cảnh; "auto": đầu cụm nhạc → nện (zoom), còn lại → whip. */
  enter?: Enter;
  /** "ground" | "ground2" | "dark" | "accent" | mã màu */
  bg?: string;
  props: Record<string, unknown>;
};

export type SceneType = "TitleSlam" | "LogoReveal" | "StatCount" | "KnowledgeCard" | "FeatureSteps" | "DeviceDemo" | "MediaHero" | "CardCycle" | "Ladder" | "LineReveal" | "EndCard";

export type Cue = { sfx: string; beat: number; volume?: number };

export type Storyboard = {
  title: string;
  format: { width: number; height: number; fps: number };
  music: Music;
  theme: Theme;
  scenes: Scene[];
  /** Hiệu ứng âm thanh theo phách tuyệt đối (public/sfx/<tên>.ogg); mỗi tiếng phải có nguyên nhân trên hình. */
  cues?: Cue[];
};
