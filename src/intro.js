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
      <div class="in-flash"></div>
      <div class="in-title">${ART.atom(96)}<b>${T({ar:'الاتزان الكيميائي',en:'Chemical Equilibrium'})}</b><span>${T({ar:'الصف الثالث الثانوي · كيمياء',en:'Grade 12 · Chemistry'})}</span></div>
      <div class="in-start"><button class="in-go" type="button">▶ ${T({ar:'ابدأ الرحلة',en:'Start the journey'})}</button><button class="in-snd" type="button"></button></div>
      <button class="in-skip" type="button">${T({ar:'تخطي ⏭',en:'Skip ⏭'})}</button>`;
    document.body.appendChild(d); document.body.classList.add('intro-on');
    let ended=false, t=null; const end=()=>{ if(ended) return; ended=true; clearTimeout(t); SFX.stop(); d.classList.add('out'); document.body.classList.remove('intro-on');
      setTimeout(()=>{ d.remove(); onDone&&onDone(); },450); };
    const go=d.querySelector('.in-go'); go.onpointerdown=()=>SFX.warm();
    const snd=d.querySelector('.in-snd'), paint=()=>{ snd.textContent=VOICE.on()?'🔊 '+T({ar:'الصوت شغّال — علّي صوت الموبايل',en:'Sound is on — turn your volume up'}):'🔇 '+T({ar:'الصوت مقفول — دوس هنا تشغّله',en:'Sound is off — tap to turn it on'}); };
    paint(); snd.onclick=()=>{ if(!VOICE.on()){ store.set('cot:mute',false); VOICE.set(true); COACH.badge&&COACH.badge(); } paint(); };
    go.onclick=async()=>{ if(d.classList.contains('go')||go.dataset.busy) return; go.dataset.busy=1; logEv('intro_start',''); VOICE.prime(); SFX.warm();
      const lead=await SFX.play();   /* seconds until the sounds are actually heard */
      setTimeout(()=>requestAnimationFrame(()=>{ d.classList.add('go'); t=setTimeout(end,DUR); }), Math.round(lead*1000)); };
    d.querySelector('.in-skip').onclick=()=>{ logEv('intro_skip',''); end(); };
    addEventListener('keydown',function k(e){ if(e.key==='Escape'){ removeEventListener('keydown',k); end(); } });
  }
  return {run};
})();

/* intro sound effects, made in the browser (no audio files): power-on zap, whoosh on the zoom, shimmer on the title */
const SFX=(()=>{ let ac=null, nodes=[];
  function tone(type,f0,f1,t0,dur,vol){ const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t0); if(f1) o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
    g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur); o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0+dur+0.05); nodes.push(o); }
  function noise(t0,dur,vol,fA,fB){ const n=ac.createBuffer(1,ac.sampleRate*dur,ac.sampleRate), d=n.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s=ac.createBufferSource(); s.buffer=n; const bp=ac.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=1.2; bp.frequency.setValueAtTime(fA,t0); bp.frequency.exponentialRampToValueAtTime(fB,t0+dur*0.85);
    const g=ac.createGain(); g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(vol,t0+dur*0.7); g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    s.connect(bp).connect(g).connect(ac.destination); s.start(t0); s.stop(t0+dur); nodes.push(s); }
  function warm(){ try{ if(!VOICE.on()) return; ac=ac||new (window.AudioContext||window.webkitAudioContext)(); if(ac.state!=='running') ac.resume();
      const b=ac.createBufferSource(); b.buffer=ac.createBuffer(1,1,22050); b.connect(ac.destination); b.start(0); /* iPhone: a sound started inside the tap unlocks the context */
    }catch(e){} }
  /* schedules every sound on the audio clock and returns how long until it is heard, so the animation starts at the same instant */
  async function play(){ try{ if(!VOICE.on()) return 0; warm(); if(ac.state!=='running') await Promise.race([ac.resume(),new Promise(r=>setTimeout(r,400))]);
      const lead=0.12, lat=Math.min(0.3,(ac.outputLatency||0)+(ac.baseLatency||0)), T0=ac.currentTime+lead;
      // cue times match the CSS timeline of the intro (seconds after it starts)
      tone('sine',320,140,T0+0.5,0.18,0.25);                                   // 0.50 pop: the head appears at the edge
      [1.02,1.14,1.26].forEach((x,i)=>tone('square',900+i*260,1400+i*200,T0+x,0.08,0.05)); // eyes flicker on (each light-up step)
      tone('sine',220,220,T0+1.3,1.6,0.035);                                   // 1.30 soft hum while it looks at you
      tone('triangle',660,990,T0+2.52,0.1,0.06);                               // 2.55 the blink closes
      noise(T0+3.0,0.95,0.5,250,3200);                                         // 3.00–3.95 whoosh with the zoom
      [1046.5,1318.5,1568,2093].forEach((f,i)=>tone('sine',f,0,T0+3.9+i*0.06,1.6,0.12)); // 3.95 flash, then the title
      return lead+lat; }catch(e){ return 0; } }
  function stop(){ nodes.forEach(n=>{ try{n.stop()}catch(e){} }); nodes=[]; }
  return {play,stop,warm};
})();
