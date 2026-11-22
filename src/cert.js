/* ================= CERTIFICATE (design A: ivory parchment, gold frame, red wax seal) =================
   Unlocks when the student has finished the platform: their path is complete AND the post-test is passed
   (CONFIG.certMinPost). Arabic or English version; printed / saved as PDF with the browser. */
const CERT=(()=>{
  const W=1600, H=1131, GOLD='#a8822a';
  const ros=(cx,cy,R,r,d,n,stroke,sw,op)=>{ const k=R-r, g=(a,b)=>b?g(b,a%b):a, T=2*Math.PI*r/g(R,r); let p='';
    for(let i=0;i<=n;i++){ const t=T*i/n; p+=`${(cx+k*Math.cos(t)+d*Math.cos(k/r*t)).toFixed(1)},${(cy+k*Math.sin(t)-d*Math.sin(k/r*t)).toFixed(1)} `; }
    return `<polyline points="${p}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`; };
  const atom=(cx,cy,r,c,sw)=>[0,60,120].map(a=>`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r*.38).toFixed(1)}" fill="none" stroke="${c}" stroke-width="${sw}" transform="rotate(${a} ${cx} ${cy})"/>`).join('')+`<circle cx="${cx}" cy="${cy}" r="${(r*.16).toFixed(1)}" fill="${c}"/>`;
  function wreath(cx,cy,rad,c){ let o=''; for(const side of [-1,1]) for(let i=0;i<10;i++){ const ang=side<0?Math.PI/180*(205+11*i):Math.PI/180*(-25-11*i);
      const x=cx+rad*Math.cos(ang), y=cy-rad*Math.sin(ang), td=-ang*180/Math.PI+(side<0?90:-90);
      for(const off of [-22,22]) o+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="14" ry="5.5" fill="${c}" transform="rotate(${(td+off).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(${off>0?9:-9} 0)"/>`; } return o; }
  function seal(cx,cy,R){ let s=''; for(const [dx,rot] of [[-34,12],[34,-12]]) s+=`<path d="M${cx+dx-22},${cy+30} L${cx+dx+22},${cy+30} L${cx+dx+22+rot},${cy+R+95} L${cx+dx+rot},${cy+R+70} L${cx+dx-22+rot},${cy+R+95} Z" fill="#5c0b0b"/>`;
    let pts=''; for(let i=0;i<72;i++){ const a=2*Math.PI*i/72, rr=i%2?R*.93:R; pts+=`${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)} `; }
    return s+`<defs><radialGradient id="cSeal" cx="40%" cy="35%"><stop offset="0" stop-color="#e07a6a"/><stop offset=".45" stop-color="#9b1c1c"/><stop offset="1" stop-color="#5c0b0b"/></radialGradient></defs>
      <polygon points="${pts}" fill="url(#cSeal)"/><circle cx="${cx}" cy="${cy}" r="${R*.82}" fill="none" stroke="#e07a6a" stroke-width="2"/>${ros(cx,cy,60,21,32,900,'#e07a6a',.7,.55)}
      <circle cx="${cx}" cy="${cy}" r="${R*.5}" fill="#9b1c1c" stroke="#e07a6a" stroke-width="1.5"/>${atom(cx,cy,R*.36,'#e07a6a',2.2)}`; }
  function dots(inset){ let s=''; for(let x=inset+22;x<=W-inset-22;x+=22) for(const y of [inset,H-inset]) s+=`<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${GOLD}" stroke-width="1"/>`;
    for(let y=inset+22;y<=H-inset-22;y+=22) for(const x of [inset,W-inset]) s+=`<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="${GOLD}" stroke-width="1"/>`; return s; }
  let BG=null, UID=0;
  const bg=en=>`<svg class="cbg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><radialGradient id="cPa" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#fdf8ea"/><stop offset=".7" stop-color="#f4ead0"/><stop offset="1" stop-color="#e6d3a6"/></radialGradient>
    <linearGradient id="cGf" x1="0" x2="1"><stop offset="0" stop-color="#8a6a1c"/><stop offset=".5" stop-color="#e8c76a"/><stop offset="1" stop-color="#8a6a1c"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#cPa)"/>
    <rect x="34" y="34" width="${W-68}" height="${H-68}" fill="none" stroke="url(#cGf)" stroke-width="10"/>
    <rect x="54" y="54" width="${W-108}" height="${H-108}" fill="none" stroke="${GOLD}" stroke-width="2"/>${BG.dots}
    <rect x="90" y="90" width="${W-180}" height="${H-180}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>${BG.corners}${BG.big}
    ${wreath(W/2,175,78,'#b8902f')}<circle cx="${W/2}" cy="175" r="56" fill="#13254a" stroke="url(#cGf)" stroke-width="5"/>${atom(W/2,175,40,'#e8c76a',2.5)}
    ${seal(en?W-330:330,880,92)}</svg>`;
  function build(){ if(BG) return; BG={dots:dots(72), corners:[[150,150],[W-150,150],[150,H-150],[W-150,H-150]].map(([x,y])=>ros(x,y,48,18,30,800,GOLD,.8,.85)).join(''), big:ros(W/2,H/2+40,300,105,160,2500,GOLD,.6,.13)}; }

  const AR_D=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'], arNum=n=>String(n).replace(/\d/g,d=>AR_D[d]);
  const MONTHS_AR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function grade(p,en){ return p>=90?(en?'Excellent':'ممتاز'):p>=80?(en?'Very Good':'جيد جدًا'):p>=65?(en?'Good':'جيد'):(en?'Pass':'مقبول'); }
  function number(){ let h=0; for(const ch of (USER?.email||'')) h=(h*31+ch.charCodeAt(0))>>>0; return `EQ-${new Date(S.cert?.at||Date.now()).getFullYear()}-${String(h%10000).padStart(4,'0')}`; }

  function status(){
    const k=S.path, w=(S.pre?.weak||[]).filter(c=>!S.fixed?.[c]);
    const pathDone = k==='rem' ? UNITS.every(unitDone) : k==='sup' ? !w.length : k==='enr' ? Object.values(S.chal||{}).filter(Boolean).length>=CHALLENGES.length : false;
    const units=UNITS.filter(unitDone).length, ch=Object.values(S.chal||{}).filter(Boolean).length;
    const steps=[
      {ok:!!S.pre, t:{ar:'الاختبار التشخيصي',en:'Diagnostic test'}},
      {ok:pathDone, t: k==='sup'?{ar:`تصحيح نقط الضعف (فاضل ${w.length})`,en:`Fix weak points (${w.length} left)`}: k==='enr'?{ar:`حل تحديات المسار الإثرائي (${ch}/${CHALLENGES.length})`,en:`Enrichment challenges (${ch}/${CHALLENGES.length})`}: k==='rem'?{ar:`دروس المسار العلاجي (${units}/6)`,en:`Remedial lessons (${units}/6)`}:{ar:'اختيار مسار وإنهاؤه',en:'Choose and finish a path'}},
      {ok:!!S.post && S.post.score>=CONFIG.certMinPost, t:{ar:`النجاح في الاختبار البعدي (${CONFIG.certMinPost}% أو أكتر)`,en:`Pass the post-test (${CONFIG.certMinPost}% or more)`}}];
    return {steps, ok:steps.every(s=>s.ok)};
  }

  function html(lang,name){ build(); const en=lang==='en', p=S.post?.score||0, d=new Date(S.cert?.at||Date.now());
    const date=en?`${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`:`${arNum(d.getDate())} ${MONTHS_AR[d.getMonth()]} ${arNum(d.getFullYear())}`;
    const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const body=en?`
      <div class="c-l ci" style="top:272px;font-size:22px;letter-spacing:8px;color:${GOLD}">CHEMICAL EQUILIBRIUM PLATFORM</div>
      <div class="c-l vi" style="top:300px;font-size:104px;color:#13254a;line-height:1.3">Certificate of Completion</div>
      <div class="c-l am" style="top:445px;font-size:30px;color:#5a4a2a">This is to certify that</div>
      <div class="c-l vi c-name" style="top:488px;font-size:86px;color:#7a1414;line-height:1.35">${esc(name)}</div>
      <div class="c-line" style="top:612px"></div>
      <div class="c-l am" style="top:632px;font-size:28px;color:#3b3220;line-height:1.75;padding:0 250px">has successfully completed the <b>Chemical Equilibrium &amp; Le Chatelier’s Principle</b> unit for the third year of secondary school and passed all of its assessments with a grade of <b style="color:#7a1414">${grade(p,1)} (${p}%)</b>, mastering all of its scientific concepts.</div>
      <div class="c-sig am" style="left:200px"><div style="font-size:28px;color:#13254a">${date}</div><div class="c-sl">Date of issue</div></div>
      <div class="c-sig am" style="right:560px"><div class="c-sign"><img src="img/sign.png" alt=""></div><div class="c-sl">Teacher’s signature</div></div>`
    :`
      <div class="c-l ci" style="top:272px;font-size:22px;letter-spacing:8px;color:${GOLD}">CERTIFICATE OF COMPLETION</div>
      <div class="c-l ru" style="top:290px;font-size:96px;color:#13254a;line-height:1.3">شهادة إتمام</div>
      <div class="c-l am" style="top:438px;font-size:30px;color:#5a4a2a">تشهد منصة <b>الاتزان الكيميائي</b> بأن الطالب / الطالبة</div>
      <div class="c-l ru c-name" style="top:490px;font-size:78px;color:#7a1414;line-height:1.35">${esc(name)}</div>
      <div class="c-line" style="top:610px"></div>
      <div class="c-l am" style="top:632px;font-size:29px;color:#3b3220;line-height:1.75;padding:0 260px">قد أتمّ بنجاح وحدة <b>الاتزان الكيميائي ومبدأ لوشاتيليه</b> للصف الثالث الثانوي،<br>واجتاز جميع اختباراتها بتقدير <b style="color:#7a1414">${grade(p)}</b> بنسبة <b style="color:#7a1414">${arNum(p)}٪</b>، متقنًا جميع مفاهيمها العلمية.</div>
      <div class="c-sig am" style="left:560px"><div class="c-sign"><img src="img/sign.png" alt=""></div><div class="c-sl">توقيع المعلمة</div></div>
      <div class="c-sig am" style="right:200px"><div style="font-size:30px;color:#13254a">${date}</div><div class="c-sl">تاريخ الإصدار</div></div>`;
    const u='c'+(++UID), svg=bg(en).replace(/\b(cPa|cGf|cSeal)\b/g,'$1'+u);
    return `<div class="cert" dir="${en?'ltr':'rtl'}" lang="${lang}">${svg}${body}<div class="c-l ci" style="bottom:104px;font-size:16px;letter-spacing:3px;color:${GOLD}">CERTIFICATE NO. ${number()}</div></div>`; }

  function fit(){ document.querySelectorAll('.cert-fit').forEach(f=>{ const c=f.querySelector('.cert'); if(!c) return; const k=f.clientWidth/W; c.style.transform=`scale(${k})`; f.style.height=(H*k)+'px'; }); }
  addEventListener('resize',fit);

  function card(){ const st=status(), lang=S.cert?.lang||(LANG==='en'?'en':'ar');
    AFTER.push(()=>{ fit(); wire(); });
    return `<div class="card cert-card" id="certCard"><h2 style="margin-top:0">🎓 ${T({ar:'شهادة إتمام المنصة',en:'Platform completion certificate'})}</h2>
      <div class="cert-prev ${st.ok?'':'locked'}"><div class="cert-fit">${html(lang, S.cert?.name||T({ar:'اسمك هنا',en:'Your name here'}))}</div>${st.ok?'':`<div class="cert-lock"><span>🔒</span><b>${T({ar:'الشهادة بتتفتح لما تخلّص المنصة',en:'Unlocks when you finish the platform'})}</b></div>`}</div>
      <ul class="cert-steps">${st.steps.map(s=>`<li class="${s.ok?'ok':''}">${s.ok?'✅':'⬜'} ${T(s.t)}</li>`).join('')}</ul>
      <div class="cert-lang" role="radiogroup" aria-label="language"><span>${T({ar:'لغة الشهادة:',en:'Certificate language:'})}</span>
        <button type="button" data-cl="ar" class="${lang==='ar'?'on':''}" role="radio" aria-checked="${lang==='ar'}">العربية</button><button type="button" data-cl="en" class="${lang==='en'?'on':''}" role="radio" aria-checked="${lang==='en'}">English</button></div>
      ${st.ok?`<label class="cert-name">${T({ar:'اكتب اسمك زي ما عايزه يظهر في الشهادة',en:'Type your name as it should appear'})}<input id="certName" maxlength="40" value="${(S.cert?.name||'').replace(/"/g,'&quot;')}" placeholder="${T({ar:'الاسم الثلاثي',en:'Full name'})}"></label>`:''}
      <button class="btn ${st.ok?'blue':''} cert-go" id="certGo" ${st.ok?'':'disabled aria-disabled="true"'}>${st.ok?'🎓 '+T({ar:'اطلع شهادتي',en:'Get my certificate'}):'🔒 '+T({ar:'اطلع شهادتي',en:'Get my certificate'})}</button></div>`; }

  function wire(){ const box=document.getElementById('certCard'); if(!box) return;
    box.querySelectorAll('[data-cl]').forEach(b=>b.onclick=()=>{ S.cert=S.cert||{}; S.cert.lang=b.dataset.cl; save();
      box.querySelectorAll('[data-cl]').forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-checked',x===b); });
      box.querySelector('.cert-fit').innerHTML=html(b.dataset.cl, box.querySelector('#certName')?.value.trim()||S.cert?.name||T({ar:'اسمك هنا',en:'Your name here'})); fit(); });
    const nm=box.querySelector('#certName'); if(nm) nm.oninput=()=>{ const n=box.querySelector('.c-name'); if(n) n.textContent=nm.value.trim()||T({ar:'اسمك هنا',en:'Your name here'}); };
    box.querySelector('#certGo').onclick=()=>{ if(!status().ok) return;
      const name=(nm?.value||'').trim(); if(name.length<3){ toast(T({ar:'اكتب اسمك الأول ✍️',en:'Type your name first ✍️'})); nm?.focus(); return; }
      S.cert=S.cert||{}; const first=!S.cert.at; S.cert.name=name; S.cert.at=S.cert.at||new Date().toISOString(); S.cert.lang=S.cert.lang||(LANG==='en'?'en':'ar'); save();
      logEv('certificate',JSON.stringify({name,lang:S.cert.lang,no:number(),post:S.post?.score,first}));
      open(S.cert.lang,name); }; }

  function open(lang,name){ let m=document.getElementById('certModal'); if(m) m.remove();
    m=document.createElement('div'); m.id='certModal'; m.className='cert-modal'; m.setAttribute('role','dialog');
    m.innerHTML=`<div class="cert-mbar"><b>🎓 ${T({ar:'مبروك! دي شهادتك',en:'Congratulations! Here is your certificate'})}</b><span><button class="btn blue sm" id="certPrint">⬇️ ${T({ar:'تحميل PDF / طباعة',en:'Download PDF / Print'})}</button><button class="btn ghost sm" id="certClose">✕</button></span></div>
      <p class="cert-tip">${T({ar:'عشان تحفظها PDF: دوس "تحميل" واختار "حفظ كـ PDF" (Save as PDF).',en:'To keep it as a PDF, press Download and choose “Save as PDF”.'})}</p>
      <div class="cert-fit" id="certPrintArea">${html(lang,name)}</div>`;
    document.body.appendChild(m); document.body.classList.add('cert-open'); fit();
    m.querySelector('#certClose').onclick=()=>{ m.remove(); document.body.classList.remove('cert-open'); };
    m.querySelector('#certPrint').onclick=()=>{ logEv('certificate_print',lang); window.print(); };
    COACH.say(T({ar:'مبروووك يا بطل 🎉🎓 دي شهادتك، تستاهلها!',en:'Congratulations, champ 🎉🎓 You earned it!'}),7000,{force:true}); }

  return {card,status,open};
})();
