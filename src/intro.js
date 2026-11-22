/* ================= INTRO: Acquire wakes up in the dark, waves, and turns into the atom logo =================
   Plays every time the platform is opened (about 7 s). "Skip" ends it at once; reduced-motion users skip it. */
const INTRO=(()=>{
  const DUR=7600;
  function robot(){ return ART.robotBig().replace(/\bid="rb/g,'id="in').replace(/\bid="rg/g,'id="ig').replace(/url\(#rg/g,'url(#ig').replace(/\brb-/g,'in-'); }
  function run(onDone){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return onDone&&onDone();
    const d=document.createElement('div'); d.id='intro'; d.className='intro'; d.setAttribute('role','dialog'); d.setAttribute('aria-label',T({ar:'مقدمة المنصة',en:'Platform intro'}));
    d.innerHTML=`<div class="in-flash"></div><div class="in-floor"></div>
      <div class="in-stage"><div class="in-bot">${robot()}</div>
        <div class="in-bub">${T({ar:'أنا Acquire 🤖 مساعدك في رحلة الاتزان!',en:'I’m Acquire 🤖 your guide to equilibrium!'})}</div>
        <div class="in-atom">${ART.atom(64)}</div></div>
      <div class="in-title"><b>${T({ar:'الاتزان الكيميائي',en:'Chemical Equilibrium'})}</b><span>${T({ar:'الصف الثالث الثانوي · كيمياء',en:'Grade 12 · Chemistry'})}</span></div>
      <button class="in-skip" type="button">${T({ar:'تخطي ⏭',en:'Skip ⏭'})}</button>`;
    document.body.appendChild(d); document.body.classList.add('intro-on');
    let ended=false; const end=()=>{ if(ended) return; ended=true; clearTimeout(t); d.classList.add('out'); document.body.classList.remove('intro-on');
      setTimeout(()=>{ d.remove(); onDone&&onDone(); },450); };
    const t=setTimeout(end,DUR);
    d.querySelector('.in-skip').onclick=()=>{ logEv('intro_skip',''); end(); };
    addEventListener('keydown',function k(e){ if(e.key==='Escape'){ removeEventListener('keydown',k); end(); } });
  }
  return {run};
})();
