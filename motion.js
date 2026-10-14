/* Glide motion layer: purposeful, ease-out, 200–450ms, transform/opacity only */
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const ORDER={overview:0,insights:.5,news:.5,expenses:1,detail:1.5,mileage:1.5,scan:2,review:2.5,reports:3,settings:4};
let shared=null;
function swap(update){
 const de=document.documentElement;
 if(!document.startViewTransition||RM.matches){update();return}
 de.dataset.dir=S.dir>0?'fwd':S.dir<0?'back':'none';
 const t=document.startViewTransition(()=>{update();if(shared)shared.after()});
 t.finished.finally(()=>{delete de.dataset.dir;if(shared){shared.clear();shared=null}});
}
function navTo(s,arg,src,fromHash){
 const prev=S.screen;S.dir=Math.sign((ORDER[s]??0)-(ORDER[prev]??0));
 shared=null;
 // shared-element morphs
 if(src&&src.classList&&src.classList.contains('item')&&(s==='detail'||s==='mileage')){
  src.style.viewTransitionName='morph';
  shared={after(){src.style.viewTransitionName='';const t=document.querySelector(s==='detail'?'.dhead':'.map');if(t)t.style.viewTransitionName='morph'},clear(){document.querySelectorAll('[style*="view-transition-name"]').forEach(e=>e.style.viewTransitionName='')}};
 }else if(s==='scan'&&prev!=='review'){
  const fab=innerWidth<900?document.getElementById('fab'):document.querySelector('.rail .scanbtn');
  if(fab){fab.style.viewTransitionName='morph';shared={after(){fab.style.viewTransitionName='';const c=document.querySelector('.cam');if(c)c.style.viewTransitionName='morph'},clear(){document.querySelectorAll('.cam,#fab,.scanbtn').forEach(e=>e.style.viewTransitionName='')}}}
 }else if((prev==='detail'||prev==='mileage')&&s==='expenses'){
  const h=document.querySelector(prev==='detail'?'.dhead':'.map');const id=S.arg;
  if(h){h.style.viewTransitionName='morph';shared={after(){h.style.viewTransitionName='';const r=document.querySelector(`.item[data-id="${id}"]`);if(r)r.style.viewTransitionName='morph'},clear(){document.querySelectorAll('.item').forEach(e=>e.style.viewTransitionName='')}}}
 }
 swap(()=>{S.screen=s;S.arg=arg;if(!fromHash)history.pushState(null,'','#'+s+(arg?'/'+arg:''));render();scrollTo(0,0)});
}
// entrance choreography; called after each render
function enter(v){
 if(RM.matches){v.classList.add('rm');return}
 let i=0;const step=40,cap=10;
 v.querySelectorAll('.row[style*="margin:4px 0 20px"], .hero, .card, .list>.item, .day, .search, .seg, .cam, .map, .cta, .chips, .grid2>.card').forEach(el=>{
  if(el.closest('.list')&&!el.classList.contains('item'))return;
  el.classList.add('rise');el.style.setProperty('--d',Math.min(i++,cap)*step+'ms');
 });
 v.querySelectorAll('.chip').forEach((c,j)=>{c.classList.add('slide');c.style.setProperty('--d',120+j*45+'ms')});
 v.querySelectorAll('.strip i').forEach((b,j)=>{b.classList.add('grow');b.style.setProperty('--d',180+j*45+'ms')});
 v.querySelectorAll('.bar i').forEach((b,j)=>{b.classList.add('growx');b.style.setProperty('--d',260+j*80+'ms')});
 v.querySelectorAll('.donut').forEach(d=>d.classList.add('spin'));
 v.querySelectorAll('.pager b.on').forEach(d=>d.classList.add('growx'));
 v.querySelectorAll('.map path').forEach(p=>{const L=p.getTotalLength();p.style.strokeDasharray=L;p.style.strokeDashoffset=L;p.getBoundingClientRect();p.style.transition='stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1) .2s';requestAnimationFrame(()=>p.style.strokeDashoffset=0)});
 v.querySelectorAll('.hero .big, .disp, .stat .v').forEach(countUp);
}
function countUp(el){
 const txt=el.textContent,m=txt.match(/[\d,]+(\.\d+)?/);if(!m)return;
 const target=parseFloat(m[0].replace(/,/g,'')),dec=m[1]?m[1].length-1:0,pre=txt.slice(0,m.index),post=txt.slice(m.index+m[0].length);
 const fmt=n=>pre+n.toLocaleString('en-GB',{minimumFractionDigits:dec,maximumFractionDigits:dec})+post;
 // reserve final width so nothing shifts while counting
 el.style.display=getComputedStyle(el).display==='inline'?'inline-block':'';el.style.minWidth=el.getBoundingClientRect().width+'px';
 const dur=700,t0=performance.now()+120;
 const f=t=>{const k=Math.min(1,Math.max(0,(t-t0)/dur)),e=1-Math.pow(1-k,3);el.textContent=fmt(target*e);if(k<1)requestAnimationFrame(f);else{el.textContent=txt;el.style.minWidth=''}};
 el.textContent=fmt(0);requestAnimationFrame(f);
}
