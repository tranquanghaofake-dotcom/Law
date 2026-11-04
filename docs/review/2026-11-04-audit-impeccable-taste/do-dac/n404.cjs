const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist';
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.end(d)})});
(async()=>{await new Promise(r=>s.listen(0,r));const b=await chromium.launch();const pg=await b.newPage();pg.on('response',x=>{if(x.status()>=400)console.log(x.status(),x.url())});
for(const h of ['#/bo/dat-coc','#/hoc/hien-phap/hp-1','#/on']){await pg.goto(`http://localhost:${s.address().port}/${h}`);await pg.waitForTimeout(1200);}
await b.close();s.close()})();
