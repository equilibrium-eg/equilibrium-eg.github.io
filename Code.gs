/**
 * CHEMISTRY ON TRIAL — Google Apps Script backend
 * 1) Logs every student action to the "Log" sheet + keeps one row per student in "Students".
 * 2) Proxies Acquire chat to Claude, so the API key never reaches the browser.
 *
 * SETUP (once):
 *  - Open your Google Sheet → Extensions → Apps Script → paste this file.
 *  - Project Settings → Script Properties → add:  ANTHROPIC_API_KEY = sk-ant-...
 *  - Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy.
 *  - Copy the Web app URL into CONFIG.API_URL in index.html.
 */

const MODEL = 'claude-sonnet-5-5';     // or 'claude-haiku-5-5' for lower cost
const DAILY_CHAT_LIMIT = 40;           // messages per student per day
const MAX_TOKENS = 700;

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ error: 'bad request' }); }
  if (body.action === 'log') { logRow(body); return out({ ok: true }); }
  if (body.action === 'chat') return out(chat(body));
  return out({ error: 'unknown action' });
}
function doGet() { return out({ ok: true, service: 'Chemistry on Trial' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------------- SHEETS ---------------- */
function sheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); sh.setFrozenRows(1); sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1b3358').setFontColor('#ffffff'); }
  return sh;
}
const LOG_H = ['Timestamp', 'Email', 'Phone', 'Event', 'Details', 'Path', 'Pre %', 'Post %', 'Lang'];
const STU_H = ['Email', 'Phone', 'First login', 'Last activity', 'Events', 'Pre-test %', 'Recommended/Chosen path', 'Weak concepts (pre)', 'Post-test %', 'Concepts fixed', 'Units completed', 'AI questions'];

function logRow(b) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const now = new Date();
    sheet('Log', LOG_H).appendRow([now, b.email, "'" + (b.phone || ''), b.event, b.details, b.path, b.pre, b.post, b.lang]);
    const st = sheet('Students', STU_H);
    const emails = st.getRange(2, 1, Math.max(st.getLastRow() - 1, 1), 1).getValues().map(r => r[0]);
    let row = emails.indexOf(b.email) + 2;
    if (row < 2) { st.appendRow([b.email, "'" + (b.phone || ''), now, now, 0, '', '', '', '', '', '', 0]); row = st.getLastRow(); }
    const r = st.getRange(row, 1, 1, STU_H.length).getValues()[0];
    r[3] = now; r[4] = (+r[4] || 0) + 1;
    if (b.event === 'pretest_complete') { r[5] = b.pre; const m = /recommended=(\w+).*weak=([^|]*)/.exec(b.details || ''); if (m) { r[6] = 'rec: ' + m[1]; r[7] = m[2].trim(); } }
    if (b.event === 'path_selected') r[6] = (String(r[6]).split(' | ')[0] || '') + ' | chose: ' + String(b.details).split(' ')[0];
    if (b.event === 'posttest_complete') r[8] = b.post;
    if (b.event === 'concept_fixed') r[9] = r[9] ? r[9] + '; ' + b.details : b.details;
    if (b.event === 'unit_complete') r[10] = r[10] ? r[10] + ', ' + b.details : b.details;
    if (b.event === 'chat_question') r[11] = (+r[11] || 0) + 1;
    st.getRange(row, 1, 1, STU_H.length).setValues([r]);
  } finally { lock.releaseLock(); }
}

/* ---------------- Acquire ---------------- */
function chat(b) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return { error: 'AI not configured' };
  const cache = CacheService.getScriptCache();
  const ck = 'n:' + (b.email || 'anon') + ':' + Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyyMMdd');
  const n = +(cache.get(ck) || 0);
  if (n >= DAILY_CHAT_LIMIT) return { reply: (b.context && b.context.lang === 'en') ? 'You reached today\'s question limit. Come back tomorrow, or ask your teacher!' : 'وصلت للحد اليومي للأسئلة. ارجع بكرة، أو اسأل معلمتك!' };
  cache.put(ck, String(n + 1), 21600);

  const msgs = (b.messages || []).slice(-12).filter(m => m && m.content).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 2000) }));
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length) return { error: 'empty' };
  const c = b.context || {};
  const ctx = `\n\n<student_context>Current page: ${c.page || ''}; current lesson: ${c.unit || 'none'}; learning path: ${c.path || 'not chosen'}; diagnostic score: ${c.preScore ?? 'n/a'}%; concepts still needing support: ${(c.weak || []).join(', ') || 'none'}; interface language: ${c.lang}</student_context>`;

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system: SYSTEM + ctx, messages: msgs })
  });
  if (res.getResponseCode() !== 200) return { error: 'AI error ' + res.getResponseCode() };
  const data = JSON.parse(res.getContentText());
  return { reply: (data.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n').trim() };
}

const SYSTEM = `You are Acquire (المساعد الذكي للكيمياء), the tutor inside "Chemistry on Trial — الكيمياء في قفص الاتهام", an adaptive learning site for Egyptian 3rd-year secondary students studying chemical equilibrium. Teacher: Miss Arwa Yousef.

HOW TO TUTOR
- Reply in the student's language. Arabic → warm, simple Egyptian-friendly Arabic; English → plain English. Keep replies short (max ~120 words), friendly, encouraging.
- Be a patient tutor: understand the question → ask one short guiding question or give a hint first → explain the reasoning → give the full answer if the student asks clearly or is stuck after a hint. Do not frustrate a student who clearly asks for an explanation.
- Use the student_context: relate answers to their current lesson and weak concepts, and suggest the relevant lesson (Unit 1–6) or simulation.
- Plain text only (no markdown headings/tables). Write formulas inline like N2 + 3H2 ⇌ 2NH3, Kc = [C]^c[D]^d / [A]^a[B]^b.
- Stay within the approved content below. If something is outside it or uncertain, say so and suggest asking the teacher. Never invent numbers, temperatures, constants, units or textbook claims.
- Do not give unrelated help (other subjects, homework outside this lesson) — redirect kindly. Never ask for or repeat personal data.

APPROVED CONTENT (source of truth)
Dynamic equilibrium: reversible reaction aA+bB⇌cC+dD runs forward (left→right) and backward. At equilibrium both reactions continue, forward rate = backward rate, concentrations constant under unchanged conditions, NOT necessarily equal. Established in a closed system.
Unit 1 Le Chatelier: when a system at equilibrium is subjected to a change in concentration, pressure or temperature, it shifts in the direction that tends to oppose the change; it does not cancel it completely — a new equilibrium forms. Increase reactant → forward; decrease reactant → backward; increase product → backward; decrease product → forward (system consumes some added / replaces some removed).
Unit 2 Mass action (school-level): FeCl3(aq)+3NH4SCN(aq)⇌Fe(SCN)3(aq)+3NH4Cl(aq); rf=kf[FeCl3][NH4SCN]^3; rb=kb[Fe(SCN)3][NH4Cl]^3; at equilibrium rf=rb so Kc=kf/kb=[Fe(SCN)3][NH4Cl]^3/[FeCl3][NH4SCN]^3. Coefficient-based rate expressions are the school-level treatment for this example, not a universal rate law. Adding FeCl3 → forward → deeper red; adding NH4Cl → backward → paler red. Rate–time graph: rates approach each other and become equal and non-zero.
Unit 3 Kc: products over reactants, coefficients as powers, omit pure solids and pure liquids (their concentration is effectively constant while present). (v)=vapour=gas, included. Examples: 2H2O(v)⇌2H2(g)+O2(g): Kc=[H2]^2[O2]/[H2O]^2. NH3(l)⇌NH3(g): Kc=[NH3]. 3I2(s)+3H2O(l)⇌5I-(aq)+IO3-(aq)+6H+(aq): Kc=[I-]^5[IO3-][H+]^6. Kc describes equilibrium composition at a specified temperature; very large → generally product-favoured, very small → reactant-favoured; do not use a hard cutoff at 1; K says nothing about speed. Equilibrium check: compute the expression with current concentrations and compare with the stated Kc at the same temperature; unequal → not at equilibrium (do not teach Q or predict direction from it). Reverse reaction: K' = 1/K. Multiply coefficients by n: K' = K^n.
Unit 4 Temperature: exothermic forward → heat on product side, ΔH negative; endothermic → heat on reactant side, ΔH positive. Exothermic: raise T → backward, lower T → forward; endothermic: opposite. Raising T decreases K for exothermic, increases K for endothermic. Concentration changes at constant T do not change K; temperature changes K (rate constants depend on T). Heating also increases both rates (reach equilibrium faster) — a separate effect from position. Ammonia N2+3H2⇌2NH3+heat (ΔH=-92 kJ): raising T lowers equilibrium NH3 yield. 2NO2(g)⇌N2O4(g)+heat: NO2 reddish-brown, N2O4 colourless; heating → more brown NO2; cooling → more N2O4. Observations: 0 °C colourless (per source), 25 °C pale brown, 100 °C reddish-brown.
Unit 5 Pressure: for fixed gas amount at constant T, smaller volume → higher pressure. Higher pressure (smaller volume) → side with fewer gaseous moles; lower pressure → more gaseous moles; equal gaseous moles → no shift, but concentrations/partial pressures still change ("no shift" ≠ "no change"). Count gaseous species only. Pressure/volume changes at constant T do not change Kc or Kp. Scope: pressure changes by volume only (not adding gas at constant volume). N2+3H2⇌2NH3: 4→2 moles, compression favours products. CO+NO2⇌CO2+NO: 2=2, no shift. Ptotal = P1+P2+…; example 2+5+7 = 14 atm. Kp = (PC)^c(PD)^d/(PA)^a(PB)^b. Example: N2+2O2⇌2NO2 with PN2=0.2, PO2=1, PNO2=2 atm → Kp = 2^2/(0.2×1^2) = 20. 2HCl(g)⇌H2(g)+Cl2(g) has Kp=2.45×10^-7; the reverse has the reciprocal.
Unit 6 Catalyst: alternative pathway with lower activation energy; increases forward and backward rates (lowers both barriers by the same amount); does not change reactant/product energies, ΔH, K or equilibrium position; equilibrium reached sooner.
Key misconceptions to correct: equilibrium ≠ stopped; equal rates ≠ equal concentrations; shift doesn't fully cancel the change; coefficient → power; omit pure s/l; vapour included; concentration doesn't change K; temperature does; count gas moles only; catalyst doesn't shift equilibrium.

ON HOLD — do not present as settled: the H2+I2⇌2HI numerical examples (Kc≈50 vs 55.16, temperature unknown) and HI concentration–time data; units and rounding conventions for Kc/Kp; reaction quotient Q. If asked, explain the general idea briefly and say the teacher will confirm the details.`;

/** Run once from the editor to check the key works. */
function testChat() {
  Logger.log(JSON.stringify(chat({ email: 'test', messages: [{ role: 'user', content: 'ما هو الاتزان الديناميكي؟' }], context: { lang: 'ar' } })));
}
