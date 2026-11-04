// node spine-shot.cjs <nhãn>  → ảnh tủ sách Hồ sơ ở 390/1280 + bảng cỡ chữ gáy
const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml'};
const tag=process.argv[2]||'x', OUT=path.join(process.argv[3]??require('node:os').tmpdir(),'spine'); fs.mkdirSync(OUT,{recursive:true});
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.startsWith('/Law/'))p=p.slice(4);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream');r.end(d)})});
(async()=>{await new Promise(r=>s.listen(0,r));const U=`http://localhost:${s.address().port}/Law/`;const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM});const res={};
 for (const w of [390,1280]) { const p=await b.newPage({viewport:{width:w,height:900},deviceScaleFactor:2}); await p.goto(U+'#/toi'); await p.waitForSelector('.bk-case'); await p.waitForTimeout(1200);
  const el=await p.$('.bk-case'); await el.scrollIntoViewIfNeeded(); await el.screenshot({path:`${OUT}/${tag}-${w}.png`});
  res[w]=await p.evaluate(()=>[...document.querySelectorAll('.bk-name')].map(e=>{const r=e.getBoundingClientRect();return {t:e.textContent,fs:parseFloat(getComputedStyle(e).fontSize).toFixed(1),over:e.scrollHeight>e.clientHeight+1,sh:e.scrollHeight,ch:e.clientHeight,h:e.closest(".bk-spine").style.getPropertyValue("--h")}}));
  await p.close(); }
 fs.writeFileSync(`${OUT}/${tag}.json`,JSON.stringify(res,null,1)); console.log(JSON.stringify(res[390].map(x=>x.t+'='+x.fs+(x.over?'!':''))));
 await b.close(); s.close();})();
