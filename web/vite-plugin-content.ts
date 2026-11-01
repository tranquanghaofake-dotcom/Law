// Phục vụ web/content/ tại /content/ khi dev/preview và copy vào dist/content khi build.
// (Vite chỉ có một publicDir = static/, còn nội dung giữ riêng để script kiểm tra và git diff gọn.)
import { cpSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import type { Plugin } from 'vite';

export function contentDir(dir = 'content'): Plugin {
  let root = process.cwd();
  let outDir = 'dist';
  let mount = '/content/';
  const serve = (server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? '').split('?')[0];
      if (!url.startsWith(mount)) return next();
      const rel = normalize(decodeURIComponent(url.slice(mount.length)));
      if (rel.includes('..')) return next();
      const file = join(root, dir, rel);
      if (!existsSync(file) || !statSync(file).isFile()) { res.statusCode = 404; res.end('Not found'); return; }
      res.setHeader('Content-Type', file.endsWith('.json') ? 'application/json; charset=utf-8' : 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(readFileSync(file));
    });
  };
  return {
    name: 'luyen-luat-content-dir',
    configResolved(c) { root = c.root; outDir = c.build.outDir; mount = `${c.base.replace(/\/$/, '')}/${dir}/`; },
    configureServer(server) { serve(server); },
    configurePreviewServer(server) { serve(server); },
    closeBundle() { cpSync(join(root, dir), join(root, outDir, dir.replace(/^\//, '')), { recursive: true }); },
  };
}
