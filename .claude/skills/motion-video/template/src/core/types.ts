// Kiểu của storyboard.json — một file duy nhất mô tả cả video: khổ, nhạc, giao diện, danh sách cảnh.
// Mọi mốc thời gian TRONG cảnh tính bằng PHÁCH (beat) kể từ đầu cảnh; cảnh dài theo Ô NHỊP (bar = 4 phách).
// Chế độ "clock": "voice": cảnh dài theo CÂU nói (`say`), mốc có thể là { "say": "a2:từ khoá", "add": phách } — xem giong.json.

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
  /** "Mắt cắt" ở đầu mỗi cụm nhạc bằng dấu thương hiệu (vd. { text: "§", color: "#b3261e" }): phủ khung rồi mở ra cảnh mới.
   *  Không đặt → đầu cụm chỉ có nện (zoom) + rung + tách màu chữ. */
  cutMark?: { text: string; color: string; ink?: string };
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

export type Enter = "auto" | "cut" | "curve" | "whip" | "flood" | "iris" | "zoom";

export type Media = { kind: "image" | "video"; src: string; alpha?: boolean };

/** Mốc theo lời (chế độ voice): "a2" = đầu câu a2 · "a2:đặt cọc" = lúc từ đó được nói · "đặt cọc" = tìm trong câu của cảnh. `add` = phách cộng thêm. */
export type Say = { say: string; add?: number };

export type Voice = {
  /** File giọng trong public/ (do scripts/canh_giong.py ghi: voice/voice.wav). */
  file: string;
  /** Giây giữ hình sau câu cuối (mặc định 1,5). */
  tailSec?: number;
  /** Giây im trước khi giọng bắt đầu (mặc định 0). */
  leadSec?: number;
  volume?: number;
};

export type Scene = {
  id: string;
  type: SceneType;
  /** Chế độ nhạc: độ dài cảnh (ô nhịp). */
  bars?: number;
  /** Chế độ voice: các id câu cảnh này nói (theo thứ tự); cảnh bắt đầu ở đầu câu đầu tiên, kéo tới cảnh sau. */
  say?: string[];
  /** Cách vào cảnh; "auto": đầu cụm nhạc → nện (zoom), còn lại → whip. */
  enter?: Enter;
  /** "ground" | "ground2" | "dark" | "accent" | mã màu */
  bg?: string;
  props: Record<string, unknown>;
};

export type SceneType = "TitleSlam" | "LogoReveal" | "StatCount" | "KnowledgeCard" | "FeatureSteps" | "DeviceDemo" | "MediaHero" | "CardCycle" | "CardMontage" | "Ladder" | "LineReveal" | "EndCard";

export type Cue = { sfx: string; beat?: number; at?: Say; volume?: number };

export type Storyboard = {
  title: string;
  /** "music" (mặc định): nhạc là đồng hồ, cảnh dài theo ô nhịp. "voice": giọng đọc là đồng hồ, cảnh dài theo câu nói. */
  clock?: "music" | "voice";
  voice?: Voice;
  format: { width: number; height: number; fps: number };
  music: Music;
  theme: Theme;
  scenes: Scene[];
  /** Hiệu ứng âm thanh theo phách tuyệt đối (public/sfx/<tên>.ogg); mỗi tiếng phải có nguyên nhân trên hình. */
  cues?: Cue[];
};
