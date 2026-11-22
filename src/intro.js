/* ================= INTRO: Acquire peeks in from the left edge, says a line, zooms into the screen, then the title =================
   Plays every time the platform is opened (about 6.5 s). "Skip" ends it at once; reduced-motion users skip it. */
const INTRO=(()=>{
  const DUR=6600;
  function head(){ // the big robot's head only (antenna, headphones, face, visor, glowing eyes, smile)
    const s=ART.robotBig(), defs=s.match(/<defs>[\s\S]*?<\/defs>/)[0], h=s.match(/<g class="rb-head">[\s\S]*?<\/g>\s*<\/g>/)[0].replace(/<\/g>\s*<\/g>$/,'</g>');
    return `<svg viewBox="20 0 180 150" class="pk-svg" aria-hidden="true">${defs.replace(/id="rg/g,'id="pk')}
      ${h.replace(/url\(#rg/g,'url(#pk').replace(/\brb-/g,'pk-')}</svg>`; }
  const hand=`<svg viewBox="0 0 60 44" class="pk-hand" aria-hidden="true"><defs><linearGradient id="pkH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a95f5"/><stop offset="1" stop-color="#1d5fc2"/></linearGradient></defs>
      <rect x="0" y="8" width="40" height="28" rx="14" fill="url(#pkH)"/><rect x="30" y="2" width="12" height="16" rx="6" fill="url(#pkH)"/><rect x="34" y="15" width="14" height="12" rx="6" fill="url(#pkH)"/><rect x="30" y="26" width="12" height="15" rx="6" fill="url(#pkH)"/></svg>`;
  function run(onDone){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return onDone&&onDone();
    const d=document.createElement('div'); d.id='intro'; d.className='intro'; d.setAttribute('role','dialog'); d.setAttribute('aria-label',T({ar:'مقدمة المنصة',en:'Platform intro'}));
    d.innerHTML=`<div class="pk"><div class="pk-tilt">${head()}</div></div>
      <div class="pk-h1">${hand}</div><div class="pk-h2">${hand}</div>
      <div class="pk-bub">${T({ar:'الكيمياء في قفص الاتهام! 🔍',en:'Chemistry on trial! 🔍'})}</div>
      <div class="in-flash"></div>
      <div class="in-title">${ART.atom(96)}<b>${T({ar:'الاتزان الكيميائي',en:'Chemical Equilibrium'})}</b><span>${T({ar:'الصف الثالث الثانوي · كيمياء',en:'Grade 12 · Chemistry'})}</span></div>
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
