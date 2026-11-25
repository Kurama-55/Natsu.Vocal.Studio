const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,origin='https://natsu-vocal-studio.jp';
const pages=['index','lesson','pricing','instructor','about','voice','access','faq','trial','ai-support','tokushoho'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('公式11ページと総合リンクが検索可能で、正しい本番URLを示す',()=>{
 assert.equal(read('CNAME').trim(),'natsu-vocal-studio.jp');
 for(const file of [...pages.map(p=>p+'.html'),'links/index.html']){
  const h=read(file);assert(h.includes('name="viewport"'),file);assert(!/name="robots"[^>]*noindex/.test(h),file);
  assert(h.includes('name="description"'),file);assert(h.includes('rel="canonical" href="'+origin),file);
  assert(!/localhost|127\.0\.0\.1|\/Users\//.test(h),file);assert(h.includes('analytics.js'),file);
 }
 assert(read('robots.txt').includes('Sitemap: '+origin+'/sitemap.xml'));
 const s=JSON.parse(read('index.html').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(s.url,origin+'/');assert.equal(s.founder.name,'紅林奈津子');assert.equal(s.address.addressLocality,'浜松市中央区');
});
test('ページが参照する画像・内部リンク・CSS内素材がすべて存在する',()=>{
 const files=[...pages.map(p=>p+'.html'),'links/index.html'];
 for(const file of files){const h=read(file),base=new URL('/'+file,origin);
  for(const m of h.matchAll(/(?:src|href)="([^"]+)"/g)){
   const url=new URL(m[1].replaceAll('&amp;','&'),base);if(url.origin!==origin)continue;
   let local=path.join(root,decodeURIComponent(url.pathname));if(url.pathname.endsWith('/'))local=path.join(local,'index.html');
   assert(fs.existsSync(local),file+' missing '+url.pathname);
   if(url.hash&&/\.html$/.test(local)){const id=decodeURIComponent(url.hash.slice(1));assert(read(path.relative(root,local)).includes('id="'+id+'"'),file+' missing #'+id);}
  }
 }
 for(const name of fs.readdirSync(path.join(root,'brand')).filter(f=>f.endsWith('.css'))){const file='brand/'+name;for(const m of read(file).matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){if(/^(?:data:|https?:|\/\/)/.test(m[1]))continue;assert(fs.existsSync(path.resolve(root,'brand',m[1].split('?')[0])),file+' missing '+m[1]);}}
});
test('承認済みの料金・感想・FAQ・短いURLと公式用Clarityを保持する',()=>{
 for(const p of ['index','pricing','trial'])for(const price of ['8,000','14,000','19,500','24,000'])assert(read(p+'.html').split('<div class="pc-original">')[0].includes(price),p+' '+price);
 assert(read('ai-support.html').includes('22,000'));
 const voice=read('voice.html').split('<div class="pc-original">')[0];assert.equal((voice.match(/class="q-photo"/g)||[]).length,6);assert.equal((voice.match(/class="q-review"/g)||[]).length,7);
 assert.equal((read('faq.html').split('<div class="pc-original">')[0].match(/class="q-question"/g)||[]).length,17);
 for(const [file,sha] of Object.entries({'voice/index.html':'414e47c674b32dc911dc59bfe245620343edc2910567e6bcd6990c70fc0f36fe','ai/index.html':'c66773b8a185dd06834e72a5a94aa2aefd4eea6d1a27fa32aa3f45ac2fdb7da2','line/index.html':'1410609f4f8e73861134533b0a7420a4dc5f5aa2681e4fb513383c8236544e19'}))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),sha,file);
 assert(read('script.js').includes('zifepv8fl1'));assert(read('brand/analytics.js').includes('zifepv8fl1'));assert(!read('brand/analytics.js').includes('zgj8in7j7z'));
 assert(read('links/index.html').includes('https://www.dance-studio-seed.com/'));
});
test('PCとスマホで共通の発声の3場面、読みやすい表、ナツの活動への入口を保持する',()=>{
 const h=read('index.html');for(const asset of ['method-listen','method-exercise','method-song'])assert.equal((h.match(new RegExp('src="brand/clean-page/'+asset+'\\.webp"','g'))||[]).length,1,asset);
 assert(read('brand/clean-page.css').includes('.q-rates th[scope="row"]{background:#e2eff1}'));
 for(const p of pages)assert(read(p+'.html').includes('href="links/"'),p);
});
test('全ページがPC・スマホ共通の本文を使い、文字を焼き込んだ旧スマホ版へ戻らない',()=>{
 for(const p of pages){const h=read(p+'.html');assert(!h.includes('pc-original')&&!h.includes('brand/complete/')&&!h.includes('brand/lp/')&&!h.includes('brand/unified/'),p);assert.equal((h.match(/<h1[ >]/g)||[]).length,1,p);assert(!/イメージです/.test(h),p);}
});
