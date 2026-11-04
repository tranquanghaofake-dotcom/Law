const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/')p='/index.html'; fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();} r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream'); r.end(d);});});
(async()=>{await new Promise(r=>s.listen(0,r)); const port=s.address().port; const b=await chromium.launch();
 for (const [n,h] of [['home','#/'],['concepts-list','#/mon/hien-phap/khai-niem']]) {
  const c=await b.newContext({viewport:{width:390,height:844}}); const p=await c.newPage(); const all=[];
  p.on('request',r=>all.push(r.url())); await p.goto(`http://localhost:${port}/${h}`); await p.waitForLoadState('networkidle'); await p.waitForTimeout(800);
  const loc=all.filter(u=>u.includes('localhost')), ext=all.length-loc.length;
  console.log(n,'tong',all.length,'localhost',loc.length,'json',loc.filter(u=>u.includes('.json')).length,'ngoai(font)',ext,'SW',await p.evaluate(()=>navigator.serviceWorker&&navigator.serviceWorker.controller?'co':'khong')); await c.close();}
 await b.close(); s.close();})();
