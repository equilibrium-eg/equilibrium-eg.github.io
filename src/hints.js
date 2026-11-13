/* ============ ACQUIRE KNOWLEDGE (free, content-based) ============
   HINTS[id] = { h:[hint1, hint2], w:{ optionIndex: why-this-is-wrong } }
   Level 3 (solution) = the question's own correct option + explanation (x).
*/
const HINTS = {
 Q1a:{h:[{ar:'فكّر: الاتزان "ساكن" ولا "ديناميكي"؟',en:'Think: is equilibrium static or dynamic?'},{ar:'ديناميكي يعني التفاعلين شغالين. هل ينفع واحد منهم يقف؟',en:'Dynamic means both reactions run. Can one of them stop?'}],
   w:{0:{ar:'لو التفاعل الطردي وقف، كان التفاعل العكسي هيستهلك النواتج والتركيزات هتتغير — لكن عند الاتزان التركيزات ثابتة.',en:'If the forward reaction stopped, the backward one would consume products and concentrations would change — yet at equilibrium they are constant.'}}},
 Q1b:{h:[{ar:'لما نسحب مادة، النظام بيحاول يعمل إيه؟ يعوّضها ولا يستهلكها؟',en:'When we remove a substance, does the system replace it or consume it?'},{ar:'النظام هيعوّض جزء من المتفاعل المسحوب — يعني هيكوّن متفاعلات. ده أنهي اتجاه؟',en:'It replaces some of the removed reactant — i.e. it forms reactants. Which direction is that?'}],
   w:{0:{ar:'الطردي بيستهلك المتفاعلات أكتر، وده عكس اللي النظام محتاجه بعد ما قلّ المتفاعل.',en:'Forward would consume even more reactant — the opposite of what the system needs.'},2:{ar:'أي تغيير في التركيز بيأثر على الاتزان؛ النظام لازم يستجيب.',en:'Any concentration change disturbs equilibrium; the system must respond.'}}},
 Q1c:{h:[{ar:'المبدأ بيقول النظام "يقلل" أثر التغيير. هل "يقلل" زي "يلغي"؟',en:'The principle says the system "opposes" the change. Is opposing the same as cancelling?'},{ar:'بعد الإضافة النظام بيوصل لاتزان جديد — مش لنفس الحالة القديمة.',en:'After the addition the system reaches a new equilibrium — not the old one.'}],
   w:{0:{ar:'النظام بيستهلك جزء بس من المادة المضافة، فيوصل لاتزان جديد مختلف عن الأصلي.',en:'The system consumes only part of the added substance, reaching a new, different equilibrium.'}}},
 Q2a:{h:[{ar:'عند الاتزان إيه العلاقة بين المعدل الطردي والعكسي؟',en:'At equilibrium, how are the forward and backward rates related?'},{ar:'لو rf = rb، اقسم ثابت المعدل الطردي على العكسي — ده بيدّي إيه؟',en:'If rf = rb, divide kf by kb — what does that give?'}],
   w:{1:{ar:'المعدل الطردي مش صفر عند الاتزان؛ التفاعلين شغالين.',en:'The forward rate is not zero at equilibrium; both reactions run.'},2:{ar:'Kc نسبة (قسمة) بين الثابتين، مش حاصل ضربهم.',en:'Kc is a ratio (division) of the two constants, not their product.'}}},
 Q2b:{h:[{ar:'NH₄Cl موجود في أنهي جانب من المعادلة؟',en:'Which side of the equation is NH₄Cl on?'},{ar:'إضافة ناتج ← النظام يستهلكه ← إزاحة عكسية. الإزاحة العكسية بتقلل المادة الملونة ولا بتزودها؟',en:'Adding a product → the system consumes it → backward shift. Does that increase or decrease the coloured product?'}],
   w:{0:{ar:'اللون بيغمق لما نضيف متفاعل (FeCl₃)، لكن NH₄Cl ناتج.',en:'Colour deepens when we add a reactant (FeCl₃), but NH₄Cl is a product.'},2:{ar:'إضافة ناتج بتزيح الاتزان، فاللون لازم يتغير.',en:'Adding a product shifts equilibrium, so the colour must change.'}}},
 Q3a:{h:[{ar:'بص على الحالة الفيزيائية لكل مادة: (l) و (g).',en:'Look at each state symbol: (l) and (g).'},{ar:'السائل النقي (l) تركيزه ثابت فمش بيتكتب. يبقى فاضل مين في التعبير؟',en:'A pure liquid (l) is omitted. What is left in the expression?'}],
   w:{0:{ar:'السائل النقي ما بيتكتبش في تعبير Kc.',en:'The pure liquid is not written in Kc.'},2:{ar:'Kc مش رقم ثابت 1؛ بيساوي تركيز الغاز عند الاتزان.',en:'Kc is not simply 1; it equals the gas concentration at equilibrium.'}}},
 Q3b:{h:[{ar:'افتكر مثال: 2H₂O(v) ⇌ 2H₂ + O₂ — الـ 2 اتكتبت إزاي في Kc؟',en:'Recall 2H₂O(v) ⇌ 2H₂ + O₂ — how did the 2 appear in Kc?'},{ar:'اتكتبت [H₂]² — يعني الرقم بقى إيه؟',en:'It became [H₂]² — so the number became what?'}],
   w:{0:{ar:'المعامل مش بيتضرب في التركيز؛ بيبقى أُس.',en:'The coefficient does not multiply; it becomes a power.'},2:{ar:'المعامل مهم جدًا ولازم يظهر كأُس.',en:'The coefficient matters and must appear as a power.'}}},
 Q4a:{h:[{ar:'التفاعل طارد ← الحرارة مكتوبة مع النواتج. التسخين هيزيح لأنهي اتجاه؟',en:'Exothermic → heat is with the products. Heating shifts which way?'},{ar:'الإزاحة العكسية بتقلل النواتج. لو النواتج قلّت (في البسط)، K هيعمل إيه؟',en:'A backward shift lowers products (numerator). What happens to K?'}],
   w:{0:{ar:'K بيزيد بالتسخين للتفاعل الماص، مش الطارد.',en:'K increases on heating for endothermic reactions, not exothermic.'},2:{ar:'الحرارة هي العامل الوحيد اللي بيغير قيمة K.',en:'Temperature is the one factor that does change K.'}}},
 Q4b:{h:[{ar:'فيه تأثيرين منفصلين للحرارة: على "السرعة" وعلى "الموضع".',en:'Heat has two separate effects: on rate and on position.'},{ar:'التسخين بيسرّع الاتجاهين، والموضع بيتزاح ناحية الاتجاه الماص للحرارة.',en:'Heating speeds both directions; the position moves toward the endothermic direction.'}],
   w:{1:{ar:'التسخين بيزود معدل التفاعلين الطردي والعكسي، مش واحد بس.',en:'Heating increases both rates, not just one.'},2:{ar:'التسخين عمومًا بيزود معدل التفاعل.',en:'Heating generally increases reaction rate.'}}},
 Q5a:{h:[{ar:'الضغط الكلي = مجموع الضغوط الجزئية.',en:'Total pressure = sum of partial pressures.'},{ar:'اجمع: 2 + 5 + 7',en:'Add: 2 + 5 + 7'}],
   w:{1:{ar:'إحنا بنجمع الضغوط الجزئية، مش بنضربها.',en:'We add partial pressures, not multiply them.'},2:{ar:'7 atm ده ضغط غاز واحد بس، مش الكلي.',en:'7 atm is one gas only, not the total.'}}},
 Q5b:{h:[{ar:'عِد المولات الغازية: يسار (1 + 3) ويمين (2).',en:'Count gas moles: left (1 + 3), right (2).'},{ar:'تقليل الضغط ← الجانب اللي فيه مولات غازية أكتر. ده أنهي جانب؟',en:'Lower pressure → the side with more gas moles. Which side?'}],
   w:{0:{ar:'الإزاحة الطردية بتقلل عدد المولات — وده بيحصل لما الضغط يزيد مش يقل.',en:'Forward reduces moles — that happens when pressure increases, not decreases.'},2:{ar:'عدد المولات مش متساوي (4 مقابل 2)، فالضغط بيأثر.',en:'Moles are unequal (4 vs 2), so pressure has an effect.'}}},
 Q6a:{h:[{ar:'الحفاز بيوفّر "طريق تاني" للتفاعل. الطريق ده إيه اللي بيتغير فيه؟',en:'A catalyst offers another path. What changes on that path?'},{ar:'بص على منحنى الطاقة: مستوى المتفاعلات والنواتج ثابت، القمة بس اللي بتنزل.',en:'Look at the energy profile: reactant/product levels stay; only the peak drops.'}],
   w:{0:{ar:'ΔH هو فرق الطاقة بين المتفاعلات والنواتج، والحفاز ما بيغيرهمش.',en:'ΔH is the reactant–product energy gap; a catalyst does not change it.'},2:{ar:'الحفاز ما بيغيرش ثابت الاتزان ولا موضعه.',en:'A catalyst changes neither K nor the position.'}}},
 Q6b:{h:[{ar:'الحفاز بيأثر على الاتجاه الطردي بس ولا الاتنين؟',en:'Does a catalyst affect only forward, or both?'},{ar:'لو الاتجاهين اتسرّعوا بنفس القدر، هل في اتجاه "اتفضّل" على التاني؟',en:'If both speed up equally, is either direction favoured?'}],
   w:{1:{ar:'الحفاز ما بيُستهلكش في التفاعل.',en:'A catalyst is not consumed.'},2:{ar:'الحفاز بيسرّع التفاعل العكسي كمان، مش بيبطّأه.',en:'A catalyst speeds up the backward reaction too.'}}},
 E1:{h:[{ar:'فرّق بين "المعدل" (سرعة التحول) و"الكمية" (التركيز).',en:'Separate "rate" (speed of conversion) from "amount" (concentration).'},{ar:'في محاكاة الدرس 1: المعدلين بقوا متساويين، لكن عدد الجسيمات الزرقا والبرتقاني كان متساوي؟',en:'In the Unit 1 simulation the rates became equal — were the blue and orange counts equal?'}],
   w:{0:{ar:'تساوي المعدلين لا يعني تساوي التركيزات.',en:'Equal rates do not imply equal concentrations.'},2:{ar:'القاعدة دي مش متعلقة بالحالة الغازية؛ التركيزات عمومًا مش لازم تتساوى.',en:'This has nothing to do with gases; concentrations need not be equal in general.'}}},
 E2:{h:[{ar:'الحفاز بيأثر على "السرعة" ولا على "الموضع"؟',en:'Does a catalyst affect rate or position?'},{ar:'المشكلة هنا إن التبريد بيبطّأ التفاعل. مين بيحل مشكلة البطء من غير ما يغير الناتج؟',en:'The problem is that cooling slows the reaction. What fixes slowness without changing yield?'}],
   w:{0:{ar:'الحفاز ما بيغيرش الناتج عند الاتزان.',en:'A catalyst does not change the equilibrium yield.'},2:{ar:'الحفاز ما بيغيرش ΔH.',en:'A catalyst does not change ΔH.'}}},
 E3:{h:[{ar:'عِد المولات الغازية في الجانبين.',en:'Count gas moles on both sides.'},{ar:'2 = 2 يعني مفيش إزاحة… بس لما الحجم يبقى النص، التركيز بيحصله إيه؟',en:'2 = 2 means no shift… but when volume halves, what happens to concentration?'}],
   w:{0:{ar:'الموضع ما اتغيرش فعلًا، لكن تركيزات كل الغازات زادت بالانضغاط.',en:'The position is unchanged, but all gas concentrations rose on compression.'},2:{ar:'عدد المولات متساوي، فمفيش إزاحة طردية.',en:'Moles are equal, so there is no forward shift.'}}},
 E4:{h:[{ar:'فكّر في كل عامل لوحده: الضغط، وبعدين الحرارة.',en:'Think about each factor alone: pressure, then temperature.'},{ar:'المولات 4 ← 2، والحرارة مع النواتج. أنهي ظروف تزيح الاتنين طرديًا؟',en:'Moles 4 → 2, heat with products. Which conditions push both forward?'}],
   w:{1:{ar:'خفض الضغط ورفع الحرارة الاتنين بيزيحوا عكسيًا هنا.',en:'Lower pressure and higher temperature both shift backward here.'},2:{ar:'الحفاز بيسرّع الوصول بس، ما بيزودش الناتج.',en:'A catalyst only speeds things up; it does not raise the yield.'}}},
 E5:{h:[{ar:'التفاعل اتكتب بالعكس — المتفاعلات بقت نواتج.',en:'The reaction is written in reverse — reactants became products.'},{ar:'لو البسط والمقام اتبدلوا، القيمة الجديدة = ؟',en:'If numerator and denominator swap, the new value = ?'}],
   w:{0:{ar:'القيمة دي للاتجاه الأصلي بس؛ لازم تتغير لما نعكس المعادلة.',en:'That value belongs only to the original direction.'},2:{ar:'التربيع بيحصل لما نضرب المعاملات في 2، مش لما نعكس.',en:'Squaring is for doubling coefficients, not reversing.'}}},
 E6:{h:[{ar:'التسخين له تأثيرين: على السرعة وعلى الموضع.',en:'Heating has two effects: rate and position.'},{ar:'الحرارة مع النواتج ← الطردي طارد ← التسخين يزيح لأنهي اتجاه؟ وده بيكوّن أنهي غاز؟',en:'Heat with products → forward exothermic → heating shifts which way? Forming which gas?'}],
   w:{1:{ar:'التسخين بيزود معدل التفاعلين، مش العكسي بس.',en:'Heating increases both rates, not just the backward one.'},2:{ar:'الحرارة هي العامل اللي بيغير K.',en:'Temperature is what changes K.'}}},
 E7:{h:[{ar:'بص على الرمز: (v) و (l) — مين فيهم غاز؟',en:'Look at (v) and (l) — which is a gas?'},{ar:'البخار غاز تركيزه بيتغير، والسائل النقي تركيزه ثابت.',en:'Vapour is a gas with changing concentration; a pure liquid’s is constant.'}],
   w:{0:{ar:'السائل النقي (l) ما بيتكتبش.',en:'The pure liquid (l) is not written.'},2:{ar:'البخار (v) غاز، فلازم يتكتب.',en:'Vapour (v) is a gas, so it is included.'}}}
};

/* Concept explainers: simple explanation + example + where to practise */
const EXPLAIN = {
 c_dyn:{s:{ar:'الاتزان الديناميكي: التفاعل الطردي والعكسي شغالين طول الوقت وبنفس المعدل، عشان كده الكميات بتفضل ثابتة. زي سلّم متحرك والناس طالعة ونازلة بنفس العدد في الدقيقة.',en:'Dynamic equilibrium: forward and backward reactions keep running at the same rate, so amounts stay constant — like people going up and down an escalator at the same rate.'},
   q:{ar:'سؤال ليك: عند الاتزان، هل التفاعل وقف؟',en:'Your turn: at equilibrium, has the reaction stopped?'}},
 c_conc:{s:{ar:'عند الاتزان التركيزات ثابتة، لكن مش لازم تكون متساوية. "تساوي المعدلات" ≠ "تساوي الكميات".',en:'At equilibrium concentrations are constant but not necessarily equal. Equal rates ≠ equal amounts.'},
   q:{ar:'في محاكاة الدرس 1: بعد الاتزان، عدد الجسيمات الزرقا والبرتقاني متساوي؟',en:'In the Unit 1 simulation, after equilibrium, are blue and orange counts equal?'}},
 c_lec:{s:{ar:'مبدأ لوشاتيليه: لو غيّرت حاجة في نظام متزن، النظام يتزاح في الاتجاه اللي يقلل أثر التغيير. ضفت مادة؟ يستهلك جزء منها. سحبت مادة؟ يعوّض جزء منها.',en:"Le Chatelier: change something and the system shifts to oppose it. Added a substance? It consumes some. Removed one? It replaces some."},
   q:{ar:'جرّب: لو زوّدنا متفاعل، الاتزان هيتزاح فين؟',en:'Try: if we add a reactant, which way will it shift?'}},
 c_mass:{s:{ar:'قانون فعل الكتلة (مدرسيًا): معدل التفاعل بيعتمد على تركيز المواد المتفاعلة مرفوعة لأُس معاملاتها. عند الاتزان rf = rb، ومنها Kc = kf / kb.',en:'Mass action (school level): rate depends on reactant concentrations raised to their coefficients. At equilibrium rf = rb, giving Kc = kf / kb.'},
   q:{ar:'في FeCl₃ + 3NH₄SCN، الـ 3 هتظهر إزاي في معدل التفاعل الطردي؟',en:'In FeCl₃ + 3NH₄SCN, how does the 3 appear in the forward rate?'}},
 c_kc:{s:{ar:'خطوات Kc: (1) النواتج فوق (2) المتفاعلات تحت (3) المعامل يبقى أُس (4) الصلب والسائل النقي ما يتكتبوش.',en:'Kc steps: (1) products on top (2) reactants below (3) coefficient → power (4) omit pure solids and liquids.'},
   q:{ar:'جرّب "مُنشئ تعبير Kc" في الدرس 3.',en:'Try the Kc builder in Unit 3.'}},
 c_phase:{s:{ar:'(s) صلب و (l) سائل نقي: تركيزهم ثابت فما بيتكتبوش في Kc. (g) غاز و (aq) محلول و (v) بخار: بيتكتبوا.',en:'(s) solid and (l) pure liquid: constant, so omitted. (g), (aq) and (v) vapour: included.'},
   q:{ar:'في NH₃(l) ⇌ NH₃(g)، مين هيتكتب في Kc؟',en:'In NH₃(l) ⇌ NH₃(g), what goes into Kc?'}},
 c_temp:{s:{ar:'الحرارة: حدّد الأول الحرارة مكتوبة فين. التسخين يزيح بعيد عن الحرارة (ناحية الاتجاه الماص)، والتبريد يزيح ناحيتها (الاتجاه الطارد).',en:'Temperature: first find where heat is written. Heating shifts toward the endothermic direction; cooling toward the exothermic one.'},
   q:{ar:'في 2NO₂ ⇌ N₂O₄ + حرارة، لو سخّنا اللون البني هيغمق ولا يفتح؟',en:'In 2NO₂ ⇌ N₂O₄ + heat, will heating deepen or fade the brown?'}},
 c_ktemp:{s:{ar:'قيمة K بتتغير بالحرارة بس. تغيير التركيز أو الضغط بيزيح الاتزان من غير ما يغير K. التسخين: K يقل للطارد ويزيد للماص.',en:'K changes only with temperature. Concentration or pressure changes shift equilibrium without changing K. Heating: K falls for exothermic, rises for endothermic.'},
   q:{ar:'لو ضفنا متفاعل عند نفس درجة الحرارة، K هيتغير؟',en:'If we add a reactant at the same temperature, does K change?'}},
 c_pres:{s:{ar:'الضغط: عِد المولات الغازية بس. زيادة الضغط (تصغير الحجم) ← ناحية المولات الأقل. لو متساويين ← مفيش إزاحة، بس التركيزات بتزيد.',en:'Pressure: count gas moles only. Higher pressure (smaller volume) → fewer moles. Equal → no shift, but concentrations rise.'},
   q:{ar:'في N₂ + 3H₂ ⇌ 2NH₃، كام مول غاز في كل جانب؟',en:'In N₂ + 3H₂ ⇌ 2NH₃, how many gas moles on each side?'}},
 c_kp:{s:{ar:'الضغط الكلي = مجموع الضغوط الجزئية. Kp زي Kc بالظبط بس بنستخدم الضغوط الجزئية بدل التركيزات.',en:'Total pressure = sum of partial pressures. Kp is like Kc but uses partial pressures.'},
   q:{ar:'جرّب حاسبة Kp في الدرس 5.',en:'Try the Kp calculator in Unit 5.'}},
 c_cat:{s:{ar:'العامل الحفاز بيعمل "طريق مختصر" بطاقة تنشيط أقل للاتجاهين بنفس القدر، فبيوصل للاتزان أسرع — لكن ما بيغيرش الموضع ولا K ولا ΔH.',en:'A catalyst opens a shortcut with lower activation energy for both directions equally, so equilibrium comes sooner — but position, K and ΔH are unchanged.'},
   q:{ar:'جرّب "سباق الوصول للاتزان" في الدرس 6.',en:'Try the "race to equilibrium" in Unit 6.'}}
};

/* Keyword map (normalized Arabic + English) → concept */
const KEYS = {
 c_dyn:['ديناميك','يتوقف','وقف','توقف','ساكن','اتزان كيميائي','dynamic','stop','static'],
 c_conc:['متساوي','تساوي','نفس الكميه','equal','same amount'],
 c_lec:['شاتيليه','شاتليه','لوشاتيليه','ازاحه','يزاح','اضافه','سحب','تركيز','chatelier','shift','add','remove','concentration'],
 c_mass:['فعل الكتله','معدل التفاعل','kf','kb','ثابت المعدل','mass action','rate','fecl','scn','ثيوسيانات','لون احمر'],
 c_kc:['kc','ثابت الاتزان','تعبير','بسط','مقام','اس','constant','expression'],
 c_phase:['صلب','سائل','بخار','(s)','(l)','(v)','solid','liquid','vapour','vapor','حاله فيزيائيه'],
 c_temp:['حراره','تسخين','سخن','تبريد','برد','طارد','ماص','no2','n2o4','بني','temperature','heat','cool','exothermic','endothermic'],
 c_ktemp:['k يتغير','قيمه k','تتغير k','k change'],
 c_pres:['ضغط','حجم','مكبس','مولات','pressure','volume','piston','moles'],
 c_kp:['kp','ضغط جزئي','ضغوط جزئيه','ضغط كلي','partial','total pressure'],
 c_cat:['حفاز','عامل مساعد','طاقه التنشيط','تنشيط','catalyst','activation']
};
