const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html'; fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();} r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream'); r.end(d);});});
(async()=>{await new Promise(r=>s.listen(0,r)); const port=s.address().port; const b=await chromium.launch();
 for (const [n,h] of [['home','#/'],['subjects','#/mon'],['subject','#/mon/hien-phap'],['concepts-list','#/mon/hien-phap/khai-niem'],['quizzes','#/luyen-de']]) {
  const c=await b.newContext({viewport:{width:390,height:844}}); const p=await c.newPage(); const reqs=[]; let bytes=0;
  p.on('response',async r=>{const u=r.url(); if(u.includes('localhost')){reqs.push(u.replace(/.*localhost:\d+/,'')); try{bytes+=(await r.body()).length}catch{}}});
  const t=Date.now(); await p.goto(`http://localhost:${port}/${h}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(500);
  const json=reqs.filter(x=>x.includes('.json')).length; const js=reqs.filter(x=>x.endsWith('.js')).length;
  console.log(n,'reqs',reqs.length,'json',json,'js',js,'KB',Math.round(bytes/1024),'ms',Date.now()-t); await c.close();}
 await b.close(); s.close();})();
