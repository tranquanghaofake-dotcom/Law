// Đo bố cục từng khung cho scripts/kiem_tra_bo_cuc.mjs — chỉ bật khi render với inputProps { probe: true }.
// Ghi một dòng console "MVPROBE {json}": hộp chữ, hộp ảnh/video đang thấy (toạ độ khung W×H), cỡ chữ thật.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { H, W } from "./timeline";

type Box = { x: number; y: number; w: number; h: number; t?: string; fs?: number; lh?: number; kind: "text" | "media" };

const visible = (el: Element) => {
  let o = 1;
  for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
    if ((n as HTMLElement).dataset?.probe === "skip") return 0;
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden") return 0;
    o *= parseFloat(cs.opacity || "1");
  }
  return o;
};

export const Probe: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = delayRender("probe");
    const go = () => {
      const root = ref.current!.getBoundingClientRect();
      const k = root.width / W;
      const rel = (r: DOMRect) => ({ x: (r.left - root.left) / k, y: (r.top - root.top) / k, w: r.width / k, h: r.height / k });
      const out: Box[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set<Element>();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        if (!el || seen.has(el) || !n.textContent?.trim() || el.closest("svg")) continue;
        seen.add(el);
        if (visible(el) < 0.5) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        // cỡ chữ thật trên khung = font-size × tỉ lệ biến đổi (scale của cảnh, của lớp nhịp)
        const he = el as HTMLElement;
        const sc = he.offsetWidth ? el.getBoundingClientRect().width / he.offsetWidth / k : 1;
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize) * sc;
        // chiều cao dòng thật: hộp range cao ~1,3 em (chừa chỗ dấu) nên hai dòng sát nhau luôn "chồng" nếu đo bằng hộp đó
        const lh = parseFloat(cs.lineHeight) * sc;
        out.push({ ...rel(r), t: n.textContent.trim().slice(0, 40), fs: Math.round(fs), lh: Number.isFinite(lh) ? Math.round(lh) : undefined, kind: "text" });
      }
      document.querySelectorAll("img,video,canvas").forEach((el) => {
        if (visible(el) < 0.5) return;
        const r = el.getBoundingClientRect();
        if (r.width > 4 && r.height > 4) out.push({ ...rel(r), kind: "media" });
      });
      console.log("MVPROBE " + JSON.stringify({ frame, W, H, boxes: out }));
      continueRender(h);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(() => requestAnimationFrame(go)));
  }, [frame]);
  return <AbsoluteFill ref={ref} style={{ pointerEvents: "none" }} />;
};
