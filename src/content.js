/* ============ CONTENT (structured, editable by teacher) ============
   Equations go inside $...$ :  digits after letters = subscripts,  ^{..} superscript,  _{..} subscript,
   <=> = ⇌ ,  «numerator|denominator» = fraction.
   review:true  → item awaiting teacher confirmation (tag shown while CONFIG.showReviewTags = true)
*/
const CONCEPTS = {
  c_dyn:  {u:'u1', ar:'الاتزان الديناميكي', en:'Dynamic equilibrium'},
  c_conc: {u:'u1', ar:'التركيزات عند الاتزان', en:'Concentrations at equilibrium'},
  c_lec:  {u:'u1', ar:'مبدأ لوشاتيليه (التركيز)', en:"Le Chatelier – concentration"},
  c_mass: {u:'u2', ar:'قانون فعل الكتلة', en:'Law of mass action'},
  c_kc:   {u:'u3', ar:'كتابة تعبير ثابت الاتزان Kc', en:'Writing the Kc expression'},
  c_phase:{u:'u3', ar:'الحالة الفيزيائية في تعبير Kc', en:'Phases in the Kc expression'},
  c_temp: {u:'u4', ar:'تأثير درجة الحرارة على الاتزان', en:'Temperature and equilibrium'},
  c_ktemp:{u:'u4', ar:'ثابت الاتزان ودرجة الحرارة', en:'K and temperature'},
  c_pres: {u:'u5', ar:'تأثير الضغط على الاتزان', en:'Pressure and equilibrium'},
  c_kp:   {u:'u5', ar:'الضغط الجزئي و Kp', en:'Partial pressure and Kp'},
  c_cat:  {u:'u6', ar:'العامل الحفاز', en:'The catalyst'}
};

/* Diagnostic pre/post test — drafted questions, pending teacher approval */
const PRETEST = [
 {id:'P01', c:'c_dyn', q:{ar:'عند الوصول لحالة الاتزان الكيميائي:', en:'When chemical equilibrium is reached:'},
  o:[{ar:'يتوقف التفاعل تمامًا',en:'The reaction stops completely'},{ar:'يستمر التفاعلان الطردي والعكسي بنفس المعدل',en:'Forward and backward reactions continue at the same rate'},{ar:'يستمر التفاعل الطردي فقط',en:'Only the forward reaction continues'},{ar:'يصبح معدل التفاعل الطردي أكبر من العكسي',en:'The forward rate becomes greater than the backward rate'}], a:1,
  x:{ar:'الاتزان ديناميكي: التفاعلان مستمران ومعدلهما متساوٍ.',en:'Equilibrium is dynamic: both reactions continue at equal rates.'}},
 {id:'P02', c:'c_conc', q:{ar:'عند الاتزان، تركيزات المتفاعلات والنواتج:',en:'At equilibrium, the concentrations of reactants and products are:'},
  o:[{ar:'متساوية دائمًا',en:'Always equal'},{ar:'ثابتة، لكنها ليست بالضرورة متساوية',en:'Constant, but not necessarily equal'},{ar:'تتغير باستمرار',en:'Continuously changing'},{ar:'تساوي صفرًا',en:'Equal to zero'}], a:1,
  x:{ar:'تساوي المعدلات لا يعني تساوي التركيزات.',en:'Equal rates do not mean equal concentrations.'}},
 {id:'P03', c:'c_lec', q:{ar:'في التفاعل $aA+bB<=>cC+dD$ عند زيادة تركيز المادة A يُزاح الاتزان في الاتجاه:',en:'For $aA+bB<=>cC+dD$, increasing the concentration of A shifts equilibrium:'},
  o:[{ar:'الطردي (نحو النواتج)',en:'Forward (toward products)'},{ar:'العكسي (نحو المتفاعلات)',en:'Backward (toward reactants)'},{ar:'لا يتأثر الاتزان',en:'No effect'},{ar:'يتوقف التفاعل',en:'The reaction stops'}], a:0,
  x:{ar:'النظام يستهلك جزءًا من المادة المضافة فيتجه للنواتج.',en:'The system consumes some of the added substance, shifting toward products.'}},
 {id:'P04', c:'c_lec', q:{ar:'عند سحب (إنقاص تركيز) أحد النواتج من نظام متزن، يُزاح الاتزان في الاتجاه:',en:'Removing (decreasing) a product from a system at equilibrium shifts it:'},
  o:[{ar:'العكسي',en:'Backward'},{ar:'الطردي',en:'Forward'},{ar:'لا يتأثر',en:'No effect'},{ar:'يعود لنفس الحالة الأصلية تمامًا',en:'Returns exactly to the original state'}], a:1,
  x:{ar:'النظام يعوّض جزءًا مما سُحب، فيتجه طرديًا.',en:'The system replaces some of what was removed: forward shift.'}},
 {id:'P05', c:'c_mass', q:{ar:'تعبير معدل التفاعل الطردي للتفاعل $FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$ حسب المعالجة المدرسية:',en:'The school-level forward rate expression for $FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$ is:'},
  o:[{ar:'$r_{f}=k_{f}[FeCl3][NH4SCN]^{3}$',en:'$r_{f}=k_{f}[FeCl3][NH4SCN]^{3}$'},{ar:'$r_{f}=k_{f}[FeCl3][NH4SCN]$',en:'$r_{f}=k_{f}[FeCl3][NH4SCN]$'},{ar:'$r_{f}=k_{f}[Fe(SCN)3][NH4Cl]^{3}$',en:'$r_{f}=k_{f}[Fe(SCN)3][NH4Cl]^{3}$'},{ar:'$r_{f}=k_{f}([FeCl3]+3[NH4SCN])$',en:'$r_{f}=k_{f}([FeCl3]+3[NH4SCN])$'}], a:0,
  x:{ar:'المعامل يصبح أسًا للتركيز، والطردي يعتمد على تركيز المتفاعلات.',en:'Coefficients become powers; the forward rate depends on reactant concentrations.'}},
 {id:'P06', c:'c_kc', q:{ar:'تعبير $K_{c}$ للتفاعل $2H2O(g)<=>2H2(g)+O2(g)$ هو:',en:'The $K_{c}$ expression for $2H2O(g)<=>2H2(g)+O2(g)$ is:'},
  o:[{ar:'$K_{c}=«[H2]^{2}[O2]|[H2O]^{2}»$',en:'$K_{c}=«[H2]^{2}[O2]|[H2O]^{2}»$'},{ar:'$K_{c}=«[H2O]^{2}|[H2]^{2}[O2]»$',en:'$K_{c}=«[H2O]^{2}|[H2]^{2}[O2]»$'},{ar:'$K_{c}=«[H2][O2]|[H2O]»$',en:'$K_{c}=«[H2][O2]|[H2O]»$'},{ar:'$K_{c}=«2[H2][O2]|2[H2O]»$',en:'$K_{c}=«2[H2][O2]|2[H2O]»$'}], a:0,
  x:{ar:'النواتج في البسط، المتفاعلات في المقام، والمعاملات أُسس.',en:'Products on top, reactants below, coefficients as powers.'}},
 {id:'P07', c:'c_phase', q:{ar:'تعبير $K_{c}$ للتفاعل $3I2(s)+3H2O(l)<=>5I^{-}(aq)+IO3^{-}(aq)+6H^{+}(aq)$ هو:',en:'The $K_{c}$ expression for $3I2(s)+3H2O(l)<=>5I^{-}(aq)+IO3^{-}(aq)+6H^{+}(aq)$ is:'},
  o:[{ar:'$K_{c}=«[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}|[I2]^{3}[H2O]^{3}»$',en:'$K_{c}=«[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}|[I2]^{3}[H2O]^{3}»$'},{ar:'$K_{c}=[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}$',en:'$K_{c}=[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}$'},{ar:'$K_{c}=«[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}|[H2O]^{3}»$',en:'$K_{c}=«[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}|[H2O]^{3}»$'},{ar:'$K_{c}=[I^{-}][IO3^{-}][H^{+}]$',en:'$K_{c}=[I^{-}][IO3^{-}][H^{+}]$'}], a:1,
  x:{ar:'الصلب النقي (I₂) والسائل النقي (H₂O) لا يُكتبان في التعبير.',en:'Pure solid I₂ and pure liquid H₂O are omitted.'}},
 {id:'P08', c:'c_temp', q:{ar:'في التفاعل الطارد للحرارة $N2(g)+3H2(g)<=>2NH3(g)+Heat$ عند رفع درجة الحرارة:',en:'For the exothermic $N2(g)+3H2(g)<=>2NH3(g)+Heat$, raising the temperature:'},
  o:[{ar:'يُزاح الاتزان طرديًا ويزداد NH₃',en:'Shifts forward, more NH₃'},{ar:'يُزاح الاتزان عكسيًا ويقل NH₃',en:'Shifts backward, less NH₃'},{ar:'لا يتأثر الاتزان',en:'No effect'},{ar:'يتوقف التفاعل',en:'The reaction stops'}], a:1,
  x:{ar:'التسخين يُفضّل الاتجاه الماص للحرارة، وهو هنا العكسي.',en:'Heating favours the endothermic direction — here the backward one.'}},
 {id:'P09', c:'c_ktemp', q:{ar:'تغيير تركيز إحدى المواد عند ثبوت درجة الحرارة يجعل قيمة $K_{c}$:',en:'Changing a concentration at constant temperature makes the value of $K_{c}$:'},
  o:[{ar:'تزداد',en:'Increase'},{ar:'تقل',en:'Decrease'},{ar:'لا تتغير',en:'Stay the same'},{ar:'تساوي صفرًا',en:'Become zero'}], a:2,
  x:{ar:'$K_{c}$ يتغير بتغير درجة الحرارة فقط.',en:'$K_{c}$ changes only when temperature changes.'}},
 {id:'P10', c:'c_pres', q:{ar:'في التفاعل $N2(g)+3H2(g)<=>2NH3(g)$ زيادة الضغط (بتقليل الحجم) تزيح الاتزان:',en:'For $N2(g)+3H2(g)<=>2NH3(g)$, increasing pressure (by reducing volume) shifts equilibrium:'},
  o:[{ar:'طرديًا (نحو عدد مولات غازية أقل)',en:'Forward (toward fewer gas moles)'},{ar:'عكسيًا (نحو عدد مولات أكبر)',en:'Backward (toward more gas moles)'},{ar:'لا يتأثر',en:'No shift'},{ar:'يتوقف التفاعل',en:'Reaction stops'}], a:0,
  x:{ar:'4 مولات غازية يسارًا و2 يمينًا؛ زيادة الضغط تفضل الجانب الأقل.',en:'4 gas moles on the left, 2 on the right; higher pressure favours fewer.'}},
 {id:'P11', c:'c_pres', q:{ar:'في التفاعل $CO(g)+NO2(g)<=>CO2(g)+NO(g)$ عند زيادة الضغط بتقليل الحجم:',en:'For $CO(g)+NO2(g)<=>CO2(g)+NO(g)$, compressing the container:'},
  o:[{ar:'يُزاح الاتزان طرديًا',en:'Shifts forward'},{ar:'يُزاح الاتزان عكسيًا',en:'Shifts backward'},{ar:'لا يتغير موضع الاتزان، لكن تركيزات الغازات تزيد',en:'Position does not shift, but gas concentrations increase'},{ar:'لا يحدث أي تغيير على الإطلاق',en:'Nothing changes at all'}], a:2,
  x:{ar:'عدد المولات الغازية متساوٍ (2 = 2)، فلا إزاحة، لكن الانضغاط يزيد التركيزات.',en:'Equal gas moles (2 = 2): no shift, yet compression raises concentrations.'}},
 {id:'P12', c:'c_kp', q:{ar:'للتفاعل $N2(g)+2O2(g)<=>2NO2(g)$ إذا كانت الضغوط الجزئية: $P_{N2}=0.2 atm$ و $P_{O2}=1 atm$ و $P_{NO2}=2 atm$ فإن $K_{p}$ يساوي:',en:'For $N2(g)+2O2(g)<=>2NO2(g)$ with $P_{N2}=0.2$, $P_{O2}=1$, $P_{NO2}=2$ atm, $K_{p}$ equals:'},
  o:[{ar:'20',en:'20'},{ar:'10',en:'10'},{ar:'0.05',en:'0.05'},{ar:'40',en:'40'}], a:0,
  x:{ar:'$K_{p}=«(2)^{2}|(0.2)(1)^{2}»=20$',en:'$K_{p}=«(2)^{2}|(0.2)(1)^{2}»=20$'}},
 {id:'P13', c:'c_cat', q:{ar:'إضافة عامل حفاز لنظام متزن:',en:'Adding a catalyst to a system at equilibrium:'},
  o:[{ar:'يزيد معدل التفاعل الطردي فقط',en:'Speeds up only the forward reaction'},{ar:'يزيد معدل التفاعلين ولا يغير موضع الاتزان',en:'Speeds up both reactions without changing the equilibrium position'},{ar:'يزيح الاتزان نحو النواتج',en:'Shifts equilibrium toward products'},{ar:'يزيد قيمة ثابت الاتزان',en:'Increases the equilibrium constant'}], a:1,
  x:{ar:'الحفاز يقلل طاقة التنشيط للاتجاهين بنفس القدر.',en:'A catalyst lowers activation energy equally for both directions.'}},
 {id:'P14', c:'c_temp', q:{ar:'في النظام $2NO2(g)<=>N2O4(g)+Heat$ (NO₂ بني محمر، N₂O₄ عديم اللون)، عند التسخين:',en:'In $2NO2(g)<=>N2O4(g)+Heat$ (NO₂ reddish-brown, N₂O₄ colourless), on heating:'},
  o:[{ar:'يزداد اللون البني المحمر',en:'The reddish-brown colour deepens'},{ar:'يختفي اللون',en:'The colour disappears'},{ar:'لا يتغير اللون',en:'No colour change'},{ar:'يتحول للون أزرق',en:'It turns blue'}], a:0,
  x:{ar:'التسخين يُفضّل الاتجاه العكسي الماص للحرارة فيتكوّن NO₂ أكثر.',en:'Heating favours the endothermic reverse direction → more NO₂.'}}
];

/* ---------------- UNITS ---------------- */
const UNITS = [
{ id:'u1', n:1, color:'blue',
  t:{ar:'الاتزان الديناميكي ومبدأ لوشاتيليه', en:"Dynamic equilibrium & Le Chatelier's principle"},
  goal:{ar:'تفسير الاتزان الديناميكي، وتطبيق مبدأ لوشاتيليه على تغيّر التركيز.',en:"Explain dynamic equilibrium and apply Le Chatelier's principle to concentration changes."},
  sections:[
   {h:{ar:'التفاعل الانعكاسي',en:'Reversible reactions'}, b:{ar:
    '<p>التفاعل الانعكاسي يسير في الاتجاهين: الطردي (من اليسار لليمين) والعكسي (من اليمين لليسار).</p><div class="eqblock">$aA+bB<=>cC+dD$</div>',en:
    '<p>A reversible reaction proceeds in both directions: forward (left to right) and backward (right to left).</p><div class="eqblock">$aA+bB<=>cC+dD$</div>'}},
   {h:{ar:'الاتزان الديناميكي',en:'Dynamic equilibrium'}, b:{ar:
    '<ul class="kp"><li>التفاعل الطردي مستمر، والتفاعل العكسي مستمر.</li><li>معدل التفاعل الطردي = معدل التفاعل العكسي.</li><li>التركيزات تظل ثابتة مع الزمن طالما الظروف ثابتة.</li><li>التركيزات <b>ليست بالضرورة متساوية</b>.</li></ul><p>الاتزان ديناميكي وليس ساكنًا: تساوي المعدلين يعني أن العمليتين تحدثان بنفس السرعة، وليس أن كميات المتفاعلات والنواتج متساوية.</p>',en:
    '<ul class="kp"><li>The forward reaction continues, and so does the backward reaction.</li><li>Forward rate = backward rate.</li><li>Concentrations stay constant with time under unchanged conditions.</li><li>Concentrations are <b>not necessarily equal</b>.</li></ul><p>Equilibrium is dynamic, not static: equal rates mean both processes happen at the same rate, not that the amounts are equal.</p>'}},
   {h:{ar:'النظام المغلق',en:'Closed system'}, review:true, b:{ar:
    '<p>يتحقق الاتزان الكيميائي في نظام مغلق يمنع دخول أو خروج المواد بطريقة تغيّر تركيب النظام المتفاعل. لو هرب غاز ناتج مثلًا، قد يتغير التركيب ولا يبقى النظام في نفس حالة الاتزان.</p>',en:
    '<p>Chemical equilibrium is established in a closed system, which prevents substances entering or leaving in a way that changes the composition. If a product gas escapes, the composition may change and the system may not remain at the same equilibrium.</p>'}},
   {h:{ar:'مبدأ لوشاتيليه',en:"Le Chatelier's principle"}, b:{ar:
    '<p>إذا حدث تغيّر في أحد العوامل المؤثرة على نظام في حالة اتزان (التركيز أو الضغط أو درجة الحرارة)، يُزاح الاتزان في الاتجاه الذي يقلل من تأثير هذا التغيّر.</p><p>النظام <b>لا يلغي</b> التغيّر بالكامل؛ بل يستجيب ويصل إلى اتزان جديد.</p>',en:
    '<p>When a system at equilibrium is subjected to a change in concentration, pressure or temperature, the equilibrium shifts in the direction that tends to oppose the change.</p><p>The system does <b>not</b> cancel the disturbance completely; it responds and establishes a new equilibrium.</p>'}},
   {h:{ar:'تأثير التركيز',en:'Effect of concentration'}, b:{ar:
    '<table class="rules"><tr><th>التغيير</th><th>اتجاه الإزاحة</th></tr><tr><td>زيادة تركيز متفاعل</td><td>طردي (نحو النواتج)</td></tr><tr><td>نقص تركيز متفاعل</td><td>عكسي (نحو المتفاعلات)</td></tr><tr><td>زيادة تركيز ناتج</td><td>عكسي</td></tr><tr><td>نقص تركيز ناتج</td><td>طردي</td></tr></table><p>النظام يستهلك جزءًا من المادة المضافة، أو يعوّض جزءًا من المادة المسحوبة.</p>',en:
    '<table class="rules"><tr><th>Change</th><th>Shift</th></tr><tr><td>Increase a reactant</td><td>Forward (toward products)</td></tr><tr><td>Decrease a reactant</td><td>Backward (toward reactants)</td></tr><tr><td>Increase a product</td><td>Backward</td></tr><tr><td>Decrease a product</td><td>Forward</td></tr></table><p>The system consumes some of an added substance, or replaces some of a removed substance.</p>'}}
  ],
  sims:['dyn'],
  mis:[
   {w:{ar:'عند الاتزان التفاعل يتوقف.',en:'At equilibrium the reaction stops.'}, r:{ar:'التفاعلان مستمران بنفس المعدل (اتزان ديناميكي).',en:'Both reactions continue at equal rates (dynamic).'}, c:'c_dyn'},
   {w:{ar:'تساوي المعدلات يعني تساوي التركيزات.',en:'Equal rates mean equal concentrations.'}, r:{ar:'التركيزات ثابتة لكنها غالبًا غير متساوية.',en:'Concentrations are constant but usually not equal.'}, c:'c_conc'},
   {w:{ar:'النظام يرجع لنفس حالته الأصلية بالضبط بعد الإزاحة.',en:'After a shift the system returns exactly to its original state.'}, r:{ar:'النظام يقلل أثر التغيير ويصل لاتزان جديد.',en:'The system opposes the change and reaches a new equilibrium.'}, c:'c_lec'}
  ],
  quiz:[
   {id:'Q1a', c:'c_dyn', q:{ar:'صح أم خطأ: "عند الاتزان، يتوقف التفاعل الطردي."',en:'True or false: "At equilibrium the forward reaction stops."'}, o:[{ar:'صح',en:'True'},{ar:'خطأ — التفاعل الطردي مستمر بنفس معدل العكسي',en:'False — it continues at the same rate as the backward reaction'}], a:1, x:{ar:'الاتزان ديناميكي.',en:'Equilibrium is dynamic.'}},
   {id:'Q1b', c:'c_lec', q:{ar:'عند إنقاص تركيز أحد المتفاعلات في نظام متزن، يُزاح الاتزان:',en:'Decreasing a reactant concentration shifts equilibrium:'}, o:[{ar:'طرديًا',en:'Forward'},{ar:'عكسيًا',en:'Backward'},{ar:'لا يتأثر',en:'No shift'}], a:1, x:{ar:'النظام يعوّض جزءًا من المتفاعل المسحوب، فيتجه عكسيًا.',en:'The system replaces some of the removed reactant: backward.'}},
   {id:'Q1c', c:'c_lec', q:{ar:'بعد إضافة متفاعل، الاتزان الجديد:',en:'After adding a reactant, the new equilibrium:'}, o:[{ar:'يلغي الإضافة تمامًا ويعود كما كان',en:'Cancels the addition completely'},{ar:'يقلل أثر الإضافة لكن لا يلغيه بالكامل',en:'Reduces the effect but does not cancel it completely'}], a:1, x:{ar:'النظام يقاوم التغيير ويصل لاتزان جديد.',en:'The system opposes the change and settles at a new equilibrium.'}}
  ]
},
{ id:'u2', n:2, color:'green',
  t:{ar:'قانون فعل الكتلة ومعدل التفاعل',en:'Law of mass action & reaction rates'},
  goal:{ar:'كتابة تعبيرات معدل التفاعل الطردي والعكسي واستنتاج تعبير ثابت الاتزان.',en:'Write forward/backward rate expressions and derive the equilibrium-constant expression.'},
  sections:[
   {h:{ar:'المثال المدرسي',en:'The school-level example'}, b:{ar:
    '<div class="eqblock">$FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$</div><p>معدل التفاعل الطردي:</p><div class="eqblock">$r_{f}=k_{f}[FeCl3][NH4SCN]^{3}$</div><p>معدل التفاعل العكسي:</p><div class="eqblock">$r_{b}=k_{b}[Fe(SCN)3][NH4Cl]^{3}$</div><p>عند الاتزان $r_{f}=r_{b}$ ، إذن:</p><div class="eqblock">$K_{c}=«k_{f}|k_{b}»=«[Fe(SCN)3][NH4Cl]^{3}|[FeCl3][NH4SCN]^{3}»$</div><ul class="kp"><li>الأقواس المربعة [ ] تعني التركيز.</li><li>$k_{f}$ ثابت معدل التفاعل الطردي، و $k_{b}$ ثابت معدل التفاعل العكسي.</li><li>معاملات المعادلة الموزونة تظهر كأُسس في هذه المعالجة المدرسية.</li></ul><p class="muted">ملحوظة: هذا التعبير المعتمد على المعاملات هو المعالجة المدرسية لهذا المثال، وليس قانون معدل عامًا لكل التفاعلات.</p>',en:
    '<div class="eqblock">$FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$</div><p>Forward rate:</p><div class="eqblock">$r_{f}=k_{f}[FeCl3][NH4SCN]^{3}$</div><p>Backward rate:</p><div class="eqblock">$r_{b}=k_{b}[Fe(SCN)3][NH4Cl]^{3}$</div><p>At equilibrium $r_{f}=r_{b}$, so:</p><div class="eqblock">$K_{c}=«k_{f}|k_{b}»=«[Fe(SCN)3][NH4Cl]^{3}|[FeCl3][NH4SCN]^{3}»$</div><ul class="kp"><li>Square brackets mean concentration.</li><li>$k_{f}$ is the forward rate constant; $k_{b}$ the backward rate constant.</li><li>Balanced-equation coefficients appear as powers in this school-level treatment.</li></ul><p class="muted">Note: this coefficient-based expression is the school-level treatment for this example, not a universal rate law.</p>'}},
   {h:{ar:'تجربة اللون',en:'The colour investigation'}, b:{ar:
    '<ul class="kp"><li>إضافة $FeCl3$ (متفاعل) ← إزاحة طردية ← يصبح اللون الأحمر أعمق.</li><li>إضافة $NH4Cl$ (ناتج) ← إزاحة عكسية ← يصبح اللون الأحمر أفتح.</li></ul>',en:
    '<ul class="kp"><li>Adding $FeCl3$ (reactant) → forward shift → deeper red.</li><li>Adding $NH4Cl$ (product) → backward shift → paler red.</li></ul>'}},
   {h:{ar:'منحنى المعدل مع الزمن',en:'Rate–time graph'}, b:{ar:
    '<p>في البداية يكون معدل التفاعل الطردي كبيرًا والعكسي صغيرًا. مع الوقت يقل الطردي ويزداد العكسي حتى يتساويا. عند الاتزان: المعدلان <b>غير صفريين ومتساويان</b> والتفاعل مستمر في الاتجاهين. شاهد ذلك في المحاكاة بالوحدة الأولى.</p>',en:
    '<p>Initially the forward rate is high and the backward rate is low. Over time they approach each other until equal. At equilibrium both rates are <b>non-zero and equal</b>, and the reaction continues both ways. See the Unit 1 simulation.</p>'}}
  ],
  sims:['fescn'],
  mis:[
   {w:{ar:'المعامل يُضرب في التركيز.',en:'The coefficient multiplies the concentration.'}, r:{ar:'المعامل يصبح أسًا للتركيز: $[NH4SCN]^{3}$',en:'The coefficient becomes a power: $[NH4SCN]^{3}$'}, c:'c_mass'}
  ],
  quiz:[
   {id:'Q2a', c:'c_mass', q:{ar:'عند الاتزان يكون:',en:'At equilibrium:'}, o:[{ar:'$r_{f}=r_{b}$ و $K_{c}=«k_{f}|k_{b}»$',en:'$r_{f}=r_{b}$ and $K_{c}=«k_{f}|k_{b}»$'},{ar:'$r_{f}=0$',en:'$r_{f}=0$'},{ar:'$K_{c}=k_{f}×k_{b}$',en:'$K_{c}=k_{f}×k_{b}$'}], a:0, x:{ar:'تساوي المعدلين يعطي النسبة $«k_{f}|k_{b}»$.',en:'Equal rates give the ratio $«k_{f}|k_{b}»$.'}},
   {id:'Q2b', c:'c_lec', q:{ar:'في خليط الاتزان الأحمر للتفاعل: $FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$ عند إضافة $NH4Cl$ يصبح اللون:',en:'In the red equilibrium mixture of $FeCl3(aq)+3NH4SCN(aq)<=>Fe(SCN)3(aq)+3NH4Cl(aq)$, adding $NH4Cl$ makes the colour:'}, o:[{ar:'أحمر أعمق',en:'Deeper red'},{ar:'أحمر أفتح',en:'Paler red'},{ar:'لا يتغير',en:'Unchanged'}], a:1, x:{ar:'$NH4Cl$ ناتج ← إزاحة عكسية ← لون أفتح.',en:'$NH4Cl$ is a product → backward shift → paler.'}}
  ]
},
{ id:'u3', n:3, color:'purple',
  t:{ar:'ثابت الاتزان Kc',en:'The equilibrium constant Kc'},
  goal:{ar:'كتابة تعبير Kc من المعادلة الموزونة، واستبعاد المواد الصلبة والسائلة النقية.',en:'Construct Kc from a balanced equation and omit pure solids and liquids.'},
  sections:[
   {h:{ar:'التعبير العام',en:'General expression'}, b:{ar:
    '<div class="eqblock">$aA+bB<=>cC+dD$ &nbsp;&nbsp;&nbsp; $K_{c}=«[C]^{c}[D]^{d}|[A]^{a}[B]^{b}»$</div><ol><li>النواتج في البسط.</li><li>المتفاعلات في المقام.</li><li>معامل كل مادة يصبح أسًا.</li><li>لا تُكتب المواد الصلبة النقية والسوائل النقية.</li><li>عوّض بتركيزات الاتزان واعرض خطوات الحساب.</li></ol>',en:
    '<div class="eqblock">$aA+bB<=>cC+dD$ &nbsp;&nbsp;&nbsp; $K_{c}=«[C]^{c}[D]^{d}|[A]^{a}[B]^{b}»$</div><ol><li>Products in the numerator.</li><li>Reactants in the denominator.</li><li>Each coefficient becomes a power.</li><li>Omit pure solids and pure liquids.</li><li>Substitute equilibrium concentrations and show the arithmetic.</li></ol>'}},
   {h:{ar:'لماذا لا نكتب الصلب والسائل النقي؟',en:'Why omit pure solids and liquids?'}, review:true, b:{ar:
    '<p>تركيز المادة الصلبة النقية أو السائلة النقية يظل ثابتًا تقريبًا طالما هذه المادة موجودة، فيُدمج أثره الثابت داخل قيمة ثابت الاتزان ولا يُكتب كحد متغير.</p>',en:
    '<p>The concentration of a pure solid or pure liquid stays effectively constant while that phase is present, so its constant contribution is incorporated into K and not written as a variable term.</p>'}},
   {h:{ar:'رموز الحالة',en:'State symbols'}, b:{ar:
    '<p><b>(s)</b> صلب · <b>(l)</b> سائل · <b>(g)</b> غاز · <b>(aq)</b> محلول مائي · <b>(v)</b> بخار. البخار حالة غازية فيُكتب في التعبير، بينما السائل النقي لا يُكتب.</p>',en:
    '<p><b>(s)</b> solid · <b>(l)</b> liquid · <b>(g)</b> gas · <b>(aq)</b> aqueous · <b>(v)</b> vapour. Vapour is gaseous and is included; a pure liquid is omitted.</p>'}},
   {h:{ar:'أمثلة',en:'Examples'}, b:{ar:
    '<div class="eqblock">$2H2O(v)<=>2H2(g)+O2(g)$ &nbsp; ⟹ &nbsp; $K_{c}=«[H2]^{2}[O2]|[H2O]^{2}»$</div><div class="eqblock">$NH3(l)<=>NH3(g)$ &nbsp; ⟹ &nbsp; $K_{c}=[NH3]$</div><div class="eqblock">$3I2(s)+3H2O(l)<=>5I^{-}(aq)+IO3^{-}(aq)+6H^{+}(aq)$ &nbsp; ⟹ &nbsp; $K_{c}=[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}$</div>',en:
    '<div class="eqblock">$2H2O(v)<=>2H2(g)+O2(g)$ &nbsp; ⟹ &nbsp; $K_{c}=«[H2]^{2}[O2]|[H2O]^{2}»$</div><div class="eqblock">$NH3(l)<=>NH3(g)$ &nbsp; ⟹ &nbsp; $K_{c}=[NH3]$</div><div class="eqblock">$3I2(s)+3H2O(l)<=>5I^{-}(aq)+IO3^{-}(aq)+6H^{+}(aq)$ &nbsp; ⟹ &nbsp; $K_{c}=[I^{-}]^{5}[IO3^{-}][H^{+}]^{6}$</div>'}},
   {h:{ar:'دلالة قيمة Kc',en:'Meaning of Kc'}, review:true, b:{ar:
    '<p>$K_{c}$ يصف تركيب خليط الاتزان عند درجة حرارة محددة. القيمة <b>الكبيرة جدًا</b> تدل عمومًا على أن النواتج هي السائدة، والقيمة <b>الصغيرة جدًا</b> تدل على أن المتفاعلات هي السائدة. قيمة K لا تدل على سرعة التفاعل.</p>',en:
    '<p>$K_{c}$ describes the equilibrium composition at a specified temperature. A <b>very large</b> value generally indicates product-favoured; a <b>very small</b> value reactant-favoured. K says nothing about how fast a reaction is.</p>'}},
   {h:{ar:'هل الخليط في حالة اتزان؟',en:'Is the mixture at equilibrium?'}, b:{ar:
    '<p>احسب قيمة التعبير باستخدام تركيزات الخليط الحالية، وقارنها بقيمة $K_{c}$ المعطاة <b>عند نفس درجة الحرارة</b>. إذا اختلفت القيمتان فالخليط ليس في حالة اتزان.</p>',en:
    '<p>Calculate the expression using the current concentrations and compare with the stated $K_{c}$ <b>at the same temperature</b>. If they differ, the mixture is not at equilibrium.</p>'}},
   {h:{ar:'عكس المعادلة وضربها',en:'Reversing and multiplying'}, b:{ar:
    '<div class="eqblock">$K_{reverse}=«1|K_{forward}»$ &nbsp;&nbsp;&nbsp; $K_{new}=(K_{original})^{n}$</div><p>عند عكس المعادلة يصبح الثابت مقلوب الثابت الأصلي، وعند ضرب كل المعاملات في n يُرفع الثابت للأس n.</p>',en:
    '<div class="eqblock">$K_{reverse}=«1|K_{forward}»$ &nbsp;&nbsp;&nbsp; $K_{new}=(K_{original})^{n}$</div><p>Reversing gives the reciprocal; multiplying all coefficients by n raises K to the power n.</p>'}},
   {h:{ar:'مثال عددي: تكوين يوديد الهيدروجين',en:'Worked example: forming hydrogen iodide'}, newrev:true, b:{ar:
    '<div class="eqblock">$H2(g)+I2(g)<=>2HI(g)$ &nbsp;&nbsp; $K_{c}=«[HI]^{2}|[H2][I2]»=50$</div><p><b>دلالة القيمة:</b> $K_{c}=50$ أكبر من 1، فعند الاتزان تكون نسبة النواتج كبيرة مقارنة بالمتفاعلات عند درجة الحرارة المحددة.</p><p><b>مثال 1 — احسب $K_{c}$:</b> عند الاتزان $[HI]=0.500 mol/L$ و $[H2]=0.050 mol/L$ و $[I2]=0.100 mol/L$.</p><div class="eqblock">$K_{c}=«(0.500)^{2}|(0.050)(0.100)»=«0.250|0.005»=50.000$</div><p><b>مثال 2 — احسب $[HI]$:</b> عند الاتزان $[H2]=[I2]=0.100 mol/L$.</p><div class="eqblock">$[HI]^{2}=50×0.100×0.100=0.500$ ⟹ $[HI]=0.707 mol/L$</div><ul class="kp"><li>قرّب الناتج النهائي لأقرب <b>3 أرقام عشرية</b>.</li><li>عوّض بتركيزات <b>الاتزان</b> فقط، واكتب خطوات الحساب.</li></ul>',en:
    '<div class="eqblock">$H2(g)+I2(g)<=>2HI(g)$ &nbsp;&nbsp; $K_{c}=«[HI]^{2}|[H2][I2]»=50$</div><p><b>Meaning:</b> $K_{c}=50$ is greater than 1, so at equilibrium the proportion of products is large compared with reactants at the specified temperature.</p><p><b>Example 1 — find $K_{c}$:</b> at equilibrium $[HI]=0.500 mol/L$, $[H2]=0.050 mol/L$, $[I2]=0.100 mol/L$.</p><div class="eqblock">$K_{c}=«(0.500)^{2}|(0.050)(0.100)»=«0.250|0.005»=50.000$</div><p><b>Example 2 — find $[HI]$:</b> at equilibrium $[H2]=[I2]=0.100 mol/L$.</p><div class="eqblock">$[HI]^{2}=50×0.100×0.100=0.500$ ⟹ $[HI]=0.707 mol/L$</div><ul class="kp"><li>Round the final answer to <b>3 decimal places</b>.</li><li>Substitute <b>equilibrium</b> concentrations only and show the working.</li></ul>'}}
  ],
  sims:['kc'],
  mis:[
   {w:{ar:'كل المواد تُكتب في تعبير Kc.',en:'Every substance appears in Kc.'}, r:{ar:'المواد الصلبة النقية والسوائل النقية لا تُكتب.',en:'Pure solids and pure liquids are omitted.'}, c:'c_phase'},
   {w:{ar:'المعامل يُكتب كرقم مضروب.',en:'The coefficient is written as a multiplier.'}, r:{ar:'المعامل يصبح أسًا.',en:'The coefficient becomes a power.'}, c:'c_kc'},
   {w:{ar:'بخار الماء (v) يُعامل كسائل ويُحذف.',en:'Water vapour (v) is treated as a liquid and omitted.'}, r:{ar:'البخار غاز ويُكتب في التعبير.',en:'Vapour is a gas and is included.'}, c:'c_phase'}
  ],
  quiz:[
   {id:'Q3a', c:'c_phase', q:{ar:'تعبير $K_{c}$ للتفاعل $NH3(l)<=>NH3(g)$ هو:',en:'The $K_{c}$ for $NH3(l)<=>NH3(g)$ is:'}, o:[{ar:'$K_{c}=«[NH3(g)]|[NH3(l)]»$',en:'$K_{c}=«[NH3(g)]|[NH3(l)]»$'},{ar:'$K_{c}=[NH3]$',en:'$K_{c}=[NH3]$'},{ar:'$K_{c}=1$',en:'$K_{c}=1$'}], a:1, x:{ar:'السائل النقي لا يُكتب.',en:'The pure liquid is omitted.'}},
   {id:'Q3b', c:'c_kc', q:{ar:'في تعبير $K_{c}$، معامل المادة في المعادلة الموزونة:',en:'In a $K_{c}$ expression, a substance’s coefficient:'}, o:[{ar:'يُضرب في التركيز',en:'Multiplies the concentration'},{ar:'يصبح أسًا للتركيز',en:'Becomes the power of the concentration'},{ar:'يُهمل',en:'Is ignored'}], a:1, x:{ar:'مثال: $[H2]^{2}$',en:'Example: $[H2]^{2}$'}},
   {id:'Q3c', c:'c_kc', q:{ar:'للتفاعل $H2(g)+I2(g)<=>2HI(g)$ قيمة $K_{c}=50$. إذا كان عند الاتزان $[H2]=[I2]=0.100 mol/L$ فإن $[HI]$ يساوي:',en:'For $H2(g)+I2(g)<=>2HI(g)$, $K_{c}=50$. If at equilibrium $[H2]=[I2]=0.100 mol/L$, then $[HI]$ equals:'}, o:[{ar:'0.707 mol/L',en:'0.707 mol/L'},{ar:'0.500 mol/L',en:'0.500 mol/L'},{ar:'5.000 mol/L',en:'5.000 mol/L'},{ar:'0.071 mol/L',en:'0.071 mol/L'}], a:0, x:{ar:'$[HI]^{2}=50×0.100×0.100=0.500$ ، إذن $[HI]=0.707$',en:'$[HI]^{2}=50×0.100×0.100=0.500$, so $[HI]=0.707$'}}
  ]
},
{ id:'u4', n:4, color:'blue',
  t:{ar:'درجة الحرارة والاتزان',en:'Temperature and equilibrium'},
  goal:{ar:'التنبؤ بأثر تغيير درجة الحرارة على موضع الاتزان وقيمة K.',en:'Predict how temperature affects equilibrium position and K.'},
  sections:[
   {h:{ar:'تمثيل الحرارة',en:'Representing heat'}, b:{ar:
    '<p>في التفاعل <b>الطارد</b> للحرارة تُكتب الحرارة مع النواتج، و $ΔH$ سالبة. في التفاعل <b>الماص</b> تُكتب الحرارة مع المتفاعلات، و $ΔH$ موجبة.</p>',en:
    '<p>For an <b>exothermic</b> forward reaction heat is written with the products and $ΔH$ is negative. For an <b>endothermic</b> one, heat is on the reactant side and $ΔH$ is positive.</p>'}},
   {h:{ar:'قواعد الإزاحة',en:'Shift rules'}, b:{ar:
    '<table class="rules"><tr><th>التفاعل الطردي</th><th>رفع الحرارة</th><th>خفض الحرارة</th></tr><tr><td>طارد للحرارة</td><td>إزاحة عكسية</td><td>إزاحة طردية</td></tr><tr><td>ماص للحرارة</td><td>إزاحة طردية</td><td>إزاحة عكسية</td></tr></table>',en:
    '<table class="rules"><tr><th>Forward reaction</th><th>Raise T</th><th>Lower T</th></tr><tr><td>Exothermic</td><td>Backward</td><td>Forward</td></tr><tr><td>Endothermic</td><td>Forward</td><td>Backward</td></tr></table>'}},
   {h:{ar:'درجة الحرارة وثابت الاتزان',en:'Temperature and K'}, review:true, b:{ar:
    '<ul class="kp"><li>رفع الحرارة <b>يقلل</b> $K_{c}$ للتفاعل الطارد، و<b>يزيد</b> $K_{c}$ للتفاعل الماص.</li><li>تغيير التركيز عند ثبوت الحرارة لا يغير $K_{c}$.</li></ul><p>ثوابت المعدل $k_{f}$ و $k_{b}$ تعتمد على درجة الحرارة، والنسبة بينهما هي $K_{c}$؛ لذلك تغيير الحرارة يغير $K_{c}$ نفسه، بينما تغيير التركيز يزيح الاتزان دون تغيير $K_{c}$.</p>',en:
    '<ul class="kp"><li>Raising T <b>decreases</b> $K_{c}$ for an exothermic reaction and <b>increases</b> it for an endothermic one.</li><li>Changing concentration at constant T does not change $K_{c}$.</li></ul><p>The rate constants $k_{f}$ and $k_{b}$ depend on temperature and their ratio is $K_{c}$; so temperature changes K itself, while concentration changes only shift the position.</p>'}},
   {h:{ar:'الحرارة ومعدل التفاعل',en:'Temperature and rate'}, b:{ar:
    '<p>التسخين يزيد معدل التفاعلين الطردي والعكسي فيصل النظام للاتزان أسرع. هذا تأثير <b>منفصل</b> عن قاعدة إزاحة الموضع نحو الاتجاه الماص للحرارة.</p>',en:
    '<p>Heating increases both forward and backward rates, so equilibrium is reached faster. This is <b>separate</b> from the rule that the position shifts toward the endothermic direction.</p>'}},
   {h:{ar:'مثال: تحضير النشادر',en:'Example: ammonia synthesis'}, review:true, b:{ar:
    '<div class="eqblock">$N2(g)+3H2(g)<=>2NH3(g)+Heat$ &nbsp; <bdi>($ΔH=-92 kJ$)</bdi></div><ul class="kp"><li>رفع الحرارة ← إزاحة عكسية ← يقل ناتج النشادر عند الاتزان.</li><li>خفض الحرارة ← إزاحة طردية ← يزيد ناتج النشادر.</li></ul>',en:
    '<div class="eqblock">$N2(g)+3H2(g)<=>2NH3(g)+Heat$ &nbsp; <bdi>($ΔH=-92 kJ$)</bdi></div><ul class="kp"><li>Raising T → backward shift → lower equilibrium yield of NH₃.</li><li>Lowering T → forward shift → higher yield.</li></ul>'}},
   {h:{ar:'مثال: NO₂ / N₂O₄',en:'Example: NO₂ / N₂O₄'}, b:{ar:
    '<div class="eqblock">$2NO2(g)<=>N2O4(g)+Heat$</div><p>NO₂ بني محمر و N₂O₄ عديم اللون. التسخين يفضّل الاتجاه العكسي الماص فيزيد NO₂ البني، والتبريد يفضّل الاتجاه الطردي الطارد فيزيد N₂O₄.</p>',en:
    '<div class="eqblock">$2NO2(g)<=>N2O4(g)+Heat$</div><p>NO₂ is reddish-brown and N₂O₄ colourless. Heating favours the endothermic reverse direction (more brown NO₂); cooling favours the exothermic forward direction (more N₂O₄).</p>'}}
  ],
  sims:['no2'],
  mis:[
   {w:{ar:'الحرارة تأثيرها مثل التركيز تمامًا ولا تغير K.',en:'Temperature acts just like concentration and does not change K.'}, r:{ar:'تغيير الحرارة يغير قيمة K نفسها.',en:'Changing temperature changes K itself.'}, c:'c_ktemp'},
   {w:{ar:'التسخين يزيد معدل التفاعل الطردي فقط.',en:'Heating speeds up only the forward reaction.'}, r:{ar:'التسخين يزيد المعدلين، والإزاحة تكون نحو الاتجاه الماص.',en:'Heating speeds up both; the shift is toward the endothermic direction.'}, c:'c_temp'}
  ],
  quiz:[
   {id:'Q4a', c:'c_ktemp', q:{ar:'رفع درجة الحرارة لتفاعل طردي طارد للحرارة يجعل $K_{c}$:',en:'Raising T for an exothermic forward reaction makes $K_{c}$:'}, o:[{ar:'يزداد',en:'Increase'},{ar:'يقل',en:'Decrease'},{ar:'لا يتغير',en:'Unchanged'}], a:1, x:{ar:'الإزاحة عكسية فتقل النواتج ويقل K.',en:'Backward shift, fewer products, smaller K.'}},
   {id:'Q4b', c:'c_temp', q:{ar:'تسخين نظام متزن:',en:'Heating a system at equilibrium:'}, o:[{ar:'يزيد معدل التفاعلين، ويزيح الموضع نحو الاتجاه الماص للحرارة',en:'Increases both rates and shifts the position toward the endothermic direction'},{ar:'يزيد معدل التفاعل الطردي فقط',en:'Increases only the forward rate'},{ar:'لا يؤثر على المعدل',en:'Has no effect on rate'}], a:0, x:{ar:'تأثيران مختلفان: السرعة والموضع.',en:'Two distinct effects: rate and position.'}}
  ]
},
{ id:'u5', n:5, color:'green',
  t:{ar:'الضغط والحجم و Kp',en:'Pressure, volume & Kp'},
  goal:{ar:'التنبؤ بأثر الضغط على الاتزانات الغازية، وكتابة واستخدام تعبير Kp.',en:'Predict pressure effects on gaseous equilibria and use Kp.'},
  sections:[
   {h:{ar:'الضغط والحجم',en:'Pressure and volume'}, b:{ar:
    '<p>لكمية ثابتة من الغاز عند ثبوت درجة الحرارة: تقليل الحجم يزيد الضغط، وزيادة الحجم تقلل الضغط.</p>',en:
    '<p>For a fixed amount of gas at constant temperature, decreasing volume increases pressure; increasing volume decreases pressure.</p>'}},
   {h:{ar:'أثر الضغط على الاتزان',en:'Effect on equilibrium'}, b:{ar:
    '<ul class="kp"><li>زيادة الضغط (تقليل الحجم) ← إزاحة نحو الجانب ذي <b>عدد المولات الغازية الأقل</b>.</li><li>تقليل الضغط (زيادة الحجم) ← إزاحة نحو الجانب ذي عدد المولات الغازية الأكبر.</li><li>إذا تساوى عدد المولات الغازية في الجانبين لا يُزاح موضع الاتزان.</li><li>احسب المولات <b>الغازية فقط</b> (لا تحسب الصلب أو السائل أو المحلول المائي).</li></ul><p>الانضغاط يرفع الضغط، والإزاحة نحو جزيئات غازية أقل تقاوم هذه الزيادة.</p><p><b>"لا إزاحة" لا تعني "لا تغيير"</b>: الانضغاط يزيد تركيزات الغازات حتى لو لم يتغير الموضع. وتغيير الضغط عند ثبوت الحرارة لا يغير $K_{c}$ أو $K_{p}$.</p>',en:
    '<ul class="kp"><li>Increasing pressure (smaller volume) → shift toward <b>fewer gas moles</b>.</li><li>Decreasing pressure (larger volume) → shift toward more gas moles.</li><li>Equal gas moles on both sides → no shift in position.</li><li>Count <b>gaseous species only</b> (not solids, liquids or aqueous species).</li></ul><p>Compression raises pressure; a shift toward fewer gas molecules tends to oppose it.</p><p><b>"No shift" does not mean "nothing changes"</b>: compression still raises gas concentrations. Pressure changes at constant T do not change $K_{c}$ or $K_{p}$.</p>'}},
   {h:{ar:'أمثلة',en:'Examples'}, b:{ar:
    '<div class="eqblock">$N2(g)+3H2(g)<=>2NH3(g)$ &nbsp; <bdi>(4 مولات ← 2 مول)</bdi></div><p>زيادة الضغط تفضّل النواتج، وتقليله يفضّل المتفاعلات.</p><div class="eqblock">$CO(g)+NO2(g)<=>CO2(g)+NO(g)$ &nbsp; <bdi>(2 = 2)</bdi></div><p>لا إزاحة في الموضع، لكن التركيزات والضغوط الجزئية تتغير.</p>',en:
    '<div class="eqblock">$N2(g)+3H2(g)<=>2NH3(g)$ &nbsp; (4 mol → 2 mol)</div><p>Higher pressure favours products; lower pressure favours reactants.</p><div class="eqblock">$CO(g)+NO2(g)<=>CO2(g)+NO(g)$ &nbsp; (2 = 2)</div><p>No shift, but concentrations and partial pressures change.</p>'}},
   {h:{ar:'الضغط الجزئي و Kp',en:'Partial pressure and Kp'}, b:{ar:
    '<p>الضغط الجزئي هو مساهمة غاز واحد في ضغط الخليط.</p><div class="eqblock">$P_{total}=P_{1}+P_{2}+...+P_{n}$ </div><p>مثال: $2+5+7=14 atm$</p><div class="eqblock">$K_{p}=«(P_{C})^{c}(P_{D})^{d}|(P_{A})^{a}(P_{B})^{b}»$</div><p><b>مثال محلول:</b> للتفاعل $N2(g)+2O2(g)<=>2NO2(g)$ ، $P_{N2}=0.2 atm$ و $P_{O2}=1 atm$ و $P_{NO2}=2 atm$:</p><div class="eqblock">$K_{p}=«(P_{NO2})^{2}|P_{N2}(P_{O2})^{2}»=«(2)^{2}|(0.2)(1)^{2}»=20$</div>',en:
    '<p>A partial pressure is one gas’s contribution to the mixture’s pressure.</p><div class="eqblock">$P_{total}=P_{1}+P_{2}+...+P_{n}$ &nbsp;&nbsp; e.g. $2+5+7=14 atm$</div><div class="eqblock">$K_{p}=«(P_{C})^{c}(P_{D})^{d}|(P_{A})^{a}(P_{B})^{b}»$</div><p><b>Worked example:</b> for $N2(g)+2O2(g)<=>2NO2(g)$ with $P_{N2}=0.2$, $P_{O2}=1$, $P_{NO2}=2$ atm:</p><div class="eqblock">$K_{p}=«(P_{NO2})^{2}|P_{N2}(P_{O2})^{2}»=«(2)^{2}|(0.2)(1)^{2}»=20$</div>'}}
  ],
  sims:['piston','kp'],
  mis:[
   {w:{ar:'لو مفيش إزاحة يبقى مفيش أي تغيير.',en:'No shift means nothing changes.'}, r:{ar:'التركيزات تزيد بالانضغاط حتى بدون إزاحة.',en:'Compression raises concentrations even without a shift.'}, c:'c_pres'},
   {w:{ar:'نحسب كل المولات في المعادلة.',en:'Count all moles in the equation.'}, r:{ar:'نحسب المولات الغازية فقط.',en:'Count gaseous moles only.'}, c:'c_pres'}
  ],
  quiz:[
   {id:'Q5a', c:'c_kp', q:{ar:'خليط غازات ضغوطها الجزئية 2 و 5 و 7 atm. الضغط الكلي:',en:'Partial pressures 2, 5 and 7 atm. Total pressure:'}, o:[{ar:'14 atm',en:'14 atm'},{ar:'70 atm',en:'70 atm'},{ar:'7 atm',en:'7 atm'}], a:0, x:{ar:'$P_{total}=2+5+7=14 atm$',en:'$P_{total}=2+5+7=14 atm$'}},
   {id:'Q5b', c:'c_pres', q:{ar:'عند تقليل الضغط (زيادة الحجم) لتفاعل النشادر $N2+3H2<=>2NH3$:',en:'Lowering pressure (larger volume) for $N2+3H2<=>2NH3$:'}, o:[{ar:'إزاحة طردية',en:'Forward shift'},{ar:'إزاحة عكسية (نحو المولات الأكثر)',en:'Backward shift (toward more moles)'},{ar:'لا إزاحة',en:'No shift'}], a:1, x:{ar:'الجانب الأيسر فيه 4 مولات غازية.',en:'The left side has 4 gas moles.'}}
  ]
},
{ id:'u6', n:6, color:'purple',
  t:{ar:'دور العامل الحفاز',en:'The role of a catalyst'},
  goal:{ar:'تفسير لماذا يسرّع الحفاز الوصول للاتزان دون تغيير موضعه.',en:'Explain why a catalyst speeds up reaching equilibrium without shifting it.'},
  sections:[
   {h:{ar:'ماذا يفعل العامل الحفاز؟',en:'What does a catalyst do?'}, b:{ar:
    '<ul class="kp"><li>يوفر مسارًا بديلًا للتفاعل بطاقة تنشيط أقل.</li><li>يزيد معدل التفاعلين الطردي والعكسي.</li><li>لا يغير طاقة المتفاعلات أو النواتج، ولا يغير $ΔH$.</li><li>لا يغير موضع الاتزان ولا قيمة ثابت الاتزان.</li><li>يجعل النظام يصل للاتزان أسرع.</li></ul>',en:
    '<ul class="kp"><li>Provides an alternative pathway with lower activation energy.</li><li>Increases both forward and backward rates.</li><li>Does not change reactant/product energy levels or $ΔH$.</li><li>Does not change the equilibrium position or constant.</li><li>Equilibrium is reached sooner.</li></ul>'}},
   {h:{ar:'منحنى الطاقة',en:'Energy profile'}, b:{ar:
    '<p>المتفاعلات والنواتج عند نفس مستويات الطاقة في المسارين. الحفاز يخفض قمة طاقة التنشيط للاتجاهين الطردي والعكسي <b>بنفس المقدار</b>، لذلك يزيد المعدلين معًا ولا يزيح الاتزان.</p>',en:
    '<p>Reactants and products have the same energy levels in both pathways. The catalyst lowers the forward and backward barriers <b>by the same amount</b>, so both rates increase and the position does not shift.</p>'}}
  ],
  sims:['cat'],
  mis:[
   {w:{ar:'الحفاز يزيد كمية النواتج عند الاتزان.',en:'A catalyst increases the amount of product at equilibrium.'}, r:{ar:'الحفاز يسرّع الوصول للاتزان فقط.',en:'A catalyst only speeds up reaching equilibrium.'}, c:'c_cat'}
  ],
  quiz:[
   {id:'Q6a', c:'c_cat', q:{ar:'العامل الحفاز يغيّر:',en:'A catalyst changes:'}, o:[{ar:'قيمة ΔH',en:'ΔH'},{ar:'طاقة التنشيط',en:'Activation energy'},{ar:'ثابت الاتزان',en:'The equilibrium constant'}], a:1, x:{ar:'يخفض طاقة التنشيط فقط.',en:'It lowers activation energy only.'}},
   {id:'Q6b', c:'c_cat', q:{ar:'لماذا لا يزيح الحفاز الاتزان؟',en:'Why does a catalyst not shift equilibrium?'}, o:[{ar:'لأنه يخفض حاجز الطاقة للاتجاهين بنفس المقدار',en:'It lowers both barriers by the same amount'},{ar:'لأنه يُستهلك في التفاعل',en:'It is consumed in the reaction'},{ar:'لأنه يبطئ التفاعل العكسي',en:'It slows the backward reaction'}], a:0, x:{ar:'المعدلان يزيدان معًا.',en:'Both rates increase together.'}}
  ]
}
];

/* Enrichment — critical thinking & problem solving (approved reactions only) */
const CHALLENGES = [
 {id:'E1', c:'c_conc', q:{ar:'طالب قال: "بما إن معدل التفاعلين متساوي عند الاتزان، يبقى كمية النواتج = كمية المتفاعلات." أفضل رد علمي:',en:'A student says: "Since rates are equal at equilibrium, product amount = reactant amount." Best scientific reply:'},
  o:[{ar:'كلامه صحيح دائمًا',en:'Always correct'},{ar:'خطأ: تساوي المعدلين يعني تساوي سرعة العمليتين، والتركيزات ثابتة لكن ليست بالضرورة متساوية',en:'Wrong: equal rates mean equal speeds of the two processes; concentrations are constant but not necessarily equal'},{ar:'صحيح فقط في التفاعلات الغازية',en:'Correct only for gaseous reactions'}], a:1,
  x:{ar:'الفكرة المحورية: تساوي "المعدل" ≠ تساوي "الكمية".',en:'Key idea: equal rate ≠ equal amount.'}},
 {id:'E2', c:'c_cat', q:{ar:'في تفاعل النشادر الطارد، خفض الحرارة يزيد الناتج عند الاتزان لكنه يبطّئ التفاعل. ما الذي يضيفه العامل الحفاز هنا؟',en:'In the exothermic ammonia reaction, lowering T raises equilibrium yield but slows the reaction. What does a catalyst add?'},
  o:[{ar:'يزيد الناتج عند الاتزان',en:'Raises the equilibrium yield'},{ar:'يجعل النظام يصل للاتزان أسرع دون تغيير الناتج عند الاتزان',en:'Reaches equilibrium faster without changing the equilibrium yield'},{ar:'يغير إشارة ΔH',en:'Changes the sign of ΔH'}], a:1,
  x:{ar:'افصل بين "السرعة" و"الموضع": الحفاز يعالج مشكلة السرعة فقط.',en:'Separate rate from position: the catalyst only addresses rate.'}},
 {id:'E3', c:'c_pres', q:{ar:'ضغطنا وعاء فيه $CO(g)+NO2(g)<=>CO2(g)+NO(g)$ لنصف حجمه. زميلك قال "مفيش أي حاجة اتغيرت". تقييمك:',en:'A vessel with $CO(g)+NO2(g)<=>CO2(g)+NO(g)$ is compressed to half volume. A classmate says "nothing changed". Your evaluation:'},
  o:[{ar:'صحيح تمامًا',en:'Fully correct'},{ar:'نصف صحيح: الموضع لم يتغير، لكن تركيزات كل الغازات زادت',en:'Half correct: position unchanged, but all gas concentrations increased'},{ar:'خطأ: الاتزان أُزيح طرديًا',en:'Wrong: it shifted forward'}], a:1,
  x:{ar:'"لا إزاحة" ≠ "لا تغيير".',en:'"No shift" ≠ "no change".'}},
 {id:'E4', c:'c_pres', q:{ar:'لتفاعل $N2(g)+3H2(g)<=>2NH3(g)+Heat$ ، أي مجموعة ظروف تزيد ناتج النشادر عند الاتزان؟',en:'For $N2(g)+3H2(g)<=>2NH3(g)+Heat$, which pair of conditions increases the equilibrium yield of NH₃?'},
  o:[{ar:'زيادة الضغط وخفض الحرارة',en:'Higher pressure and lower temperature'},{ar:'خفض الضغط ورفع الحرارة',en:'Lower pressure and higher temperature'},{ar:'إضافة حفاز فقط',en:'Adding a catalyst only'}], a:0,
  x:{ar:'الضغط ← نحو مولات أقل (طردي)، والتبريد ← نحو الاتجاه الطارد (طردي).',en:'Pressure → fewer moles (forward); cooling → exothermic direction (forward).'}},
 {id:'E5', c:'c_kc', q:{ar:'للتفاعل $2HCl(g)<=>H2(g)+Cl2(g)$ قيمة $K_{p}=2.45×10^{-7}$. ثابت الاتزان للتفاعل المعكوس $H2(g)+Cl2(g)<=>2HCl(g)$ هو:',en:'For $2HCl(g)<=>H2(g)+Cl2(g)$, $K_{p}=2.45×10^{-7}$. For the reverse $H2(g)+Cl2(g)<=>2HCl(g)$, K is:'},
  o:[{ar:'$2.45×10^{-7}$',en:'$2.45×10^{-7}$'},{ar:'$«1|2.45×10^{-7}»$',en:'$«1|2.45×10^{-7}»$'},{ar:'$(2.45×10^{-7})^{2}$',en:'$(2.45×10^{-7})^{2}$'}], a:1,
  x:{ar:'عكس المعادلة ⟸ مقلوب الثابت.',en:'Reversing the equation ⟹ reciprocal constant.'}},
 {id:'E6', c:'c_temp', q:{ar:'سخّنا أنبوبة فيها $2NO2(g)<=>N2O4(g)+Heat$. ما الوصف الأدق لما حدث؟',en:'We heat a tube containing $2NO2(g)<=>N2O4(g)+Heat$. The most accurate description:'},
  o:[{ar:'زاد معدل التفاعلين، وأُزيح الموضع عكسيًا فزاد اللون البني',en:'Both rates increased, and the position shifted backward so the brown colour deepened'},{ar:'زاد معدل التفاعل العكسي فقط',en:'Only the backward rate increased'},{ar:'لم يتغير K',en:'K did not change'}], a:0,
  x:{ar:'تأثيران: سرعة أكبر للاتجاهين + موضع جديد، و K نفسه يتغير مع الحرارة.',en:'Two effects: faster rates both ways + a new position; K itself changes with T.'}},
 {id:'E7', c:'c_phase', q:{ar:'في تعبير $K_{c}$ لتفاعل فيه $H2O(v)$ وتفاعل آخر فيه $H2O(l)$:',en:'In $K_{c}$ for one reaction with $H2O(v)$ and another with $H2O(l)$:'},
  o:[{ar:'يُكتب الماء في الحالتين',en:'Water is written in both'},{ar:'يُكتب البخار (v) ولا يُكتب السائل النقي (l)',en:'Vapour (v) is included; pure liquid (l) is omitted'},{ar:'لا يُكتب في الحالتين',en:'Omitted in both'}], a:1,
  x:{ar:'البخار غاز تركيزه متغير، والسائل النقي تركيزه ثابت.',en:'Vapour is a gas with variable concentration; a pure liquid’s is constant.'}}
];

/* Behavioural objectives (review: pending teacher approval) + one-screen summary ("infographic") per unit */
const UNIT_EXTRA = {
 u1:{obj:[
   {ar:'يفسّر المقصود بالاتزان الديناميكي في نظام مغلق.',en:'Explain dynamic equilibrium in a closed system.'},
   {ar:'يميّز بين تساوي معدلي التفاعل وثبات التركيزات.',en:'Distinguish equal rates from constant concentrations.'},
   {ar:'يتنبأ باتجاه إزاحة الاتزان عند تغيير تركيز مادة متفاعلة أو ناتجة.',en:'Predict the shift when a reactant or product concentration changes.'},
   {ar:'يطبّق مبدأ لوشاتيليه على أمثلة بسيطة.',en:"Apply Le Chatelier's principle to simple examples."}],
  sum:[{i:'🔁',t:{ar:'اتزان ديناميكي',en:'Dynamic equilibrium'},d:{ar:'التفاعلان مستمران بنفس المعدل',en:'Both reactions continue at equal rates'}},
   {i:'📊',t:{ar:'التركيزات',en:'Concentrations'},d:{ar:'ثابتة… وليست بالضرورة متساوية',en:'Constant… not necessarily equal'}},
   {i:'➕',t:{ar:'زيادة متفاعل',en:'Add a reactant'},d:{ar:'إزاحة طردية',en:'Forward shift'}},
   {i:'➖',t:{ar:'زيادة ناتج',en:'Add a product'},d:{ar:'إزاحة عكسية',en:'Backward shift'}}]},
 u2:{obj:[
   {ar:'يكتب تعبيري معدل التفاعل الطردي والعكسي للمثال المدرسي.',en:'Write the forward and backward rate expressions for the school example.'},
   {ar:'يستنتج أن $K_{c}=«k_{f}|k_{b}»$ عند تساوي المعدلين.',en:'Derive $K_{c}=«k_{f}|k_{b}»$ when the two rates are equal.'},
   {ar:'يوضّح أن معامل المادة في المعادلة الموزونة يصبح أسًا لتركيزها.',en:'Show that a coefficient in the balanced equation becomes a power.'},
   {ar:'يفسّر تغيّر شدة اللون الأحمر عند إضافة متفاعل أو ناتج.',en:'Explain the change in red colour when a reactant or product is added.'}],
  sum:[{i:'⚖️',t:{ar:'عند الاتزان',en:'At equilibrium'},d:{ar:'$r_{f}=r_{b}$',en:'$r_{f}=r_{b}$'}},
   {i:'🧮',t:{ar:'ثابت الاتزان',en:'Equilibrium constant'},d:{ar:'$K_{c}=«k_{f}|k_{b}»$',en:'$K_{c}=«k_{f}|k_{b}»$'}},
   {i:'³',t:{ar:'المعامل',en:'The coefficient'},d:{ar:'يصبح أسًا: $[NH4SCN]^{3}$',en:'Becomes a power: $[NH4SCN]^{3}$'}},
   {i:'🔴',t:{ar:'تجربة اللون',en:'Colour test'},d:{ar:'+$FeCl3$ أغمق · +$NH4Cl$ أفتح',en:'+$FeCl3$ deeper · +$NH4Cl$ paler'}}]},
 u3:{obj:[
   {ar:'يكتب تعبير $K_{c}$ من معادلة موزونة.',en:'Write the $K_{c}$ expression from a balanced equation.'},
   {ar:'يستبعد المواد الصلبة النقية والسوائل النقية من التعبير.',en:'Omit pure solids and pure liquids from the expression.'},
   {ar:'يميّز بين السائل (l) والبخار (v) عند كتابة التعبير.',en:'Distinguish liquid (l) from vapour (v) when writing the expression.'},
   {ar:'يفسّر دلالة القيمة الكبيرة جدًا والصغيرة جدًا لـ $K_{c}$.',en:'Interpret very large and very small values of $K_{c}$.'}],
  sum:[{i:'⬆️',t:{ar:'النواتج',en:'Products'},d:{ar:'في البسط',en:'On top'}},
   {i:'⬇️',t:{ar:'المتفاعلات',en:'Reactants'},d:{ar:'في المقام',en:'On the bottom'}},
   {i:'🚫',t:{ar:'(s) و (l)',en:'(s) and (l)'},d:{ar:'لا تُكتب',en:'Not written'}},
   {i:'✅',t:{ar:'(g) و (v) و (aq)',en:'(g), (v), (aq)'},d:{ar:'تُكتب',en:'Written'}}]},
 u4:{obj:[
   {ar:'يميّز بين التفاعل الطارد والماص للحرارة.',en:'Distinguish exothermic from endothermic reactions.'},
   {ar:'يتنبأ بأثر التسخين والتبريد على موضع الاتزان.',en:'Predict the effect of heating and cooling on the equilibrium position.'},
   {ar:'يفسّر لماذا تغيّر الحرارة قيمة K بينما لا يغيّرها تغيير التركيز.',en:'Explain why temperature changes K while concentration does not.'},
   {ar:'يوضّح أن التسخين يزيد معدل التفاعلين الطردي والعكسي.',en:'Show that heating speeds up both forward and backward reactions.'}],
  sum:[{i:'🔥',t:{ar:'طارد + تسخين',en:'Exothermic + heat'},d:{ar:'إزاحة عكسية · K ↓',en:'Backward shift · K ↓'}},
   {i:'❄️',t:{ar:'طارد + تبريد',en:'Exothermic + cool'},d:{ar:'إزاحة طردية · K ↑',en:'Forward shift · K ↑'}},
   {i:'🌡️',t:{ar:'ماص + تسخين',en:'Endothermic + heat'},d:{ar:'إزاحة طردية · K ↑',en:'Forward shift · K ↑'}},
   {i:'⚡',t:{ar:'التسخين',en:'Heating'},d:{ar:'يسرّع التفاعلين',en:'Speeds up both reactions'}}]},
 u5:{obj:[
   {ar:'يتنبأ بأثر زيادة الضغط أو نقصه على الاتزانات الغازية.',en:'Predict the effect of raising or lowering pressure on gaseous equilibria.'},
   {ar:'يحسب عدد المولات الغازية فقط في طرفي المعادلة.',en:'Count gas moles only on each side of the equation.'},
   {ar:'يوضّح أن عدم إزاحة الاتزان لا يعني عدم تغيّر التركيزات.',en:'Explain that "no shift" does not mean concentrations stay the same.'},
   {ar:'يكتب تعبير $K_{p}$ باستخدام الضغوط الجزئية.',en:'Write the $K_{p}$ expression using partial pressures.'}],
  sum:[{i:'🗜️',t:{ar:'ضغط ↑',en:'Pressure ↑'},d:{ar:'نحو المولات الغازية الأقل',en:'Toward fewer gas moles'}},
   {i:'🎈',t:{ar:'ضغط ↓',en:'Pressure ↓'},d:{ar:'نحو المولات الغازية الأكثر',en:'Toward more gas moles'}},
   {i:'🟰',t:{ar:'مولات متساوية',en:'Equal moles'},d:{ar:'لا إزاحة… لكن التركيزات ↑',en:'No shift… but concentrations ↑'}},
   {i:'🔒',t:{ar:'$K_{c}$ و $K_{p}$',en:'$K_{c}$ and $K_{p}$'},d:{ar:'ثابتان عند ثبوت الحرارة',en:'Unchanged at constant T'}}]},
 u6:{obj:[
   {ar:'يوضّح أن العامل الحفاز يوفّر مسارًا بديلًا بطاقة تنشيط أقل.',en:'Explain that a catalyst provides an alternative pathway with lower activation energy.'},
   {ar:'يفسّر لماذا لا يزيح العامل الحفاز موضع الاتزان.',en:'Explain why a catalyst does not shift the equilibrium position.'},
   {ar:'يميّز بين ما يغيّره الحفاز (المعدل وطاقة التنشيط) وما لا يغيّره ($ΔH$ و K والموضع).',en:'Distinguish what a catalyst changes (rate, Ea) from what it does not ($ΔH$, K, position).'}],
  sum:[{i:'⛰️',t:{ar:'طاقة التنشيط',en:'Activation energy'},d:{ar:'يقلّلها للاتجاهين بنفس المقدار',en:'Lowered equally for both directions'}},
   {i:'⚡',t:{ar:'المعدل',en:'Rate'},d:{ar:'الطردي والعكسي يزيدان معًا',en:'Forward and backward both increase'}},
   {i:'⏱️',t:{ar:'الاتزان',en:'Equilibrium'},d:{ar:'يُوصَل إليه أسرع',en:'Reached sooner'}},
   {i:'🔒',t:{ar:'$ΔH$ و K والموضع',en:'$ΔH$, K, position'},d:{ar:'لا تتغير',en:'Unchanged'}}]}
};
