/* ============ SIMULATIONS (conceptual / illustrative) ============ */
const SIMS = {};
const illTag = () => `<span class="tag ill">${T({ar:'نموذج مفاهيمي توضيحي — ليس بيانات مقاسة',en:'Conceptual / illustrative — not measured data'})}</span>`;
function simShell(title, body){ return `<div class="sim"><div class="simhead"><h3>${title}</h3>${illTag()}</div>${body}</div>`; }
function rnd(a,b){return a+Math.random()*(b-a)}
function fitCanvas(cv){ const r=window.devicePixelRatio||1, w=cv.width, h=cv.height; cv.style.width='100%'; cv.style.maxWidth=Math.round(w*1.35)+'px'; cv.style.aspectRatio=w+'/'+h; cv.width=w*r; cv.height=h*r; const c=cv.getContext('2d'); c.scale(r,r); return {c,w,h}; }

/* ---------- 1. Dynamic equilibrium + concentration lab ---------- */
SIMS.dyn = (root)=>{
  root.innerHTML = simShell(T({ar:'من بداية التفاعل إلى الاتزان — ومعمل التركيز',en:'From reaction start to equilibrium — concentration lab'}), `
  <p class="muted">${T({ar:'الجسيمات الزرقاء = متفاعل A ، والبرتقالية = ناتج B. اضغط تشغيل وراقب المعدلين والتركيزين. بعد الوصول للاتزان جرّب تغيير التركيز وتوقّع اتجاه الإزاحة.',en:'Blue = reactant A, orange = product B. Press play and watch the two rates and concentrations. After equilibrium, disturb the system and predict the shift.'})}</p>
  <div class="simgrid">
    <div><canvas id="dP" width="460" height="300"></canvas>
      <div class="legend" style="margin-top:6px"><span><i style="background:#2f7be6;border-radius:50%"></i>A</span><span><i style="background:#f08a24"></i>B</span><span>${chem('$A<=>B$')}</span></div></div>
    <div>
      <div class="counter"><div style="color:#1d5fc2">${T({ar:'تحولات طردية',en:'Forward events'})}<br><span id="dF">0</span></div><div style="color:#c96a10">${T({ar:'تحولات عكسية',en:'Backward events'})}<br><span id="dB">0</span></div></div>
      <div style="font-weight:700;font-size:.9rem">${T({ar:'المعدل مع الزمن',en:'Rate vs time'})}</div><canvas id="dR" width="320" height="130"></canvas>
      <div style="font-weight:700;font-size:.9rem;margin-top:6px">${T({ar:'التركيز مع الزمن',en:'Concentration vs time'})}</div><canvas id="dC" width="320" height="130"></canvas>
      <div class="legend"><span><i style="background:#2f7be6"></i>${T({ar:'طردي / [A]',en:'forward / [A]'})}</span><span><i style="background:#f08a24"></i>${T({ar:'عكسي / [B]',en:'backward / [B]'})}</span></div>
    </div>
  </div>
  <div class="ctrls"><button class="btn blue sm" id="dGo">${T({ar:'▶ تشغيل',en:'▶ Play'})}</button><button class="btn ghost sm" id="dReset">${T({ar:'↺ إعادة',en:'↺ Reset'})}</button></div>
  <div class="ctrls" id="dDist">
    <button class="btn ghost sm" data-a="addA">+ ${T({ar:'إضافة متفاعل A',en:'Add reactant A'})}</button>
    <button class="btn ghost sm" data-a="remA">− ${T({ar:'سحب متفاعل A',en:'Remove reactant A'})}</button>
    <button class="btn ghost sm" data-a="addB">+ ${T({ar:'إضافة ناتج B',en:'Add product B'})}</button>
    <button class="btn ghost sm" data-a="remB">− ${T({ar:'سحب ناتج B',en:'Remove product B'})}</button>
  </div>
  <div id="dPred"></div><div id="dFb"></div>`);
  const P=fitCanvas(root.querySelector('#dP')), R=fitCanvas(root.querySelector('#dR')), C=fitCanvas(root.querySelector('#dC'));
  const pf=0.022, pb=0.011; let parts=[], run=false, rf=0, rb=0, hist=[], marks=[], raf, acc=0, last=0, totF=0, totB=0, tick=0;
  const mk=s=>({x:rnd(12,P.w-12),y:rnd(12,P.h-12),vx:rnd(-1,1),vy:rnd(-1,1),s,fl:0});
  function reset(){parts=[];for(let i=0;i<54;i++)parts.push(mk('A'));rf=rb=0;hist=[];marks=[];totF=totB=0;tick=0;run=false;root.querySelector('#dGo').textContent=T({ar:'▶ تشغيل',en:'▶ Play'});root.querySelector('#dPred').innerHTML='';root.querySelector('#dFb').innerHTML='';draw();}
  function step(){ let f=0,b=0; for(const p of parts){ if(p.s==='A'&&Math.random()<pf){p.s='B';p.fl=8;f++} else if(p.s==='B'&&Math.random()<pb){p.s='A';p.fl=8;b++} }
    totF+=f;totB+=b; rf=rf*.93+f*.07; rb=rb*.93+b*.07; tick++;
    const nA=parts.filter(p=>p.s==='A').length; hist.push([rf,rb,nA,parts.length-nA]); if(hist.length>320){hist.shift();marks=marks.map(m=>m-1).filter(m=>m>=0)} }
  function move(){ for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.x<8||p.x>P.w-8)p.vx*=-1;if(p.y<8||p.y>P.h-8)p.vy*=-1;p.x=Math.max(8,Math.min(P.w-8,p.x));p.y=Math.max(8,Math.min(P.h-8,p.y));if(p.fl)p.fl--;} }
  function graph(G,i1,i2,max){ const c=G.c; c.clearRect(0,0,G.w,G.h); c.strokeStyle='#c9d6ea'; c.lineWidth=1; c.beginPath(); c.moveTo(24,6); c.lineTo(24,G.h-16); c.lineTo(G.w-4,G.h-16); c.stroke();
    c.fillStyle='#8a99b2'; c.font='10px Inter'; c.fillText(T({ar:'الزمن',en:'time'}),G.w-36,G.h-4);
    const n=hist.length; if(!n)return; const sx=(G.w-30)/320, sy=(G.h-26)/max;
    for(const m of marks){c.strokeStyle='#f2b33d';c.setLineDash([4,3]);c.beginPath();c.moveTo(25+m*sx,6);c.lineTo(25+m*sx,G.h-16);c.stroke();c.setLineDash([])}
    [[i1,'#2f7be6'],[i2,'#f08a24']].forEach(([k,col])=>{c.strokeStyle=col;c.lineWidth=2.2;c.beginPath();hist.forEach((h,j)=>{const x=25+j*sx,y=G.h-17-h[k]*sy; j?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();}); }
  function draw(){ const c=P.c; c.clearRect(0,0,P.w,P.h);
    for(const p of parts){ if(p.fl){c.strokeStyle='rgba(242,179,61,'+(p.fl/8)+')';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,11,0,7);c.stroke()}
      if(p.s==='A'){c.fillStyle='#2f7be6';c.beginPath();c.arc(p.x,p.y,6,0,7);c.fill()} else {c.fillStyle='#f08a24';c.beginPath();c.roundRect?c.roundRect(p.x-6,p.y-6,12,12,3):c.rect(p.x-6,p.y-6,12,12);c.fill()} }
    const mr=Math.max(1.6, ...hist.map(h=>Math.max(h[0],h[1])));
    graph(R,0,1,mr*1.1); graph(C,2,3,Math.max(60,parts.length)*1.05);
    root.querySelector('#dF').textContent=totF; root.querySelector('#dB').textContent=totB; }
  function loop(t){ raf=requestAnimationFrame(loop); if(!run){return} const dt=t-last; last=t; acc+=Math.min(dt,100); move(); while(acc>55){step();acc-=55} draw(); }
  root.querySelector('#dGo').onclick=()=>{ run=!run; last=performance.now(); root.querySelector('#dGo').textContent=run?T({ar:'❚❚ إيقاف',en:'❚❚ Pause'}):T({ar:'▶ تشغيل',en:'▶ Play'}); logEv('sim','dyn:'+(run?'play':'pause')); };
  root.querySelector('#dReset').onclick=()=>{reset();logEv('sim','dyn:reset')};
  const expect={addA:'f',remA:'b',addB:'b',remB:'f'};
  const why={addA:{ar:'أضفنا متفاعلًا، فيزداد معدل التفاعل الطردي مؤقتًا ويستهلك النظام جزءًا من A المضاف ← إزاحة طردية.',en:'Adding reactant raises the forward rate temporarily; the system consumes some added A → forward shift.'},
    remA:{ar:'سحبنا متفاعلًا، فيقل المعدل الطردي مؤقتًا ويعوّض النظام جزءًا من A ← إزاحة عكسية.',en:'Removing reactant lowers the forward rate; the system replaces some A → backward shift.'},
    addB:{ar:'أضفنا ناتجًا، فيزداد المعدل العكسي مؤقتًا ويستهلك النظام جزءًا من B ← إزاحة عكسية.',en:'Adding product raises the backward rate; the system consumes some B → backward shift.'},
    remB:{ar:'سحبنا ناتجًا، فيقل المعدل العكسي مؤقتًا ويعوّض النظام جزءًا من B ← إزاحة طردية.',en:'Removing product lowers the backward rate; the system replaces some B → forward shift.'}};
  root.querySelectorAll('#dDist button').forEach(b=>b.onclick=()=>{
    if(tick<60){ root.querySelector('#dFb').innerHTML=`<div class="fb no">${T({ar:'شغّل المحاكاة أولًا واستنى لحد ما المعدلين يتساووا تقريبًا (الاتزان).',en:'Run the simulation first and wait until the rates are about equal (equilibrium).'})}</div>`; return;}
    const a=b.dataset.a; run=false; root.querySelector('#dGo').textContent=T({ar:'▶ تشغيل',en:'▶ Play'});
    root.querySelector('#dFb').innerHTML='';
    root.querySelector('#dPred').innerHTML=`<div class="predict"><b>${T({ar:'توقّع قبل ما نطبّق: الاتزان هيتزاح ناحية؟',en:'Predict first: which way will equilibrium shift?'})}</b><div class="ctrls"><button class="btn blue sm" data-p="f">${T({ar:'طردي (نحو B)',en:'Forward (toward B)'})}</button><button class="btn ghost sm" data-p="b">${T({ar:'عكسي (نحو A)',en:'Backward (toward A)'})}</button></div></div>`;
    root.querySelectorAll('#dPred [data-p]').forEach(pb2=>pb2.onclick=()=>{
      const ok=pb2.dataset.p===expect[a];
      if(a==='addA'){for(let i=0;i<16&&parts.length<130;i++)parts.push(mk('A'))}
      if(a==='addB'){for(let i=0;i<16&&parts.length<130;i++)parts.push(mk('B'))}
      if(a==='remA'||a==='remB'){const s=a==='remA'?'A':'B';let k=0;parts=parts.filter(p=>{if(p.s===s&&k<14){k++;return false}return true})}
      marks.push(hist.length-1);
      root.querySelector('#dPred').innerHTML='';
      root.querySelector('#dFb').innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?T({ar:'✔ توقّع صحيح! ',en:'✔ Correct prediction! '}):T({ar:'✘ مش بالظبط. ',en:'✘ Not quite. '})}${T(why[a])}<br>${T({ar:'لاحظ: التفاعلان لسه شغالين، والنظام بيوصل لاتزان جديد — مش بيرجع لنفس الحالة الأصلية.',en:'Note: both reactions keep running and the system reaches a new equilibrium — not the original state.'})}</div>`;
      logEv('sim',`dyn:${a}:predict=${pb2.dataset.p}:${ok?'correct':'wrong'}`);
      run=true; last=performance.now(); root.querySelector('#dGo').textContent=T({ar:'❚❚ إيقاف',en:'❚❚ Pause'});
    });
  });
  reset(); raf=requestAnimationFrame(loop);
  return ()=>cancelAnimationFrame(raf);
};

/* ---------- 2. Fe(III) thiocyanate colour ---------- */
SIMS.fescn = (root)=>{
  let lv=3; const L=[0,1,2,3,4,5,6];
  const col=k=>{const a=[248,214,180],b=[128,12,16],t=k/6;return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')})`};
  root.innerHTML=simShell(T({ar:'تجربة اللون: كلوريد الحديد III وثيوسيانات الأمونيوم',en:'Colour investigation: iron(III) chloride and ammonium thiocyanate'}),`
   <div class="eqblock">${chem('$FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$')}</div>
   <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:center">
    <svg viewBox="0 0 160 190" width="170" aria-label="beaker"><path d="M30 20 v140 a14 14 0 0 0 14 14 h72 a14 14 0 0 0 14 -14 v-140" fill="#f4f8ff" stroke="#9fb6d6" stroke-width="4"/><path id="fLiq" d="M34 70 h92 v88 a12 12 0 0 1 -12 12 h-68 a12 12 0 0 1 -12 -12z" fill="${col(lv)}" style="transition:fill .8s"/><line x1="22" y1="20" x2="138" y2="20" stroke="#9fb6d6" stroke-width="4" stroke-linecap="round"/></svg>
    <div style="flex:1;min-width:220px"><div class="ctrls"><button class="btn blue sm" data-a="fe">+ ${chem('$FeCl3$')}</button><button class="btn green sm" data-a="nh">+ ${chem('$NH4Cl$')}</button><button class="btn ghost sm" data-a="r">↺ ${T({ar:'إعادة',en:'Reset'})}</button></div>
     <div id="fPred"></div><div id="fFb" aria-live="polite"></div></div></div>
   <p class="muted" style="font-size:.88rem">${T({ar:'هذه المعادلة هي النموذج المدرسي المعتمد في الدرس. وصف اللون: "أحمر أعمق" أو "أحمر أفتح" فقط.',en:'This equation is the lesson’s school-level model. Colour is described only as "deeper red" or "paler red".'})}</p>`);
  const liq=root.querySelector('#fLiq'), fb=root.querySelector('#fFb'), pr=root.querySelector('#fPred');
  root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const a=b.dataset.a;
    if(a==='r'){lv=3;liq.setAttribute('fill',col(lv));fb.innerHTML='';pr.innerHTML='';return}
    pr.innerHTML=`<div class="predict"><b>${T({ar:'توقّع: اللون هيبقى؟',en:'Predict: the colour will become?'})}</b><div class="ctrls"><button class="btn sm" style="background:#8c1013" data-p="d">${T({ar:'أحمر أعمق',en:'Deeper red'})}</button><button class="btn sm" style="background:#e9a27c" data-p="p">${T({ar:'أحمر أفتح',en:'Paler red'})}</button></div></div>`;
    pr.querySelectorAll('[data-p]').forEach(p=>p.onclick=()=>{ const exp=a==='fe'?'d':'p', ok=p.dataset.p===exp;
      lv=Math.max(0,Math.min(6,lv+(a==='fe'?1.3:-1.3))); liq.setAttribute('fill',col(lv)); pr.innerHTML='';
      fb.innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?'✔ ':'✘ '}${a==='fe'?T({ar:'أضفنا متفاعلًا (FeCl₃) ← إزاحة طردية ← أحمر أعمق.',en:'Added a reactant (FeCl₃) → forward shift → deeper red.'}):T({ar:'أضفنا ناتجًا (NH₄Cl) ← إزاحة عكسية ← أحمر أفتح.',en:'Added a product (NH₄Cl) → backward shift → paler red.'})}</div>`;
      logEv('sim',`fescn:${a}:${ok?'correct':'wrong'}`); }); });
};

/* ---------- 3. Kc builder ---------- */
const KC_RX=[
 {id:'r1',sp:[{f:'H2O',ph:'v',co:2,s:'R'},{f:'H2',ph:'g',co:2,s:'P'},{f:'O2',ph:'g',co:1,s:'P'}]},
 {id:'r2',sp:[{f:'NH3',ph:'l',co:1,s:'R'},{f:'NH3',ph:'g',co:1,s:'P'}]},
 {id:'r3',sp:[{f:'I2',ph:'s',co:3,s:'R'},{f:'H2O',ph:'l',co:3,s:'R'},{f:'I^{-}',ph:'aq',co:5,s:'P'},{f:'IO3^{-}',ph:'aq',co:1,s:'P'},{f:'H^{+}',ph:'aq',co:6,s:'P'}]},
 {id:'r4',sp:[{f:'N2',ph:'g',co:1,s:'R'},{f:'H2',ph:'g',co:3,s:'R'},{f:'NH3',ph:'g',co:2,s:'P'}]},
 {id:'r5',sp:[{f:'FeCl3',ph:'aq',co:1,s:'R'},{f:'NH4SCN',ph:'aq',co:3,s:'R'},{f:'Fe(SCN)3',ph:'aq',co:1,s:'P'},{f:'NH4Cl',ph:'aq',co:3,s:'P'}]}
];
function rxEq(r){const side=s=>r.sp.filter(x=>x.s===s).map(x=>(x.co>1?x.co:'')+x.f+'('+x.ph+')').join('+');return side('R')+'<=>'+side('P')}
function term(x){return '['+x.f+']'+(x.co>1?'^{'+x.co+'}':'')}
function kexpr(num,den){const n=num.map(term).join('')||'1';return den.length?'$K_{c}=«'+n+'|'+den.map(term).join('')+'»$':'$K_{c}='+n+'$'}
SIMS.kc=(root)=>{
  let cur=0;
  root.innerHTML=simShell(T({ar:'مُنشئ تعبير ثابت الاتزان Kc',en:'Kc expression builder'}),`<div class="tabs" id="kTabs">${KC_RX.map((r,i)=>`<button data-i="${i}">${T({ar:'تفاعل',en:'Reaction'})} ${i+1}</button>`).join('')}</div><div id="kBody"></div>`);
  root.querySelector('#kBody').addEventListener('change',e=>{if(e.target.tagName==='SELECT')preview()});
  const opts=()=>`<option value="">—</option><option value="n">${T({ar:'في البسط',en:'Numerator'})}</option><option value="d">${T({ar:'في المقام',en:'Denominator'})}</option><option value="o">${T({ar:'لا يُكتب',en:'Omit'})}</option>`;
  function show(i){cur=i; root.querySelectorAll('#kTabs button').forEach((b,j)=>b.classList.toggle('on',j===i)); const r=KC_RX[i];
    root.querySelector('#kBody').innerHTML=`<div class="eqblock">${chem('$'+rxEq(r)+'$')}</div><p>${T({ar:'حدّد مكان كل مادة في التعبير:',en:'Place each substance in the expression:'})}</p>
     ${r.sp.map((x,j)=>`<div class="kcrow"><span class="sp">${chem('$'+(x.co>1?x.co:'')+x.f+'('+x.ph+')$')}</span><select data-j="${j}" aria-label="${x.f}">${opts()}</select><span class="muted" id="kx${j}"></span></div>`).join('')}
     <div class="eqblock" id="kPrev">${chem('$K_{c}=?$')}</div><div class="ctrls"><button class="btn purple sm" id="kChk">${T({ar:'تحقّق',en:'Check'})}</button></div><div id="kFb"></div>`;
    root.querySelector('#kChk').onclick=check; }
  function choices(){return [...root.querySelectorAll('#kBody select')].map(s=>s.value)}
  function preview(){const r=KC_RX[cur],c=choices();root.querySelector('#kPrev').innerHTML=chem(kexpr(r.sp.filter((x,j)=>c[j]==='n'),r.sp.filter((x,j)=>c[j]==='d')))}
  function check(){ const r=KC_RX[cur],c=choices(); let all=true;
    r.sp.forEach((x,j)=>{ const right=(x.ph==='s'||x.ph==='l')?'o':(x.s==='P'?'n':'d'); const ok=c[j]===right; if(!ok)all=false;
      const why = right==='o'?T({ar:(x.ph==='s'?'صلب نقي':'سائل نقي')+' — تركيزه ثابت فلا يُكتب',en:'pure '+(x.ph==='s'?'solid':'liquid')+' — constant, omitted'}):
        right==='n'?T({ar:'ناتج'+(x.ph==='v'?' (بخار = غاز)':'')+' ← البسط، والأس = '+x.co,en:'product'+(x.ph==='v'?' (vapour = gas)':'')+' → numerator, power = '+x.co}):
        T({ar:'متفاعل'+(x.ph==='v'?' (بخار = غاز يُكتب)':'')+' ← المقام، والأس = '+x.co,en:'reactant'+(x.ph==='v'?' (vapour = gas, included)':'')+' → denominator, power = '+x.co});
      root.querySelector('#kx'+j).innerHTML=(ok?'✔ ':'✘ ')+why; root.querySelector('#kx'+j).style.color=ok?'#0d8a5b':'#c23a3f'; });
    const corr=kexpr(r.sp.filter(x=>x.s==='P'&&!['s','l'].includes(x.ph)),r.sp.filter(x=>x.s==='R'&&!['s','l'].includes(x.ph)));
    root.querySelector('#kFb').innerHTML=`<div class="fb ${all?'ok':'no'}">${all?T({ar:'✔ ممتاز! التعبير الصحيح:',en:'✔ Excellent! The correct expression:'}):T({ar:'راجع العلامات ✘ — التعبير الصحيح:',en:'Check the ✘ marks — correct expression:'})} <span>${chem(corr)}</span></div>`;
    logEv('sim',`kc:${r.id}:${all?'correct':'wrong'}`); }
  root.querySelectorAll('#kTabs button').forEach(b=>b.onclick=()=>show(+b.dataset.i)); show(0);
};

/* ---------- 4. NO2 / N2O4 temperature (3 positions) ---------- */
SIMS.no2=(root)=>{
  const S={0:{c:'#f6f1ea',d:{ar:'عديم اللون (حسب وصف المصدر)',en:'Colourless (as described in the source)'},rv:true},25:{c:'#ddb07c',d:{ar:'بني باهت',en:'Pale brown'}},100:{c:'#9c3a1d',d:{ar:'بني محمر',en:'Reddish-brown'}}};
  let t=25, pred=null;
  root.innerHTML=simShell(T({ar:'أثر درجة الحرارة على اتزان NO₂ / N₂O₄',en:'Temperature and the NO₂ / N₂O₄ equilibrium'}),`
   <div class="eqblock">${chem('$2NO2(g)<=>N2O4(g)+Heat$')}</div>
   <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center">
    <svg viewBox="0 0 90 220" width="90"><rect x="25" y="8" width="40" height="190" rx="20" fill="#f4f8ff" stroke="#9fb6d6" stroke-width="4"/><rect id="nGas" x="29" y="40" width="32" height="154" rx="16" fill="${S[25].c}" style="transition:fill .9s"/><rect x="20" y="4" width="50" height="12" rx="5" fill="#9fb6d6"/></svg>
    <div style="flex:1;min-width:230px">
     <div class="predict"><b>${T({ar:'توقّع: لو سخّنا الأنبوبة، اللون البني هيـ...؟',en:'Predict: if we heat the tube, the brown colour will...?'})}</b><div class="ctrls"><button class="btn ghost sm" data-p="up">${T({ar:'يغمق',en:'Deepen'})}</button><button class="btn ghost sm" data-p="down">${T({ar:'يفتح',en:'Fade'})}</button></div></div>
     <div class="tabs" role="radiogroup">${[0,25,100].map(v=>`<button data-t="${v}" class="${v===25?'on':''}" role="radio">${v} °C</button>`).join('')}</div>
     <div id="nDesc" style="font-weight:800;font-size:1.1rem"></div><div id="nFb"></div></div></div>`);
  const upd=()=>{root.querySelector('#nGas').setAttribute('fill',S[t].c);root.querySelector('#nDesc').innerHTML=T({ar:'الملاحظة عند ',en:'Observation at '})+t+' °C: '+T(S[t].d)+(S[t].rv&&CONFIG.showReviewTags?' <span class="tag">'+T({ar:'بانتظار اعتماد المعلمة',en:'pending teacher approval'})+'</span>':'')};
  root.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{pred=b.dataset.p;root.querySelectorAll('[data-p]').forEach(x=>{x.classList.toggle('blue',x===b);x.classList.toggle('ghost',x!==b)})});
  root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ const nt=+b.dataset.t; if(nt===t)return; const dir=nt>t?'up':'down'; t=nt;
    root.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b)); upd();
    let msg = dir==='up'?T({ar:'التسخين يُفضّل الاتجاه العكسي الماص للحرارة ← يتكوّن NO₂ أكثر ← اللون البني المحمر يزيد.',en:'Heating favours the endothermic reverse direction → more NO₂ → deeper reddish-brown.'}):T({ar:'التبريد يُفضّل الاتجاه الطردي الطارد للحرارة ← يتكوّن N₂O₄ أكثر ← اللون يفتح.',en:'Cooling favours the exothermic forward direction → more N₂O₄ → paler.'});
    let cls='ok'; if(pred&&dir==='up'){const ok=pred==='up';cls=ok?'ok':'no';msg=(ok?'✔ ':'✘ ')+msg}
    root.querySelector('#nFb').innerHTML=`<div class="fb ${cls}">${msg}</div>`; logEv('sim','no2:'+nt+(pred?':pred='+pred:'')); });
  upd();
};

/* ---------- 5. Piston pressure lab ---------- */
SIMS.piston=(root)=>{
  const RX={nh3:{eq:'$N2(g)+3H2(g)<=>2NH3(g)$',L:4,Rm:2,R:[['N2',1],['H2',3]],P:[['NH3',2]],tgt:{L:.3,M:.5,S:.75}},
            co:{eq:'$CO(g)+NO2(g)<=>CO2(g)+NO(g)$',L:2,Rm:2,R:[['CO',1],['NO2',1]],P:[['CO2',1],['NO',1]],tgt:{L:.5,M:.5,S:.5}}};
  const COL={N2:['#2f7be6',7],H2:['#9fb0c8',4.5],NH3:['#15a46d',6.5],CO:['#5b6b82',6],NO2:['#a0522d',6.5],CO2:['#1c2a3f',6.5],NO:['#8a63e0',6]};
  const VOL={L:1,M:.72,S:.45}; let rx='nh3', vol='M', parts=[], raf, acc=0, last=performance.now();
  root.innerHTML=simShell(T({ar:'معمل المكبس: الضغط والحجم',en:'Piston lab: pressure and volume'}),`
   <div class="tabs" id="pRx"><button data-r="nh3" class="on">${T({ar:'عدد مولات غير متساوٍ',en:'Unequal gas moles'})}</button><button data-r="co">${T({ar:'عدد مولات متساوٍ',en:'Equal gas moles'})}</button></div>
   <div class="eqblock" id="pEq"></div>
   <canvas id="pC" width="480" height="250"></canvas>
   <div class="legend" id="pLeg" style="margin-top:6px"></div>
   <div class="ctrls"><button class="btn ghost sm" data-v="L">${T({ar:'حجم كبير (ضغط أقل)',en:'Large volume (low P)'})}</button><button class="btn ghost sm" data-v="M">${T({ar:'حجم متوسط',en:'Medium volume'})}</button><button class="btn blue sm" data-v="S">${T({ar:'حجم صغير (ضغط أعلى)',en:'Small volume (high P)'})}</button></div>
   <div class="counter"><div>${T({ar:'جزيئات المتفاعلات',en:'Reactant molecules'})}<br><span id="pR"></span></div><div>${T({ar:'جزيئات النواتج',en:'Product molecules'})}<br><span id="pP"></span></div><div>${T({ar:'تزاحم الغاز (نسبي)',en:'Gas crowding (relative)'})}<br><span id="pD"></span></div></div>
   <div id="pFb"></div>`);
  const G=fitCanvas(root.querySelector('#pC'));
  const boxW=()=>30+(G.w-60)*VOL[vol];
  const add=(f,x,y)=>parts.push({f,x:x??rnd(20,boxW()),y:y??rnd(20,G.h-20),vx:rnd(-1.2,1.2),vy:rnd(-1.2,1.2)});
  function setup(){parts=[];const r=RX[rx];const U=10,p0=Math.round(U*r.tgt[vol]);for(let i=0;i<U;i++){(i<p0?r.P:r.R).forEach(([f,n])=>{for(let k=0;k<n;k++)add(f)})}
    root.querySelector('#pEq').innerHTML=chem(r.eq)+` &nbsp; <bdi class="muted">(${r.L} ${T({ar:'مول غاز',en:'gas mol'})} → ${r.Rm})</bdi>`;
    root.querySelector('#pLeg').innerHTML=[...r.R,...r.P].map(([f])=>`<span><i style="background:${COL[f][0]};border-radius:50%"></i>${chem('$'+f+'$')}</span>`).join('');}
  function take(f,n,near){const idx=[];for(let i=0;i<parts.length&&idx.length<n;i++)if(parts[i].f===f)idx.push(i);if(idx.length<n)return null;const pos={x:parts[idx[0]].x,y:parts[idx[0]].y};idx.sort((a,b)=>b-a).forEach(i=>parts.splice(i,1));return pos}
  function cnt(f){return parts.filter(p=>p.f===f).length}
  function step(){ const r=RX[rx], t=r.tgt[vol], k=0.03; const units=f=>cnt(f[0][0])/f[0][1]; const nR=units(r.R), nP=units(r.P);
    if(Math.random()<k*t*nR){ if(r.R.every(([f,n])=>cnt(f)>=n)){let pos;r.R.forEach(([f,n])=>{const p=take(f,n);pos=pos||p});r.P.forEach(([f,n])=>{for(let i=0;i<n;i++)add(f,pos.x+rnd(-6,6),pos.y+rnd(-6,6))})} }
    if(Math.random()<k*(1-t)*nP){ if(r.P.every(([f,n])=>cnt(f)>=n)){let pos;r.P.forEach(([f,n])=>{const p=take(f,n);pos=pos||p});r.R.forEach(([f,n])=>{for(let i=0;i<n;i++)add(f,pos.x+rnd(-6,6),pos.y+rnd(-6,6))})} } }
  function draw(){ const c=G.c,W=boxW(); c.clearRect(0,0,G.w,G.h);
    const isR=document.documentElement.dir==='rtl';
    c.fillStyle='#f4f8ff'; c.fillRect(10,10,W,G.h-20); c.strokeStyle='#9fb6d6'; c.lineWidth=3; c.strokeRect(10,10,W,G.h-20);
    c.fillStyle='#c9d6ea'; c.fillRect(10+W,14,14,G.h-28); c.fillRect(24+W,G.h/2-6,G.w-W-30,12);
    for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.x<18){p.x=18;p.vx=Math.abs(p.vx)}if(p.x>W+2){p.x=W+2;p.vx=-Math.abs(p.vx)}if(p.y<18||p.y>G.h-18)p.vy*=-1;p.y=Math.max(18,Math.min(G.h-18,p.y));
      const [col,rad]=COL[p.f];c.fillStyle=col;c.beginPath();c.arc(p.x,p.y,rad,0,7);c.fill()}
    const r=RX[rx]; const nr=r.R.reduce((s,[f])=>s+cnt(f),0), np=r.P.reduce((s,[f])=>s+cnt(f),0);
    root.querySelector('#pR').textContent=nr; root.querySelector('#pP').textContent=np; root.querySelector('#pD').textContent=((nr+np)/(VOL[vol]*40)).toFixed(1)+'×'; }
  function loop(t){raf=requestAnimationFrame(loop);acc+=Math.min(t-last,100);last=t;while(acc>60){step();acc-=60}draw()}
  root.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{ const prev=vol; vol=b.dataset.v; root.querySelectorAll('[data-v]').forEach(x=>{x.classList.toggle('blue',x===b);x.classList.toggle('ghost',x!==b)});
    if(prev===vol)return; const comp=VOL[vol]<VOL[prev];
    const msg = rx==='nh3' ? (comp?T({ar:'قلّلنا الحجم ← زاد الضغط ← الاتزان يُزاح نحو الجانب ذي المولات الغازية الأقل (النشادر: 2 مول) لمقاومة زيادة الضغط. لاحظ أن التفاعلين ما زالا يحدثان.',en:'Smaller volume → higher pressure → shift toward fewer gas moles (NH₃: 2 mol) to oppose it. Both reactions still occur.'}):T({ar:'زوّدنا الحجم ← قلّ الضغط ← الاتزان يُزاح نحو الجانب ذي المولات الأكثر (المتفاعلات: 4 مولات).',en:'Larger volume → lower pressure → shift toward more gas moles (reactants: 4 mol).'}))
      : T({ar:'عدد المولات الغازية متساوٍ (2 = 2) ← موضع الاتزان لا يُزاح. لكن لاحظ أن تزاحم الجزيئات (التركيز) '+(comp?'زاد':'قلّ')+' — "لا إزاحة" لا تعني "لا تغيير".',en:'Equal gas moles (2 = 2) → no shift in position. But crowding (concentration) '+(comp?'increased':'decreased')+' — "no shift" ≠ "no change".'});
    root.querySelector('#pFb').innerHTML=`<div class="fb ok">${msg}</div>`; logEv('sim',`piston:${rx}:${prev}->${vol}`); });
  root.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{rx=b.dataset.r;root.querySelectorAll('[data-r]').forEach(x=>x.classList.toggle('on',x===b));setup();root.querySelector('#pFb').innerHTML=''});
  setup(); raf=requestAnimationFrame(loop); root.querySelector('[data-v="M"]').click(); root.querySelector('#pFb').innerHTML='';
  return ()=>cancelAnimationFrame(raf);
};

/* ---------- 6. Kp calculator (approved example only) ---------- */
SIMS.kp=(root)=>{
  root.innerHTML=`<div class="sim"><div class="simhead"><h3>${T({ar:'حاسبة Kp الموجّهة',en:'Guided Kp calculator'})}</h3></div>
   <div class="eqblock">${chem('$N2(g)+2O2(g)<=>2NO2(g)$')}</div>
   <p>${chem(T({ar:'المعطيات: $P_{N2}=0.2$ atm ، $P_{O2}=1$ atm ، $P_{NO2}=2$ atm',en:'Given: $P_{N2}=0.2$ atm, $P_{O2}=1$ atm, $P_{NO2}=2$ atm'}))}</p>
   <p><b>1)</b> ${T({ar:'اكتب التعبير: النواتج في البسط، والمعاملات أُسس.',en:'Write the expression: products on top, coefficients as powers.'})}</p>
   <div class="ctrls"><button class="btn ghost sm" id="kpShow">${T({ar:'اعرض التعبير',en:'Show expression'})}</button></div><div id="kpE"></div>
   <p><b>2)</b> ${T({ar:'عوّض واحسب قيمة Kp:',en:'Substitute and calculate Kp:'})}</p>
   <div class="ctrls"><input class="numin" id="kpIn" inputmode="decimal" aria-label="Kp"><button class="btn purple sm" id="kpChk">${T({ar:'تحقّق',en:'Check'})}</button></div><div id="kpFb"></div>
   <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
   <p><b>${T({ar:'الضغط الكلي:',en:'Total pressure:'})}</b> ${T({ar:'خليط ضغوطه الجزئية 2 و 5 و 7 atm. احسب الضغط الكلي (atm):',en:'A mixture with partial pressures 2, 5 and 7 atm. Total pressure (atm):'})}</p>
   <div class="ctrls"><input class="numin" id="ptIn" inputmode="decimal" aria-label="P total"><button class="btn purple sm" id="ptChk">${T({ar:'تحقّق',en:'Check'})}</button></div><div id="ptFb"></div>
   <p class="muted" style="font-size:.85rem">${T({ar:'ملحوظة: وحدات K وقواعد التقريب بانتظار اعتماد المعلمة، لذلك لا تُقيَّم الوحدة هنا.',en:'Note: K units and rounding rules await teacher approval, so units are not graded here.'})}</p></div>`;
  const ex='$K_{p}=«(P_{NO2})^{2}|P_{N2}(P_{O2})^{2}»$';
  root.querySelector('#kpShow').onclick=()=>root.querySelector('#kpE').innerHTML=`<div class="eqblock">${chem(ex)}</div>`;
  const num=v=>parseFloat(String(v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫','.').replace(',','.'));
  root.querySelector('#kpChk').onclick=()=>{const v=num(root.querySelector('#kpIn').value),ok=Math.abs(v-20)<1e-9;
    root.querySelector('#kpFb').innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?'✔ ':'✘ '}${chem('$K_{p}=«(2)^{2}|(0.2)(1)^{2}»=«4|0.2»=20$')}</div>`;logEv('sim','kp:'+(ok?'correct':'wrong:'+v))};
  root.querySelector('#ptChk').onclick=()=>{const v=num(root.querySelector('#ptIn').value),ok=Math.abs(v-14)<1e-9;
    root.querySelector('#ptFb').innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?'✔ ':'✘ '}${chem('$P_{total}=2+5+7=14 atm$')}</div>`;logEv('sim','ptotal:'+(ok?'correct':'wrong:'+v))};
};

/* ---------- 7. Catalyst energy profile ---------- */
SIMS.cat=(root)=>{
  let on=false, raf;
  root.innerHTML=simShell(T({ar:'مستكشف منحنى الطاقة والعامل الحفاز',en:'Catalyst energy-profile explorer'}),`
   <p class="muted">${T({ar:'تفاعل عام (توضيحي) — لم يُحدَّد تفاعل بعينه لهذه المحاكاة.',en:'Generic reaction (illustrative) — no specific reaction assigned to this simulation.'})}</p>
   <div class="simgrid"><svg viewBox="0 0 420 260" style="background:#fff;border:1px solid var(--line);border-radius:14px;width:100%">
     <line x1="40" y1="20" x2="40" y2="236" stroke="#9fb0c8" stroke-width="2"/><line x1="40" y1="236" x2="406" y2="236" stroke="#9fb0c8" stroke-width="2"/>
     <text x="14" y="130" font-size="12" fill="#5b6b82" transform="rotate(-90 14 130)">${T({ar:'الطاقة',en:'Energy'})}</text>
     <text x="330" y="252" font-size="12" fill="#5b6b82">${T({ar:'مسار التفاعل',en:'Reaction path'})}</text>
     <path id="cU" d="M50 160 H110 C160 160 170 40 210 40 C250 40 260 190 310 190 H400" fill="none" stroke="#e0474c" stroke-width="3.5"/>
     <path id="cK" d="M50 160 H110 C160 160 170 100 210 100 C250 100 260 190 310 190 H400" fill="none" stroke="#15a46d" stroke-width="3.5" stroke-dasharray="7 5" opacity=".25"/>
     <text x="52" y="152" font-size="12" fill="#1c2a3f">${T({ar:'المتفاعلات',en:'Reactants'})}</text><text x="330" y="182" font-size="12" fill="#1c2a3f">${T({ar:'النواتج',en:'Products'})}</text>
     <line x1="380" y1="160" x2="380" y2="190" stroke="#6a44c2" stroke-width="2"/><text x="352" y="210" font-size="12" fill="#6a44c2">ΔH</text>
     <line x1="80" y1="160" x2="80" y2="40" stroke="#e0474c" stroke-width="1.5" stroke-dasharray="3 3"/><text x="84" y="70" font-size="11" fill="#e0474c">Ea</text>
     <line id="cEa2" x1="96" y1="160" x2="96" y2="100" stroke="#15a46d" stroke-width="1.5" stroke-dasharray="3 3" opacity=".25"/><text id="cEa2t" x="100" y="120" font-size="11" fill="#15a46d" opacity=".25">Ea'</text>
    </svg>
    <div><div class="ctrls"><button class="btn green sm" id="cTog">${T({ar:'إضافة عامل حفاز',en:'Add catalyst'})}</button><button class="btn ghost sm" id="cRace">${T({ar:'▶ سباق الوصول للاتزان',en:'▶ Race to equilibrium'})}</button></div>
     <div style="font-weight:700;margin-top:6px">${T({ar:'بدون حفاز',en:'Without catalyst'})}</div><div class="bar"><i id="cB1" style="width:0;background:#e0474c"></i></div>
     <div style="font-weight:700;margin-top:8px">${T({ar:'مع حفاز',en:'With catalyst'})}</div><div class="bar"><i id="cB2" style="width:0;background:#15a46d"></i></div>
     <p class="muted" style="font-size:.88rem">${T({ar:'طول الشريط = نسبة النواتج المتكوّنة (توضيحي). الحفاز يصل أسرع، لكن الاتنين بيقفوا عند نفس القيمة.',en:'Bar = product formed (illustrative). With catalyst it gets there sooner, but both stop at the same value.'})}</p>
     <div id="cFb"></div></div></div>`);
  root.querySelector('#cTog').onclick=()=>{ on=!on; ['#cK','#cEa2','#cEa2t'].forEach(s=>root.querySelector(s).setAttribute('opacity',on?1:.25)); root.querySelector('#cU').setAttribute('opacity',on?.45:1);
    root.querySelector('#cTog').textContent=on?T({ar:'إزالة العامل الحفاز',en:'Remove catalyst'}):T({ar:'إضافة عامل حفاز',en:'Add catalyst'});
    root.querySelector('#cFb').innerHTML=on?`<div class="fb ok">${T({ar:'المسار الجديد له طاقة تنشيط أقل (Ea\') للاتجاهين بنفس المقدار. مستوى المتفاعلات والنواتج وقيمة ΔH لم تتغير ← لا إزاحة للاتزان ولا تغيير في K.',en:'The new path has a lower barrier (Ea\') for both directions by the same amount. Reactant/product levels and ΔH unchanged → no shift, K unchanged.'})}</div>`:''; logEv('sim','cat:'+(on?'on':'off')); };
  root.querySelector('#cRace').onclick=()=>{ cancelAnimationFrame(raf); const t0=performance.now(), F=65;
    const f=(t,k)=>F*(1-Math.exp(-t*k)); (function an(t){ const dt=(t-t0)/1000; root.querySelector('#cB1').style.width=f(dt,.45)+'%'; root.querySelector('#cB2').style.width=f(dt,1.6)+'%'; if(dt<9)raf=requestAnimationFrame(an)})(t0); logEv('sim','cat:race'); };
  return ()=>cancelAnimationFrame(raf);
};
