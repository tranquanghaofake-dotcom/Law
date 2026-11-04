const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream');r.end(d)})});
(async()=>{await new Promise(r=>s.listen(0,r));const U=`http://localhost:${s.address().port}/`;const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out={};
 const ctx=await b.newContext({serviceWorkers:'block'});const p=await ctx.newPage();const reqs=[];p.on('request',r=>{if(r.url().startsWith(U))reqs.push(r.url().replace(U,'/'))});
 const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
 await p.goto(U+'#/mon/hien-phap/khai-niem');await p.waitForSelector('.entry-toggle');await p.waitForTimeout(800);
 out.localReq=reqs.length; out.json=reqs.filter(x=>x.endsWith('.json')).length; out.bundle=reqs.filter(x=>x.includes('bundles/'));
 out.entries=await p.evaluate(()=>document.querySelectorAll('.entry-toggle').length);
 out.total=await p.evaluate(()=>document.querySelector('header p.muted')?.textContent.trim().slice(0,30));
 // mở lesson sau trang khái niệm: khái niệm lấy từ bộ nhớ
 const before=reqs.length; await p.goto(U+'#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan');await p.waitForTimeout(800); out.deep=await p.evaluate(()=>document.activeElement.className);
 const f=fs.readFileSync(ROOT+'/content/bundles/hien-phap.json'); out.bundleKB={raw:Math.round(f.length/1024),gzip:Math.round(zlib.gzipSync(f).length/1024)};
 out.bad=bad; console.log(JSON.stringify(out,null,1)); await b.close(); s.close();})();
