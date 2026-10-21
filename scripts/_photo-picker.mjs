import { readFileSync, writeFileSync } from "fs";

const jobs = JSON.parse(readFileSync("content/_photo-matches.json", "utf8"));
const services = [...new Set(jobs.map((d) => d.service))].sort();
const totalPairs = jobs.reduce((n, j) => n + j.pairs.length, 0);

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Before / After matched pairs — ${totalPairs} suggestions</title>
<style>
 body{font-family:Segoe UI,Arial,sans-serif;margin:0;background:#0d1b2e;color:#eee;padding-bottom:300px}
 header{position:sticky;top:0;background:#0d1b2e;padding:12px 20px;border-bottom:1px solid #2a3b55;z-index:10}
 h1{font-size:16px;margin:0 0 8px}
 h1 small{color:#8fa1bd;font-weight:400}
 header button{margin:2px;padding:6px 12px;border-radius:999px;border:1px solid #3b5277;background:#16263e;color:#dce6f5;cursor:pointer;font-size:12px}
 header button:hover,header button.on{background:#1766d9}
 .job{padding:14px 20px;border-bottom:1px solid #22314a}
 .job h2{font-size:13px;color:#9fc1f0;font-weight:600;margin:0 0 10px}
 .job h2 .svc{background:#1766d9;color:#fff;border-radius:999px;padding:2px 10px;margin-right:8px;font-size:11px;text-transform:uppercase}
 .grid{display:flex;flex-wrap:wrap;gap:14px}
 .pair{background:#121f33;border:1px solid #2a3b55;border-radius:10px;padding:8px;width:300px}
 .pair.kept{border-color:#2ecc71;box-shadow:0 0 0 2px #2ecc7144}
 .cmp{position:relative;width:284px;height:190px;border-radius:6px;overflow:hidden;user-select:none}
 .cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
 .cmp .top{clip-path:inset(0 50% 0 0)}
 .cmp .bar{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;box-shadow:0 0 6px #000;pointer-events:none}
 .cmp .knob{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#1766d9;color:#fff;border-radius:50%;width:30px;height:30px;text-align:center;line-height:30px;font-size:14px;pointer-events:none}
 .cmp .tag{position:absolute;top:6px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;pointer-events:none}
 .cmp .tagB{left:6px;background:#7a2d2ddd;color:#ffd7d7}
 .cmp .tagA{right:6px;background:#1e6b40dd;color:#d3ffe4}
 .cmp input[type=range]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
 .meta{font-size:10px;margin-top:6px;line-height:1.5;color:#aab7cc}
 .meta code{color:#ffd98a}
 .match{font-weight:700}
 .m-very{color:#7de8a8}.m-close{color:#ffd98a}.m-loose{color:#ff9d9d}
 .pair .keep{margin-top:6px;background:#1766d9;color:#fff;border:0;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer}
 .pair.kept .keep{background:#1e6b40}
 #tray{position:fixed;bottom:0;left:0;right:0;background:#09141f;border-top:2px solid #1766d9;padding:10px 20px;z-index:20;max-height:280px;overflow:auto}
 #tray h2{font-size:13px;margin:0 0 8px;color:#9fc1f0;display:inline-block}
 #copy{background:#1766d9;color:#fff;border:0;border-radius:999px;padding:8px 18px;font-weight:700;cursor:pointer;margin-left:12px}
 #picked{font-size:11px;line-height:1.7}
 #picked code{color:#ffd98a}
 #picked button{background:#7a2d2d;color:#fff;border:0;border-radius:4px;font-size:10px;cursor:pointer;margin-left:8px}
 #out{width:100%;margin-top:8px;background:#0d1b2e;color:#cfe0f5;border:1px solid #2a3b55;border-radius:6px;font-size:11px;display:none}
 .hint{color:#8fa1bd;font-size:12px}
</style></head><body>
<header>
 <h1>Matched before / after pairs — ${totalPairs} suggestions in ${jobs.length} jobs.
 <small>Each card is one suggested pair of the SAME scene (closest visual match first). Drag across the photo to compare. Click KEEP on the ones you want, then "Copy my picks".</small></h1>
 <button class="on" onclick="filter('',this)">ALL</button>
 ${services.map((s) => `<button onclick="filter('${s}',this)">${s}</button>`).join(" ")}
</header>
<div id="list"></div>
<div id="tray">
 <h2>Kept pairs (<span id="n">0</span>)</h2><button id="copy" onclick="copyPicks()">Copy my picks</button>
 <div class="hint" id="hint">Nothing kept yet. Click KEEP on a pair above.</div>
 <div id="picked"></div>
 <textarea id="out" rows="5" readonly></textarea>
</div>
<script>
const DATA=${JSON.stringify(jobs)};
let kept=JSON.parse(localStorage.getItem('kept2')||'[]');
const list=document.getElementById('list');
function matchLabel(s){return s<40?['very close match','m-very']:s<75?['close match','m-close']:['loose match','m-loose']}
function pid(p){return p.before.f+'|'+p.after.f}
function render(){
 list.innerHTML=DATA.map((j,ji)=>{
  const cards=j.pairs.map((p,pi)=>{
   const [lbl,cls]=matchLabel(p.score);
   const isKept=kept.some(k=>pid(k)===pid(p));
   return \`<div class="pair\${isKept?' kept':''}" id="pair-\${ji}-\${pi}">
    <div class="cmp">
      <img src="\${p.after.src}" loading="lazy">
      <img class="top" src="\${p.before.src}" loading="lazy">
      <span class="tag tagB">BEFORE</span><span class="tag tagA">AFTER</span>
      <div class="bar"></div><div class="knob">⇔</div>
      <input type="range" min="0" max="100" value="50" oninput="slide(this)">
    </div>
    <div class="meta"><span class="match \${cls}">\${lbl}</span><br>
      before <code>\${p.before.f}</code> · after <code>\${p.after.f}</code></div>
    <button class="keep" onclick="toggleKeep(\${ji},\${pi})">\${isKept?'✓ KEPT — click to remove':'KEEP THIS PAIR'}</button>
   </div>\`;
  }).join('');
  return \`<section class="job" data-service="\${j.service}">
   <h2><span class="svc">\${j.service}</span> \${j.job} <em style="color:#7f8da5;font-style:normal">(\${j.pairs.length} suggested pairs)</em></h2>
   <div class="grid">\${cards}</div></section>\`;
 }).join('');
}
function slide(r){
 const c=r.closest('.cmp');
 c.querySelector('.top').style.clipPath='inset(0 '+(100-r.value)+'% 0 0)';
 c.querySelector('.bar').style.left=r.value+'%';
 c.querySelector('.knob').style.left=r.value+'%';
}
function toggleKeep(ji,pi){
 const j=DATA[ji],p=j.pairs[pi];
 const i=kept.findIndex(k=>pid(k)===pid(p));
 if(i>=0)kept.splice(i,1);else kept.push({service:j.service,job:j.job,before:p.before,after:p.after});
 localStorage.setItem('kept2',JSON.stringify(kept));
 const el=document.getElementById('pair-'+ji+'-'+pi);
 el.classList.toggle('kept',i<0);
 el.querySelector('.keep').textContent=i<0?'✓ KEPT — click to remove':'KEEP THIS PAIR';
 drawTray();
}
function drawTray(){
 document.getElementById('n').textContent=kept.length;
 document.getElementById('hint').style.display=kept.length?'none':'';
 document.getElementById('picked').innerHTML=kept.map((k,i)=>
  \`\${i+1}. <b>\${k.service}</b> — before <code>\${k.before.f}</code> / after <code>\${k.after.f}</code> <button onclick="dropKept(\${i})">remove</button>\`
 ).join('<br>');
}
function dropKept(i){kept.splice(i,1);localStorage.setItem('kept2',JSON.stringify(kept));render();drawTray();}
function copyPicks(){
 const out=document.getElementById('out');
 out.value=kept.map((p,i)=>\`\${i+1}. [\${p.service}] \${p.job}\\n   before: \${p.before.f}\\n   after:  \${p.after.f}\`).join('\\n');
 out.style.display='block';out.select();
 try{document.execCommand('copy');document.getElementById('copy').textContent='Copied! Paste it to the agent';}catch(e){}
}
function filter(s,btn){
 document.querySelectorAll('header button').forEach(b=>b.classList.remove('on'));
 if(btn)btn.classList.add('on');
 document.querySelectorAll('.job').forEach(j=>{j.style.display=(!s||j.dataset.service===s)?'':'none'});
 window.scrollTo(0,0);
}
render();drawTray();
</script></body></html>`;

writeFileSync("photo-picker.html", html);
console.log(`jobs: ${jobs.length}, suggested pairs: ${totalPairs}`);
