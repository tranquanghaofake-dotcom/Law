// Phục vụ packages/content/dist tại <base>/content/ khi dev/preview và copy vào dist/content khi build.
// (Vite chỉ có một publicDir = static/; nội dung là workspace riêng nên không nằm trong app.)
import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize, resolve } from 'node:path';
import type { Plugin } from 'vite';

export type ContentDirOptions = {
  /** Thư mục nguồn tuyệt đối (packages/content/dist). */
  src: string;
  /** Tên đường dẫn public, mặc định 'content'. */
  mount?: string;
};

export function contentDir({ src, mount = 'content' }: ContentDirOptions): Plugin {
  let root = process.cwd();
  let outDir = 'dist';
  let prefix = `/${mount}/`;
  const serve = (server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!url.startsWith(prefix)) return next();
      const rel = normalize(decodeURIComponent(url.slice(prefix.length)));
      if (rel.includes('..')) return next();
      const file = join(src, rel);
      if (!existsSync(file) || !statSync(file).isFile()) { res.statusCode = 404; res.end('Not found'); return; }
      res.setHeader('Content-Type', file.endsWith('.json') ? 'application/json; charset=utf-8' : 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(readFileSync(file));
    });
  };
  return {
    name: 'luyen-luat-content-dir',
    configResolved(c) {
      root = c.root; outDir = c.build.outDir; prefix = `${c.base.replace(/\/$/, '')}/${mount}/`;
      if (!existsSync(join(src, 'index.json'))) c.logger.warn(`[content] Chưa có ${src}/index.json — chạy \`npm run content\` ở gốc repo.`);
    },
    configureServer(server) { serve(server); },
    configurePreviewServer(server) { serve(server); },
    closeBundle() { cpSync(src, resolve(root, outDir, mount), { recursive: true }); },
  };
}
