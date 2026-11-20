/* ================= CONFIG ================= */
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbwkTkQUCGk2qS5gro0e0cEB2YF1A8R0czG9KKu_HErutTg4woSlBZHNVTFFrP9pFrojmw/exec', // Google Apps Script Web App (logging)
  showReviewTags: true,      // show "pending teacher approval" tags (turn off before launch)
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
const reviewTag = ()=> CONFIG.showReviewTags?` <span class="tag">${T({ar:'بانتظار اعتماد المعلمة',en:'Pending teacher approval'})}</span>`:'';

/* ================= USER STATE ================= */
let USER = store.get('cot:user', null);   // {email, phone}
let S = USER ? store.get('cot:s:'+USER.email, {}) : {};
const save = ()=> USER && store.set('cot:s:'+USER.email, S);

/* ================= LOGGING → Google Sheet ================= */
function post(payload){
  if(!CONFIG.API_URL) return Promise.resolve(null);
  return fetch(CONFIG.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(r=>r.json()).catch(()=>null);
}
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
  <div class="navlinks">${USER?`
   <button onclick="go('dashboard')" aria-label="home">${ART.i.home}<span>${T({ar:'الرئيسية',en:'Home'})}</span></button>
   <button onclick="go('report')" aria-label="results">${ART.i.chart}<span>${T({ar:'نتائجك',en:'Results'})}</span></button>
   <button onclick="openChat()" aria-label="help">${ART.i.help}<span>${T({ar:'المساعدة',en:'Help'})}</span></button>`:''}
   <button class="lang" onclick="toggleLang()" aria-label="language">${ART.i.globe}<span>${LANG==='ar'?'English':'العربية'}</span></button>
   ${USER?`<button onclick="logout()" aria-label="logout">${ART.i.out}<span>${T({ar:'خروج',en:'Logout'})}</span></button>`:''}</div></nav>`;
}
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
  const V={login:vLogin, welcome:vWelcome, pretest:()=>vTest('pre'), posttest:()=>vTest('post'), dashboard:vDash, path:vPath, report:vReport};
  const html = /^u[1-6]$/.test(r) ? vUnit(r) : (V[r]||vDash)();
  $('#app').innerHTML = nav() + `<main class="wrap" id="main">${chem(html)}</main>`;
  $('#fabWrap').style.display = USER?'':'none';
  CUR_ROUTE=r; document.body.dataset.route=r;
  AFTER.splice(0).forEach(f=>{try{f()}catch(e){console.error(e)}});
  if(!/test$/.test(r)) COACH.hide();
  try{ COMPANION.onRoute(r); }catch(e){ console.error(e); }
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
   </div></div>`;
}

/* Acquire guide: talks, grows, waves and points at what to fill */
const GUIDE = (()=>{
  let timers=[], stage='', typing=null, live=false;
  const L = {
    hi:{ar:'أهلًا بيك! 👋 هنبدأ تجربة تعليمية بشكل جديد خالص',en:'Hi there! 👋 We’re starting a totally new learning experience'},
    ready:{ar:'جاااهز؟ 🤩',en:'Readyyy? 🤩'},
    go:{ar:'يلا بينا يا أصحابي نبدأ! 🚀',en:'Let’s go, friends! 🚀'},
    email:{ar:'اكتب الإيميل الشخصي بتاعك 📧',en:'Type your personal email 📧'},
    phone:{ar:'تمام! 👌 وكمان رقم موبايلك 📱',en:'Great! 👌 And your mobile number 📱'},
    consent:{ar:'آخر حاجة: علّم هنا بالموافقة ✅',en:'Last thing: tick the agreement here ✅'},
    btn:{ar:'كده تمام! دوس هنا ونبدأ 🎉',en:'All set! Press here to start 🎉'}
  };
  const $r = s=>document.querySelector(s);
  const clear=()=>{ timers.forEach(clearTimeout); timers=[]; clearInterval(typing); };
  const later=(ms,f)=>timers.push(setTimeout(()=>live&&f(),ms));
  function mood(cls){ const b=$r('#rbot'); if(!b)return; b.classList.remove('pop','jump','wave','point','big'); void b.offsetWidth; cls.split(' ').filter(Boolean).forEach(c=>b.classList.add(c)); }
  function say(o){ const el=$r('#rtxt'); if(!el)return; const txt=T(o); clearInterval(typing); el.textContent=''; let i=0;
    const bub=$r('#rbub'); bub.classList.remove('show'); void bub.offsetWidth; bub.classList.add('show');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){ el.textContent=txt; return; }
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
    ph.addEventListener('focus',()=>{ if(stage!=='#ph'){ clear(); point('#ph',validEmail(em.value)?L.phone:{ar:'وكمان رقم موبايلك 📱',en:'And your mobile number 📱'});} });
    em.addEventListener('input',()=>{ if(validEmail(em.value)&&stage==='#em'){ clear(); later(600,next); live=true; } });
    ph.addEventListener('input',()=>{ if(validPhone(ph.value)&&stage==='#ph'){ clear(); later(600,next); live=true; } });
    cs.addEventListener('change',onEdit);
    $r('#rreplay').onclick=intro;
    window.addEventListener('resize',()=>stage&&aim(stage));
    window.addEventListener('scroll',()=>stage&&aim(stage),{passive:true}); }
  function oops(msg,sel){ clear(); live=true; stage=sel; say({ar:'🤔 '+msg,en:'🤔 '+msg}); mood('pop point'); highlight(sel); aim(sel); }
  function stop(){ clear(); live=false; highlight(null); }
  window.addEventListener('hashchange',()=>{ if(!document.querySelector('#rstage')) stop(); });
  return {start,stop,oops};
})();

/* ---- WELCOME ---- */
function vWelcome(){
  const moods=[{k:'great',ar:'ممتاز',en:'Great'},{k:'good',ar:'كويس',en:'Good'},{k:'nervous',ar:'متوتر شوية',en:'A bit nervous'},{k:'tired',ar:'تعبان',en:'Tired'}];
  AFTER.push(()=>{ $$('.moods button').forEach(b=>b.onclick=()=>{S.mood=b.dataset.k;save();$$('.moods button').forEach(x=>x.classList.toggle('on',x===b));
    $('#moodR').textContent=T(MOOD_LINES[b.dataset.k]); WALKER.choose(b); logEv('mood',b.dataset.k)}); WALKER.start();
    const sb=$('#startDx'); let told=false; const tell=()=>{ if(told) return; told=true; WALKER.hint(sb,T(OFFLINE_LINE)); logEv('robot_offline_hint',''); };
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
  const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sizeFor=()=>{ const b=document.querySelector('.moods button'); const h=b?b.getBoundingClientRect().height:44; return Math.round(h*1.6); };
  function make(){ el?.remove(); el=document.createElement('div'); el.className='walker'; el.innerHTML=`<div class="wb-bub" aria-hidden="true"></div><div class="wb-body">${ART.robotMini()}</div>`; document.body.appendChild(el); size(); }
  function size(){ if(!el) return; const h=sizeFor(); el.style.width=Math.round(h*100/132)+'px'; el.style.height=h+'px'; }
  const page=r=>({x:r.left+scrollX, y:r.top+scrollY, w:r.width, h:r.height});
  function spotOn(btn){ const r=page(btn.getBoundingClientRect()), w=el.offsetWidth, h=el.offsetHeight; return {x:r.x+r.w/2-w/2, y:r.y-h+12}; }
  function spotHome(){ const r=page(document.querySelector('#wbHome').getBoundingClientRect()), w=el.offsetWidth, h=el.offsetHeight; return {x:r.x+r.w/2-w/2, y:r.y+r.h-h}; }
  function place(p){ pos=p; el.style.transform=`translate(${p.x}px,${p.y}px)`; }
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
    hush(); mood(null); await move(spotOn(btn),tk); if(tk!==token) return; mood(btn.dataset.k); say(T(MOOD_LINES[btn.dataset.k]),true); }
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
    let idle=null; const idleArm=()=>{ clearTimeout(idle); idle=setTimeout(()=>{ if(CUR_ROUTE.endsWith('test')) COACH.say(T({ar:'أنا موجود هنا لمساعدتك 🤖 خد وقتك وفكّر براحتك',en:'I’m right here to help you 🤖 Take your time and think it through'}),5000); },25000); };
    cleanups.push(()=>{ clearTimeout(idle); COACH.hide(); });
    const progressLine=()=>{ const n=done(), m=N-n;
      if(m===0){ $('#tsend').classList.add('glow'); return T({ar:'جاوبت على كل الأسئلة 🎉 تقدر دلوقتي تسلّم الاختبار',en:'You answered every question 🎉 You can submit the test now'}); }
      $('#tsend').classList.remove('glow');
      let s = n===1 ? T({ar:`حلّيت سؤال، فاضلك ${m} 💪`,en:`1 done, ${m} to go 💪`}) : T({ar:`حلّيت ${n}، فاضلك ${m} 💪`,en:`${n} done, ${m} to go 💪`});
      const g=gapBefore(i); if(g) s+=T({ar:` — بس إنت ناسي سؤال رقم ${g}، افتكر ترجعله 😉`,en:` — but you skipped question ${g}, remember to go back 😉`});
      return s; };
    COACH.say(T({ar:`أنا موجود هنا لمساعدتك 🤖 جاوب براحتك، وأنا هقولك فاضلك كام سؤال`,en:`I’m here to help you 🤖 Answer at your pace and I’ll tell you how many are left`}),6000);
    const navRow=()=>{ const n=Object.keys(ans).length; $('#tp').style.width=(n/qs.length*100)+'%';
      $('#tn').textContent=T({ar:`${n} من ${qs.length} متجاوب`,en:`${n} of ${qs.length} answered`});
      $('#qnav').innerHTML=qs.map((q,k)=>`<button class="qn ${ans[q.id]!=null?'a':''} ${k===i?'cur':''} ${flag[q.id]?'f':''}" data-k="${k}" aria-label="${T({ar:'سؤال',en:'Question'})} ${k+1}">${k+1}</button>`).join('');
      $$('#qnav .qn').forEach(b=>b.onclick=()=>{i=+b.dataset.k;show()}); };
    const show=()=>{ const q=qs[i]; $('#tsub').innerHTML=''; if(Object.keys(ans).length||i) keep();
      box.innerHTML=chem(`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><h2 style="font-size:1.2rem;margin-top:0">${i+1}. ${T(q.q)}</h2><button class="btn sm flagb ${flag[q.id]?'on':''}" id="tfl">⚑ ${flag[q.id]?T({ar:'مُعلَّم للمراجعة',en:'Marked for review'}):T({ar:'علّم للمراجعة',en:'Mark for review'})}</button></div>
        ${q.o.map((o,j)=>`<button class="opt ${ans[q.id]===j?'sel':''}" data-j="${j}"><span class="k">${L(j)}</span><span>${T(o)}</span></button>`).join('')}
        <div style="display:flex;justify-content:space-between;margin-top:14px"><button class="btn ghost sm" id="tb" ${i?'':'disabled'}>${T({ar:'السابق',en:'Back'})}</button><button class="btn blue sm" id="tnx" ${i===qs.length-1?'disabled':''}>${T({ar:'التالي',en:'Next'})}</button></div>`);
      $$('.opt',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j; const was=ans[q.id]; if(ans[q.id]===j){delete ans[q.id]}else ans[q.id]=j; $$('.opt',box).forEach(x=>x.classList.toggle('sel',+x.dataset.j===ans[q.id])); navRow(); keep(); idleArm();
        if(was==null && ans[q.id]!=null) COACH.say(progressLine(),done()===N?9000:3500); else if(ans[q.id]==null){ COACH.hide(); $('#tsend').classList.remove('glow'); } });
      $('#tfl').onclick=()=>{flag[q.id]=!flag[q.id]; keep(); show()};
      $('#tb').onclick=()=>{i--;show()}; $('#tnx').onclick=()=>{ const left=ans[q.id]==null; i++; show(); if(left) COACH.say(T({ar:`إنت ناسي سؤال رقم ${i}، افتكر ترجعله 😉`,en:`You skipped question ${i} — remember to come back 😉`}),4500); }; navRow(); idleArm(); };
    $('#tsend').onclick=()=>{ const miss=qs.map((q,k)=>ans[q.id]==null?k+1:0).filter(Boolean), fl=qs.map((q,k)=>flag[q.id]?k+1:0).filter(Boolean);
      if(!miss.length && !fl.length) return finish();
      COACH.say(miss.length?T({ar:`فاضلك ${miss.length} ${miss.length===1?'سؤال':'أسئلة'} ماجاوبتهمش: ${miss.join('، ')} — تحب ترجعلهم؟`,en:`${miss.length} unanswered: ${miss.join(', ')} — want to go back?`}):T({ar:'جاوبت على كل الأسئلة 🎉 راجع اللي معلّمه لو حابب، وبعدين سلّم',en:'All answered 🎉 Review your marked ones if you like, then submit'}),7000);
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
    $('.hintb',sec).onclick=()=>{ const H=HINTS[q.id]?.h||[]; lvl++;
      const parts=H.slice(0,lvl).map((h,k)=>`<div><b>${T({ar:'تلميح',en:'Hint'})} ${k+1}:</b> ${chem(T(h))}</div>`);
      if(lvl>H.length) parts.push(`<div><b>${T({ar:'الحل:',en:'Solution:'})}</b> ${chem(T(q.o[q.a]))} — ${chem(T(q.x))}</div>`);
      $('.qhint',sec).innerHTML=`<div class="fb hint">${parts.join('')}${lvl<=H.length?`<div class="muted" style="font-size:.85rem">${lvl<H.length?T({ar:'لسه محتاج مساعدة؟ دوس تلميح تاني.',en:'Still stuck? Press Hint again.'}):T({ar:'دوس تلميح تاني لو عايز تشوف الحل.',en:'Press Hint again to see the solution.'})}</div>`:''}</div>`;
      if(lvl>H.length) $('.hintb',sec).disabled=true;
      logEv('hint',`${q.id}:level${Math.min(lvl,H.length+1)}${lvl>H.length?'(solution)':''}`); };
    $$('.opt',sec).forEach(b=>b.onclick=()=>{ const j=+b.dataset.j, ok=j===q.a;
      $$('.opt',sec).forEach((x,k)=>{x.classList.remove('ok','no'); if(k===j)x.classList.add(ok?'ok':'no')});
      const why=HINTS[q.id]?.w?.[j];
      $('.qfb',sec).innerHTML=`<div class="fb ${ok?'ok':'no'}">${ok?T({ar:'✔ إجابة صحيحة. ',en:'✔ Correct. '})+chem(T(q.x)):T({ar:'✘ مش دي. ',en:'✘ Not this one. '})+(why?chem(T(why)):'')+'<br>'+T({ar:'جرّب اختيار تاني، أو دوس 💡 تلميح.',en:'Try another option, or press 💡 Hint.'})}</div>`;
      if(!ok){CTX.q=q.id; CTX.wrong={id:q.id,j}; COMPANION.wrong();}
      S[bucket]=S[bucket]||{}; if(unit){S.units=S.units||{};S.units[unit]=S.units[unit]||{};S.units[unit].q=S.units[unit].q||{};S.units[unit].q[q.id]=ok||S.units[unit].q[q.id]||false;}
      else { const before=S[bucket][q.id]; S[bucket][q.id]=ok||S[bucket][q.id]||false; if(bucket==='chal'&&ok&&!before){ save(); COMPANION.chal(); } }
      if(ok && S.pre?.weak.includes(q.c)){S.fixed=S.fixed||{}; if(!S.fixed[q.c]){S.fixed[q.c]=true; logEv('concept_fixed',q.c); toast(T({ar:'تم تصحيح مفهوم: ',en:'Concept fixed: '})+T(CONCEPTS[q.c])); COMPANION.fixed(q.c);}}
      if(unit && qs.every(x=>S.units[unit].q[x.id]!==undefined) && !S.units[unit].done){S.units[unit].done=true; logEv('unit_complete',unit); toast(T({ar:'خلّصت الدرس 🎉',en:'Lesson complete 🎉'})); save(); COMPANION.unitDone(unit);}
      save(); logEv('quiz_answer',`${q.id}:${ok?'correct':'wrong'}:choice=${j}`); }); });
}

/* ---- UNIT ---- */
function vUnit(id){
  const u=unitById(id), k=S.path||S.rec, p=PATHS[k], idx=UNITS.indexOf(u);
  S.units=S.units||{}; S.units[id]=S.units[id]||{}; if(!S.units[id].opened){S.units[id].opened=new Date().toISOString()} S.lastUnit=id; save();
  logEv('unit_open',id); CTX.unit=id;
  AFTER.push(()=>{ u.sims.forEach(s=>{const c=SIMS[s]($('#sim-'+s));if(typeof c==='function')cleanups.push(c)}); practice($('#uq'),u.quiz,'units',id); });
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><button class="btn ghost sm" onclick="go('path')">${LANG==='ar'?'→':'←'} ${T(p.name)}</button><button class="btn ghost sm" onclick="askAbout()">${ART.i.help.replace('<svg','<svg width="18"')} ${T({ar:'اسأل Acquire عن الدرس ده',en:'Ask Acquire about this lesson'})}</button></div>
   <div class="banner" style="margin-top:14px;justify-content:flex-start;text-align:start"><span class="n" style="background:var(--${u.color});color:#fff;width:52px;height:52px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;flex:none">${u.n}</span><div><h1 style="font-size:1.6rem">${T(u.t)}</h1><p>${T(u.goal)}</p></div></div>
   <div class="card" style="margin-top:18px">${u.sections.map(s=>`<div class="section"><h2>${T(s.h)}${s.review?reviewTag():''}</h2>${T(s.b)}</div>`).join('')}</div>
   <div class="section"><h2>${T({ar:'جرّب بنفسك',en:'Try it yourself'})}</h2>${u.sims.map(s=>`<div id="sim-${s}"></div>`).join('')}</div>
   <div class="card"><h2 style="margin-top:0">${T({ar:'انتبه من الأخطاء الشائعة',en:'Watch out for common misconceptions'})}</h2>${u.mis.map(m=>`<div class="mis"><div class="w">✘ ${T(m.w)}</div><div class="r">✔ ${T(m.r)}</div></div>`).join('')}</div>
   <div class="card" style="margin-top:18px"><h2 style="margin-top:0">${k==='sup'?T({ar:'إعادة التقييم',en:'Reassessment'}):T({ar:'اختبر نفسك',en:'Check yourself'})}</h2><div id="uq"></div></div>
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
    <p class="muted" style="font-size:.88rem">${T({ar:'الدرجة مؤشر واحد فقط، ولا تقيس كل ما تعلمته.',en:'A score is only one indicator; it does not measure everything you learned.'})}</p></div>`;
}

/* ================= ACQUIRE (free, content-based assistant) ================= */
const CTX={unit:null,q:null,wrong:null,lvl:{}}; let CHAT=[];
const norm=s=>String(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[₀-₉]/g,d=>'0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(d)]);
const STARTERS=[{k:'simple',ar:'اشرح لي مفهوم بطريقة أبسط',en:'Explain a concept more simply'},{k:'hint',ar:'ساعدني في السؤال من غير ما تقول الإجابة',en:'Help me without giving the answer'},{k:'why',ar:'وضّح لي سبب خطأ إجابتي',en:'Why was my answer wrong?'},{k:'cmp',ar:'الفرق بين الحرارة والعامل الحفاز؟',en:'Temperature vs catalyst?'},{k:'act',ar:'رشّح لي نشاط لنقطة ضعفي',en:'Suggest an activity for my weak point'}];
/* Acquire coach bubble beside the floating button: text + optional action buttons, close (✕) and "mute for a while" */
const COACH=(()=>{ let t=null, last=0;
  const muted=()=>!!store.get('cot:mute',false);
  function el(){ let b=document.getElementById('coachBub');
    if(!b){ b=document.createElement('div'); b.id='coachBub'; b.className='coach-bub'; b.setAttribute('role','status'); b.setAttribute('aria-live','polite');
      b.innerHTML=`<button class="cb-x" aria-label="close">✕</button><div class="cb-t"></div><div class="cb-a"></div><button class="cb-m"></button>`;
      document.body.appendChild(b);
      b.querySelector('.cb-x').onclick=()=>hide();
      b.querySelector('.cb-m').onclick=()=>setMute(true); }
    b.querySelector('.cb-m').textContent='🤫 '+T({ar:'اسكت شوية',en:'Quiet for now'});
    return b; }
  function say(text,ms=4500,opt={}){ if(muted() || !USER) return; if(!opt.force && Date.now()-last<(opt.gap??0)) return; last=Date.now();
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
  function setMute(v){ store.set('cot:mute',!!v); logEv('acquire_mute',v?'on':'off'); hide(); badge();
    if(!v) say(T({ar:'رجعتلك تاني 🤖 هفضل معاك خطوة بخطوة!',en:'I’m back 🤖 I’ll be with you every step!'}),3500,{force:true}); }
  return {say,hide,setMute,badge};
})();

/* Acquire companion: reacts to where the student is on the platform */
const COMPANION=(()=>{ const seen=new Set();
  const nm=c=>T(CONCEPTS[c]); const U=id=>unitById(id);
  const list=a=>a.length<=1?a.join(''):a.slice(0,-1).join('، ')+T({ar:' و',en:' and '})+a[a.length-1];
  const go2=r=>()=>go(r);
  const say=(t,ms,opt)=>COACH.say(t,ms,opt);
  function nextUnit(){ return UNITS.find(u=>!unitDone(u)); }
  function inProgress(){ const id=S.lastUnit; if(!id) return null; const u=U(id); return u&&!unitDone(u)&&S.units?.[id]?.q&&Object.keys(S.units[id].q).length?u:(u&&!unitDone(u)?u:null); }
  function openWeak(){ return (S.pre?.weak||[]).filter(c=>!S.fixed?.[c]); }
  function pathAdvice(){
    const k=S.path||S.rec;
    if(k==='sup'){ const w=openWeak(); if(!w.length) return {t:T({ar:'صلّحت كل نقط ضعفك 🎉 إنت جاهز للاختبار البعدي!',en:'You fixed all your weak points 🎉 Ready for the post-test!'}),a:[{label:T({ar:'▶ ابدأ الاختبار البعدي',en:'▶ Start post-test'}),fn:go2('posttest'),primary:1}]};
      const u=U(CONCEPTS[w[0]].u); return {t:T({ar:`فاضلك ${w.length} ${w.length===1?'مفهوم':'مفاهيم'} تصلّحه، يلا نبدأ بـ "${nm(w[0])}" (الدرس ${u.n}) 💪`,en:`${w.length} concept(s) left to fix — let’s start with "${nm(w[0])}" (lesson ${u.n}) 💪`}),a:[{label:T({ar:'▶ يلا بينا',en:'▶ Let’s go'}),fn:go2(u.id),primary:1}]}; }
    if(k==='enr'){ const n=Object.values(S.chal||{}).filter(Boolean).length, N=CHALLENGES.length;
      if(n>=N) return {t:T({ar:'حلّيت كل التحديات 🔥 إنت كده كسرت الدنيا! يلا على الاختبار البعدي',en:'All challenges solved 🔥 On to the post-test!'}),a:[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]};
      return {t:n?T({ar:`حلّيت ${n} من ${N} تحديات 🔥 كمّل التحدي الجاي تحت`,en:`${n} of ${N} challenges solved 🔥 Keep going below`}):T({ar:`قدامك ${N} تحديات تفكير ناقد 🔥 يلا نبدأ بأول واحد!`,en:`${N} critical-thinking challenges await 🔥 Let’s start with the first!`}),a:[{label:T({ar:'وديني للتحديات',en:'Take me there'}),fn:()=>document.querySelector('#chq')?.scrollIntoView({behavior:'smooth'}),primary:1}]}; }
    const ip=inProgress(); if(ip) return {t:T({ar:`إنت سايب "${T(ip.t)}" في النص، يلا نكمّله؟ 😉`,en:`You left "${T(ip.t)}" halfway — shall we finish it? 😉`}),a:[{label:T({ar:'▶ كمّله',en:'▶ Continue'}),fn:go2(ip.id),primary:1}]};
    const nu=nextUnit(), d=UNITS.filter(unitDone).length;
    if(!nu) return {t:T({ar:'خلصت كل الدروس 🎉 يلا على الاختبار البعدي نشوف اتحسّنت قد إيه',en:'All lessons done 🎉 Let’s see your progress in the post-test'}),a:[{label:T({ar:'▶ ابدأ الاختبار البعدي',en:'▶ Start post-test'}),fn:go2('posttest'),primary:1}]};
    return {t:d?T({ar:`خلصت ${d} من 6 دروس 💪 الدرس الجاي: "${T(nu.t)}"`,en:`${d} of 6 lessons done 💪 Next: "${T(nu.t)}"`}):T({ar:`يلا نبدأ أول درس: "${T(nu.t)}" 🚀`,en:`Let’s start the first lesson: "${T(nu.t)}" 🚀`}),a:[{label:T({ar:'▶ يلا نبدأه',en:'▶ Start it'}),fn:go2(nu.id),primary:1}]}; }
  function onRoute(r){ COACH.badge(); if(!USER) return;
    setTimeout(()=>{ if(CUR_ROUTE!==r) return;
      if(r==='dashboard' && S.pre){
        if(S.justPre){ delete S.justPre; save(); const w=S.pre.weak, rec=S.rec;
          let t=T({ar:`خلصت الاختبار 👏 جبت ${S.pre.score}%.`,en:`Test done 👏 You scored ${S.pre.score}%.`});
          t+=w.length?T({ar:` عندك ${w.length} ${w.length===1?'مفهوم محتاج':'مفاهيم محتاجة'} شوية دعم: ${list(w.slice(0,3).map(nm))}${w.length>3?'…':''}.`,en:` ${w.length} concept(s) need support: ${list(w.slice(0,3).map(nm))}${w.length>3?'…':''}.`}):T({ar:' أتقنت كل المفاهيم! 🔥',en:' You mastered every concept! 🔥'});
          t+=T({ar:` أنا شايف ${T(PATHS[rec].name)} هو الأنسب ليك.`,en:` I think the ${T(PATHS[rec].name)} suits you best.`});
          document.querySelector('.path.rec')?.classList.add('glow');
          return say(t,20000,{force:true,actions:[{label:T({ar:'▶ يلا نبدأ المسار',en:'▶ Start the path'}),fn:()=>choosePath(rec),primary:1},{label:T({ar:'وريني المسارات التانية',en:'Show other paths'}),fn:()=>document.querySelector('.paths')?.scrollIntoView({behavior:'smooth'})}]}); }
        if(!sessionStorage.getItem('cot:greet')){ sessionStorage.setItem('cot:greet','1'); const a=S.path?pathAdvice():null;
          return say(T({ar:'أهلًا تاني 👋 ',en:'Welcome back 👋 '})+(a?a.t:T({ar:'اختار مسارك وتعالى نبدأ!',en:'Pick your path and let’s begin!'})),12000,{force:true,actions:a?a.a:[]}); }
        return; }
      if(r==='path'){ const a=pathAdvice(); sessionStorage.setItem('cot:greet','1'); return say(a.t,12000,{force:true,actions:a.a}); }
      if(/^u[1-6]$/.test(r)){ const u=U(r); if(seen.has(r)) return; seen.add(r);
        say(T({ar:`الدرس ده عن: ${T(u.goal)} ابدأ بالمحاكاة، وخمّن قبل ما تدوس 🤔`,en:`This lesson: ${T(u.goal)} Start with the simulation and predict before you click 🤔`}),9000,{force:true,actions:[{label:T({ar:'وديني للمحاكاة',en:'Go to the simulation'}),fn:()=>document.querySelector('.sim')?.scrollIntoView({behavior:'smooth',block:'start'}),primary:1}]});
        const q=document.querySelector('#uq'); if(q&&'IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)&&CUR_ROUTE===r){ io.disconnect(); say(T({ar:'يلا نختبر نفسنا 📝 لو احتجت، دوس 💡 تلميح جنب السؤال',en:'Time to check yourself 📝 Need help? Press 💡 Hint'}),5000,{gap:6000}); } },{threshold:.4}); io.observe(q); cleanups.push(()=>io.disconnect()); }
        return; }
      if(r==='report' && S.pre){
        if(S.post){ const d=S.post.score-S.pre.score, m=11-S.post.weak.length, w=S.post.weak;
          let t=d>0?T({ar:`اتحسّنت ${d}+% 🚀 بقيت متمكن من ${m} مفاهيم من 11!`,en:`You improved by +${d}% 🚀 You now master ${m} of 11 concepts!`}):T({ar:`نتيجتك ${S.post.score}%، ومتمكن من ${m} مفاهيم من 11 💪`,en:`You scored ${S.post.score}% and master ${m} of 11 concepts 💪`});
          if(w.length){ t+=T({ar:` لسه محتاج تراجع "${nm(w[0])}".`,en:` You still need to review "${nm(w[0])}".`}); return say(t,15000,{force:true,actions:[{label:T({ar:'▶ راجع الدرس',en:'▶ Review it'}),fn:go2(CONCEPTS[w[0]].u),primary:1}]}); }
          return say(t+T({ar:' برافو عليك 🎉',en:' Well done 🎉'}),9000,{force:true}); }
        return say(T({ar:'لسه ماعملتش الاختبار البعدي، تحب تعمله وتشوف اتحسّنت قد إيه؟',en:'You haven’t taken the post-test yet — want to see how much you’ve improved?'}),12000,{force:true,actions:[{label:T({ar:'▶ ابدأه',en:'▶ Start it'}),fn:go2('posttest'),primary:1}]}); }
    },900); }
  function wrong(){ say(T({ar:'ولا يهمك 😊 دوس 💡 تلميح وأنا معاك',en:'No worries 😊 Press 💡 Hint, I’m with you'}),4000,{gap:6000}); }
  function fixed(c){ const left=openWeak().length; say(T({ar:`برافو 🎉 صلّحت مفهوم "${nm(c)}"${left?`، فاضلك ${left}`:'، وكده خلصت كل نقط ضعفك!'}`,en:`Bravo 🎉 You fixed "${nm(c)}"${left?` — ${left} left`:' — all weak points fixed!'}`}),6000,{force:true}); }
  function unitDoneMsg(id){ const k=S.path||S.rec; let a;
    if(k==='sup'){ a=pathAdvice(); return say(T({ar:'خلصت الدرس 🎉 ',en:'Lesson complete 🎉 '})+a.t,15000,{force:true,actions:a.a}); }
    const idx=UNITS.findIndex(u=>u.id===id), nx=UNITS.slice(idx+1).find(u=>!unitDone(u))||nextUnit();
    if(!nx) return say(T({ar:'خلصت كل الدروس 🎉 يلا على الاختبار البعدي!',en:'All lessons done 🎉 On to the post-test!'}),15000,{force:true,actions:[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]});
    say(T({ar:`خلصت الدرس 🎉 الدرس الجاي: "${T(nx.t)}"`,en:`Lesson complete 🎉 Next: "${T(nx.t)}"`}),15000,{force:true,actions:[{label:T({ar:'▶ يلا نبدأه',en:'▶ Start it'}),fn:go2(nx.id),primary:1}]}); }
  function chal(){ const n=Object.values(S.chal||{}).filter(Boolean).length, N=CHALLENGES.length; say(n>=N?T({ar:'حلّيت كل التحديات 🔥 يلا على الاختبار البعدي!',en:'All challenges solved 🔥 On to the post-test!'}):T({ar:`برافو 🔥 حلّيت ${n} من ${N}`,en:`Bravo 🔥 ${n} of ${N} solved`}),n>=N?12000:4000,{force:true,actions:n>=N?[{label:T({ar:'▶ الاختبار البعدي',en:'▶ Post-test'}),fn:go2('posttest'),primary:1}]:[]}); }
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
applyDir(); renderChat(); render();
