// Generates the deck: node build.js && python3 rtlfix.py presentation.pptx  (needs pptxgenjs, react, react-dom, react-icons, sharp; applyTheme comes from the pptx skill)
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const React = require('react');
const RDS = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa');
const { applyTheme } = require('/root/.claude/skills/synced/5f102cdb-e019-4550-abaf-d94c52ffb40a_7d619d44-619a-4b1a-815e-a66fef9a4d2b/pptx/scripts/apply_theme.js');

const THEME = {
  name: 'Equilibrium',
  headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: '1C2A3F', lt1: 'FFFFFF', dk2: '1B3358', lt2: 'EEF4FC',
    accent1: '1D5FC2', accent2: '0D8A5B', accent3: '6A44C2', accent4: 'F2B33D', accent5: 'E0474C', accent6: '5B6B82',
    hlink: '1D5FC2', folHlink: '6A44C2' }
};
const HEX = { navy: '1B3358', blue: '1D5FC2', green: '0D8A5B', purple: '6A44C2', amber: 'F2B33D', red: 'E0474C', slate: '5B6B82',
  ink: '1C2A3F', ice: 'EEF4FC', blueSoft: 'E7F0FD', greenSoft: 'E5F7EE', purpleSoft: 'F0EAFD', amberSoft: 'FFF4DC', line: 'DBE6F5', white: 'FFFFFF' };

async function icon(Comp, color = 'FFFFFF', size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color: '#' + color, size }));
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}
async function svgPng(svg, w) {
  const buf = await sharp(Buffer.from(svg), { density: 300 }).resize({ width: w }).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}
const ART = new Function(fs.readFileSync('' + __dirname + '/../../src/art.js', 'utf8') + ';return ART')();
const shot = f => ({ path: '' + __dirname + '/shots/' + f });
const imgSize = f => { const b = fs.readFileSync('' + __dirname + '/shots/' + f); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
function fit(f, maxW, maxH) { const s = imgSize(f); const r = Math.min(maxW / s.w, maxH / s.h); return { w: s.w * r, h: s.h * r }; }

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pres.title = 'الاتزان الكيميائي — منصة تعلّم تكيّفية';
  pres.author = 'أروى يوسف';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 13.333, H = 7.5;
  const RTL = { rtlMode: true, align: 'right' };

  pres.defineSlideMaster({ title: 'COVER', background: { color: HEX.navy },
    objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 5.2, y: 2.1, w: 7.4, h: 1.4, fontSize: 54, bold: true, color: C.background1, align: 'right', rtlMode: true, valign: 'bottom' }, text: '' } }] });
  pres.defineSlideMaster({ title: 'CONTENT', background: { color: HEX.white },
    objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.35, w: 12.13, h: 0.85, fontSize: 34, bold: true, color: C.text2, align: 'right', rtlMode: true, valign: 'middle' }, text: '' } }],
    slideNumber: { x: 0.5, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6 } });
  pres.defineSlideMaster({ title: 'CLOSING', background: { color: HEX.navy },
    objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.45, w: 12.13, h: 0.85, fontSize: 34, bold: true, color: C.background1, align: 'right', rtlMode: true, valign: 'middle' }, text: '' } }] });

  const robot = await svgPng(ART.robot(240), 900);
  const flasks = await svgPng(ART.flasks(), 900);
  const card = (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.15, fill: { color: fill }, line: { color: HEX.line, width: 0.75 }, objectName: name });
  const circleIcon = async (s, Comp, x, y, d, fill, name) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: 'none' }, objectName: name + '-bg' });
    s.addImage({ data: await icon(Comp), x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52, objectName: name + '-icon', altText: '' });
  };
  const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 15, color: C.text1, margin: 0, ...RTL, valign: 'top' }, o));

  /* ---------- 1. Cover ---------- */
  pres.addSection({ title: 'المقدمة' });
  let s = pres.addSlide({ masterName: 'COVER', sectionTitle: 'المقدمة' });
  s.addText('الاتزان الكيميائي', { placeholder: 'title' });
  T(s, 'منصة تعلّم رقمية تكيّفية لطلاب الصف الثالث الثانوي', { x: 4.7, y: 3.6, w: 7.9, h: 0.6, fontSize: 24, color: 'CADCFC' });
  T(s, 'اختبار تشخيصي · ثلاثة مسارات تعلم · محاكاة تفاعلية · مساعد ذكي', { x: 4.7, y: 4.25, w: 7.9, h: 0.5, fontSize: 16, color: '9FB6D6' });
  T(s, 'أروى يوسف', { x: 4.7, y: 5.3, w: 7.9, h: 0.5, fontSize: 18, bold: true, color: HEX.amber });
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 1.4, w: 3.6, h: 3.6, fill: { color: '22416D' }, line: { type: 'none' }, objectName: 'robot-halo' });
  s.addImage({ data: robot, x: 1.35, y: 1.65, w: 2.7, h: 2.92, altText: 'شخصية المساعد الذكي Acquire', objectName: 'robot' });
  s.addImage({ data: flasks, x: 1.2, y: 5.0, w: 2.9, h: 1.98, altText: 'دوارق كيميائية', objectName: 'flasks' });
  s.addNotes('نقدّم منصة "الاتزان الكيميائي": بيئة تعلّم رقمية تكيّفية لطلاب الصف الثالث الثانوي، تشمل اختبارًا تشخيصيًا وثلاثة مسارات تعلم ومحاكاة تفاعلية ومساعدًا ذكيًا اسمه Acquire.');

  /* ---------- 2. Idea ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المقدمة' });
  s.addText('الفكرة: تعلّم يتكيّف مع مستوى كل طالب', { placeholder: 'title' });
  card(s, 6.9, 1.55, 5.83, 3.7, HEX.ice, 'problem-card');
  await circleIcon(s, fa.FaExclamationTriangle, 11.75, 1.8, 0.75, HEX.red, 'problem');
  T(s, 'المشكلة', { x: 7.2, y: 1.85, w: 4.4, h: 0.6, fontSize: 22, bold: true, color: C.text2 });
  T(s, [
    { text: 'الطلاب في الفصل الواحد يختلفون في مستوى فهمهم للاتزان الكيميائي، والشرح الموحّد لا يراعي هذه الفروق.', options: { bullet: true, breakLine: true } },
    { text: 'عمليات الاتزان غير مرئية (التفاعلان الطردي والعكسي مستمران) فيصعب تخيّلها من الكتاب.', options: { bullet: true, breakLine: true } },
    { text: 'المعلمة لا ترى بسهولة أين يتعثر كل طالب بالتحديد.', options: { bullet: true } }
  ], { x: 7.2, y: 2.65, w: 5.25, h: 2.5, paraSpaceAfter: 8 });
  card(s, 0.6, 1.55, 5.83, 3.7, HEX.greenSoft, 'goal-card');
  await circleIcon(s, fa.FaBullseye, 5.45, 1.8, 0.75, HEX.green, 'goal');
  T(s, 'الهدف', { x: 0.9, y: 1.85, w: 4.4, h: 0.6, fontSize: 22, bold: true, color: C.text2 });
  T(s, [
    { text: 'تحديد مستوى كل طالب على مستوى المفهوم، وليس بالدرجة الكلية فقط.', options: { bullet: true, breakLine: true } },
    { text: 'توجيهه لمسار تعلم مناسب مع محاكاة تجعل الاتزان "مرئيًا".', options: { bullet: true, breakLine: true } },
    { text: 'دعم فوري بمساعد ذكي، ومتابعة لحظية للمعلمة.', options: { bullet: true } }
  ], { x: 0.9, y: 2.65, w: 5.25, h: 2.5, paraSpaceAfter: 8 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.6, w: 12.13, h: 1.0, rectRadius: 0.15, fill: { color: HEX.navy }, line: { type: 'none' }, objectName: 'question-band' });
  T(s, 'السؤال المحوري للدرس: كيف يستجيب النظام المتزن عندما نغيّر التركيز أو الحرارة أو الضغط؟ (مبدأ لوشاتيليه)', { x: 0.9, y: 5.6, w: 11.55, h: 1.0, fontSize: 18, bold: true, color: C.background1, valign: 'middle' });
  s.addNotes('المشكلة: فروق فردية بين الطلاب، وصعوبة تخيّل الاتزان الديناميكي، وصعوبة المتابعة الفردية. الهدف: منصة تشخّص على مستوى المفهوم وتوجّه كل طالب لمسار مناسب.');

  /* ---------- 3. Method ---------- */
  pres.addSection({ title: 'المنهجية والبيانات' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنهجية والبيانات' });
  s.addText('منهجية العمل: البحث القائم على التصميم (DBR)', { placeholder: 'title' });
  const stages = [
    ['التحليل', 'المنهج، احتياجات المعلمة، المفاهيم الخاطئة', fa.FaSearch, 'done'],
    ['التصميم', 'المسارات الثلاثة، رحلة الطالب، الواجهة', fa.FaPencilRuler, 'done'],
    ['التطوير', 'بناء المنصة والمحاكاة والمساعد', fa.FaTools, 'done'],
    ['التطبيق', 'تجربة مع طلاب الصف الثالث الثانوي', fa.FaUsers, 'next'],
    ['التقييم', 'مقارنة القبلي والبعدي وبيانات الاستخدام', fa.FaChartLine, 'later'],
    ['التحسين', 'تعديل المنصة ودورة جديدة', fa.FaSyncAlt, 'later']];
  const sw = 1.85, gap = (12.13 - 6 * sw) / 5;
  for (let i = 0; i < 6; i++) {
    const [h, d, ic, st] = stages[i]; const x = 12.73 - sw - i * (sw + gap);
    const col = st === 'done' ? HEX.blue : st === 'next' ? HEX.green : HEX.slate;
    card(s, x, 1.7, sw, 3.6, st === 'next' ? HEX.greenSoft : st === 'done' ? HEX.blueSoft : 'F4F6FA', 'stage-' + i);
    await circleIcon(s, ic, x + sw / 2 - 0.45, 1.95, 0.9, col, 'stage-ic-' + i);
    s.addText(h, { isTextBox: true, x: x + 0.1, y: 3.0, w: sw - 0.2, h: 0.5, fontSize: 18, bold: true, color: col, align: 'center', rtlMode: true, margin: 0 });
    s.addText(d, { isTextBox: true, x: x + 0.15, y: 3.55, w: sw - 0.3, h: 1.1, fontSize: 13, color: C.text1, align: 'center', rtlMode: true, margin: 0, valign: 'top' });
    s.addText(st === 'done' ? 'تم' : st === 'next' ? 'الخطوة التالية' : 'لاحقًا', { isTextBox: true, x: x + 0.1, y: 4.75, w: sw - 0.2, h: 0.35, fontSize: 12, bold: true, color: col, align: 'center', rtlMode: true, margin: 0 });
    if (i < 5) s.addText('←', { isTextBox: true, x: x - gap, y: 3.1, w: gap, h: 0.5, fontSize: 18, color: C.accent6, align: 'center', margin: 0 });
  }
  T(s, 'المنهجية مستمدة من وثيقة المشروع: كل دورة تنتهي بتحليل بيانات الاستخدام والنتائج ثم تحسين المنصة قبل الدورة التالية.', { x: 0.6, y: 5.75, w: 12.13, h: 0.8, fontSize: 15, color: C.accent6 });
  s.addNotes('اتبعنا منهجية البحث القائم على التصميم. أنجزنا التحليل والتصميم والتطوير، والخطوة التالية هي التطبيق مع الطلاب، ثم التقييم والتحسين في دورات متتالية.');

  /* ---------- 4. Data sources ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنهجية والبيانات' });
  s.addText('مصادر البيانات: من أين جمعنا المحتوى؟', { placeholder: 'title' });
  const src = [
    [fa.FaFlask, HEX.blue, HEX.blueSoft, 'المحتوى العلمي', 'وثيقة المحتوى العلمي المراجَعة لدرس الاتزان الكيميائي وفق المنهج المصري: ست وحدات، والمعادلات والأمثلة والأخطاء الشائعة المعتمدة.'],
    [fa.FaMicrophone, HEX.green, HEX.greenSoft, 'متطلبات المعلمة', 'تسجيلات صوتية ووثيقة مواصفات المشروع: المسارات الثلاثة ونسبها، بيانات الدخول، والمساعد الذكي.'],
    [fa.FaPalette, HEX.purple, HEX.purpleSoft, 'التصميم المرجعي', 'تصميم واجهة مرجعي معتمد (الألوان والبطاقات والشخصية الكرتونية) طُبّق على كل الشاشات.'],
    [fa.FaTable, 'B07A12', HEX.amberSoft, 'بيانات الطلاب', 'تُجمع لحظيًا أثناء الاستخدام في Google Sheets: الدخول، الإجابات، المسارات، والتلميحات المطلوبة.']];
  for (let i = 0; i < 4; i++) {
    const [ic, col, soft, h, d] = src[i]; const cx = i % 2 === 0 ? 6.83 : 0.6, cy = i < 2 ? 1.5 : 3.75;
    card(s, cx, cy, 5.9, 2.0, soft, 'src-' + i);
    await circleIcon(s, ic, cx + 5.9 - 0.95, cy + 0.3, 0.7, col, 'src-ic-' + i);
    T(s, h, { x: cx + 0.3, y: cy + 0.32, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: col });
    T(s, d, { x: cx + 0.3, y: cy + 0.9, w: 4.55, h: 1.0, fontSize: 14 });
  }
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.0, w: 12.13, h: 0.85, rectRadius: 0.12, fill: { color: 'FDECED' }, line: { color: 'F6C6C8', width: 0.75 }, objectName: 'rule-band' });
  T(s, 'ضابط علمي: البنود التي تحتاج تأكيد المعلمة (مثل بيانات تفاعل HI غير المحددة بدرجة حرارة) حُجبت عن الطلاب، ولم نُضِف أي أرقام أو أمثلة غير موجودة في المصدر.', { x: 0.9, y: 6.0, w: 11.55, h: 0.85, fontSize: 14, color: '8A1F24', valign: 'middle' });
  s.addNotes('أربعة مصادر: وثيقة المحتوى العلمي هي المرجع لكل معلومة، ومتطلبات المعلمة حددت المسارات وبيانات الدخول، والتصميم المرجعي حدد الشكل، وبيانات الطلاب تُجمع آليًا في جوجل شيت. أي بند غير مؤكد علميًا لم يُعرض على الطلاب.');

  /* ---------- 5. Journey ---------- */
  pres.addSection({ title: 'المنصة' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('رحلة الطالب داخل المنصة', { placeholder: 'title' });
  const steps = [['تسجيل الدخول', 'بالبريد الإلكتروني ورقم الهاتف'], ['الاختبار التشخيصي', '14 سؤالًا قبل أي شرح'], ['تحليل المفاهيم', 'تحديد المفاهيم المتقنة والضعيفة'],
    ['المسار المناسب', 'علاجي أو تصحيحي أو إثرائي'], ['الدروس والمحاكاة', 'شرح + محاكاة + اختبار قصير'], ['الاختبار البعدي', 'نفس المفاهيم بعد التعلم'], ['تقرير التقدم', 'مقارنة قبلي وبعدي لكل مفهوم']];
  const sc = [HEX.blue, HEX.blue, HEX.blue, HEX.green, HEX.green, HEX.purple, HEX.purple];
  for (let i = 0; i < 7; i++) {
    const y = 1.45 + i * 0.78;
    s.addShape(pres.shapes.OVAL, { x: 12.08, y, w: 0.6, h: 0.6, fill: { color: sc[i] }, line: { type: 'none' }, objectName: 'step-dot-' + i });
    s.addText(String(i + 1), { isTextBox: true, x: 12.08, y, w: 0.6, h: 0.6, fontSize: 16, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0 });
    T(s, [{ text: steps[i][0] + '  ', options: { bold: true, fontSize: 17, color: C.text2 } }, { text: steps[i][1], options: { fontSize: 14, color: C.accent6 } }], { x: 5.0, y, w: 6.9, h: 0.6, valign: 'middle' });
  }
  const mf = fit('mobile_c.png', 2.6, 5.6);
  card(s, 0.9 - 0.12, 1.33, mf.w + 0.24, mf.h + 0.24, HEX.ice, 'phone-frame');
  s.addImage({ ...shot('mobile_c.png'), x: 0.9, y: 1.45, w: mf.w, h: mf.h, altText: 'لوحة المسارات على الموبايل', objectName: 'mobile-shot' });
  T(s, 'المنصة تعمل على الموبايل والكمبيوتر', { x: 0.6, y: 7.0, w: 3.5, h: 0.35, fontSize: 11, color: C.accent6, align: 'center' });
  s.addNotes('رحلة الطالب سبع خطوات: يسجل الدخول، يجتاز اختبارًا تشخيصيًا، تحلل المنصة إجاباته على مستوى المفهوم، ثم يدخل المسار المناسب، يدرس بالمحاكاة، ثم اختبار بعدي وتقرير يقارن التقدم.');

  /* ---------- 6. Diagnostic ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('الاختبار التشخيصي: تشخيص على مستوى المفهوم', { placeholder: 'title' });
  const stats = [['14', 'سؤالًا', HEX.blue], ['11', 'مفهومًا علميًا', HEX.green], ['3', 'مسارات تعلم', HEX.purple]];
  for (let i = 0; i < 3; i++) {
    const x = 10.83 - i * 2.05;
    card(s, x, 1.45, 1.9, 1.6, HEX.white, 'stat-' + i);
    s.addText(stats[i][0], { isTextBox: true, x, y: 1.5, w: 1.9, h: 0.95, fontSize: 48, bold: true, color: stats[i][2], align: 'center', margin: 0 });
    s.addText(stats[i][1], { isTextBox: true, x, y: 2.45, w: 1.9, h: 0.45, fontSize: 14, color: C.accent6, align: 'center', rtlMode: true, margin: 0 });
  }
  T(s, [
    { text: 'كل سؤال مربوط بمفهوم محدد، فتعرف المنصة نقاط الضعف بدقة.', options: { bullet: true, breakLine: true } },
    { text: 'تنقّل حر بين الأسئلة، وتعليم للمراجعة، وتسليم في أي وقت.', options: { bullet: true, breakLine: true } },
    { text: 'الأسئلة المتروكة تُسجَّل منفصلة عن الإجابات الخاطئة.', options: { bullet: true, breakLine: true } },
    { text: 'المساعد الذكي لا يساعد أثناء الاختبار حفاظًا على صدق النتيجة.', options: { bullet: true, breakLine: true } },
    { text: 'الأسئلة مسودة بانتظار اعتماد المعلمة.', options: { bullet: true } }
  ], { x: 6.7, y: 3.35, w: 6.03, h: 3.3, paraSpaceAfter: 8 });
  const tf = fit('test.png', 5.7, 5.3);
  s.addImage({ ...shot('test.png'), x: 0.6, y: 1.45, w: tf.w, h: tf.h, altText: 'شاشة الاختبار التشخيصي', objectName: 'test-shot' });
  s.addNotes('14 سؤالًا تغطي 11 مفهومًا. التحليل يتم على مستوى المفهوم. الطالب يتنقل بحرية ويعلّم الأسئلة للمراجعة. الأسئلة ما زالت مسودة بانتظار اعتماد المعلمة.');

  /* ---------- 7. Paths ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('ثلاثة مسارات حسب نتيجة الاختبار التشخيصي', { placeholder: 'title' });
  const paths = [
    ['المسار العلاجي', '0% – 49%', HEX.blue, HEX.blueSoft, fa.FaBook, ['دراسة الوحدات الست كاملة من الأساس', 'محاكاة ومعامل افتراضية لكل وحدة', 'اختبار قصير بعد كل درس']],
    ['المسار التصحيحي والداعم', '50% – 79%', HEX.green, HEX.greenSoft, fa.FaSyncAlt, ['يعرض المفاهيم الضعيفة فقط', 'الفكرة الخاطئة مقابل الصحيحة', 'إعادة تقييم كل مفهوم بعد المعالجة']],
    ['المسار الإثرائي', '80% – 100%', HEX.purple, HEX.purpleSoft, fa.FaRocket, ['تحديات تفكير ناقد وحل مشكلات', 'تطبيق في مواقف جديدة', 'معمل افتراضي مفتوح']]];
  for (let i = 0; i < 3; i++) {
    const [h, r, col, soft, ic, it] = paths[i]; const x = 12.73 - 3.85 - i * (3.85 + 0.29);
    card(s, x, 1.5, 3.85, 5.2, soft, 'path-' + i);
    await circleIcon(s, ic, x + 3.85 / 2 - 0.45, 1.75, 0.9, col, 'path-ic-' + i);
    s.addText(h, { isTextBox: true, x: x + 0.2, y: 2.8, w: 3.45, h: 0.55, fontSize: 20, bold: true, color: col, align: 'center', rtlMode: true, margin: 0 });
    s.addText(r, { isTextBox: true, x: x + 0.2, y: 3.4, w: 3.45, h: 0.75, fontSize: 32, bold: true, color: C.text2, align: 'center', margin: 0 });
    T(s, it.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < it.length - 1 } })), { x: x + 0.3, y: 4.4, w: 3.25, h: 2.1, fontSize: 14, paraSpaceAfter: 8 });
  }
  s.addNotes('النسب حددتها المعلمة: من صفر إلى 49% المسار العلاجي، ومن 50 إلى 79% المسار التصحيحي والداعم، ومن 80 إلى 100% المسار الإثرائي. المنصة تقترح المسار، والطالب يستطيع اختيار غيره.');

  /* ---------- 8. Dashboard screenshot ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('لوحة المسارات كما يراها الطالب', { placeholder: 'title' });
  const df = fit('dash_c.png', 9.0, 5.5);
  s.addImage({ ...shot('dash_c.png'), x: 0.6, y: 1.4, w: df.w, h: df.h, altText: 'لوحة نتيجة الاختبار والمسارات الثلاثة', objectName: 'dash-shot' });
  const callouts = [['نتيجة الطالب', 'النسبة والمفاهيم التي تحتاج دعمًا', HEX.red], ['المسار المقترح', 'مُبرز بعلامة "مناسب لك"', HEX.green], ['حرية الاختيار', 'يمكن للطالب اختيار أي مسار', HEX.blue], ['المساعد Acquire', 'متاح في كل صفحة', HEX.purple]];
  for (let i = 0; i < 4; i++) {
    const y = 1.45 + i * 1.35;
    card(s, 9.95, y, 2.78, 1.15, HEX.ice, 'callout-' + i);
    T(s, callouts[i][0], { x: 10.1, y: y + 0.12, w: 2.48, h: 0.42, fontSize: 16, bold: true, color: callouts[i][2] });
    T(s, callouts[i][1], { x: 10.1, y: y + 0.55, w: 2.48, h: 0.5, fontSize: 13, color: C.accent6 });
  }
  s.addNotes('هذه الشاشة الفعلية بعد الاختبار: النتيجة والمفاهيم الضعيفة على اليسار، والمسارات الثلاثة مع إبراز المسار المقترح، والتصميم مطابق للتصميم المرجعي المعتمد.');

  /* ---------- 9. Units ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('المحتوى: ست وحدات تغطي الدرس كاملًا', { placeholder: 'title' });
  const units = [['الاتزان الديناميكي ومبدأ لوشاتيليه', 'محاكاة الجسيمات ومعمل التركيز', HEX.blue], ['قانون فعل الكتلة ومعدل التفاعل', 'تجربة لون ثيوسيانات الحديد', HEX.green], ['ثابت الاتزان Kc', 'مُنشئ تعبير Kc', HEX.purple],
    ['درجة الحرارة والاتزان', 'أنبوبة NO₂ / N₂O₄ عند 0 و25 و100°م', HEX.blue], ['الضغط والحجم و Kp', 'معمل المكبس وحاسبة Kp', HEX.green], ['دور العامل الحفاز', 'منحنى الطاقة وسباق الوصول للاتزان', HEX.purple]];
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3); const x = 12.73 - 3.85 - col * (3.85 + 0.29), y = 1.5 + row * 2.6;
    card(s, x, y, 3.85, 2.3, HEX.white, 'unit-' + i);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 3.85 - 0.85, y: y + 0.25, w: 0.6, h: 0.6, rectRadius: 0.1, fill: { color: units[i][2] }, line: { type: 'none' }, objectName: 'unit-n-' + i });
    s.addText(String(i + 1), { isTextBox: true, x: x + 3.85 - 0.85, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.background1, align: 'center', valign: 'middle', margin: 0 });
    T(s, units[i][0], { x: x + 0.25, y: y + 0.25, w: 2.6, h: 0.9, fontSize: 17, bold: true, color: C.text2 });
    T(s, units[i][1], { x: x + 0.25, y: y + 1.35, w: 3.35, h: 0.7, fontSize: 14, color: C.accent6 });
  }
  s.addNotes('المحتوى مبني على ست وحدات من وثيقة المحتوى العلمي. كل وحدة فيها شرح مختصر، ومحاكاة، وبطاقات للأخطاء الشائعة، واختبار قصير.');

  /* ---------- 10. Simulations ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('المحاكاة التفاعلية: توقّع ثم جرّب ثم فسّر', { placeholder: 'title' });
  const f1 = fit('dyn.png', 6.0, 4.15), f2 = fit('piston.png', 5.6, 4.15);
  s.addImage({ ...shot('dyn.png'), x: 12.73 - f1.w, y: 1.45, w: f1.w, h: f1.h, altText: 'محاكاة الاتزان الديناميكي', objectName: 'dyn-shot' });
  s.addImage({ ...shot('piston.png'), x: 0.6, y: 1.45, w: f2.w, h: f2.h, altText: 'معمل المكبس', objectName: 'piston-shot' });
  T(s, 'الاتزان الديناميكي: المعدلان يتساويان والتركيزات لا تتساوى', { x: 12.73 - f1.w, y: 1.5 + f1.h, w: f1.w, h: 0.4, fontSize: 12, color: C.accent6 });
  T(s, 'معمل المكبس: الضغط يزيح الاتزان نحو المولات الأقل', { x: 0.6, y: 1.5 + f2.h, w: f2.w, h: 0.4, fontSize: 12, color: C.accent6 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 6.15, w: 12.13, h: 0.8, rectRadius: 0.12, fill: { color: HEX.ice }, line: { type: 'none' }, objectName: 'sim-band' });
  T(s, '7 أنشطة تفاعلية · الطالب يتوقّع قبل كل تجربة ويحصل على تفسير فوري · كلها نماذج مفاهيمية توضيحية وليست بيانات مقاسة', { x: 0.9, y: 6.15, w: 11.55, h: 0.8, fontSize: 15, bold: true, color: C.text2, valign: 'middle' });
  s.addNotes('المحاكاة تجعل غير المرئي مرئيًا. الطالب يُطلب منه التوقع قبل كل تغيير، ثم يرى النتيجة والتفسير. وكل المحاكاة موسومة بأنها نماذج مفاهيمية وليست بيانات معملية.');

  /* ---------- 11. Acquire ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المنصة' });
  s.addText('المساعد الذكي Acquire', { placeholder: 'title' });
  const cf = fit('chat.png', 3.2, 5.4);
  s.addImage({ ...shot('chat.png'), x: 0.6, y: 1.45, w: cf.w, h: cf.h, altText: 'محادثة مع المساعد Acquire', objectName: 'chat-shot' });
  const feats = [[fa.FaLightbulb, HEX.amber, 'تلميحات على ثلاثة مستويات', 'تلميح خفيف، ثم أوضح، ثم الحل مع الشرح'],
    [fa.FaTimesCircle, HEX.red, 'لماذا إجابتي خاطئة؟', 'تفسير خاص بكل اختيار خاطئ يعالج الفكرة الخاطئة وراءه'],
    [fa.FaComments, HEX.blue, 'يفهم العربية والإنجليزية', 'يشرح 11 مفهومًا ببساطة ويرشّح نشاطًا حسب نقاط الضعف'],
    [fa.FaShieldAlt, HEX.green, 'داخل حدود المنهج فقط', 'بدون تكلفة، لا يخرج عن الدروس، ومعطّل أثناء الاختبارات']];
  for (let i = 0; i < 4; i++) {
    const y = 1.45 + i * 1.35;
    await circleIcon(s, feats[i][0], 12.03, y + 0.1, 0.7, feats[i][1], 'feat-' + i);
    T(s, feats[i][2], { x: 4.4, y: y + 0.05, w: 7.45, h: 0.45, fontSize: 18, bold: true, color: C.text2 });
    T(s, feats[i][3], { x: 4.4, y: y + 0.52, w: 7.45, h: 0.6, fontSize: 14, color: C.accent6 });
  }
  s.addNotes('Acquire مساعد مبني على محتوى الدروس نفسه وليس على خدمة ذكاء اصطناعي مدفوعة؛ لذلك تكلفته صفر ولا يخرج عن المنهج. يقدم تلميحات متدرجة وتفسيرًا لكل خطأ، ويفهم العربية العامية والإنجليزية.');

  /* ---------- 12. Teacher tracking ---------- */
  pres.addSection({ title: 'المتابعة والتشغيل' });
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المتابعة والتشغيل' });
  s.addText('متابعة المعلمة: كل نشاط يُسجَّل في Google Sheets', { placeholder: 'title' });
  const hdr = ['التلميحات', 'البعدي', 'المفاهيم الضعيفة', 'المسار', 'القبلي', 'الطالب'].map(t => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: HEX.navy }, align: 'center', rtlMode: true } }));
  const rows = [['3', '86%', 'الحرارة، الحفاز', 'تصحيحي', '57%', 'طالب 1'], ['7', '64%', 'Kc، الضغط، الحرارة', 'علاجي', '36%', 'طالب 2'], ['0', '93%', '—', 'إثرائي', '86%', 'طالب 3']]
    .map(r => r.map(t => ({ text: t, options: { align: 'center', rtlMode: true, color: HEX.ink } })));
  s.addTable([hdr, ...rows], { x: 4.0, y: 1.55, w: 8.73, colW: [1.2, 1.1, 2.33, 1.3, 1.1, 1.7], fontSize: 14, border: { type: 'solid', color: HEX.line, pt: 0.75 }, fill: { color: 'FFFFFF' }, rowH: 0.5, objectName: 'sheet-table' });
  T(s, 'مثال توضيحي لشكل تبويب Students (بيانات وهمية)', { x: 4.0, y: 3.65, w: 8.73, h: 0.35, fontSize: 11, color: C.accent6 });
  T(s, [
    { text: 'تبويب Log: سطر لكل حدث بالوقت (دخول، إجابة، توقّع في المحاكاة، طلب تلميح، سؤال للمساعد).', options: { bullet: true, breakLine: true } },
    { text: 'تبويب Students: صف واحد لكل طالب يُحدَّث تلقائيًا بالنتيجة والمسار ونقاط الضعف.', options: { bullet: true, breakLine: true } },
    { text: 'الأسئلة المتروكة مسجّلة منفصلة عن الخاطئة، والبيانات لا تضيع عند انقطاع الإنترنت.', options: { bullet: true } }
  ], { x: 4.0, y: 4.25, w: 8.73, h: 2.4, paraSpaceAfter: 8 });
  card(s, 0.6, 1.55, 3.0, 5.1, HEX.greenSoft, 'events-card');
  s.addImage({ data: await icon(fa.FaTable, HEX.green), x: 1.75, y: 1.85, w: 0.7, h: 0.7, objectName: 'sheet-icon', altText: '' });
  T(s, 'ما يُسجَّل لكل طالب', { x: 0.8, y: 2.75, w: 2.6, h: 0.45, fontSize: 16, bold: true, color: C.accent2, align: 'center' });
  T(s, ['الدخول ووقته', 'الحالة المزاجية', 'إجابات القبلي والبعدي', 'المسار المقترح والمختار', 'الدروس المكتملة', 'المفاهيم التي صُححت', 'أسئلة المساعد'].map((t, k, a) => ({ text: t, options: { bullet: true, breakLine: k < a.length - 1 } })),
    { x: 0.85, y: 3.3, w: 2.5, h: 3.2, fontSize: 14, paraSpaceAfter: 4 });
  s.addNotes('كل حدث يُسجّل لحظيًا في جوجل شيت بحساب المعلمة. هذه البيانات هي أساس مرحلة التقييم في منهجية DBR: مقارنة القبلي بالبعدي، وتحديد المفاهيم الأصعب، وقياس فاعلية كل مسار.');

  /* ---------- 13. Tech ---------- */
  s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: 'المتابعة والتشغيل' });
  s.addText('التشغيل: منصة مجانية تعمل على أي جهاز', { placeholder: 'title' });
  const tech = [[fa.FaCode, HEX.blue, 'صفحة ويب واحدة', 'HTML و JavaScript بدون خوادم مدفوعة'], [fa.FaGithub, HEX.navy, 'GitHub Pages', 'استضافة مجانية تعمل في مصر وبرابط محايد'],
    [fa.FaGoogle, HEX.green, 'Google Sheets', 'Apps Script يستقبل البيانات ويرتّبها'], [fa.FaMobileAlt, HEX.purple, 'موبايل وكمبيوتر', 'تصميم متجاوب بالعربية والإنجليزية']];
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2); const x = 12.73 - 4.1 - col * 4.35, y = 1.5 + row * 2.75;
    card(s, x, y, 4.1, 2.45, HEX.ice, 'tech-' + i);
    await circleIcon(s, tech[i][0], x + 4.1 - 1.0, y + 0.3, 0.75, tech[i][1], 'tech-ic-' + i);
    T(s, tech[i][2], { x: x + 0.3, y: y + 0.35, w: 2.7, h: 0.5, fontSize: 19, bold: true, color: C.text2 });
    T(s, tech[i][3], { x: x + 0.3, y: y + 1.2, w: 3.5, h: 0.8, fontSize: 14, color: C.accent6 });
  }
  card(s, 0.6, 1.5, 3.4, 5.2, HEX.navy, 'cost-card');
  s.addText('0', { isTextBox: true, x: 0.6, y: 2.2, w: 3.4, h: 1.6, fontSize: 96, bold: true, color: HEX.amber, align: 'center', margin: 0 });
  s.addText('تكلفة التشغيل الشهرية', { isTextBox: true, x: 0.8, y: 3.95, w: 3.0, h: 0.5, fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', rtlMode: true, margin: 0 });
  s.addText('بدون اشتراكات أو خدمات ذكاء اصطناعي مدفوعة', { isTextBox: true, x: 0.8, y: 4.55, w: 3.0, h: 0.9, fontSize: 14, color: 'CADCFC', align: 'center', rtlMode: true, margin: 0 });
  s.addNotes('المنصة لا تحتاج أي تكلفة تشغيل: الاستضافة على GitHub Pages، والبيانات في جوجل شيت، والمساعد مبني على المحتوى. واخترنا GitHub Pages لأن بعض الاستضافات البديلة محجوبة حاليًا في مصر.');

  /* ---------- 14. Next steps ---------- */
  pres.addSection({ title: 'الخطوات القادمة' });
  s = pres.addSlide({ masterName: 'CLOSING', sectionTitle: 'الخطوات القادمة' });
  s.addText('الخطوات القادمة', { placeholder: 'title' });
  const nx = [['اعتماد المحتوى', 'مراجعة المعلمة لأسئلة الاختبار والبنود العلمية المعلّقة'], ['تجربة استطلاعية', 'تطبيق المنصة مع مجموعة من طلاب الصف الثالث الثانوي'],
    ['تحليل البيانات', 'مقارنة القبلي والبعدي، وفاعلية كل مسار، واستخدام المساعد'], ['دورة تحسين', 'تعديل المنصة بناءً على النتائج وآراء الطلاب']];
  for (let i = 0; i < 4; i++) {
    const x = 12.73 - 2.85 - i * (2.85 + 0.243);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 2.85, h: 3.4, rectRadius: 0.15, fill: { color: '22416D' }, line: { type: 'none' }, objectName: 'next-' + i });
    s.addText(String(i + 1), { isTextBox: true, x, y: 1.9, w: 2.85, h: 0.9, fontSize: 44, bold: true, color: HEX.amber, align: 'center', margin: 0 });
    s.addText(nx[i][0], { isTextBox: true, x: x + 0.15, y: 2.85, w: 2.55, h: 0.5, fontSize: 19, bold: true, color: 'FFFFFF', align: 'center', rtlMode: true, margin: 0 });
    s.addText(nx[i][1], { isTextBox: true, x: x + 0.2, y: 3.45, w: 2.45, h: 1.4, fontSize: 14, color: 'CADCFC', align: 'center', rtlMode: true, margin: 0, valign: 'top' });
  }
  s.addImage({ data: robot, x: 0.75, y: 5.35, w: 1.4, h: 1.52, altText: 'شخصية المساعد', objectName: 'robot-end' });
  T(s, 'شكرًا لحسن استماعكم', { x: 2.4, y: 5.6, w: 10.33, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
  T(s, 'equilibrium-eg.github.io', { x: 2.4, y: 6.3, w: 10.33, h: 0.45, fontSize: 16, color: '9FB6D6', rtlMode: false });
  s.addNotes('الخطوات القادمة: اعتماد المحتوى والأسئلة، ثم تجربة استطلاعية مع الطلاب، ثم تحليل البيانات المجمعة، ثم دورة تحسين. شكرًا.');

  await pres.writeFile({ fileName: __dirname + '/presentation.pptx' });
  await applyTheme(__dirname + '/presentation.pptx', THEME);
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });
