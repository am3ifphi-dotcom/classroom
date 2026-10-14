// Produce a completely offline, file://-compatible HTML from Vite's build.
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('dist');let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mime={'.png':'image/png','.mp3':'audio/mpeg','.ogg':'audio/ogg','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml'};
const cache=new Map();function inline(url){let clean=url.replace(/^\//,'');if(cache.has(clean))return cache.get(clean);const file=path.join(root,clean);if(!fs.existsSync(file))return url;let type=mime[path.extname(clean)];if(!type)return url;const result=`data:${type};base64,${fs.readFileSync(file).toString('base64')}`;cache.set(clean,result);return result;}
html=html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,(_,url)=>{let css=fs.readFileSync(path.join(root,url.replace(/^\//,'')),'utf8');css=css.replace(/url\(([^)]+)\)/g,(_,u)=>{u=u.replace(/["']/g,'');const resolved=u.startsWith('/')?u:'/assets/'+u;return `url("${inline(resolved)}")`;});return '<style>'+css+'</style>';});
html=html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,url)=>{let js=fs.readFileSync(path.join(root,url.replace(/^\//,'')),'utf8');js=js.replace(/(["'])(\/assets\/[^"']+)\1/g,(_,q,u)=>q+inline(u)+q);return '<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>';});
html=html.replace(/(src|href)="(\/assets\/[^\"]+)"/g,(_,attr,url)=>`${attr}="${inline(url)}"`);
// All asset loading is inlined; no imports, service worker or local web server needed.
const out=process.argv[2]||'release/after-hours.html';fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,html);console.log(`Standalone HTML: ${out} (${(Buffer.byteLength(html)/1024/1024).toFixed(1)} MiB)`);
