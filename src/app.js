/* ================= CONFIG ================= */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwkTkQUCGk2qS5gro0e0cEB2YF1A8R0czG9KKu_HErutTg4woSlBZHNVTFFrP9pFrojmw/exec', // Google Apps Script Web App (logging)
  certMinPost: 50,          // post-test % needed (with a finished path) to unlock the certificate
  showReviewTags: false,     // teacher approved the reviewed items on 2026-11-25
  thresholds: { remedial: 49, support: 79 }, // 0–49 remedial · 50–79 support · 80–100 enrichment
  teacher: { ar:'أ. أروى يوسف', en:'Miss Arwa Yousef' }
};

/* ================= CORE HELPERS ================= */
let LANG = (()=>{try{return localStorage.getItem('cot:lang')||'ar'}catch(e){return 'ar'}})();
const T = o => (o==null?'':typeof o==='string'?o:(o[LANG]??o.ar));
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const store = { get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };
function fmt(x){
  x=x.replace(/<=>/g,' ⇌ ').replace(/->/g,' → ');
  x=x.replace(/([A-Za-z\)\]])(\d+)/g,'$1<sub>$2</sub>');
  x=x.replace(/\^\{(.+?)\}/g,'<sup>$1</sup>').replace(/_\{(.+?)\}/g,'<sub>$1</sub>');
  x=x.replace(/«(.+?)\|(.+?)»/g,'<span class="frac"><span>$1</span><span>$2</span></span>');
  return x;
}
const chem = s => String(s).replace(/\$(.+?)\$/g,(m,x)=>'<span class="eq">'+fmt(x)+'</span>');
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),2200)}
const reviewTag = (f=CONFIG.showReviewTags)=> f?` <span class="tag">${T({ar:'بانتظار اعتماد المعلمة',en:'Pending teacher approval'})}</span>`:'';

/* ================= USER STATE ================= */
let USER = store.get('cot:user', null);   // {email, phone}
let S = USER ? store.get('cot:s:'+USER.email, {}) : {};
const save = ()=> USER && store.set('cot:s:'+USER.email, S);

/* ================= LOGGING → Google Sheet ================= */
function post(payload){
  if(!CONFIG.API_URL) return Promise.resolve(null);
  return fetch(CONFIG.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(r=>r.json()).catch(()=>null);
}
/* ---- accessibility settings (font size, contrast, motion, voice speed) ---- */
const A11Y=(()=>{ const K='cot:a11y'; const s=Object.assign({fs:0,hc:false,rm:false,slow:false},store.get(K,{}));
  function apply(){ const h=document.documentElement; h.classList.toggle('a-fs1',s.fs===1); h.classList.toggle('a-fs2',s.fs===2); h.classList.toggle('a-hc',!!s.hc); h.classList.toggle('a-rm',!!s.rm); }
  function set(p){ const wasSlow=s.slow; Object.assign(s,p); store.set(K,s); if(p.slow&&!wasSlow) setTimeout(()=>aSay({v:135,ar:'تمام، هتكلم أبطأ شوية 🐢',en:'Okay, I’ll speak a little slower 🐢'},3500),50); apply(); try{logEv('a11y',JSON.stringify(s))}catch(e){} paint(); }
  const rm=()=>!!s.rm||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rate=()=>s.slow?0.9:1.1;
  function opt(on,label,fn){ return `<button class="a11y-o ${on?'on':''}" onclick="${fn}" aria-pressed="${!!on}">${label}</button>`; }
  function paint(){ const b=document.getElementById('a11yBody'); if(!b) return;
    b.innerHTML=`<div class="a11y-r"><b>🔠 ${T({ar:'حجم الخط',en:'Text size'})}</b><div>${opt(s.fs===0,'<bdi dir=ltr>A</bdi>','A11Y.set({fs:0})')}${opt(s.fs===1,'<bdi dir=ltr>A+</bdi>','A11Y.set({fs:1})')}${opt(s.fs===2,'<bdi dir=ltr>A++</bdi>','A11Y.set({fs:2})')}</div></div>
     <div class="a11y-r"><b>🌓 ${T({ar:'تباين عالي',en:'High contrast'})}</b><div>${opt(!s.hc,T({ar:'عادي',en:'Normal'}),'A11Y.set({hc:false})')}${opt(s.hc,T({ar:'عالي',en:'High'}),'A11Y.set({hc:true})')}</div></div>
     <div class="a11y-r"><b>🐢 ${T({ar:'صوت Acquire',en:'Acquire’s voice'})}</b><div>${opt(!s.slow,T({ar:'عادي',en:'Normal'}),'A11Y.set({slow:false})')}${opt(s.slow,T({ar:'أبطأ',en:'Slower'}),'A11Y.set({slow:true})')}</div></div>
     <div class="a11y-r"><b>✋ ${T({ar:'الحركة والأنيميشن',en:'Motion & animation'})}</b><div>${opt(!s.rm,T({ar:'عادي',en:'Normal'}),'A11Y.set({rm:false})')}${opt(s.rm,T({ar:'أقل',en:'Reduced'}),'A11Y.set({rm:true})')}</div></div>`; }
  function open(){ close(); const d=document.createElement('div'); d.className='a11y-bg'; d.id='a11yP'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
    d.innerHTML=`<div class="a11y-card"><div class="a11y-h"><h2>♿ ${T({ar:'إعدادات الإتاحة',en:'Accessibility'})}</h2><button class="btn ghost sm" onclick="A11Y.close()" aria-label="close">✕</button></div><div id="a11yBody"></div><p class="muted" style="font-size:.88rem;margin:8px 0 0">${T({ar:'الإعدادات بتتحفظ على الجهاز ده.',en:'Settings are saved on this device.'})}</p></div>`;
    d.onclick=e=>{ if(e.target===d) close(); }; document.body.appendChild(d); paint(); logEv('a11y_open'); aSay({v:134,ar:'ظبّط الإعدادات اللي تريّحك 🙂',en:'Adjust the settings that suit you best 🙂'},3500); }
  function close(){ document.getElementById('a11yP')?.remove(); }
  apply(); return {set,get:()=>s,rm,rate,open,close,apply};
})();
/* Acquire says a line (text + recorded voice id) */
function aSay(o,ms=4500){ try{ COACH.say(T(o),ms,{force:true,voice:o.v}); }catch(e){} }
function logEv(event, details=''){
  const p={action:'log', ts:new Date().toISOString(), email:USER?.email||'', phone:USER?.phone||'', event, details:String(details).slice(0,500), path:S.path||'', pre:S.pre?.score??'', post:S.post?.score??'', lang:LANG};
  if(CONFIG.API_URL){ const q=store.get('cot:pending',[]); q.push(p); store.set('cot:pending',q.slice(-300)); flushLogs(); }
  else { const l=store.get('cot:log',[]); l.push(p); store.set('cot:log',l.slice(-400)); }
}
let FLUSHING=false;
async function flushLogs(){ if(FLUSHING) return; FLUSHING=true;
  try{ let q=store.get('cot:pending',[]);
    while(q.length){ const r=await post(q[0]); if(!r||!r.ok) break; q=store.get('cot:pending',[]); q.shift(); store.set('cot:pending',q); }
  } finally { FLUSHING=false; } }
setInterval(()=>{ if(store.get('cot:pending',[]).length) flushLogs(); }, 15000);

/* ================= PATHS ================= */
const PATHS = {
 rem:{color:'blue', icon:'book', art:'books', name:{ar:'المسار العلاجي',en:'Remedial path'}, range:'0% – 49%',
   desc:{ar:'هتدرس الوحدة كاملة من الأساس خطوة بخطوة، بالمحاكاة والمعامل الافتراضية واختبار قصير بعد كل درس.',en:'Study the whole unit from the foundations, step by step, with simulations, virtual labs and a short quiz after each lesson.'},
   feats:[{ar:'جميع دروس الوحدة بالترتيب',en:'All lessons in order'},{ar:'محاكاة ومعامل افتراضية',en:'Simulations & virtual labs'},{ar:'كويز قصير بعد كل درس',en:'Short quiz after each lesson'}],
   cta:{ar:'ابدأ من البداية',en:'Start from the beginning'}},
 sup:{color:'green', icon:'cycle', art:'target', name:{ar:'المسار التصحيحي والداعم',en:'Corrective & support path'}, range:'50% – 79%',
   desc:{ar:'لأنك محتاج دعم في بعض المفاهيم، هتنتقل مباشرة للدروس والأنشطة اللي تعالج نقاط ضعفك.',en:'You need support in some concepts, so you go straight to the lessons and activities that fix your weak points.'},
   feats:[{ar:'تصحيح المفاهيم الخاطئة',en:'Correcting misconceptions'},{ar:'أنشطة ومحاكاة موجّهة',en:'Targeted activities & simulations'},{ar:'إعادة التقييم بعد المراجعة',en:'Reassessment after review'}],
   cta:{ar:'ابدأ مسارك التصحيحي',en:'Start your support path'}},
 enr:{color:'purple', icon:'star', art:'rocket', name:{ar:'المسار الإثرائي',en:'Enrichment path'}, range:'80% – 100%',
   desc:{ar:'إجاباتك أظهرت إتقانك للمفاهيم الأساسية، يلا نتوسع بتحديات تفكير ناقد وحل مشكلات.',en:'You have mastered the basics — let’s go further with critical-thinking and problem-solving challenges.'},
   feats:[{ar:'تحديات تفكير ناقد',en:'Critical-thinking challenges'},{ar:'حل مشكلات ومواقف جديدة',en:'Problem solving in new situations'},{ar:'معمل افتراضي مفتوح',en:'Open virtual lab'}],
   cta:{ar:'ابدأ مسارك الإثرائي',en:'Start your enrichment path'}}
};
const pathFor = sc => sc<=CONFIG.thresholds.remedial?'rem':sc<=CONFIG.thresholds.support?'sup':'enr';
const unitById = id => UNITS.find(u=>u.id===id);

/* ================= LAYOUT ================= */
function nav(){
  return `<nav class="nav"><div class="brand">${ART.atom(44)}<span>${T({ar:'الاتزان الكيميائي',en:'Chemical Equilibrium'})}</span></div>
  <div class="navlinks">${USER?`<button class="hamb" id="hamb" onclick="toggleMenu(event)" aria-label="menu" aria-expanded="false" aria-controls="navmenu"><span class="hb-i">☰</span></button>
   <div class="navmenu" id="navmenu" role="menu">
    <button role="menuitem" onclick="menuGo(()=>go('dashboard'))">${ART.i.home}<span>${T({ar:'الرئيسية',en:'Home'})}</span></button>
    <button role="menuitem" onclick="menuGo(()=>go('report'))">${ART.i.chart}<span>${T({ar:'نتائجك',en:'Results'})}</span></button>
    <button role="menuitem" onclick="menuGo(()=>go('games'))"><span class="mi-emo">🎮</span><span>${T({ar:'ساحة الألعاب',en:'Game zone'})}</span></button>
    <button role="menuitem" onclick="menuGo(openChat)">${ART.i.help}<span>${T({ar:'المساعدة',en:'Help'})}</span></button>
    <button role="menuitem" data-snd onclick="VOICE.toggle()">${VOICE.label()}</button>
    <button role="menuitem" onclick="menuGo(A11Y.open)"><span class="mi-emo">♿</span><span>${T({ar:'الإتاحة',en:'Accessibility'})}</span></button>
    <button role="menuitem" onclick="menuGo(toggleLang)">${ART.i.globe}<span>${LANG==='ar'?'English':'العربية'}</span></button>
    <hr>
    <button role="menuitem" class="out" onclick="menuGo(logout)">${ART.i.out}<span>${T({ar:'خروج',en:'Logout'})}</span></button>
   </div>`:`<button class="lang" onclick="toggleLang()" aria-label="language">${ART.i.globe}<span>${LANG==='ar'?'English':'العربية'}</span></button>`}</div></nav>`;
}
/* one-time notice after login: the robot talks, and the voice can be turned off from the ☰ menu */
function soundNote(){ if(!USER || store.get('cot:sndNote',false) || document.getElementById('sndNote')) return;
  const h=document.getElementById('hamb'); if(!h) return;
  const d=document.createElement('div'); d.id='sndNote'; d.className='snd-note'; d.setAttribute('role','dialog');
  d.innerHTML=`<div class="sn-ico">🔊</div><div class="sn-tx"><b>${T({ar:'صوت الروبوت شغّال معاك',en:'The robot’s voice is on'})}</b><span>${T({ar:'Acquire هيكلمك بصوته وإنت بتتعلم. تقدر تقفل الصوت في أي وقت من القايمة ☰ اللي فوق.',en:'Acquire will talk to you as you learn. You can turn the voice off any time from the ☰ menu above.'})}</span>
    <div class="sn-b"><button class="btn blue sm" id="snOk">${T({ar:'تمام 👍',en:'OK 👍'})}</button><button class="btn ghost sm" id="snOff">🔇 ${T({ar:'اقفل الصوت',en:'Turn voice off'})}</button></div></div>`;
  document.body.appendChild(d); h.classList.add('glow');
  const done=()=>{ store.set('cot:sndNote',true); d.remove(); h.classList.remove('glow'); };
  d.querySelector('#snOk').onclick=()=>{ logEv('sound_note','ok'); done(); };
  d.querySelector('#snOff').onclick=()=>{ VOICE.set(false); logEv('sound_note','off'); done(); toast(T({ar:'قفلنا الصوت 🔇 تقدر ترجّعه من القايمة ☰',en:'Voice off 🔇 turn it back on from the ☰ menu'})); };
  h.addEventListener('click',done,{once:true}); }
function toggleMenu(ev){ ev&&ev.stopPropagation(); const m=document.getElementById('navmenu'), b=document.getElementById('hamb'); if(!m) return; const o=!m.classList.contains('open'); m.classList.toggle('open',o); b.setAttribute('aria-expanded',o); b.querySelector('.hb-i').textContent=o?'✕':'☰'; }
function closeMenu(){ const m=document.getElementById('navmenu'); if(m&&m.classList.contains('open')) toggleMenu(); }
function menuGo(f){ closeMenu(); f(); }
document.addEventListener('click',e=>{ if(!e.target.closest('#navmenu')) closeMenu(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeMenu(); });
function toggleLang(){ LANG=LANG==='ar'?'en':'ar'; try{localStorage.setItem('cot:lang',LANG)}catch(e){} applyDir(); render(); renderChat(); }
function applyDir(){ document.documentElement.lang=LANG; document.documentElement.dir=LANG==='ar'?'rtl':'ltr'; }
function logout(){ logEv('logout'); USER=null; S={}; store.set('cot:user',null); try{sessionStorage.removeItem('cot:greet')}catch(e){} COACH.hide(); closeChat(); go('login'); }
function go(r){ if(location.hash==='#'+r) render(); else location.hash=r; window.scrollTo(0,0); }

/* ================= VIEWS ================= */
let cleanups=[];
function render(){
  cleanups.forEach(f=>{try{f()}catch(e){}}); cleanups=[];
  let r=(location.hash||'').slice(1)||'login';
  if(!USER && r!=='login') r='login';
  if(USER && r==='login') r=S.pre?'dashboard':'welcome';
  if(USER && !S.pre && !['welcome','pretest'].includes(r)) r='welcome';
  const V={login:vLogin, welcome:vWelcome, pretest:()=>vTest('pre'), posttest:()=>vTest('post'), dashboard:vDash, path:vPath, report:vReport, games:vGames};
  const html = /^u[1-6]$/.test(r) ? vUnit(r) : (V[r]||vDash)();
  $('#app').innerHTML = nav() + `<main class="wrap" id="main">${chem(html)}</main>`;
  $('#fabWrap').style.display = USER?'':'none';
  CUR_ROUTE=r; document.body.dataset.route=r; VOICE.stop();
  AFTER.splice(0).forEach(f=>{try{f()}catch(e){console.error(e)}});
  if(!/test$/.test(r)) COACH.hide();
  try{ COMPANION.onRoute(r); }catch(e){ console.error(e); }
  try{ soundNote(); }catch(e){ console.error(e); }
}
let AFTER=[], CUR_ROUTE='';
window.addEventListener('hashchange',render);

/* ---- LOGIN (with Acquire guide robot) ---- */
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const cleanPhone = v => v.trim().replace(/[\s-]/g,'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const validPhone = v => { const ph=cleanPhone(v); return /^(\+?20)?0?1[0125]\d{8}$/.test(ph) || /^\+?\d{9,15}$/.test(ph); };
function vLogin(){
  AFTER.push(()=>{ $('#lf').onsubmit=e=>{ e.preventDefault();
    const em=$('#em').value.trim().toLowerCase(), ph=cleanPhone($('#ph').value);
    let err='', tgt=null;
    if(!validEmail(em)) { err=T({ar:'اكتب إيميل صحيح.',en:'Enter a valid email.'}); tgt='#em'; }
    else if(!validPhone(ph)) { err=T({ar:'اكتب رقم تليفون صحيح.',en:'Enter a valid phone number.'}); tgt='#ph'; }
    else if(!$('#cs').checked) { err=T({ar:'لازم توافق على تسجيل بياناتك عشان نكمل.',en:'Please agree to the data note to continue.'}); tgt='#csWrap'; }
    $('#lerr').textContent=err; if(err){ GUIDE.oops(err,tgt); return; }
    GUIDE.stop();
    USER={email:em, phone:ph}; store.set('cot:user',USER); S=store.get('cot:s:'+em,{}); S.firstLogin=S.firstLogin||new Date().toISOString(); save();
    logEv('login', S.pre?'returning':'new'); go(S.pre?'dashboard':'welcome'); };
    GUIDE.start(); });
  return `<div class="login2">
   <div class="lcol">
    <div class="hero"><span class="tag ill">${T({ar:'الصف الثالث الثانوي · كيمياء',en:'Grade 12 (Egypt) · Chemistry'})}</span>
     <h1>${T({ar:'الاتزان الكيميائي',en:'Chemical Equilibrium'})}</h1>
     <p style="font-size:1.08rem;margin:0">${T({ar:'كيف تدافع التفاعلات عن توازنها ضد الحرارة والضغط؟',en:'How do reactions defend their balance against heat and pressure?'})}</p></div>
    <form class="card" id="lf" novalidate><h2 style="margin-top:0">${T({ar:'تسجيل الدخول',en:'Sign in'})}</h2>
     <div class="field"><label for="em">${T({ar:'البريد الإلكتروني',en:'Email'})}</label><input id="em" type="email" autocomplete="email" dir="ltr" placeholder="name@example.com"></div>
     <div class="field"><label for="ph">${T({ar:'رقم الموبايل',en:'Mobile number'})}</label><input id="ph" type="tel" autocomplete="tel" dir="ltr" placeholder="01xxxxxxxxx"></div>
     <label class="consent" id="csWrap"><input type="checkbox" id="cs"><span>${T({ar:'أوافق على تسجيل الإيميل ورقم الموبايل ونتائجي ونشاطي في المنصة لدى المعلمة لمتابعة تقدّمي.',en:'I agree that my email, phone, results and activity are recorded for my teacher to follow my progress.'})}</span></label>
     <div class="err" id="lerr" role="alert"></div>
     <button class="btn blue" id="lgo" style="width:100%">${T({ar:'يلا نبدأ',en:"Let's start"})} ${ART.i.play}</button>
     <p class="muted" style="font-size:.85rem;margin-bottom:0">${T({ar:'لو دخلت قبل كده بنفس الإيميل، هتكمّل من مكانك على نفس الجهاز.',en:'If you signed in before with this email, you continue where you left off on this device.'})}</p></form>
   </div>
   <div class="rstage" id="rstage" aria-live="polite">
    <div class="rbubble" id="rbub"><span id="rtxt"></span><i class="caret"></i></div>
    <div class="rbot" id="rbot">${ART.robotBig()}</div>
    <button type="button" class="btn ghost sm rskip" id="rreplay">↺ ${T({ar:'اسمع Acquire تاني',en:'Hear Acquire again'})}</button>
    <button type="button" class="btn ghost sm rskip" data-snd onclick="VOICE.toggle()">${VOICE.label()}</button>
   </div></div>`;
}

/* Acquire guide: talks, grows, waves and points at what to fill */
/* ---- Acquire voice: recorded lines in audio/<lang>/<id>.mp3 (ids = robot script numbers) ---- */
const VOICE=(()=>{ let a=null, q=[], pending=null, primed=false, held=false; const RATE=1.1, cache={}, warming={};
  /* ONE audio element reused for every line: phones (iPhone above all) only let a page play sound on an element first started by a tap */
  const el=new Audio(); el.preload='auto'; el.setAttribute('playsinline','');
  const SILENT='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  try{ if(navigator.audioSession) navigator.audioSession.type='playback'; }catch(e){} /* iPhone: play even with the silent switch on */
  function prime(){ if(primed) return; primed=true; try{ if(!el.src||el.src===location.href){ el.src=SILENT; } const r=el.play(); if(r&&r.catch) r.catch(()=>{ primed=false; }); }catch(e){ primed=false; } }
  const on=()=>store.get('cot:sound',true)&&!store.get('cot:mute',false);
  const src=id=>`audio/${LANG==='en'?'en':'ar'}/${String(id).padStart(2,'0')}.mp3`;
  const ALL=[...Array(127)].map((_,i)=>i+1); ALL.splice(72,0,'72a');
  /* download every line of the current language once, in the background, so a line starts instantly */
  async function warm(){ const lg=LANG==='en'?'en':'ar'; if(warming[lg]) return; warming[lg]=1;
    for(const id of ALL){ const u=src(id).replace(/^audio\/\w+/,'audio/'+lg); if(cache[u]) continue;
      try{ const r=await fetch(u); if(r.ok) cache[u]=URL.createObjectURL(await r.blob()); }catch(e){ warming[lg]=0; return; } } }
  setTimeout(warm,7000); /* after the intro, so the animation stays smooth */
  function next(){ const id=q.shift(); if(id==null){ a=null; return; } const rest=q.slice(); const u=src(id); a=el; el.onended=next; el.src=cache[u]||u; el.playbackRate=A11Y.rate(); el.defaultPlaybackRate=A11Y.rate(); el.preservesPitch=true;
    const r=el.play(); if(r&&r.catch) r.catch(()=>{ pending=[id,...rest]; q=[]; }); }
  function play(ids){ stop(); warm(); if(held){ pending=null; return; } if(!on()||ids==null) return; q=[].concat(ids).filter(x=>x!=null); pending=null; next(); }
  function stop(){ q=[]; if(a){ a.onended=null; try{a.pause()}catch(e){} a=null; } }
  /* the first real tap (touchend / click / key) unlocks sound; a line that was blocked before it plays then */
  const unlock=()=>{ if(!held&&pending&&on()){ const p=pending; pending=null; play(p); } else prime(); };
  ['touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlock,{capture:true}));
  function set(v){ store.set('cot:sound',!!v); logEv('acquire_sound',v?'on':'off'); if(!v) stop(); document.querySelectorAll('[data-snd]').forEach(b=>b.innerHTML=label()); document.querySelectorAll('[data-sndi]').forEach(b=>b.textContent=icon()); }
  const icon=()=>store.get('cot:sound',true)?'🔊':'🔇';
  const label=()=>store.get('cot:sound',true)?'🔊 '+T({ar:'صوت الروبوت شغّال',en:'Robot voice on'}):'🔇 '+T({ar:'صوت الروبوت مقفول',en:'Robot voice off'});
  return {play,stop,on,set,label,icon,prime,hold:v=>{ held=!!v; if(held){ pending=null; stop(); } },toggle:()=>set(!store.get('cot:sound',true))};
})();

const GUIDE = (()=>{
  let timers=[], stage='', typing=null, live=false;
  const L = {
    hi:{v:1,ar:'أهلًا بيك! 👋 هنبدأ تجربة تعليمية بشكل جديد خالص',en:'Hi there! 👋 We’re starting a totally new learning experience'},
    ready:{v:2,ar:'جاااهز؟ 🤩',en:'Readyyy? 🤩'},
    go:{v:3,ar:'يلا بينا يا أصحابي نبدأ! 🚀',en:'Let’s go, friends! 🚀'},
    email:{v:4,ar:'اكتب الإيميل الشخصي بتاعك 📧',en:'Type your personal email 📧'},
    phone:{v:5,ar:'تمام! 👌 وكمان رقم موبايلك 📱',en:'Great! 👌 And your mobile number 📱'},
    consent:{v:6,ar:'آخر حاجة: علّم هنا بالموافقة ✅',en:'Last thing: tick the agreement here ✅'},
    btn:{v:7,ar:'كده تمام! دوس هنا ونبدأ 🎉',en:'All set! Press here to start 🎉'}
  };
  const $r = s=>document.querySelector(s);
  const clear=()=>{ timers.forEach(clearTimeout); timers=[]; clearInterval(typing); };
  const later=(ms,f)=>timers.push(setTimeout(()=>live&&f(),ms));
  function mood(cls){ const b=$r('#rbot'); if(!b)return; b.classList.remove('pop','jump','wave','point','big'); void b.offsetWidth; cls.split(' ').filter(Boolean).forEach(c=>b.classList.add(c)); }
  function say(o){ const el=$r('#rtxt'); if(!el)return; const txt=T(o); VOICE.play(o.v); clearInterval(typing); el.textContent=''; let i=0;
    const bub=$r('#rbub'); bub.classList.remove('show'); void bub.offsetWidth; bub.classList.add('show');
    if(A11Y.rm()){ el.textContent=txt; return; }
    const chars=[...txt]; typing=setInterval(()=>{ el.textContent+=chars[i++]||''; if(i>=chars.length) clearInterval(typing); },32); }
  function highlight(sel){ document.querySelectorAll('.glow').forEach(x=>x.classList.remove('glow')); if(!sel) return; const t=$r(sel); if(t) t.classList.add('glow'); }
  function aim(sel){ const arm=$r('#rbPoint'), svg=$r('#rbSvg'); if(!arm||!svg) return;
    if(!sel){ arm.style.transform='rotate(65deg)'; return; }
    const t=$r(sel); if(!t) return;
    const r=svg.getBoundingClientRect(), k=r.width/260, sx=r.left+148*k, sy=r.top+159*k;
    const tr=t.getBoundingClientRect(); const tx=(document.documentElement.dir==='rtl'? tr.left+Math.min(40,tr.width/2) : tr.left+tr.width/2), ty=tr.top+tr.height/2;
    let deg=Math.atan2(ty-sy, tx-sx)*180/Math.PI; deg=Math.max(-80,Math.min(95,deg));
    arm.style.transform=`rotate(${deg}deg)`; }
  function point(sel,msg){ stage=sel; say(msg); mood('point'); highlight(sel); aim(sel); }
  function next(){ if(!live) return;
    if(!validEmail($r('#em').value)) return point('#em',L.email);
    if(!validPhone($r('#ph').value)) return point('#ph',L.phone);
    if(!$r('#cs').checked) return point('#csWrap',L.consent);
    point('#lgo',L.btn); }
  function intro(){ clear(); live=true; highlight(null); aim(null);
    say(L.hi); mood('big wave');
    later(3200,()=>{ say(L.ready); mood('big pop'); });
    later(5200,()=>{ say(L.go); mood('big jump'); });
    later(7600,()=>{ mood(''); next(); }); }
  function start(){ live=true; intro();
    const em=$r('#em'), ph=$r('#ph'), cs=$r('#cs');
    const onEdit=()=>{ if(timers.length){ clear(); } next(); };
    em.addEventListener('focus',()=>{ if(stage!=='#em'){ clear(); point('#em',L.email);} });
    ph.addEventListener('focus',()=>{ if(stage!=='#ph'){ clear(); point('#ph',validEmail(em.value)?L.phone:{v:5,ar:'وكمان رقم موبايلك 📱',en:'And your mobile number 📱'});} });
    em.addEventListener('input',()=>{ if(validEmail(em.value)&&stage==='#em'){ clear(); later(600,next); live=true; } });
    ph.addEventListener('input',()=>{ if(validPhone(ph.value)&&stage==='#ph'){ clear(); later(600,next); live=true; } });
    cs.addEventListener('change',onEdit);
    $r('#rreplay').onclick=intro;
    window.addEventListener('resize',()=>stage&&aim(stage));
    window.addEventListener('scroll',()=>stage&&aim(stage),{passive:true}); }
  function oops(msg,sel){ clear(); live=true; stage=sel; say({v:{'#em':8,'#ph':9,'#csWrap':10}[sel],ar:'🤔 '+msg,en:'🤔 '+msg}); mood('pop point'); highlight(sel); aim(sel); }
  function stop(){ clear(); live=false; highlight(null); }
  window.addEventListener('hashchange',()=>{ if(!document.querySelector('#rstage')) stop(); });
  return {start,stop,oops};
})();

/* ---- WELCOME ---- */
function vWelcome(){
  const moods=[{k:'great',ar:'ممتاز',en:'Great'},{k:'good',ar:'كويس',en:'Good'},{k:'nervous',ar:'متوتر شوية',en:'A bit nervous'},{k:'tired',ar:'تعبان',en:'Tired'}];
  AFTER.push(()=>{ $$('.moods button').forEach(b=>b.onclick=()=>{S.mood=b.dataset.k;save();$$('.moods button').forEach(x=>x.classList.toggle('on',x===b));
    $('#moodR').textContent=T(MOOD_LINES[b.dataset.k]); WALKER.choose(b); logEv('mood',b.dataset.k)}); WALKER.start();
    const sb=$('#startDx'); let told=false; const tell=()=>{ if(told) return; told=true; WALKER.hint(sb,T(OFFLINE_LINE)); VOICE.play(15); logEv('robot_offline_hint',''); };
    sb.addEventListener('mouseenter',tell); sb.addEventListener('focus',tell);
    if('IntersectionObserver' in window && matchMedia('(hover: none)').matches){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); setTimeout(tell,400); } },{threshold:0.9}); io.observe(sb); } });
  const obj=[{ar:'تفسير الاتزان الديناميكي',en:'Explain dynamic equilibrium'},{ar:'تطبيق مبدأ لوشاتيليه',en:"Apply Le Chatelier's principle"},{ar:'كتابة واستخدام تعبيرات Kc و Kp',en:'Write and use Kc and Kp'},{ar:'تفسير أثر الحرارة والضغط على الاتزان و K',en:'Explain temperature and pressure effects on equilibrium and K'},{ar:'تفسير دور العامل الحفاز',en:'Explain the role of a catalyst'},{ar:'قراءة منحنيات المعدل والتركيز والطاقة',en:'Interpret rate, concentration and energy graphs'}];
  const axes=[{c:'blue',h:{ar:'المحور 1: فهم الاتزان الكيميائي',en:'Axis 1: Understanding equilibrium'},b:{ar:'التفاعل الانعكاسي، الاتزان الديناميكي، قانون فعل الكتلة، و Kc.',en:'Reversible reactions, dynamic equilibrium, mass action, Kc.'}},
    {c:'green',h:{ar:'المحور 2: مبدأ لوشاتيليه',en:"Axis 2: Le Chatelier's principle"},b:{ar:'التركيز، الحرارة، الضغط و Kp، والعامل الحفاز.',en:'Concentration, temperature, pressure & Kp, catalyst.'}},
    {c:'purple',h:{ar:'المحور 3: البحث والتطبيق',en:'Axis 3: Investigation & application'},b:{ar:'محاكاة تفاعلية، توقّع، قراءة منحنيات، ومواقف جديدة.',en:'Simulations, prediction, graphs and new situations.'}}];
  return `<div class="banner">${ART.spark()}<div><h1>${T({ar:'أهلًا بيك في رحلة الاتزان الكيميائي!',en:'Welcome to the chemical-equilibrium journey!'})}</h1><p>${T({ar:'عامل إيه النهارده؟',en:'How are you today?'})}</p>
   <div class="moods" style="justify-content:center">${moods.map(m=>`<button data-k="${m.k}" class="${S.mood===m.k?'on':''}">${T(m)}</button>`).join('')}</div><div id="moodR" class="sr-only" aria-live="polite"></div></div></div>
   <div class="card" style="margin-top:20px"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><span id="wbHome" class="wb-home">${ART.robot(96)}</span><div style="flex:1;min-width:240px">
    <h2 style="margin:0">${T({ar:'مهمتك: تحقيق في الاتزان الكيميائي',en:'Your mission: investigate chemical equilibrium'})}</h2>
    <p>${T({ar:'التفاعل الكيميائي المتزن "متهم" بأنه بيقاوم أي تغيير يحصل له. مهمتك تحقق في القضية: هتشوف إزاي النظام المتزن بيرد لما نغير التركيز أو الحرارة أو الضغط، وفي الآخر تصدر حكمك العلمي.',en:'An equilibrium system is "accused" of resisting every change. Your job: investigate how it responds when we change concentration, temperature or pressure — then give your scientific verdict.'})}</p>
    <p class="muted">${T({ar:'تحقق ← توقّع ← نمذجة ← حساب ← تطبيق ← تقييم ← الحكم',en:'Investigate → Predict → Model → Calculate → Apply → Assess → Verdict'})}</p></div></div>
    <h3>${T({ar:'هتقدر في آخر الرحلة:',en:'By the end you will be able to:'})}</h3><ul class="kp">${obj.map(o=>`<li>${T(o)}</li>`).join('')}</ul>
    <div class="axes">${axes.map(a=>`<div style="background:var(--${a.c}Soft)"><b>${T(a.h)}</b><div class="muted">${T(a.b)}</div></div>`).join('')}</div>
    <div class="predict">${T({ar:'الخطوة الجاية: اختبار تشخيصي قصير (14 سؤال) عشان نعرف نقطة انطلاقك. مفيش درجات عليه — هو بس بيحدد المسار الأنسب ليك.',en:'Next: a short diagnostic (14 questions) to find your starting point. It is not graded — it only picks the best path for you.'})}</div>
    <div style="text-align:center;margin-top:14px"><button class="btn blue" id="startDx" onclick="go('pretest')">${T({ar:'ابدأ الاختبار التشخيصي',en:'Start the diagnostic test'})} ${ART.i.play}</button>
     <div class="offline-note">📶 ${T({ar:'لو النت فصل وإنت بتحل، ولا يهمك: إجاباتك وبياناتك محفوظة على جهازك وهتتبعت لوحدها أول ما النت يرجع.',en:'If your internet drops while you work, no worries: your answers and data are saved on your device and sent automatically when you reconnect.'})}</div></div></div>`;
}


/* ---- Welcome-page walking robot: tours the mood buttons, then reacts to the chosen mood ---- */
const MOOD_LINES = {
  great:{ar:'إيه الحلاوة دي! 🤩 إنت كده هتكسر الدنيا النهارده!',en:'Awesome! 🤩 You’re going to smash it today!'},
  good:{ar:'حلو أوي! 👍 يلا نخلّي اليوم أحلى كمان مع الكيميا!',en:'Nice! 👍 Let’s make today even better with chemistry!'},
  nervous:{ar:'ولا يهمك يا بطل 💪 هنمشي واحدة واحدة، وأنا معاك خطوة بخطوة!',en:'No worries, champ 💪 We’ll go step by step — I’m with you!'},
  tired:{ar:'معلش يا صاحبي 😴 خد نفس عميق… هنبدأ براحة وهتلاقي نفسك صحصحت!',en:'Hang in there 😴 Take a deep breath — we’ll start easy and you’ll perk up!'}
};
const WALKER = (()=>{
  const EMO={great:'🤩',good:'👍',nervous:'😬',tired:'😴'};
  let el=null, pos={x:0,y:0}, running=false, token=0, current=null;
  const reduce=()=>A11Y.rm();
  const sizeFor=()=>{ const b=document.querySelector('.moods button'); const h=b?b.getBoundingClientRect().height:44; return Math.round(h*1.6); };
  function make(){ el?.remove(); el=document.createElement('div'); el.className='walker'; el.innerHTML=`<div class="wb-bub" aria-hidden="true"></div><div class="wb-body">${ART.robotMini()}</div>`; document.body.appendChild(el); size(); }
  function size(){ if(!el) return; const h=sizeFor(); el.style.width=Math.round(h*100/132)+'px'; el.style.height=h+'px'; }
  const page=r=>({x:r.left+scrollX, y:r.top+scrollY, w:r.width, h:r.height});
  function spotOn(btn){ const r=page(btn.getBoundingClientRect()), w=el.offsetWidth, h=el.offsetHeight; return {x:r.x+r.w/2-w/2, y:r.y-h+12}; }
  function spotHome(){ const r=page(document.querySelector('#wbHome').getBoundingClientRect()), w=el.offsetWidth, h=el.offsetHeight; return {x:r.x+r.w/2-w/2, y:r.y+r.h-h}; }
  function place(p){ pos=p; if(!el) return; el.style.transform=`translate(${p.x}px,${p.y}px)`; }
  function mood(m){ el.className='walker'+(m?' m-'+m:''); current=m; }
  function say(text,big,side){ const b=el.querySelector('.wb-bub'); b.textContent=text; b.classList.toggle('big',!!big); b.classList.toggle('side',!!side); b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    b.style.marginInlineStart='0px'; if(side){ b.style.transform=''; const room=el.getBoundingClientRect().left-24; b.style.maxWidth=Math.max(200,Math.min(500,room))+'px'; return; } requestAnimationFrame(()=>{ const r=b.getBoundingClientRect(); let dx=0; if(r.left<8) dx=8-r.left; if(r.right>innerWidth-8) dx=innerWidth-8-r.right; b.style.transform=`translateX(calc(-50% + ${dx}px))`; }); }
  function hush(){ el?.querySelector('.wb-bub').classList.remove('show'); }
  function move(to, tk){ return new Promise(res=>{
    if(reduce()){ place(to); return res(); }
    const from={...pos}, dist=Math.hypot(to.x-from.x,to.y-from.y), dur=Math.min(1600,Math.max(520,dist*2.2)), lift=Math.min(140,40+Math.abs(to.y-from.y)*0.35);
    el.classList.add('run'); el.classList.toggle('face-l', to.x<from.x);
    const mx=(from.x+to.x)/2, my=Math.min(from.y,to.y)-lift;
    const a=el.animate([{transform:`translate(${from.x}px,${from.y}px)`},{transform:`translate(${mx}px,${my}px)`,offset:.5},{transform:`translate(${to.x}px,${to.y}px)`}],{duration:dur,easing:'ease-in-out'});
    a.onfinish=()=>{ place(to); el.classList.remove('run'); el.classList.add('land'); setTimeout(()=>el&&el.classList.remove('land'),300); res(); };
    a.oncancel=()=>res(); }); }
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function tour(){ const tk=++token; running=true; const home=document.querySelector('#wbHome'); home.classList.add('away');
    place(spotHome()); mood(null); await wait(500);
    for(const b of document.querySelectorAll('.moods button')){ if(tk!==token) return; hush(); mood(null); await move(spotOn(b),tk); if(tk!==token) return; mood(b.dataset.k); say(EMO[b.dataset.k]); await wait(1400); }
    if(tk!==token) return; hush(); mood(null); await move(spotHome(),tk); if(tk!==token) return;
    home.classList.remove('away'); el.style.visibility='hidden'; running=false; }
  async function choose(btn){ if(!el) make(); const tk=++token; el.getAnimations().forEach(a=>a.cancel()); el.style.visibility='visible';
    document.querySelector('#wbHome')?.classList.add('away'); if(!running){ place(spotHome()); } running=false;
    hush(); mood(null); await move(spotOn(btn),tk); if(tk!==token) return; mood(btn.dataset.k); say(T(MOOD_LINES[btn.dataset.k]),true); VOICE.play({great:11,good:12,nervous:13,tired:14}[btn.dataset.k]); }
  function start(){ make(); const chosen=S.mood&&document.querySelector(`.moods button[data-k="${S.mood}"]`);
    if(chosen){ document.querySelector('#wbHome').classList.add('away'); place(spotOn(chosen)); mood(S.mood); return; }
    if(reduce()){ el.style.visibility='hidden'; return; } tour(); }
  function relayout(){ if(!el||!document.querySelector('.moods')) return; size(); const on=current&&document.querySelector(`.moods button[data-k="${current}"]`); if(on&&!running) place(spotOn(on)); }
  addEventListener('resize',relayout);
  addEventListener('hashchange',()=>{ token++; el?.remove(); el=null; });
  async function hint(btn,text){ if(!el) make(); const tk=++token; el.getAnimations().forEach(a=>a.cancel()); el.style.visibility='visible';
    document.querySelector('#wbHome')?.classList.add('away'); if(running||!current){ place(spotHome()); } running=false;
    const wide=innerWidth>760 && btn.getBoundingClientRect().left>300; let to;
    if(wide){ const r=page(btn.getBoundingClientRect()), w=el.offsetWidth, h=el.offsetHeight; to={x:r.x-w-18, y:r.y+r.h/2-h/2}; } else to=spotOn(btn);
    hush(); mood(null); await move(to,tk); if(tk!==token) return; mood('great'); say(text,true,wide); }
  return {start,choose,hint};
})();
const OFFLINE_LINE={ar:'بص، إحنا على فكرة عندنا ميزة حلوة 😉 ما تشغلش بالك لو النت قطع وإنت بتحل، إحنا محتفظين بكل إجاباتك وكل الداتا بتاعتك! 💾',en:'Hey, here’s a cool feature 😉 Don’t worry if your internet drops while you work — we keep all your answers and data safe! 💾'};

/* ---- PRE / POST TEST (free navigation) ---- */
function vTest(kind){
  const qs = kind==='pre'?PRETEST:[...PRETEST].sort((a,b)=>((a.id.charCodeAt(2)*7)%11)-((b.id.charCodeAt(2)*7)%11));
  S.drafts=S.drafts||{}; const dr=S.drafts[kind]||{};
  let i=dr.i||0; const ans=Object.assign({},dr.ans), flag=Object.assign({},dr.flag);
  const keep=()=>{ S.drafts[kind]={ans,flag,i,at:new Date().toISOString()}; save(); };
  if(Object.keys(ans).length) setTimeout(()=>toast(T({ar:'رجّعنالك إجاباتك اللي فاتت 💾',en:'Your earlier answers were restored 💾'})),300);
  const L=j=>LANG==='ar'?'أبجد'[j]:'ABCD'[j];
  AFTER.push(()=>{ const box=$('#tq');
    const N=qs.length, done=()=>Object.keys(ans).length, gapBefore=k=>{ for(let x=0;x<k;x++) if(ans[qs[x].id]==null) return x+1; return 0; };
    let idle=null; const idleArm=()=>{ clearTimeout(idle); idle=setTimeout(()=>{ if(CUR_ROUTE.endsWith('test')) COACH.say(T({ar:'أنا موجود هنا لمساعدتك 🤖 خد وقتك وفكّر براحتك',en:'I’m right here to help you 🤖 Take your time and think it through'}),5000,{voice:17}); },25000); };
    cleanups.push(()=>{ clearTimeout(idle); COACH.hide(); });
    let pv=null; const progressLine=()=>{ const n=done(), m=N-n; pv=null;
      if(m===0){ pv=31; $('#tsend').classList.add('glow'); return T({ar:'جاوبت على كل الأسئلة 🎉 تقدر دلوقتي تسلّم الاختبار',en:'You answered every question 🎉 You can submit the test now'}); }
      $('#tsend').classList.remove('glow');
      let s = n===1 ? T({ar:`حلّيت سؤال، فاضلك ${m} 💪`,en:`1 done, ${m} to go 💪`}) : T({ar:`حلّيت ${n}، فاضلك ${m} 💪`,en:`${n} done, ${m} to go 💪`});
      pv=N===14?[17+n]:[]; const g=gapBefore(i); if(g&&N===14) pv.push(31+g); if(g) s+=T({ar:` — بس إنت ناسي سؤال رقم ${g}، افتكر ترجعله 😉`,en:` — but you skipped question ${g}, remember to go back 😉`});
      return s; };
    COACH.say(T({ar:`أنا موجود هنا لمساعدتك 🤖 جاوب براحتك، وأنا هقولك فاضلك كام سؤال`,en:`I’m here to help you 🤖 Answer at your pace and I’ll tell you how many are left`}),6000,{voice:16});
    const navRow=()=>{ const n=Object.keys(ans).length; $('#tp').style.width=(n/qs.length*100)+'%';
      $('#tn').textContent=T({ar:`${n} من ${qs.length} متجاوب`,en:`${n} of ${qs.length} answered`});
      $('#qnav').innerHTML=qs.map((q,k)=>`<button class="qn ${ans[q.id]!=null?'a':''} ${k===i?'cur':''} ${flag[q.id]?'f':''}" data-k="${k}" aria-label="${T({ar:'سؤال',en:'Question'})} ${k+1}">${k+1}</button>`).join('');
      $$('#qnav .qn').forEach(b=>b.onclick=()=>{i=+b.dataset.k;show()}); };
    const show=()=>{ const q=qs[i]; $('#tsub').innerHTML=''; if(Object.keys(ans).length||i) keep();
      box.innerHTML=chem(`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><h2 style="font-size:1.2rem;margin-top:0">${i+1}. ${T(q.q)}</h2><button class="btn sm flagb ${flag[q.id]?'on':''}" id="tfl">⚑ ${flag[q.id]?T({ar:'مُعلَّم للمراجعة',en:'Marked for review'}):T({ar:'علّم للمراجعة',en:'Mark for review'})}</button></div>
        ${q.o.map((o,j)=>`<button class="opt ${ans[q.id]===j?'sel':''}" data-j="${j}"><span class="k">${L(j)}</span><span>${T(o)}</span></button>`).join('')}
        <div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn ghost sm" id="tb" ${i?'':'disabled'}>${T({ar:'السابق',en:'Back'})}</button><button class="btn blue sm" id="tnx" ${i===qs.length-1?'disabled':''}>${T({ar:'التالي',en:'Next'})}</button></div>`);
      $$('.opt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j; const was=ans[q.id]; if(ans[q.id]===j){delete ans[q.id]}else ans[q.id]=j; $$('.opt',box).forEach(x=>x.classList.toggle('sel',+x.dataset.j===ans[q.id])); navRow(); keep(); idleArm();
        if(was==null && ans[q.id]!=null) COACH.say(progressLine(),done()===N?9000:3500,{voice:pv}); else if(ans[q.id]==null){ COACH.hide(); $('#tsend').classList.remove('glow'); } });
      $('#tfl').onclick=()=>{flag[q.id]=!flag[q.id]; keep(); show()};
      $('#tb').onclick=()=>{i--;show()}; $('#tnx').onclick=()=>{ const left=ans[q.id]==null; i++; show(); if(left) COACH.say(T({ar:`إنت ناسي سؤال رقم ${i}، افتكر ترجعله 😉`,en:`You skipped question ${i} — remember to come back 😉`}),4500,{voice:N===14?31+i:null}); }; navRow(); idleArm(); };
    $('#tsend').onclick=()=>{ const miss=qs.map((q,k)=>ans[q.id]==null?k+1:0).filter(Boolean), fl=qs.map((q,k)=>flag[q.id]?k+1:0).filter(Boolean);
      if(!miss.length && !fl.length) return finish();
      COACH.say(miss.length?T({ar:`فاضلك ${miss.length} ${miss.length===1?'سؤال':'أسئلة'} ماجاوبتهمش: ${miss.join('، ')} — تحب ترجعلهم؟`,en:`${miss.length} unanswered: ${miss.join(', ')} — want to go back?`}):T({ar:'جاوبت على كل الأسئلة 🎉 راجع اللي معلّمه لو حابب، وبعدين سلّم',en:'All answered 🎉 Review your marked ones if you like, then submit'}),7000,{voice:miss.length?46:47});
      $('#tsub').innerHTML=`<div class="predict"><b>${miss.length?T({ar:'فاضل أسئلة ماتجاوبتش: ',en:'Unanswered questions: '})+miss.join('، '):''}</b>${fl.length?`<div>${T({ar:'أسئلة معلّمة للمراجعة: ',en:'Marked for review: '})}${fl.join('، ')}</div>`:''}
        ${miss.length?`<div class="muted">${T({ar:'الأسئلة المتروكة هتتحسب غلط.',en:'Unanswered questions count as wrong.'})}</div>`:''}
        <div class="ctrls"><button class="btn blue sm" id="tgo">${T({ar:'ارجع لها',en:'Go back to them'})}</button><button class="btn ghost sm" id="tfin">${T({ar:'سلّم كده',en:'Submit anyway'})}</button></div></div>`;
      $('#tgo').onclick=()=>{i=(miss[0]||fl[0])-1;show()}; $('#tfin').onclick=finish; $('#tsub').scrollIntoView({behavior:'smooth',block:'center'}); };
    const finish=()=>{ delete S.drafts[kind]; let ok=0; const wrong=new Set();
      PRETEST.forEach(q=>{ if(ans[q.id]===q.a) ok++; else wrong.add(q.c)});
      const score=Math.round(ok/PRETEST.length*100), weak=[...wrong];
      const skipped=PRETEST.filter(q=>ans[q.id]==null).map(q=>q.id);
      const det=PRETEST.map(q=>q.id+':'+(ans[q.id]==null?'skipped':ans[q.id]===q.a?'1':'0')).join(',');
      const sum=`score=${score}% | correct=${ok} | wrong=${PRETEST.length-ok-skipped.length} | skipped=${skipped.length}`;
      if(kind==='pre'){ S.pre={score,ans,weak,skipped,at:new Date().toISOString()}; S.path=null; S.justPre=true; S.rec=pathFor(score); save(); logEv('pretest_complete',`${sum} | recommended=${S.rec} | weak=${weak.join(';')} | ${det}`); go('dashboard'); }
      else { S.post={score,ans,weak,skipped,at:new Date().toISOString()}; save(); logEv('posttest_complete',`${sum} | pre=${S.pre.score}% | weak=${weak.join(';')} | ${det}`); go('report'); } };
    show(); });
  return `<div class="qwrap"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
    <h1 style="margin:0;font-size:1.5rem">${kind==='pre'?T({ar:'الاختبار التشخيصي',en:'Diagnostic pre-test'}):T({ar:'الاختبار البعدي',en:'Post-test'})}</h1>
    <span><b id="tn"></b> ${CONFIG.showReviewTags?`<span class="tag">${T({ar:'أسئلة مقترحة — بانتظار اعتماد المعلمة',en:'Draft items — pending teacher approval'})}</span>`:''}</span></div>
    <div class="progress"><i id="tp"></i></div>
    <div class="qnav" id="qnav" role="navigation"></div>
    <p class="muted" style="font-size:.88rem;margin:4px 0 12px">${T({ar:'تقدر تتنقّل بين الأسئلة بأي ترتيب، وتغيّر إجابتك لحد ما تسلّم.',en:'Move between questions in any order and change answers until you submit.'})}</p>
    <div id="tq"></div>
    <div id="tsub"></div>
    <div style="text-align:center;margin-top:16px;border-top:1px solid var(--line);padding-top:14px"><button class="btn green" id="tsend">${T({ar:'تسليم الاختبار',en:'Submit test'})}</button></div></div></div>`;
}

/* ---- DASHBOARD (reference design) ---- */
function ring(p){ const r=62,c=2*Math.PI*r; return `<svg class="ring" width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="${r}" fill="none" stroke="#e3eaf6" stroke-width="16"/><circle cx="80" cy="80" r="${r}" fill="none" stroke="#15a46d" stroke-width="16" stroke-linecap="round" stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 80 80)"/><text x="80" y="92" text-anchor="middle" font-size="34" font-weight="900" fill="#13284a" font-family="Inter">${p}%</text></svg>`; }
function vDash(){
  const pre=S.pre, rec=S.rec||pathFor(pre.score);
  const card=k=>{const p=PATHS[k];return `<div class="path ${p.color} ${k===rec?'rec':''}">${k===rec?`<span class="recbadge" style="background:var(--${p.color}2)">${T({ar:'مناسب لك',en:'Recommended'})}</span>`:''}
    <div class="pill ${p.color}">${ART.i[p.icon]} ${T(p.name)}</div>${ART[p.art]()}<p>${T(p.desc)}</p>
    <div class="what ${p.color}">${T({ar:'ماذا ستجد هنا؟',en:'What will you find?'})}</div>
    <ul class="feat">${p.feats.map(f=>`<li>${ART.check(`var(--${p.color}2)`.replace(/var\(--(\w+)\)/,(m,v)=>({blue2:'#2f7be6',green2:'#15a46d',purple2:'#8a63e0'})[v]))}${T(f)}</li>`).join('')}</ul>
    <button class="btn ${p.color}" style="width:100%;margin-top:auto" onclick="choosePath('${k}')">${ART.i.play} ${T(p.cta)}</button><div class="range">${T({ar:'نسبة الاختبار القبلي',en:'Pre-test range'})}: <span dir="ltr">${p.range}</span></div></div>`};
  return `<div class="dash"><div>
    <div class="banner">${ART.spark()}<div><h1>${T({ar:'نتيجتك تحدد نقطة انطلاقك',en:'Your result sets your starting point'})}</h1><p>${T({ar:'بناءً على تحليل إجاباتك، يمكنك اختيار المسار الأنسب لاحتياجاتك التعليمية.',en:'Based on your answers, choose the path that best fits your learning needs.'})}</p></div>${ART.target().replace('class="ill"','width="110"')}</div>
    <div class="paths">${['rem','sup','enr'].map(card).join('')}</div>
    <div class="helpbar">${ART.robot(110)}<div class="bubble"><b>${T({ar:'عندك أي سؤال؟',en:'Any questions?'})}</b><br>${T({ar:'أنا Acquire، هنا عشان أساعدك في رحلتك لفهم أعمق للاتزان الكيميائي!',en:'I’m Acquire, here to help you understand chemical equilibrium more deeply!'})}</div><button class="btn blue" onclick="openChat()">${T({ar:'اسأل المساعد الذكي',en:'Ask the AI assistant'})}</button></div>
   </div>
   <aside class="side">
    <div class="card scorebox"><h3>${T({ar:'نتيجتك في الاختبار التشخيصي',en:'Your diagnostic result'})}</h3>${ring(pre.score)}
     <div style="text-align:center;font-weight:700">${ART.check()} ${T({ar:'من الإجابات صحيحة',en:'answers correct'})}</div>
     <div style="padding:6px 18px 18px"><hr style="border:0;border-top:1px solid var(--line)"><b>${pre.weak.length?T({ar:'المفاهيم التي تحتاج إلى دعم:',en:'Concepts that need support:'}):T({ar:'أتقنت كل المفاهيم المقاسة!',en:'All measured concepts mastered!'})}</b>
     <ul class="weak" style="list-style:none;padding:0;margin:6px 0 0">${pre.weak.map(c=>`<li><span class="dot r">!</span>${T(CONCEPTS[c])}</li>`).join('')}</ul></div></div>
    <div class="card note" style="background:#eef4fd"><b>💡 ${T({ar:'ملاحظة مهمة:',en:'Important note:'})}</b><p style="margin:6px 0 0" class="muted">${T({ar:'المسار المميز هو المقترح لك، لكن تقدر تختار أي مسار. ابدأ من المسار المناسب لتحقيق أفضل استفادة.',en:'The highlighted path is recommended, but you may choose any path to get the most from the module.'})}</p></div>
    <div class="flk" style="text-align:center">${ART.flasks()}</div>
   </aside></div>`;
}
function choosePath(k){ S.path=k; save(); logEv('path_selected',`${k} (recommended=${S.rec})`); go('path'); }

/* ---- PATH ---- */
function unitDone(u){return !!S.units?.[u.id]?.done}
function vPath(){
  const k=S.path||S.rec, p=PATHS[k]; if(!S.path){S.path=k;save()}
  const head=`<div class="banner" style="justify-content:space-between;text-align:start"><div><div class="pill ${p.color}" style="display:inline-flex;width:auto;padding:6px 18px">${ART.i[p.icon]} ${T(p.name)}</div><p>${T(p.desc)}</p></div>${ART[p.art]().replace('class="ill"','width="150"')}</div>`;
  const ucard=u=>`<div class="ucard ${unitDone(u)?'done':''}"><div style="display:flex;gap:10px;align-items:center"><span class="n" style="background:var(--${u.color})">${u.n}</span><h3>${T(u.t)}</h3></div><div class="muted">${T(u.goal)}</div>
     <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto"><span>${unitDone(u)?ART.check()+' '+T({ar:'تم',en:'Done'}):''}</span><button class="btn ${p.color} sm" onclick="go('${u.id}')">${unitDone(u)?T({ar:'مراجعة',en:'Review'}):T({ar:'ابدأ الدرس',en:'Start lesson'})}</button></div></div>`;
  const postBtn=`<div class="card" style="margin-top:22px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:space-between"><div><b>${T({ar:'الحكم النهائي: الاختبار البعدي',en:'Final verdict: post-test'})}</b><div class="muted">${T({ar:'لما تخلّص، اعمل الاختبار البعدي عشان تشوف تقدّمك مقارنة بالبداية.',en:'When you finish, take the post-test to compare with your start.'})}</div></div><button class="btn ${p.color}" onclick="go('posttest')">${T({ar:'ابدأ الاختبار البعدي',en:'Start post-test'})}</button></div>`;
  const switcher=`<p class="muted" style="text-align:center">${T({ar:'عايز تغيّر المسار؟',en:'Want another path?'})} <a href="#dashboard">${T({ar:'ارجع للوحة المسارات',en:'Back to paths'})}</a></p>`;
  if(k==='rem'){ const d=UNITS.filter(unitDone).length;
    return head+`<div class="section"><h2>${T({ar:'دروس الوحدة',en:'Unit lessons'})} — ${d}/6</h2><div class="progress"><i style="width:${d/6*100}%"></i></div><div class="ulist">${UNITS.map(ucard).join('')}</div></div>`+postBtn+switcher; }
  if(k==='sup'){ const weak=S.pre.weak.length?S.pre.weak:Object.keys(CONCEPTS); const fixed=S.fixed||{}; const nf=weak.filter(c=>fixed[c]).length;
    const items=weak.map(c=>{const u=unitById(CONCEPTS[c].u); const ms=UNITS.flatMap(x=>x.mis).filter(m=>m.c===c);
      return `<div class="ucard ${fixed[c]?'done':''}"><div style="display:flex;gap:10px;align-items:center"><span class="dot ${fixed[c]?'g':'r'}">${fixed[c]?'✓':'!'}</span><h3>${T(CONCEPTS[c])}</h3></div>
       ${ms.map(m=>`<div class="mis" style="grid-template-columns:1fr"><div class="w">✘ ${T(m.w)}</div><div class="r">✔ ${T(m.r)}</div></div>`).join('')}
       <div class="muted">${T({ar:'الدرس:',en:'Lesson:'})} ${T(u.t)}</div>
       <button class="btn green sm" style="margin-top:auto" onclick="go('${u.id}')">${fixed[c]?T({ar:'مراجعة',en:'Review'}):T({ar:'عالج المفهوم + أعد التقييم',en:'Fix it + reassess'})}</button></div>`}).join('');
    return head+`<div class="section"><h2>${T({ar:'خطة الدعم الخاصة بيك',en:'Your support plan'})} — ${nf}/${weak.length}</h2><p class="muted">${T({ar:'دي المفاهيم اللي الاختبار التشخيصي أظهر إنك محتاج فيها دعم. لكل مفهوم: صحّح الفكرة الخاطئة، جرّب المحاكاة، وجاوب على أسئلة إعادة التقييم في آخر الدرس.',en:'These are the concepts the diagnostic flagged. For each: correct the misconception, try the simulation, and answer the reassessment at the end of the lesson.'})}</p><div class="progress"><i style="width:${nf/weak.length*100}%;background:var(--green2)"></i></div><div class="ulist">${items}</div></div>`
      +(nf===weak.length?`<div class="fb ok">${T({ar:'برافو! صححت كل نقاط الضعف. تقدر تكمل باقي الدروس من المسار العلاجي أو تعمل الاختبار البعدي.',en:'Well done! All weak points fixed. Continue the full sequence or take the post-test.'})}</div>`:'')+postBtn+switcher; }
  // enrichment
  AFTER.push(()=>practice($('#chq'), CHALLENGES, 'chal'));
  return head+`<div class="section"><h2>${T({ar:'تحديات التفكير الناقد وحل المشكلات',en:'Critical-thinking & problem-solving challenges'})}</h2><div class="card" id="chq"></div></div>
    <div class="section"><h2>${T({ar:'المعمل الافتراضي المفتوح',en:'Open virtual lab'})}</h2><div class="ulist">${UNITS.map(ucard).join('')}</div></div>`+postBtn+switcher;
}

/* ---- practice quiz (immediate feedback + Acquire hints) ---- */
const ALLQ = ()=>[...UNITS.flatMap(u=>u.quiz),...CHALLENGES];
const qById = id => ALLQ().find(q=>q.id===id);
function practice(box, qs, bucket, unit){
  box.innerHTML = qs.map((q,qi)=>`<div class="section" data-q="${q.id}"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><b>${qi+1}. ${chem(T(q.q))}</b><button class="btn sm hintb" data-h="${q.id}">💡 ${T({ar:'تلميح',en:'Hint'})}</button></div>${q.o.map((o,j)=>`<button class="opt" data-j="${j}"><span class="k">${j+1}</span><span>${chem(T(o))}</span></button>`).join('')}<div class="qhint"></div><div class="qfb"></div></div>`).join('');
  qs.forEach(q=>{ const sec=$(`[data-q="${q.id}"]`,box); let lvl=0;
    $('.hintb',sec).onclick=()=>{ const H=HINTS[q.id]?.h||[]; lvl++; if(q.id==='Q3c'&&lvl===1) aSay({v:136,ar:'ابدأ بالتعبير، وعوّض، وبعدين خد الجذر ✍️',en:'Start with the expression, substitute, then take the square root ✍️'},4500);
      const parts=H.slice(0,lvl).map((h,k)=>`<div><b>${T({ar:'تلميح',en:'Hint'})} ${k+1}:</b> ${chem(T(h))}</div>`);
      if(lvl>H.length) parts.push(`<div><b>${T({ar:'الحل:',en:'Solution:'})}</b> ${chem(T(q.o[q.a]))} — ${chem(T(q.x))}</div>`);
      $('.qhint',sec).innerHTML=`<div class="fb hint">${parts.join('')}${lvl<=H.length?`<div class="muted" style="font-size:.85rem">${lvl<H.length?T({ar:'لسه محتاج مساعدة؟ دوس تلميح تاني.',en:'Still stuck? Press Hint again.'}):T({ar:'دوس تلميح تاني لو عايز تشوف الحل.',en:'Press Hint again to see the solution.'})}</div>`:''}</div>`;
      if(lvl>H.length) $('.hintb',sec).disabled=true;
      logEv('hint',`${q.id}:level${Math.min(lvl,H.length+1)}${lvl>H.length?'(solution)':''}`); };
    $$('.opt',sec).forEach(b=>b.onclick=()=>{ const j=+b.dataset.j, ok=j===q.a;
      $$('.opt',sec).forEach((x,k)=>{x.classList.remove('ok','no'); if(k===j)x.classList.add(ok?'ok':'no')});
      const why=HINTS[q.id]?.w?.[j];
      $('.qfb',sec).innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?T({ar:'✔ إجابة صحيحة. ',en:'✔ Correct. '})+chem(T(q.x)):T({ar:'✘ مش دي. ',en:'✘ Not this one. '})+(why?chem(T(why)):'')+'<br>'+T({ar:'جرّب اختيار تاني، أو دوس 💡 تلميح.',en:'Try another option, or press 💡 Hint.'})}</div>`;
      if(!ok){CTX.q=q.id; CTX.wrong={id:q.id,j}; COMPANION.wrong();} else if(q.id==='Q3c') aSay({v:137,ar:'ممتاز! وما تنساش تقرّب لرقم عشري واحد ✅',en:'Excellent! And don’t forget to round to one decimal place ✅'},4500);
      S[bucket]=S[bucket]||{}; if(unit){S.units=S.units||{};S.units[unit]=S.units[unit]||{};S.units[unit].q=S.units[unit].q||{};S.units[unit].q[q.id]=ok||S.units[unit].q[q.id]||false;}
      else { const before=S[bucket][q.id]; S[bucket][q.id]=ok||S[bucket][q.id]||false; if(bucket==='chal'&&ok&&!before){ save(); COMPANION.chal(); } }
      if(ok && S.pre?.weak.includes(q.c)){S.fixed=S.fixed||{}; if(!S.fixed[q.c]){S.fixed[q.c]=true; logEv('concept_fixed',q.c); toast(T({ar:'تم تصحيح مفهوم: ',en:'Concept fixed: '})+T(CONCEPTS[q.c])); COMPANION.fixed(q.c);}}
      if(unit && qs.every(x=>S.units[unit].q[x.id]!==undefined) && !S.units[unit].done){S.units[unit].done=true; logEv('unit_complete',unit); toast(T({ar:'خلّصت الدرس 🎉',en:'Lesson complete 🎉'})); save(); COMPANION.unitDone(unit);}
      save(); logEv('quiz_answer',`${q.id}:${ok?'correct':'wrong'}:choice=${j}`); }); });
}

/* ---- UNIT ---- */
const UNIT_VIDEOS={u1:1,u2:1,u3:1,u4:1,u5:1,u6:1};
/* the moment (s) each video reaches its "common mistake" card: the video pauses there and asks */
const VQ_AT={u1:{ar:37.47,en:39.33},u2:{ar:41.97,en:42.97},u3:{ar:38.83,en:40.0},u4:{ar:49.97,en:52.93},u5:{ar:43.47,en:43.03},u6:{ar:37.9,en:39.07}};
function unitVideo(u){ if(!UNIT_VIDEOS[u.id]) return '';
  return `<div class="card uvid" style="margin-top:18px"><h2 style="margin-top:0">🎬 ${T({ar:'حكاية المحور',en:'The unit story'})}</h2>
   <div class="vwrap"><video controls playsinline preload="metadata" poster="video/${u.id}-poster.jpg" src="video/${u.id}-${LANG}.mp4" onplay="VOICE.stop();logEv('video_play','${u.id}:${LANG}')" onended="logEv('video_end','${u.id}:${LANG}')"></video></div>
   <p class="muted" style="font-size:.88rem;margin:8px 0 0">⏸️ ${T({ar:'الفيديو هيقف مرة ويسألك سؤال سريع قبل ما يكمّل.',en:'The video will pause once to ask you a quick question.'})}</p></div>`; }
function seeOnce(sel,fn){ const el=document.querySelector(sel); if(!el||!('IntersectionObserver' in window)) return; const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting&&e.intersectionRatio>=.6)){ io.disconnect(); fn(); } },{threshold:[.6]}); io.observe(el); cleanups.push(()=>io.disconnect()); }
function vqAttach(u){ const v=document.querySelector('.uvid video'), w=document.querySelector('.uvid .vwrap'); if(!v||!VQ_AT[u.id]) return;
  const at=VQ_AT[u.id][LANG]-0.2, m=u.mis[0]; let asked=false;
  const exitFs=()=>{ try{ if(document.fullscreenElement) document.exitFullscreen(); else if(v.webkitDisplayingFullscreen) v.webkitExitFullscreen(); }catch(e){} };
  v.addEventListener('timeupdate',()=>{ if(!asked && v.currentTime>=at && v.currentTime<at+4){ asked=true; v.pause(); exitFs(); ask(); } });
  v.addEventListener('seeked',()=>{ if(v.currentTime<at-1){ asked=false; w.querySelector('.vq')?.remove(); } });
  function ask(){ w.querySelector('.vq')?.remove(); const o=document.createElement('div'); o.className='vq'; o.setAttribute('role','dialog');
    o.innerHTML=`<div class="vq-c"><div class="vq-t">⏸️ ${T({ar:'سؤال سريع قبل ما نكمّل',en:'Quick question before we go on'})}</div>
      <div class="vq-s">${T({ar:'صح ولا غلط؟',en:'True or false?'})}<br>«${chem(T(m.w))}»</div>
      <div class="vq-b"><button class="btn green" data-a="t">✔ ${T({ar:'صح',en:'True'})}</button><button class="btn" style="background:#e04848;color:#fff" data-a="f">✘ ${T({ar:'غلط',en:'False'})}</button></div><div class="vq-f"></div></div>`;
    w.appendChild(o); aSay({v:128,ar:'استنى! سؤال سريع قبل ما نكمّل 🤔',en:'Hold on! A quick question before we go on 🤔'},4000);
    o.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ const ok=b.dataset.a==='f'; logEv('video_q',`${u.id}:${ok?'correct':'wrong'}`); aSay(ok?{v:129,ar:'برافو! كده إنت فاهم الخطأ الشائع ده كويس 👏',en:'Bravo! You really understand this common mistake 👏'}:{v:130,ar:'ولا يهمك، ناس كتير بتقع في الغلطة دي… بص على الصح 👇',en:'No worries, lots of people make this mistake… look at the right idea 👇'},5000);
      o.querySelector('.vq-b').innerHTML='';
      o.querySelector('.vq-f').innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?T({ar:'✔ برافو! الجملة دي غلط فعلًا.',en:'✔ Well done! That statement is false.'}):T({ar:'✘ لأ، الجملة دي غلط شائع.',en:'✘ No, that is a common mistake.'})} ${T({ar:'الصح:',en:'Correct idea:'})} ${chem(T(m.r))}</div>
        <button class="btn blue" style="margin-top:10px">▶ ${T({ar:'كمّل الفيديو',en:'Continue the video'})}</button>`;
      o.querySelector('.vq-f .btn').onclick=()=>{ o.remove(); v.play(); }; }); }
}
function unitObjectives(u){ const x=(typeof UNIT_EXTRA!=='undefined')&&UNIT_EXTRA[u.id]; if(!x) return '';
  return `<div class="card" style="margin-top:18px"><h2 style="margin-top:0">🎯 ${T({ar:'بعد المحور ده هتقدر:',en:'After this unit you will be able to:'})}</h2>
   <ol class="objs" style="--c:var(--${u.color})">${x.obj.map((o,i)=>`<li><b>${i+1}</b><span>${chem(T(o))}</span></li>`).join('')}</ol></div>`; }
function unitInfo(u){ const x=(typeof UNIT_EXTRA!=='undefined')&&UNIT_EXTRA[u.id]; if(!x) return ''; const m=u.mis[0];
  return `<div class="info" style="margin-top:18px"><div class="info-h" style="background:var(--${u.color})"><span>📌 ${T({ar:'المحور في صورة',en:'The unit at a glance'})}</span><span>${u.n}</span></div>
   <div class="info-g">${x.sum.map(t=>`<div class="info-t"><div class="ic">${t.i}</div><b>${chem(T(t.t))}</b><span>${chem(T(t.d))}</span></div>`).join('')}</div>
   <div class="info-m"><div class="w">✘ ${chem(T(m.w))}</div><div class="r">✔ ${chem(T(m.r))}</div></div></div>`; }
function reflRender(u){ const box=document.getElementById('refl'); if(!box) return; const st=S.units[u.id]||{}; const r=st.refl;
  const CF=[['low','😟',{ar:'لسه مش فاهم',en:'Not yet'}],['mid','🙂',{ar:'فاهم نص نص',en:'Getting there'}],['high','😎',{ar:'فاهم كويس',en:'Got it'}]];
  const head=`<h2 style="margin-top:0">🪞 ${T({ar:'لحظة تأمّل',en:'A moment to reflect'})}</h2>`;
  if(r && !box._edit){ box.innerHTML=head+`<div class="saved">✔ ${T({ar:'اتسجّل تأمّلك. شكرًا!',en:'Your reflection is saved. Thanks!'})}<br><b>${CF.find(c=>c[0]===r.c)?.[1]||''}</b> ${r.l?`· ${T({ar:'اتعلمت:',en:'Learned:'})} ${esc(r.l)}`:''} ${r.q?`· ${T({ar:'محتاج أفهم:',en:'Still unclear:'})} ${esc(r.q)}`:''}</div><div class="ctrls"><button class="btn ghost sm" id="rfEdit">✎ ${T({ar:'عدّل',en:'Edit'})}</button></div>`;
    box.querySelector('#rfEdit').onclick=()=>{ box._edit=true; reflRender(u); }; return; }
  let c=r?.c||'';
  box.innerHTML=head+`<label>${T({ar:'حاسس إنك فاهم المحور ده قد إيه؟',en:'How well do you understand this unit?'})}</label><div class="conf">${CF.map(x=>`<button data-c="${x[0]}" class="${c===x[0]?'on':''}">${x[1]} ${T(x[2])}</button>`).join('')}</div>
    <label for="rfL">${T({ar:'إيه أهم حاجة اتعلمتها؟',en:'What is the most important thing you learned?'})}</label><textarea id="rfL" maxlength="300">${r?.l?esc(r.l):''}</textarea>
    <label for="rfQ">${T({ar:'إيه اللي لسه مش واضح ليك؟',en:'What is still not clear to you?'})}</label><textarea id="rfQ" maxlength="300">${r?.q?esc(r.q):''}</textarea>
    <div class="ctrls" style="margin-top:10px"><button class="btn blue" id="rfSave">${T({ar:'احفظ تأمّلي',en:'Save my reflection'})}</button></div>`;
  box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ c=b.dataset.c; box.querySelectorAll('[data-c]').forEach(x=>x.classList.toggle('on',x===b)); });
  box.querySelector('#rfSave').onclick=()=>{ const l=box.querySelector('#rfL').value.trim(), q=box.querySelector('#rfQ').value.trim();
    if(!c && !l && !q){ toast(T({ar:'اختار إحساسك أو اكتب جملة 🙂',en:'Pick a feeling or write a line 🙂'})); return; }
    st.refl={c,l,q,at:new Date().toISOString()}; S.units[u.id]=st; save(); logEv('reflection',`${u.id}|${c}|${l}|${q}`); box._edit=false; reflRender(u); toast(T({ar:'اتسجّل ✔',en:'Saved ✔'})); aSay({v:133,ar:'شكرًا إنك فكّرت في اللي اتعلمته، ده بيفرق جامد! 💙',en:'Thanks for thinking about what you learned. It really makes a difference! 💙'},5000); }; }
function vUnit(id){
  const u=unitById(id), k=S.path||S.rec, p=PATHS[k], idx=UNITS.indexOf(u);
  S.units=S.units||{}; S.units[id]=S.units[id]||{}; if(!S.units[id].opened){S.units[id].opened=new Date().toISOString()} S.lastUnit=id; save();
  logEv('unit_open',id); CTX.unit=id;
  AFTER.push(()=>{ u.sims.forEach(s=>{const c=SIMS[s]($('#sim-'+s));if(typeof c==='function')cleanups.push(c)}); practice($('#uq'),u.quiz,'units',id); vqAttach(u); reflRender(u); seeOnce('.info',()=>aSay({v:131,ar:'ده المحور كله في صورة واحدة، راجعه بسرعة 📌',en:'Here’s the whole unit in one picture. Give it a quick look 📌'},4500)); seeOnce('#refl',()=>{ if(!(S.units[u.id]||{}).refl) aSay({v:132,ar:'قبل ما تمشي… قولّي، حاسس إنك فهمت قد إيه؟ 🪞',en:'Before you go… tell me, how well do you feel you understood? 🪞'},5000); }); });
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><button class="btn ghost sm" onclick="go('path')">${LANG==='ar'?'→':'←'} ${T(p.name)}</button><button class="btn ghost sm" onclick="askAbout()">${ART.i.help.replace('<svg','<svg width="18"')} ${T({ar:'اسأل Acquire عن الدرس ده',en:'Ask Acquire about this lesson'})}</button></div>
   <div class="banner" style="margin-top:14px;justify-content:flex-start;text-align:start"><span class="n" style="background:var(--${u.color});color:#fff;width:52px;height:52px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;flex:none">${u.n}</span><div><h1 style="font-size:1.6rem">${T(u.t)}</h1><p>${T(u.goal)}</p></div></div>
   ${unitVideo(u)}
   <div class="card" style="margin-top:18px">${u.sections.map(s=>`<div class="section"><h2>${T(s.h)}${s.review?reviewTag():''}</h2>${T(s.b)}</div>`).join('')}</div>
   <div class="section"><h2>${T({ar:'جرّب بنفسك',en:'Try it yourself'})}</h2>${u.sims.map(s=>`<div id="sim-${s}"></div>`).join('')}</div>
   <div class="card"><h2 style="margin-top:0">${T({ar:'انتبه من الأخطاء الشائعة',en:'Watch out for common misconceptions'})}</h2>${u.mis.map(m=>`<div class="mis"><div class="w">✘ ${T(m.w)}</div><div class="r">✔ ${T(m.r)}</div></div>`).join('')}</div>
   <div class="card" style="margin-top:18px"><h2 style="margin-top:0">${k==='sup'?T({ar:'إعادة التقييم',en:'Reassessment'}):T({ar:'اختبر نفسك',en:'Check yourself'})}</h2><div id="uq"></div></div>
   ${unitInfo(u)}
   <div class="card refl" id="refl" style="margin-top:18px"></div>
   <div style="display:flex;justify-content:space-between;margin-top:18px">${idx>0?`<button class="btn ghost" onclick="go('${UNITS[idx-1].id}')">${T({ar:'الدرس السابق',en:'Previous'})}</button>`:'<span></span>'}${idx<5?`<button class="btn ${p.color}" onclick="go('${UNITS[idx+1].id}')">${T({ar:'الدرس التالي',en:'Next lesson'})}</button>`:`<button class="btn ${p.color}" onclick="go('path')">${T({ar:'رجوع للمسار',en:'Back to path'})}</button>`}</div>`;
}

/* ---- REPORT ---- */
function vReport(){
  const pre=S.pre, post=S.post; const done=UNITS.filter(unitDone);
  const st=(t,c)=>!t?'—':(t.weak.includes(c)?`<span class="dot r">!</span>`:`<span class="dot g">✓</span>`);
  const still=post?post.weak:pre.weak.filter(c=>!S.fixed?.[c]);
  const chal=Object.values(S.chal||{}).filter(Boolean).length;
  return `<div class="banner"><div><h1>${T({ar:'تقرير تقدّمك',en:'Your progress report'})}</h1><p>${T({ar:'الحكم في القضية: إزاي اتطور فهمك للاتزان الكيميائي؟',en:'The verdict: how has your understanding of equilibrium developed?'})}</p></div></div>
   <div class="paths" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
    <div class="card" style="text-align:center"><b>${T({ar:'الاختبار القبلي',en:'Pre-test'})}</b>${ring(pre.score)}</div>
    <div class="card" style="text-align:center"><b>${T({ar:'الاختبار البعدي',en:'Post-test'})}</b>${post?ring(post.score):`<p class="muted" style="margin:40px 0">${T({ar:'لسه ما اتعملش',en:'Not taken yet'})}</p><button class="btn blue sm" onclick="go('posttest')">${T({ar:'ابدأه دلوقتي',en:'Take it now'})}</button>`}</div>
    <div class="card" style="text-align:center"><b>${T({ar:'التحسّن',en:'Improvement'})}</b><div style="font-size:2.6rem;font-weight:900;margin:34px 0;color:${post&&post.score>=pre.score?'#0d8a5b':'#5b6b82'}" dir="ltr">${post?(post.score-pre.score>=0?'+':'')+(post.score-pre.score)+'%':'—'}</div><div class="muted">${T(PATHS[S.path||S.rec].name)}</div></div></div>
   <div class="card" style="margin-top:20px;overflow-x:auto"><h2 style="margin-top:0">${T({ar:'المفاهيم',en:'Concepts'})}</h2><table class="report"><tr><th>${T({ar:'المفهوم',en:'Concept'})}</th><th>${T({ar:'قبلي',en:'Pre'})}</th><th>${T({ar:'تصحيح أثناء المسار',en:'Fixed in path'})}</th><th>${T({ar:'بعدي',en:'Post'})}</th></tr>
    ${Object.keys(CONCEPTS).map(c=>`<tr><td>${T(CONCEPTS[c])}</td><td>${st(pre,c)}</td><td>${S.fixed?.[c]?'<span class="dot g">✓</span>':'—'}</td><td>${st(post,c)}</td></tr>`).join('')}</table></div>
   <div class="card" style="margin-top:20px"><h2 style="margin-top:0">${T({ar:'نشاطك',en:'Your activity'})}</h2><p>${T({ar:'دروس مكتملة:',en:'Lessons completed:'})} <b>${done.length}/6</b> · ${T({ar:'تحديات محلولة:',en:'Challenges solved:'})} <b>${chal}/${CHALLENGES.length}</b></p>
    <h3>${T({ar:'الخطوات الجاية المقترحة',en:'Suggested next steps'})}</h3>${still.length?`<ul class="kp">${still.map(c=>`<li>${T({ar:'راجع',en:'Review'})} <a href="#${CONCEPTS[c].u}">${T(CONCEPTS[c])}</a></li>`).join('')}</ul>`:`<p>${T({ar:'ممتاز! جرّب تحديات المسار الإثرائي.',en:'Excellent! Try the enrichment challenges.'})}</p>`}
    <p class="muted" style="font-size:.88rem">${T({ar:'الدرجة مؤشر واحد فقط، ولا تقيس كل ما تعلمته.',en:'A score is only one indicator; it does not measure everything you learned.'})}</p></div>
   ${CERT.card()}`;
}

/* ================= ACQUIRE (free, content-based assistant) ================= */
const CTX={unit:null,q:null,wrong:null,lvl:{}}; let CHAT=[];
const norm=s=>String(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[₀-₉]/g,d=>'0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(d)]);
const STARTERS=[{k:'simple',ar:'اشرح لي مفهوم بطريقة أبسط',en:'Explain a concept more simply'},{k:'hint',ar:'ساعدني في السؤال من غير ما تقول الإجابة',en:'Help me without giving the answer'},{k:'why',ar:'وضّح لي سبب خطأ إجابتي',en:'Why was my answer wrong?'},{k:'cmp',ar:'الفرق بين الحرارة والعامل الحفاز؟',en:'Temperature vs catalyst?'},{k:'act',ar:'رشّح لي نشاط لنقطة ضعفي',en:'Suggest an activity for my weak point'}];

/* ---- GAME ZONE (built only from the platform's own concepts & misconceptions) ---- */
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function gameDefs(){ return Object.keys(CONCEPTS).filter(c=>EXPLAIN[c]).map(c=>{ let d=T(EXPLAIN[c].s); const k=d.indexOf(':'); if(k>0&&k<40&&c!=='c_phase') d=d.slice(k+1).trim(); if(c==='c_cat') d=d.replace(/^العامل الحفاز\s*/,'').replace(/^A catalyst\s*/,'It '); { const ss=d.split(/(?<=\.)\s/); let t=''; for(const s of ss){ t=t?t+' '+s:s; if(t.length>=60) break; } d=t; } return {c,name:T(CONCEPTS[c]),d}; }); }
function tfBank(){ const out=[]; UNITS.forEach(u=>u.mis.forEach(m=>{ out.push({s:m.w,ok:false,why:m.r,c:m.c}); out.push({s:m.r,ok:true,why:EXPLAIN[m.c]?.s||m.r,c:m.c}); })); return out; }
function gLevel(p){ return p>=200?T({ar:'خبير 🏆',en:'Expert 🏆'}):p>=80?T({ar:'متمكّن ⭐',en:'Skilled ⭐'}):T({ar:'مبتدئ 🌱',en:'Beginner 🌱'}); }
function gAdd(n){ S.games=S.games||{pts:0,ok:0}; S.games.pts+=n; S.games.ok++; save(); gScore(); }
function gScore(){ const g=S.games||{pts:0,ok:0}; const set=(id,v)=>{const e=document.getElementById(id); if(e) e.textContent=v}; set('gPts',g.pts); set('gOk',g.ok); set('gLvl',gLevel(g.pts)); }
function vGames(){
  AFTER.push(()=>{ gScore(); gMenu(); });
  return `<section class="card ghead"><h1>🎮 ${T({ar:'ساحة الألعاب',en:'Game zone'})}</h1>
    <p class="muted">${T({ar:'العب، واكسب نقط، واعرف فهمك فين — كل الأسئلة من دروس المنصة.',en:'Play, earn points and check your understanding — all items come from the platform lessons.'})}</p>${reviewTag()}
    <div class="gstats"><div><b id="gPts">0</b><span>${T({ar:'نقطة',en:'points'})}</span></div><div><b id="gOk">0</b><span>${T({ar:'إجابة صحيحة',en:'correct'})}</span></div><div><b id="gLvl"></b><span>${T({ar:'المستوى',en:'level'})}</span></div></div>
</section>
    <section class="card" id="gBox"></section>`;
}
const GAMES=[
  {g:'tf',ico:'✔✘',bg:'#e6f7ee',t:{ar:'صح ولا غلط؟',en:'True or false?'},d:{ar:'عبارات علمية، قرّر هي صح ولا غلط، وشوف التفسير.',en:'Decide if each statement is true or false, then see why.'},tag:{ar:'تصحيح المفاهيم',en:'Misconceptions'}},
  {g:'match',ico:'🔗',bg:'#eaf1fe',t:{ar:'طابق واكسب',en:'Match & win'},d:{ar:'وصّل كل مفهوم علمي بتعريفه بأقل عدد محاولات.',en:'Match each concept to its description in as few tries as possible.'},tag:{ar:'مراجعة سريعة',en:'Quick review'}},
  {g:'wheel',ico:'🎡',bg:'#e3f6f6',t:{ar:'عجلة الحظ الكيميائية',en:'Chemistry wheel'},d:{ar:'لفّ العجلة، تقف على درس، وجاوب سؤال منه.',en:'Spin the wheel, land on a lesson, answer a question from it.'},tag:{ar:'تحدي سريع',en:'Quick challenge'}},
  {g:'kc',ico:'🧩',bg:'#fff4e0',t:{ar:'رتّب معادلتك',en:'Build the expression'},d:{ar:'رتّب البطاقات عشان تبني تعبير ثابت الاتزان صح.',en:'Arrange cards to build the equilibrium-constant expression.'},tag:{ar:'تحدي التفكير',en:'Thinking'}},
  {g:'lab',ico:'🔐',bg:'#f3eefc',t:{ar:'اهرب من مختبر الاتزان',en:'Escape the equilibrium lab'},d:{ar:'ألغاز علمية، ماتعديش للأوضة الجاية غير لما تحل اللغز.',en:'Science puzzles — solve each one to unlock the next room.'},tag:{ar:'حل المشكلات',en:'Problem solving'}}];
const gSay=(t,ms=4500,force=false)=>{ if(CUR_ROUTE==='games') COACH.say(T(t),ms,{gap:force?0:2500,force,voice:t.v}); };
const GINTRO={
  tf:{v:97,ar:'يلا بينا 🤖 اقرا العبارة كويس وقرّر: صح ولا غلط؟ وأنا هقولك ليه بعد كل إجابة',en:'Read each statement and decide: true or false? I’ll explain after every answer 🤖'},
  match:{v:98,ar:'دوّر على الكلمة المفتاحية في كل تعريف، هتوصّلك للمفهوم على طول 🔍',en:'Look for the key word in each description — it points to the concept 🔍'},
  wheel:{v:99,ar:'جاهز؟ 🎡 لفّ العجلة وأنا هشوف معاك هتقف على أنهي درس!',en:'Ready? 🎡 Spin and let’s see which lesson it lands on!'},
  kc:{v:100,ar:'افتكر القاعدة 🧩 النواتج فوق، المتفاعلات تحت، والصلب والسائل النقي برّه!',en:'Remember 🧩 products on top, reactants below, pure solids and liquids out!'},
  lab:{v:101,ar:'إنت محبوس في مختبر الاتزان 🔐 حل لغز كل أوضة عشان تفتح الباب اللي بعدها، ويلا نهرب سوا!',en:'You’re locked in the equilibrium lab 🔐 Solve each room’s puzzle to open the next door!'}};
/* choose-then-confirm: the student can change the choice before pressing "confirm" */
function gPick(root, sel, fn){ const opts=[...root.querySelectorAll(sel)]; if(!opts.length) return; let ref=opts[opts.length-1]; if(ref.parentElement.classList.contains('gtf')) ref=ref.parentElement;
  const wrap=document.createElement('div'); wrap.className='gconf';
  wrap.innerHTML=`<span class="muted">${T({ar:'تقدر تغيّر اختيارك قبل ما تأكّد',en:'You can change your choice before confirming'})}</span><button class="btn blue" disabled>✔ ${T({ar:'تأكيد الإجابة',en:'Confirm answer'})}</button>`;
  ref.after(wrap); const cb=wrap.querySelector('button'); let cur=null;
  opts.forEach(b=>b.onclick=()=>{ if(b.disabled) return; if(cur===b){ b.classList.remove('pick'); cur=null; cb.disabled=true; return; } opts.forEach(x=>x.classList.remove('pick')); b.classList.add('pick'); cur=b; cb.disabled=false; });
  cb.onclick=()=>{ if(!cur) return; const b=cur; cur=null; b.classList.remove('pick'); cb.disabled=true; fn(b); if(opts.every(x=>x.disabled)) wrap.remove(); }; }
function gInner(){ const b=$('#gBox'); let i=b.querySelector('#gIn'); if(!i){ b.innerHTML='<div id="gIn"></div>'; i=b.querySelector('#gIn'); } return i; }
function gMenu(){ const box=$('#gBox');
  box.innerHTML=`<h2 class="gmh">${T({ar:'اختار اللعبة 👇',en:'Pick a game 👇'})}</h2><div class="glist">${GAMES.map(x=>`<button class="gitem${x.soon?' soon':''}" data-g="${x.g}" ${x.soon?'aria-disabled="true"':''}><span class="gico" style="background:${x.bg}">${x.ico}</span><span class="gtx"><b>${T(x.t)}</b><span>${T(x.d)}</span><em>${x.soon?T({ar:'قريبًا ⏳',en:'Coming soon ⏳'}):T(x.tag)}</em></span>${x.soon?'':'<span class="gplay">▶</span>'}</button>`).join('')}</div>`;
  box.querySelectorAll('.gitem').forEach(b=>b.onclick=()=>{ if(b.classList.contains('soon')) return toast(T({ar:'اللعبة دي جاية قريب 😉',en:'Coming soon 😉'})); gOpen(b.dataset.g); }); }
function gOpen(g){ logEv('game_open',g); ({tf:gTF,match:gMatch,wheel:gWheel,kc:gKc,lab:gLab}[g])(); gSay(GINTRO[g],6000,true); const box=$('#gBox'); const x=GAMES.find(k=>k.g===g);
  box.insertAdjacentHTML('afterbegin',`<div class="gbar"><button class="btn ghost sm" id="gBack">→ ${T({ar:'قايمة الألعاب',en:'Games menu'})}</button><b>${x.ico} ${T(x.t)}</b></div>`);
  $('#gBack').onclick=gMenu; box.scrollIntoView({behavior:'smooth',block:'start'}); }
function gTF(){ const box=gInner(); const qs=shuf(tfBank()).slice(0,8); let i=0, right=0, streak=0;
  const show=()=>{ if(i>=qs.length){ gSay(right>=6?{v:105,ar:`جبت ${right} من ${qs.length} 🔥 مستواك عالي! جرّب جولة كمان`,en:`${right}/${qs.length} 🔥 Great level! Try another round`}:{v:106,ar:`جبت ${right} من ${qs.length} 💪 الجولة الجاية هتبقى أحسن، وأنا معاك`,en:`${right}/${qs.length} 💪 Next round will be better`},6000,true); box.innerHTML=`<div class="gend"><div class="gbig">${right}/${qs.length}</div><p>${right>=6?T({ar:'تحفة! 🔥 فهمك للمفاهيم دي قوي',en:'Great! 🔥 Your understanding is strong'}):T({ar:'كويس! 💪 الجولة الجاية هتبقى أحسن',en:'Good! 💪 Next round will be better'})}</p><button class="btn blue" id="gAgain">🔄 ${T({ar:'جولة جديدة',en:'New round'})}</button></div>`; logEv('game_round','tf:'+right+'/'+qs.length); $('#gAgain').onclick=()=>gTF(); return; }
    const q=qs[i];
    box.innerHTML=`<div class="gtop"><span class="pill">${T({ar:'عبارة',en:'Statement'})} ${i+1}/${qs.length}</span><span class="pill soft">${T(CONCEPTS[q.c])}</span></div>
      <p class="gstmt">${chem(T(q.s))}</p>
      <div class="gtf"><button class="btn gT" data-v="1">✔ ${T({ar:'صح',en:'True'})}</button><button class="btn gF" data-v="0">✘ ${T({ar:'غلط',en:'False'})}</button></div>
      <div id="gFb"></div>`;
    gPick(box,'.gtf button',b=>{ const ok=(b.dataset.v==='1')===q.ok; box.querySelectorAll('.gtf button').forEach(x=>x.disabled=true); b.classList.add(ok?'good':'bad');
      if(ok){ right++; gAdd(10); streak++; gSay(streak>=3?{v:103,ar:`${streak} ورا بعض! 🔥 إنت ماشي صاروخ`,en:`${streak} in a row! 🔥`}:{v:102,ar:'برافو عليك 👏',en:'Well done 👏'},3000); } else { streak=0; gSay({v:104,ar:'ولا يهمك 😊 اقرا التفسير كويس، هو ده المهم',en:'No worries 😊 read the explanation — that’s what matters'},4000); } 
      $('#gFb').innerHTML=`<div class="fb ${ok?'ok':'no'}"><b>${ok?T({ar:'برافو! +10 ✔',en:'Correct! +10 ✔'}):T({ar:'مش بالظبط ✘',en:'Not quite ✘'})}</b> — ${q.ok?T({ar:'العبارة صح. ',en:'The statement is true. '}):T({ar:'العبارة غلط، والصح: ',en:'It is false. Correct idea: '})}${chem(T(q.why))}</div><button class="btn blue" id="gNext">${T({ar:'اللي بعده ←',en:'Next →'})}</button>`;
      logEv('game_answer',`tf:${q.c}:${ok?1:0}`); $('#gNext').onclick=()=>{i++;show()}; }); };
  show(); }

const WHEEL=[{u:'u1',c:'#2f6fdb',t:{ar:'الاتزان الديناميكي',en:'Dynamic eq.'},l:{ar:'الاتزان|الديناميكي',en:'Dynamic|equilibrium'}},{u:'u2',c:'#21a06b',t:{ar:'فعل الكتلة',en:'Mass action'},l:{ar:'فعل|الكتلة',en:'Mass|action'}},{u:'u3',c:'#7a4fd6',t:{ar:'ثابت الاتزان Kc',en:'Kc'},l:{ar:'ثابت|الاتزان Kc',en:'Constant|Kc'}},{u:'u4',c:'#e0663a',t:{ar:'الحرارة',en:'Temperature'},l:{ar:'الحرارة',en:'Temperature'}},{u:'u5',c:'#1b9aa8',t:{ar:'الضغط و Kp',en:'Pressure & Kp'},l:{ar:'الضغط|و Kp',en:'Pressure|& Kp'}},{u:'u6',c:'#e2a72e',t:{ar:'العامل الحفاز',en:'Catalyst'},l:{ar:'العامل|الحفاز',en:'The|catalyst'}}];
function wheelSvg(){ const n=WHEEL.length, R=150, cx=160, cy=160; let s='';
  WHEEL.forEach((w,i)=>{ const a0=(i*360/n-90)*Math.PI/180, a1=((i+1)*360/n-90)*Math.PI/180;
    s+=`<path d="M${cx} ${cy} L${cx+R*Math.cos(a0)} ${cy+R*Math.sin(a0)} A${R} ${R} 0 0 1 ${cx+R*Math.cos(a1)} ${cy+R*Math.sin(a1)}Z" fill="${w.c}" stroke="#fff" stroke-width="3"/>`;
    const mid=(i*360/n+360/n/2)*Math.PI/180, px=cx+R*0.63*Math.sin(mid), py=cy-R*0.63*Math.cos(mid), ls=T(w.l).split('|');
    s+=`<g class="wl" style="transform-origin:${px.toFixed(1)}px ${py.toFixed(1)}px"><text x="${px.toFixed(1)}" y="${(py-(ls.length-1)*9).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-weight="800" font-size="15">${ls.map((t,k)=>`<tspan x="${px.toFixed(1)}" dy="${k?18:0}">${t}</tspan>`).join('')}</text></g>`; });
  return `<svg viewBox="0 0 320 320" class="wsvg" id="wSvg">${s}<circle cx="${cx}" cy="${cy}" r="30" fill="#fff" stroke="#f0b94a" stroke-width="7"/><text x="${cx}" y="${cy+2}" text-anchor="middle" dominant-baseline="middle" font-size="24">🎯</text></svg>`; }
function gWheel(){ const box=gInner(); let rot=0, busy=false;
  box.innerHTML=`<p class="muted">${T({ar:'دوس "لفّ العجلة"، العجلة هتقف على درس، وجاوب سؤال منه. كل إجابة صح = 15 نقطة.',en:'Spin, land on a lesson and answer one of its questions. Each correct answer = 15 points.'})}</p>
    <div class="wwrap"><div class="wptr">▼</div>${wheelSvg()}</div>
    <div class="wq" id="wQ"><p class="muted" style="text-align:center">${T({ar:'العجلة مستنياك… يلا لفّها! 🎡',en:'The wheel is waiting… spin it! 🎡'})}</p></div>
    <div class="wbtns"><button class="btn blue" id="wSpin">🎡 ${T({ar:'لفّ العجلة',en:'Spin the wheel'})}</button></div>`;
  const svg=$('#wSvg'), btn=$('#wSpin');
  btn.onclick=()=>{ if(busy) return; busy=true; btn.disabled=true; const n=WHEEL.length, i=Math.floor(Math.random()*n);
    const target=360-(i*360/n+360/n/2); rot+=360*5+((target-rot%360)+360)%360; svg.style.transform=`rotate(${rot}deg)`; svg.querySelectorAll('.wl').forEach(g=>g.style.transform=`rotate(${-rot}deg)`);
    $('#wQ').innerHTML=`<p class="muted" style="text-align:center">${T({ar:'العجلة بتلف… بالتوفيق! 🤞',en:'Spinning… good luck! 🤞'})}</p>`; gSay({v:111,ar:'يا ترى هتقف على أنهي درس؟ 🤔',en:'Which lesson will it land on? 🤔'},2800,true);
    setTimeout(()=>{ busy=false; ask(WHEEL[i]); },3300); };
  function ask(w){ const u=unitById(w.u), q=u.quiz[Math.floor(Math.random()*u.quiz.length)]; logEv('game_spin',w.u+':'+q.id); gSay({v:112,ar:`وقفت على "${T(w.t)}" 🎯 ركّز وجاوب`,en:`Landed on "${T(w.t)}" 🎯 Focus and answer`},3500,true);
    $('#wQ').innerHTML=`<div class="gtop"><span class="pill" style="background:${w.c}22;color:${w.c}">🎯 ${T(w.t)}</span><span class="pill soft">${T({ar:'الدرس',en:'Lesson'})} ${u.n}</span></div>
      <p class="gstmt">${chem(T(q.q))}</p>${q.o.map((o,j)=>`<button class="opt" data-j="${j}"><span class="k">${j+1}</span><span>${chem(T(o))}</span></button>`).join('')}<div id="wFb"></div>`;
    gPick($('#wQ'),'.opt',b=>{ const j=+b.dataset.j, ok=j===q.a; $('#wQ').querySelectorAll('.opt').forEach(x=>x.disabled=true);
      b.classList.add(ok?'good':'bad'); if(!ok) $('#wQ').querySelector(`.opt[data-j="${q.a}"]`).classList.add('good');
      if(ok) gAdd(15); logEv('game_answer',`wheel:${q.id}:${ok?1:0}`); gSay(ok?{v:113,ar:'+15 نقطة 🎉 لفّ تاني!',en:'+15 points 🎉 Spin again!'}:{v:114,ar:'ولا يهمك 😊 بص على الإجابة الصح والتفسير، ولفّ تاني',en:'No worries 😊 check the explanation and spin again'},4000,true);
      $('#wFb').innerHTML=`<div class="fb ${ok?'ok':'no'}"><b>${ok?T({ar:'برافو! +15 🎉',en:'Correct! +15 🎉'}):T({ar:'مش بالظبط ✘',en:'Not quite ✘'})}</b>${q.x?' — '+chem(T(q.x)):''}</div>`;
      btn.disabled=false; btn.textContent='🎡 '+T({ar:'لفّ تاني',en:'Spin again'}); }); }
}

/* game: build the Kc expression (reactions from the unit-3 builder) */
function gKc(){ const box=gInner(); const rx=shuf(KC_RX); let i=0, right=0;
  const where=x=>(x.ph==='s'||x.ph==='l')?'o':(x.s==='P'?'n':'d');
  const show=()=>{ if(i>=rx.length){ gSay(right>=4?{v:119,ar:`بنيت ${right} من ${rx.length} صح 🏆 إنت كده محترف Kc!`,en:`${right}/${rx.length} correct 🏆 Kc pro!`}:{v:120,ar:`بنيت ${right} من ${rx.length} 💪 راجع قاعدة الصلب والسائل النقي وجرّب تاني`,en:`${right}/${rx.length} 💪 review the solids/liquids rule and retry`},6000,true);
      box.innerHTML=`<div class="gend"><div class="gbig">${right}/${rx.length}</div><p>${T({ar:'معادلات اتبنت صح من أول مرة',en:'expressions built right first time'})}</p><button class="btn blue" id="gAgain">🔄 ${T({ar:'جولة جديدة',en:'New round'})}</button></div>`; logEv('game_round','kc:'+right+'/'+rx.length); $('#gAgain').onclick=()=>gKc(); return; }
    const r=rx[i]; let sel=null; const place={};
    box.innerHTML=`<div class="gtop"><span class="pill">${T({ar:'معادلة',en:'Reaction'})} ${i+1}/${rx.length}</span></div>
      <div class="eqblock">${chem('$'+rxEq(r)+'$')}</div>
      <p class="muted">${T({ar:'دوس على بطاقة المادة، وبعدين دوس على المكان الصح ليها.',en:'Tap a substance card, then tap where it belongs.'})}</p>
      <div class="kcards" id="kPool">${r.sp.map((x,j)=>`<button class="kcard" data-j="${j}">${chem('$'+(x.co>1?x.co:'')+x.f+'('+x.ph+')$')}</button>`).join('')}</div>
      <div class="kzones"><div class="kz" data-z="n"><b>${T({ar:'⬆ البسط (فوق)',en:'⬆ Numerator'})}</b><div class="kzin"></div></div><div class="kz" data-z="d"><b>${T({ar:'⬇ المقام (تحت)',en:'⬇ Denominator'})}</b><div class="kzin"></div></div><div class="kz out" data-z="o"><b>${T({ar:'🚫 مايتكتبش',en:'🚫 Omitted'})}</b><div class="kzin"></div></div></div>
      <div class="eqblock" id="kPrev">${chem('$K_{c}=?$')}</div><div class="ctrls kctrl"><button class="btn ghost sm" id="kUndo">↩ ${T({ar:'تراجع',en:'Undo'})}</button><button class="btn ghost sm" id="kReset">🔄 ${T({ar:'ابدأ من الأول',en:'Start over'})}</button><button class="btn purple" id="kChk">✔ ${T({ar:'تأكيد وتحقّق',en:'Submit & check'})}</button></div><p class="muted ktip">${T({ar:'عايز ترجّع بطاقة؟ دوس عليها، وبعدين دوس على مكانها الجديد أو على مكان البطاقات فوق.',en:'To move a card back, tap it, then tap a new place or the card area above.'})}</p><div id="gFb"></div>`;
    const hist=[]; const pool=$('#kPool');
    const prev=()=>{ $('#kPrev').innerHTML=chem(kexpr(r.sp.filter((x,j)=>place[j]==='n'),r.sp.filter((x,j)=>place[j]==='d'))); $('#kUndo').disabled=!hist.length; $('#kReset').disabled=!Object.keys(place).length; };
    const moveTo=(c,z)=>{ const j=c.dataset.j; if(z==='p'){ pool.appendChild(c); delete place[j]; } else { box.querySelector(`.kz[data-z="${z}"] .kzin`).appendChild(c); place[j]=z; } };
    box.querySelectorAll('.kcard').forEach(c=>c.onclick=e=>{ e.stopPropagation(); if(c.classList.contains('good')||c.classList.contains('bad')) return; if(sel===c){ c.classList.remove('sel'); sel=null; return; } box.querySelectorAll('.kcard').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); sel=c; });
    box.querySelectorAll('.kz').forEach(z=>z.onclick=()=>{ if(!sel){ toast(T({ar:'اختار بطاقة الأول 👆',en:'Pick a card first'})); return; } hist.push([sel,place[sel.dataset.j]||'p']); moveTo(sel,z.dataset.z); sel.classList.remove('sel'); sel=null; prev(); });
    pool.onclick=()=>{ if(!sel||!place[sel.dataset.j]) return; hist.push([sel,place[sel.dataset.j]]); moveTo(sel,'p'); sel.classList.remove('sel'); sel=null; prev(); };
    $('#kUndo').onclick=()=>{ const h=hist.pop(); if(!h) return; moveTo(h[0],h[1]); box.querySelectorAll('.kcard').forEach(x=>x.classList.remove('sel')); sel=null; prev(); };
    $('#kReset').onclick=()=>{ box.querySelectorAll('.kcard').forEach(c=>{ c.classList.remove('sel'); moveTo(c,'p'); }); hist.length=0; sel=null; prev(); };
    prev();
    $('#kChk').onclick=()=>{ if(Object.keys(place).length<r.sp.length){ toast(T({ar:'حط كل البطاقات الأول 🧩',en:'Place every card first'})); gSay({v:115,ar:'لسه فيه بطاقات ما حطّتهاش مكانها 🧩',en:'Some cards are still unplaced 🧩'},3000); return; }
      let all=true; r.sp.forEach((x,j)=>{ const ok=place[j]===where(x); if(!ok) all=false; box.querySelector(`.kcard[data-j="${j}"]`).classList.add(ok?'good':'bad'); });
      const corr=kexpr(r.sp.filter(x=>where(x)==='n'),r.sp.filter(x=>where(x)==='d'));
      if(all){ right++; gAdd(20); gSay({v:116,ar:'تحفة 🎉 +20 نقطة! المعامل بقى أُس زي ما اتعلمنا',en:'Brilliant 🎉 +20! Coefficients became powers'},4000,true); }
      else { const sl=r.sp.some((x,j)=>where(x)==='o'&&place[j]!=='o'); gSay(sl?{v:117,ar:'خلّي بالك 👀 المادة الصلبة والسائل النقي تركيزهم ثابت فما بيتكتبوش',en:'Careful 👀 pure solids and liquids are omitted'}:{v:118,ar:'افتكر 👀 النواتج فوق والمتفاعلات تحت',en:'Remember 👀 products on top, reactants below'},5000,true); }
      logEv('game_answer',`kc:${r.id}:${all?1:0}`);
      box.querySelector('.kctrl').remove(); box.querySelector('.ktip')?.remove(); box.querySelectorAll('.kcard,.kz').forEach(x=>x.onclick=null); pool.onclick=null;
      $('#gFb').innerHTML=`<div class="fb ${all?'ok':'no'}"><b>${all?T({ar:'صح! +20 ✔',en:'Correct! +20 ✔'}):T({ar:'مش بالظبط ✘',en:'Not quite ✘'})}</b> ${T({ar:'التعبير الصح:',en:'Correct expression:'})} <span>${chem(corr)}</span></div><button class="btn blue" id="gNext">${T({ar:'المعادلة اللي بعدها ←',en:'Next reaction →'})}</button>`;
      $('#gNext').onclick=()=>{i++;show()}; }; };
  show(); }

/* game: escape the equilibrium lab — 6 rooms = 6 lessons, each opened by solving that lesson's questions */
const ROOMS=[{u:'u1',ico:'⚖️'},{u:'u2',ico:'🧮'},{u:'u3',ico:'🧪'},{u:'u4',ico:'🔥'},{u:'u5',ico:'🎈'},{u:'u6',ico:'⚡'}];
function gLab(){ const box=gInner(); S.games=S.games||{pts:0,ok:0}; const L=S.games.lab=S.games.lab||{done:[]}; save();
  const nextIdx=()=>ROOMS.findIndex(r=>!L.done.includes(r.u));
  const map=()=>{ const nx=nextIdx();
    box.innerHTML=`<div class="lstory">🔐 ${T({ar:'إنت محبوس جوه مختبر الاتزان الكيميائي! قدامك 6 أوض، كل أوضة فيها لغز من درس. حل اللغز عشان يتفتح باب الأوضة اللي بعدها، واجمع الأدلة لحد ما توصل لبوابة الخروج.',en:'You’re locked in the equilibrium lab! 6 rooms, each with a puzzle from one lesson. Solve it to open the next door and collect evidence until you reach the exit.'})}</div>
      <div class="lmap">${ROOMS.map((r,k)=>{ const u=unitById(r.u), st=L.done.includes(r.u)?'done':k===nx?'open':'lock';
        return `<button class="lroom ${st}" data-k="${k}"><span class="lico">${st==='lock'?'🔒':st==='done'?'✅':r.ico}</span><b>${T({ar:'أوضة',en:'Room'})} ${k+1}</b><span>${T(u.t)}</span></button>`; }).join('')}
      <div class="lroom exit ${nx<0?'open':'lock'}"><span class="lico">${nx<0?'🚪':'🔒'}</span><b>${T({ar:'بوابة الخروج',en:'Exit gate'})}</b></div></div>
      <div class="lev"><b>🗂️ ${T({ar:'الأدلة اللي جمعتها',en:'Evidence collected'})} (${L.done.length}/6)</b><div>${L.done.length?L.done.map(id=>`<span class="pill soft">${T(unitById(id).t)}</span>`).join(''):`<span class="muted">${T({ar:'لسه مفيش… افتح أول أوضة!',en:'None yet… open the first room!'})}</span>`}</div></div>
      ${nx<0?`<div class="gend"><div class="gbig">🎉</div><p>${T({ar:'هربت من المختبر! حلّيت ألغاز الأوض الست كلها.',en:'You escaped the lab! All six rooms solved.'})}</p><button class="btn ghost" id="lReset">🔄 ${T({ar:'العب من الأول',en:'Play again'})}</button></div>`:''}`;
    box.querySelectorAll('.lroom[data-k]').forEach(b=>b.onclick=()=>{ const k=+b.dataset.k;
      if(b.classList.contains('lock')){ toast(T({ar:'الأوضة دي مقفولة 🔒 حل اللي قبلها الأول',en:'Locked 🔒 solve the previous room first'})); gSay({v:121,ar:'الباب ده لسه مقفول 🔒 لازم تحل لغز الأوضة اللي قبله',en:'That door is locked 🔒 solve the previous room'},3500,true); return; }
      room(k); });
    const rs=$('#lReset'); if(rs) rs.onclick=()=>{ L.done=[]; save(); map(); gSay(GINTRO.lab,5000,true); };
    if(nx<0) gSay({v:127,ar:'هربت من المختبر 🎉🚪 إنت بطل الاتزان الكيميائي!',en:'You escaped 🎉🚪 Equilibrium champion!'},7000,true); };
  const room=k=>{ const r=ROOMS[k], u=unitById(r.u), qs=u.quiz; let qi=0; logEv('game_open','lab:'+r.u);
    gSay({v:122,ar:`إنت دلوقتي في أوضة ${k+1}: "${T(u.t)}" 🔐 جاوب ${qs.length} أسئلة صح عشان الباب يتفتح`,en:`Room ${k+1}: "${T(u.t)}" 🔐 Answer ${qs.length} questions to open the door`},5000,true);
    const ask=()=>{ const q=qs[qi];
      box.innerHTML=`<div class="gtop"><span class="pill">${r.ico} ${T({ar:'أوضة',en:'Room'})} ${k+1} — ${T(u.t)}</span><span class="pill soft">🔑 ${qi}/${qs.length}</span></div>
        <div class="lkeys">${qs.map((x,j)=>`<span class="${j<qi?'on':''}">🔑</span>`).join('')}</div>
        <p class="gstmt">${chem(T(q.q))}</p>${q.o.map((o,j)=>`<button class="opt" data-j="${j}"><span class="k">${j+1}</span><span>${chem(T(o))}</span></button>`).join('')}<div id="gFb"></div>
        <div class="ctrls"><button class="btn ghost sm" id="lMap">🗺️ ${T({ar:'الخريطة',en:'Map'})}</button></div>`;
      $('#lMap').onclick=map;
      gPick(box,'.opt',b=>{ const j=+b.dataset.j, ok=j===q.a; logEv('game_answer',`lab:${q.id}:${ok?1:0}`);
        if(!ok){ b.classList.add('bad'); b.disabled=true; const H=HINTS[q.id]?.h?.[0]; $('#gFb').innerHTML=`<div class="fb hint">🔒 ${T({ar:'القفل ما اتفتحش… جرّب تاني.',en:'The lock didn’t open… try again.'})}${H?' 💡 '+chem(T(H)):''}</div>`; gSay({v:123,ar:'القفل لسه مقفول 🔒 خد التلميح ده وجرّب تاني',en:'Still locked 🔒 use the hint and try again'},4000,true); return; }
        box.querySelectorAll('.opt').forEach(x=>x.disabled=true); b.classList.add('good'); qi++;
        if(qi<qs.length){ $('#gFb').innerHTML=`<div class="fb ok">🔑 ${T({ar:'لقيت مفتاح! كمّل.',en:'You found a key! Keep going.'})}</div><button class="btn blue" id="gNext">${T({ar:'اللي بعده ←',en:'Next →'})}</button>`; gSay({v:124,ar:'لقيت مفتاح 🔑 كمّل!',en:'Key found 🔑 keep going!'},2500,true); $('#gNext').onclick=ask; }
        else { if(!L.done.includes(r.u)){ L.done.push(r.u); gAdd(20); } save();
          const last=nextIdx()<0;
          $('#gFb').innerHTML=`<div class="fb ok">🔓 ${T({ar:'الباب اتفتح! +20 نقطة، ولقيت دليل جديد:',en:'The door opened! +20 points, new evidence:'})} <b>${T(u.t)}</b></div><button class="btn blue" id="gNext">${last?T({ar:'🚪 روح لبوابة الخروج',en:'🚪 Go to the exit'}):T({ar:'🗺️ للخريطة والأوضة اللي بعدها',en:'🗺️ Back to the map'})}</button>`;
          gSay(last?{v:126,ar:'آخر باب اتفتح 🔓 يلا على بوابة الخروج!',en:'Last door open 🔓 to the exit!'}:{v:125,ar:`الباب اتفتح 🔓 ولقيت دليل "${T(u.t)}"! يلا على الأوضة اللي بعدها`,en:`Door open 🔓 evidence found! On to the next room`},5000,true);
          $('#gNext').onclick=map; } }); };
    ask(); };
  map(); }
function gMatch(){ const box=gInner(); const items=shuf(gameDefs()).slice(0,5); const defs=shuf(items); let sel=null, tries=0, done=0;
  box.innerHTML=`<p class="muted">${T({ar:'اختار مفهوم من العمود الأول، وبعدين اختار تعريفه من العمود التاني. كل توصيلة صح = 10 نقط.',en:'Pick a concept, then its description. Each correct match = 10 points.'})}</p>
    <div class="gmatch"><div><h3>${T({ar:'المفهوم',en:'Concept'})}</h3>${items.map(x=>`<button class="gcard gc" data-c="${x.c}">${x.name}</button>`).join('')}</div>
    <div><h3>${T({ar:'التعريف أو الوصف',en:'Description'})}</h3>${defs.map(x=>`<button class="gcard gd" data-c="${x.c}">${chem(x.d)}</button>`).join('')}</div></div><div id="gFb"></div>`;
  box.querySelectorAll('.gc').forEach(b=>b.onclick=()=>{ if(b.classList.contains('good')) return; if(sel===b){ b.classList.remove('sel'); sel=null; return; } box.querySelectorAll('.gc').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); sel=b; });
  box.querySelectorAll('.gd').forEach(b=>b.onclick=()=>{ if(!sel||b.classList.contains('good')) { if(!sel) toast(T({ar:'اختار المفهوم الأول 👈',en:'Pick a concept first'})); return; } tries++;
    if(b.dataset.c===sel.dataset.c){ [b,sel].forEach(x=>{x.classList.remove('sel');x.classList.add('good');x.disabled=true}); sel=null; done++; gAdd(10); logEv('game_answer','match:'+b.dataset.c+':1'); if(done<items.length) gSay({v:108,ar:'صح كده 👌 كمّل!',en:'Correct 👌 keep going!'},2500);
      if(done===items.length){ gSay(tries<=items.length+1?{v:109,ar:'وصّلتهم كلهم من غير غلط تقريبًا 🤩 إيه الحلاوة دي!',en:'Almost no mistakes 🤩 amazing!'}:{v:110,ar:'خلصتهم كلهم 🎉 الجولة الجاية حاول بمحاولات أقل',en:'All matched 🎉 try fewer tries next time'},6000,true); $('#gFb').innerHTML=`<div class="gend"><p>${T({ar:`خلصت التوصيلات كلها في ${tries} ${tries<=10&&tries>2?'محاولات':'محاولة'} 🎉`,en:`All matched in ${tries} tries 🎉`})}</p><button class="btn blue" id="gAgain">🔄 ${T({ar:'جولة جديدة',en:'New round'})}</button></div>`; logEv('game_round','match:'+tries); $('#gAgain').onclick=()=>gMatch(); } }
    else { b.classList.add('bad'); setTimeout(()=>b.classList.remove('bad'),600); logEv('game_answer','match:'+sel.dataset.c+':0'); gSay({v:107,ar:'قرّبت 🤏 فكّر تاني في معنى المفهوم ده',en:'Close 🤏 think again about this concept'},3500); } });
}

/* Acquire coach bubble beside the floating button: text + optional action buttons, close (✕) and "mute for a while" */
const COACH=(()=>{ let t=null, last=0;
  const muted=()=>!!store.get('cot:mute',false);
  function el(){ let b=document.getElementById('coachBub');
    if(!b){ b=document.createElement('div'); b.id='coachBub'; b.className='coach-bub'; b.setAttribute('role','status'); b.setAttribute('aria-live','polite');
      b.innerHTML=`<button class="cb-x" aria-label="close">✕</button><button class="cb-s" data-sndi aria-label="sound"></button><div class="cb-t"></div><div class="cb-a"></div><button class="cb-m"></button>`;
      document.body.appendChild(b);
      b.querySelector('.cb-x').onclick=()=>hide();
      b.querySelector('.cb-m').onclick=()=>setMute(true); b.querySelector('.cb-s').onclick=()=>VOICE.toggle(); }
    b.querySelector('.cb-s').textContent=VOICE.icon();
    b.querySelector('.cb-m').textContent='🤫 '+T({ar:'اسكت شوية',en:'Quiet for now'});
    return b; }
  function say(text,ms=4500,opt={}){ if(muted() || !USER) return; if(!opt.force && Date.now()-last<(opt.gap??0)) return; last=Date.now(); VOICE.play(opt.voice);
    const b=el(); b.querySelector('.cb-t').textContent=text;
    const a=b.querySelector('.cb-a'); a.innerHTML='';
    (opt.actions||[]).forEach(x=>{ const k=document.createElement('button'); k.className='btn sm '+(x.primary?'blue':'ghost'); k.textContent=x.label; k.onclick=()=>{ hide(); logEv('acquire_action',x.label); x.fn(); }; a.appendChild(k); });
    a.style.display=(opt.actions||[]).length?'flex':'none';
    if((opt.actions||[]).length) ms=Math.max(ms,15000);
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    const f=document.querySelector('.fab'); if(f){ f.classList.remove('talk'); void f.offsetWidth; f.classList.add('talk'); }
    clearTimeout(t); t=setTimeout(hide,ms); }
  function hide(){ clearTimeout(t); document.getElementById('coachBub')?.classList.remove('show'); document.querySelector('.fab')?.classList.remove('talk'); }
  function badge(){ let m=document.getElementById('muteBadge'); const on=muted()&&!!USER;
    if(!m){ m=document.createElement('button'); m.id='muteBadge'; m.className='mute-badge'; m.onclick=()=>setMute(false); document.body.appendChild(m); }
    m.textContent='🤫 '+T({ar:'رجّع Acquire يتكلم',en:'Let Acquire talk'}); m.style.display=on?'':'none'; }
  function setMute(v){ store.set('cot:mute',!!v); logEv('acquire_mute',v?'on':'off'); hide(); badge(); if(v) VOICE.stop();
    if(!v) say(T({ar:'رجعتلك تاني 🤖 هفضل معاك خطوة بخطوة!',en:'I’m back 🤖 I’ll be with you every step!'}),3500,{force:true,voice:95}); }
  return {say,hide,setMute,badge};
})();

/* Acquire companion: reacts to where the student is on the platform */
const COMPANION=(()=>{ const seen=new Set();
  const nm=c=>T(CONCEPTS[c]); const U=id=>unitById(id);
  const list=a=>a.length<=1?a.join(''):a.slice(0,-1).join('، ')+T({ar:' و',en:' and '})+a[a.length-1];
  const go2=r=>()=>go(r);
  const say=(t,ms,opt)=>COACH.say(t,ms,opt);
  function nextUnit(){ return UNITS.find(u=>!unitDone(u)); }
  const uv=u=>73+UNITS.indexOf(u);
  function inProgress(){ const id=S.lastUnit; if(!id) return null; const u=U(id); return u&&!unitDone(u)&&S.units?.[id]?.q&&Object.keys(S.units[id].q).length?u:(u&&!unitDone(u)?u:null); }
  function openWeak(){ return (S.pre?.weak||[]).filter(c=>!S.fixed?.[c]); }
  function pathAdvice(){
    const k=S.path||S.rec;
    if(k==='sup'){ const w=openWeak(); if(!w.length) return {v:[65],t:T({ar:'صلّحت كل نقط ضعفك 🎉 إنت جاهز للاختبار البعدي!',en:'You fixed all your weak points 🎉 Ready for the post-test!'}),a:[{label:T({ar:'▶ ابدأ الاختبار البعدي',en:'▶ Start post-test'}),fn:go2('posttest'),primary:1}]};
      const u=U(CONCEPTS[w[0]].u); return {v:[64],t:T({ar:`فاضلك ${w.length} ${w.length===1?'مفهوم':'مفاهيم'} تصلّحه، يلا نبدأ بـ "${nm(w[0])}" (الدرس ${u.n}) 💪`,en:`${w.length} concept(s) left to fix — let’s start with "${nm(w[0])}" (lesson ${u.n}) 💪`}),a:[{label:T({ar:'▶ يلا بينا',en:'▶ Let’s go'}),fn:go2(u.id),primary:1}]}; }
    if(k==='enr'){ const n=Object.values(S.chal||{}).filter(Boolean).length, N=CHALLENGES.length;
      if(n>=N) return {v:['72a'],t:T({ar:'حلّيت كل التحديات 🔥 إنت كده كسرت الدنيا! يلا على الاختبار البعدي',en:'All challenges solved 🔥 On to the post-test!'}),a:[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]};
      return {v:[n?(n<=6?66+n:null):66],t:n?T({ar:`حلّيت ${n} من ${N} تحديات 🔥 كمّل التحدي الجاي تحت`,en:`${n} of ${N} challenges solved 🔥 Keep going below`}):T({ar:`قدامك ${N} تحديات تفكير ناقد 🔥 يلا نبدأ بأول واحد!`,en:`${N} critical-thinking challenges await 🔥 Let’s start with the first!`}),a:[{label:T({ar:'وديني للتحديات',en:'Take me there'}),fn:()=>document.querySelector('#chq')?.scrollIntoView({behavior:'smooth'}),primary:1}]}; }
    const ip=inProgress(); if(ip) return {v:[62],t:T({ar:`إنت سايب "${T(ip.t)}" في النص، يلا نكمّله؟ 😉`,en:`You left "${T(ip.t)}" halfway — shall we finish it? 😉`}),a:[{label:T({ar:'▶ كمّله',en:'▶ Continue'}),fn:go2(ip.id),primary:1}]};
    const nu=nextUnit(), d=UNITS.filter(unitDone).length;
    if(!nu) return {v:[63],t:T({ar:'خلصت كل الدروس 🎉 يلا على الاختبار البعدي نشوف اتحسّنت قد إيه',en:'All lessons done 🎉 Let’s see your progress in the post-test'}),a:[{label:T({ar:'▶ ابدأ الاختبار البعدي',en:'▶ Start post-test'}),fn:go2('posttest'),primary:1}]};
    return {v:d?[d<=5?55+d:null,61,uv(nu)]:[55,61,uv(nu)],t:d?T({ar:`خلصت ${d} من 6 دروس 💪 الدرس الجاي: "${T(nu.t)}"`,en:`${d} of 6 lessons done 💪 Next: "${T(nu.t)}"`}):T({ar:`يلا نبدأ أول درس: "${T(nu.t)}" 🚀`,en:`Let’s start the first lesson: "${T(nu.t)}" 🚀`}),a:[{label:T({ar:'▶ يلا نبدأه',en:'▶ Start it'}),fn:go2(nu.id),primary:1}]}; }
  function onRoute(r){ COACH.badge(); if(!USER) return;
    setTimeout(()=>{ if(CUR_ROUTE!==r) return;
      if(r==='dashboard' && S.pre){
        if(S.justPre){ delete S.justPre; save(); const w=S.pre.weak, rec=S.rec;
          let t=T({ar:`خلصت الاختبار 👏 جبت ${S.pre.score}%.`,en:`Test done 👏 You scored ${S.pre.score}%.`});
          t+=w.length?T({ar:` عندك ${w.length} ${w.length===1?'مفهوم محتاج':'مفاهيم محتاجة'} شوية دعم: ${list(w.slice(0,3).map(nm))}${w.length>3?'…':''}.`,en:` ${w.length} concept(s) need support: ${list(w.slice(0,3).map(nm))}${w.length>3?'…':''}.`}):T({ar:' أتقنت كل المفاهيم! 🔥',en:' You mastered every concept! 🔥'});
          t+=T({ar:` أنا شايف ${T(PATHS[rec].name)} هو الأنسب ليك.`,en:` I think the ${T(PATHS[rec].name)} suits you best.`});
          document.querySelector('.path.rec')?.classList.add('glow');
          return say(t,20000,{force:true,voice:[48].concat(w.length?[]:[49],[{rem:50,sup:51,enr:52}[rec]]),actions:[{label:T({ar:'▶ يلا نبدأ المسار',en:'▶ Start the path'}),fn:()=>choosePath(rec),primary:1},{label:T({ar:'وريني المسارات التانية',en:'Show other paths'}),fn:()=>document.querySelector('.paths')?.scrollIntoView({behavior:'smooth'})}]}); }
        if(!sessionStorage.getItem('cot:greet')){ sessionStorage.setItem('cot:greet','1'); const a=S.path?pathAdvice():null;
          return say(T({ar:'أهلًا تاني 👋 ',en:'Welcome back 👋 '})+(a?a.t:T({ar:'اختار مسارك وتعالى نبدأ!',en:'Pick your path and let’s begin!'})),12000,{force:true,voice:[53].concat(a?a.v:[54]),actions:a?a.a:[]}); }
        return; }
      if(r==='path'){ const a=pathAdvice(); sessionStorage.setItem('cot:greet','1'); return say(a.t,12000,{force:true,voice:a.v,actions:a.a}); }
      if(/^u[1-6]$/.test(r)){ const u=U(r); if(seen.has(r)) return; seen.add(r);
        say(T({ar:`الدرس ده عن: ${T(u.goal)} ابدأ بالمحاكاة، وخمّن قبل ما تدوس 🤔`,en:`This lesson: ${T(u.goal)} Start with the simulation and predict before you click 🤔`}),9000,{force:true,voice:79+UNITS.indexOf(u),actions:[{label:T({ar:'وديني للمحاكاة',en:'Go to the simulation'}),fn:()=>document.querySelector('.sim')?.scrollIntoView({behavior:'smooth',block:'start'}),primary:1}]});
        const q=document.querySelector('#uq'); if(q&&'IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)&&CUR_ROUTE===r){ io.disconnect(); say(T({ar:'يلا نختبر نفسنا 📝 لو احتجت، دوس 💡 تلميح جنب السؤال',en:'Time to check yourself 📝 Need help? Press 💡 Hint'}),5000,{gap:6000,voice:85}); } },{threshold:.4}); io.observe(q); cleanups.push(()=>io.disconnect()); }
        return; }
      if(r==='games'){ return say(T({ar:'أهلًا بيك في ساحة الألعاب 🎮 اختار لعبة وأنا معاك فيها!',en:'Welcome to the game zone 🎮 Pick a game — I’m with you!'}),5000,{force:true,voice:96}); }
      if(r==='report' && S.pre){
        if(S.post){ const d=S.post.score-S.pre.score, m=11-S.post.weak.length, w=S.post.weak;
          let t=d>0?T({ar:`اتحسّنت ${d}+% 🚀 بقيت متمكن من ${m} مفاهيم من 11!`,en:`You improved by +${d}% 🚀 You now master ${m} of 11 concepts!`}):T({ar:`نتيجتك ${S.post.score}%، ومتمكن من ${m} مفاهيم من 11 💪`,en:`You scored ${S.post.score}% and master ${m} of 11 concepts 💪`});
          if(w.length){ t+=T({ar:` لسه محتاج تراجع "${nm(w[0])}".`,en:` You still need to review "${nm(w[0])}".`}); return say(t,15000,{force:true,voice:[d>0?90:91,93],actions:[{label:T({ar:'▶ راجع الدرس',en:'▶ Review it'}),fn:go2(CONCEPTS[w[0]].u),primary:1}]}); }
          return say(t+T({ar:' برافو عليك 🎉',en:' Well done 🎉'}),9000,{force:true,voice:[d>0?90:91,92]}); }
        return say(T({ar:'لسه ماعملتش الاختبار البعدي، تحب تعمله وتشوف اتحسّنت قد إيه؟',en:'You haven’t taken the post-test yet — want to see how much you’ve improved?'}),12000,{force:true,voice:94,actions:[{label:T({ar:'▶ ابدأه',en:'▶ Start it'}),fn:go2('posttest'),primary:1}]}); }
    },350); }
  function wrong(){ say(T({ar:'ولا يهمك 😊 دوس 💡 تلميح وأنا معاك',en:'No worries 😊 Press 💡 Hint, I’m with you'}),4000,{gap:6000,voice:86}); }
  function fixed(c){ const left=openWeak().length; say(T({ar:`برافو 🎉 صلّحت مفهوم "${nm(c)}"${left?`، فاضلك ${left}`:'، وكده خلصت كل نقط ضعفك!'}`,en:`Bravo 🎉 You fixed "${nm(c)}"${left?` — ${left} left`:' — all weak points fixed!'}`}),6000,{force:true,voice:left?87:[87,88]}); }
  function unitDoneMsg(id){ const k=S.path||S.rec; let a;
    if(k==='sup'){ a=pathAdvice(); return say(T({ar:'خلصت الدرس 🎉 ',en:'Lesson complete 🎉 '})+a.t,15000,{force:true,voice:[89].concat(a.v),actions:a.a}); }
    const idx=UNITS.findIndex(u=>u.id===id), nx=UNITS.slice(idx+1).find(u=>!unitDone(u))||nextUnit();
    if(!nx) return say(T({ar:'خلصت كل الدروس 🎉 يلا على الاختبار البعدي!',en:'All lessons done 🎉 On to the post-test!'}),15000,{force:true,voice:[89,63],actions:[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]});
    say(T({ar:`خلصت الدرس 🎉 الدرس الجاي: "${T(nx.t)}"`,en:`Lesson complete 🎉 Next: "${T(nx.t)}"`}),15000,{force:true,voice:[89,61,uv(nx)],actions:[{label:T({ar:'▶ يلا نبدأه',en:'▶ Start it'}),fn:go2(nx.id),primary:1}]}); }
  function chal(){ const n=Object.values(S.chal||{}).filter(Boolean).length, N=CHALLENGES.length; say(n>=N?T({ar:'حلّيت كل التحديات 🔥 يلا على الاختبار البعدي!',en:'All challenges solved 🔥 On to the post-test!'}):T({ar:`برافو 🔥 حلّيت ${n} من ${N}`,en:`Bravo 🔥 ${n} of ${N} solved`}),n>=N?12000:4000,{force:true,voice:n>=N?'72a':(n<=6?66+n:null),actions:n>=N?[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]:[]}); }
  return {onRoute,wrong,fixed,unitDone:unitDoneMsg,chal};
})();
function renderChat(){
  $('#fabWrap').innerHTML=`<button class="fab" onclick="toggleChat()" aria-label="Acquire">${ART.robot(42)}<span>${T({ar:'اسأل Acquire',en:'Ask Acquire'})}</span></button>
  <section class="chat" id="chat" aria-label="Acquire"><header>${ART.robot(38)}<b>Acquire — ${T({ar:'المساعد الذكي للكيمياء',en:'Chemistry assistant'})}</b><button onclick="closeChat()" aria-label="close">×</button></header>
   <div class="mode live">${T({ar:'بيساعدك من محتوى دروس الاتزان الكيميائي',en:'Helps you using the chemical-equilibrium lessons'})}</div>
   <div class="msgs" id="msgs" aria-live="polite"></div>
   <div class="starters">${STARTERS.map(s=>`<button data-k="${s.k}">${T(s)}</button>`).join('')}</div>
   <form class="chatin" id="chf"><input id="chi" placeholder="${T({ar:'اكتب سؤالك بالعربي أو بالإنجليزي...',en:'Ask in Arabic or English...'})}" aria-label="message"><button class="btn blue sm" aria-label="send">${ART.i.send}</button></form></section>`;
  $$('.starters button').forEach(b=>b.onclick=()=>{const s=STARTERS.find(x=>x.k===b.dataset.k); userSay(T(s)); botDo(b.dataset.k)});
  $('#chf').onsubmit=e=>{e.preventDefault();const v=$('#chi').value.trim();if(v){$('#chi').value='';userSay(v);botDo('text',v)}};
  $('#msgs').addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const [act,arg]=b.dataset.act.split(':');
    if(act==='go'){closeChat();go(arg)} else if(act==='concept'){userSay(T(CONCEPTS[arg]));botDo('concept',arg)} else if(act==='hint'){botDo('hint',arg)} else if(act==='why'){botDo('why')}});
  drawMsgs();
}
function drawMsgs(){ const m=$('#msgs'); if(!m)return;
  const hello=T({ar:'أهلًا! أنا Acquire 👋 معاك في كل صفحة. أقدر أشرحلك أي مفهوم في الدروس بطريقة أبسط، وأديك تلميحات في الأسئلة، وأوضّحلك ليه إجابتك غلط.',en:'Hi! I’m Acquire 👋 — with you on every page. I can explain any concept in the lessons more simply, give hints, and explain why an answer was wrong.'});
  m.innerHTML=`<div class="m bot">${hello}</div>`+CHAT.map(x=>`<div class="m ${x.me?'me':'bot'}" dir="${x.me?'auto':x.dir}">${x.me?esc(x.t):x.t}</div>`).join(''); m.scrollTop=m.scrollHeight; }
function userSay(t){CHAT.push({me:true,t});drawMsgs();logEv('chat_question',t)}
function botSay(html){CHAT.push({me:false,t:chem(html),dir:LANG==='en'?'ltr':'rtl'});drawMsgs()}
const actBtn=(act,label)=>`<button class="btn ghost sm chatact" data-act="${act}">${label}</button>`;
const conceptChips=list=>`<div class="ctrls">${list.map(c=>actBtn('concept:'+c,T(CONCEPTS[c]))).join('')}</div>`;
function openChat(){ $('#chat').classList.add('open'); setTimeout(()=>$('#chi')?.focus(),50); logEv('chat_open',CUR_ROUTE); }
function closeChat(){ $('#chat')?.classList.remove('open'); }
function toggleChat(){ $('#chat').classList.contains('open')?closeChat():openChat(); }
function askAbout(qid){ openChat(); if(qid){CTX.q=qid; const q=qById(qid); botSay(T({ar:'خلّينا نفكر سوا في السؤال ده:',en:'Let’s think about this question together:'})+`<br><i>${T(q.q)}</i><div class="ctrls">${actBtn('hint:'+qid,'💡 '+T({ar:'تلميح',en:'Hint'}))}</div>`)} else if(/^u[1-6]$/.test(CUR_ROUTE)) botDo('simple'); }
function inTest(){return ['pretest','posttest'].includes(CUR_ROUTE)}
function currentConcepts(){ const u=/^u[1-6]$/.test(CUR_ROUTE)?CUR_ROUTE:null; return u?Object.keys(CONCEPTS).filter(c=>CONCEPTS[c].u===u):Object.keys(CONCEPTS); }
function explain(c){ const e=EXPLAIN[c], u=unitById(CONCEPTS[c].u);
  botSay(`<b>${T(CONCEPTS[c])}</b><br>${T(e.s)}<br><br>${T(e.q)}<div class="ctrls">${CUR_ROUTE!==u.id?actBtn('go:'+u.id,T({ar:'افتح الدرس ',en:'Open lesson '})+u.n+' ←'):''}</div>`); logEv('acquire_explain',c); }
function giveHint(qid){ const q=qById(qid), H=HINTS[qid]?.h||[]; const l=(CTX.lvl[qid]||0)+1; CTX.lvl[qid]=l;
  if(l<=H.length) botSay(`<b>${T({ar:'تلميح',en:'Hint'})} ${l}:</b> ${T(H[l-1])}<div class="ctrls">${actBtn('hint:'+qid,l<H.length?'💡 '+T({ar:'تلميح تاني',en:'Another hint'}):'👀 '+T({ar:'اعرض الحل',en:'Show solution'}))}</div>`);
  else botSay(`<b>${T({ar:'الحل:',en:'Solution:'})}</b> ${T(q.o[q.a])}<br>${T(q.x)}<br>${T({ar:'جرّب تشرح لنفسك ليه ده الصح قبل ما تكمل 👌',en:'Try explaining to yourself why this is right before moving on 👌'})}`);
  logEv('hint',`${qid}:level${Math.min(l,H.length+1)}`); }
function botDo(kind,arg){
  setTimeout(()=>{ const sv=LANG; if(kind==='text' && !/[\u0600-\u06FF]/.test(arg) && /[a-z]/i.test(arg)) LANG='en'; else if(kind==='text' && /[\u0600-\u06FF]/.test(arg)) LANG='ar';
    try{ botInner(kind,arg) } finally { LANG=sv } },250);
}
function botInner(kind,arg){
  if(inTest() && ['hint','why','text'].includes(kind) && !(kind==='text' && /شكر|thank/.test(norm(arg)))){ botSay(T({ar:'أثناء الاختبار مش هقدر أساعدك في الإجابات، عشان نعرف مستواك الحقيقي ونختارلك المسار الصح 🙂 بالتوفيق! بعد ما تسلّم هكون معاك في كل درس.',en:'During the test I can’t help with answers, so we find your real level and the right path 🙂 Good luck! After you submit I’ll be with you in every lesson.'})); return; }
  if(kind==='concept') return explain(arg);
  if(kind==='simple') return botSay(T({ar:'أكيد! اختار المفهوم:',en:'Sure! Pick a concept:'})+conceptChips(currentConcepts()));
  if(kind==='hint'){ const id=arg||CTX.q; if(id) return giveHint(id); return botSay(T({ar:'افتح أي سؤال في الدروس ودوس 💡 تلميح جنبه، أو دوس "اطلب مساعدة Acquire" تحت السؤال، وأنا هديك تلميحات خطوة بخطوة.',en:'Open any lesson question and press 💡 Hint next to it, and I’ll guide you step by step.'})); }
  if(kind==='why'){ const w=CTX.wrong; if(!w) return botSay(T({ar:'لما تجاوب غلط على سؤال في الدروس، اسألني هنا وأنا هوضحلك الفكرة اللي وراه.',en:'When you answer a lesson question wrongly, ask me here and I’ll explain the idea behind it.'}));
    const q=qById(w.id), why=HINTS[w.id]?.w?.[w.j]; return botSay(`${T({ar:'اخترت:',en:'You chose:'})} <i>${T(q.o[w.j])}</i><br>${why?T(why):T({ar:'الاختيار ده مش متوافق مع القاعدة.',en:'That option does not fit the rule.'})}<div class="ctrls">${actBtn('hint:'+w.id,'💡 '+T({ar:'عايز تلميح للصح',en:'Hint toward the right answer'}))}</div>`); }
  if(kind==='cmp') return botSay(T({ar:'سؤال حلو!<br>• <b>الحرارة:</b> بتزيح الاتزان (التسخين ناحية الاتجاه الماص)، وبتغيّر قيمة K، وكمان بتسرّع التفاعلين.<br>• <b>العامل الحفاز:</b> بيسرّع التفاعلين بنفس القدر بس — لا بيزيح الاتزان ولا بيغيّر K ولا ΔH.<br><br>سؤال ليك: لو عايز تزوّد ناتج النشادر عند الاتزان، هتبرّد ولا تضيف حفاز؟',en:'Great question!<br>• <b>Temperature:</b> shifts equilibrium (heating → endothermic direction), changes K, and speeds both reactions.<br>• <b>Catalyst:</b> only speeds both reactions equally — no shift, K and ΔH unchanged.<br><br>Your turn: to raise the equilibrium yield of ammonia, would you cool it or add a catalyst?'})+`<div class="ctrls">${actBtn('go:u4',T({ar:'درس الحرارة',en:'Temperature lesson'}))}${actBtn('go:u6',T({ar:'درس الحفاز',en:'Catalyst lesson'}))}</div>`);
  if(kind==='act'){ const weak=(S.pre?.weak||[]).filter(c=>!S.fixed?.[c]);
    if(!weak.length) return botSay(T({ar:'مفيش نقاط ضعف مفتوحة عندك 👏 جرّب تحديات المسار الإثرائي أو معمل المكبس في الدرس 5.',en:'No open weak points 👏 Try the enrichment challenges or the piston lab in Unit 5.'})+`<div class="ctrls">${actBtn('go:u5',T({ar:'الدرس 5',en:'Unit 5'}))}</div>`);
    const c=weak[0], u=unitById(CONCEPTS[c].u); return botSay(T({ar:`نقطة الضعف اللي نبدأ بيها: <b>${T(CONCEPTS[c])}</b>. افتح الدرس ${u.n}، جرّب المحاكاة وتوقّع قبل كل زرار، وبعدين جاوب أسئلة آخر الدرس.`,en:`Let’s start with: <b>${T(CONCEPTS[c])}</b>. Open Unit ${u.n}, try the simulation and predict before each action, then answer the questions at the end.`})+`<div class="ctrls">${actBtn('go:'+u.id,T({ar:'افتح الدرس ',en:'Open Unit '})+u.n)}</div>`+(weak.length>1?`<div class="muted">${T({ar:'نقاط تانية: ',en:'Others: '})}${weak.slice(1).map(x=>T(CONCEPTS[x])).join('، ')}</div>`:'')); }
  // free text
  const t=norm(arg||'');
  if(/^(اهلا|هاي|السلام|سلام|مرحبا|hi|hello|hey)/.test(t)) return botSay(T({ar:'أهلًا بيك! تحب أشرحلك مفهوم، ولا عندك سؤال واقف فيه؟',en:'Hi! Want a concept explained, or are you stuck on a question?'})+conceptChips(currentConcepts().slice(0,4)));
  if(/شكر|تسلم|thank/.test(t)) return botSay(T({ar:'العفو! أنا هنا في أي وقت 🙌',en:'You’re welcome! I’m here anytime 🙌'}));
  if(/(حراره|temperature|heat).*(حفاز|catalyst)|(حفاز|catalyst).*(حراره|temperature|heat)/.test(t)) return botInner('cmp');
  if(/تلميح|hint|ساعدني|مش عارف|مش فاهم السؤال|help/.test(t) && CTX.q) return botInner('hint');
  if(/غلط|خطا|wrong/.test(t)) return botInner('why');
  if(/نشاط|ضعف|activity|weak/.test(t)) return botInner('act');
  const score={}; Object.entries(KEYS).forEach(([c,ks])=>ks.forEach(k=>{if(t.includes(norm(k)))score[c]=(score[c]||0)+k.length}));
  const best=Object.entries(score).sort((a,b)=>b[1]-a[1]);
  if(best.length){ explain(best[0][0]); if(best[1]&&best[1][1]>=best[0][1]*.6) botSay(T({ar:'ممكن كمان يهمك:',en:'You may also want:'})+conceptChips([best[1][0]])); return; }
  if(/اشرح|ابسط|مش فاهم|explain|simpl|understand/.test(t)) return botInner('simple');
  botSay(T({ar:'السؤال ده برّه دروس الاتزان الكيميائي اللي أقدر أساعد فيها، أو مافهمتهوش كويس 🤔 لو برّه المنهج اسأل معلمتك. ولو عن الدروس، اختار المفهوم:',en:'That seems outside the chemical-equilibrium lessons I can help with, or I didn’t understand it 🤔 If it’s off-syllabus, ask your teacher. Otherwise pick a concept:'})+conceptChips(Object.keys(CONCEPTS)));
  logEv('acquire_unmatched',arg||'');
}

/* ================= BOOT ================= */
applyDir(); renderChat(); VOICE.hold(true); render();
INTRO.run(()=>{ VOICE.hold(false); VOICE.stop(); const rp=document.getElementById('rreplay'); if(rp) rp.click(); });
