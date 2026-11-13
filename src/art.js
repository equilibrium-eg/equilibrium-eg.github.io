/* Original SVG illustrations */
const ART = {
robot:(s=120)=>`<svg viewBox="0 0 120 130" width="${s}" height="${s*1.08}" aria-hidden="true">
 <defs><linearGradient id="rb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe9f7"/></linearGradient>
 <linearGradient id="rb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a64"/><stop offset="1" stop-color="#0f2142"/></linearGradient>
 <linearGradient id="rb3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a95f5"/><stop offset="1" stop-color="#1d5fc2"/></linearGradient></defs>
 <line x1="60" y1="10" x2="60" y2="22" stroke="#9fb6d6" stroke-width="3"/><circle cx="60" cy="9" r="5" fill="#4a95f5"/>
 <rect x="22" y="22" width="76" height="62" rx="28" fill="url(#rb1)" stroke="#c4d4ea" stroke-width="2"/>
 <rect x="12" y="40" width="14" height="28" rx="7" fill="url(#rb3)"/><rect x="94" y="40" width="14" height="28" rx="7" fill="url(#rb3)"/>
 <path d="M19 44 Q20 14 60 14 Q100 14 101 44" fill="none" stroke="url(#rb3)" stroke-width="5" stroke-linecap="round"/>
 <rect x="32" y="36" width="56" height="36" rx="17" fill="url(#rb2)"/>
 <ellipse cx="48" cy="54" rx="7" ry="8" fill="#5ee6ff"/><ellipse cx="72" cy="54" rx="7" ry="8" fill="#5ee6ff"/>
 <circle cx="50" cy="51" r="2.2" fill="#fff"/><circle cx="74" cy="51" r="2.2" fill="#fff"/>
 <path d="M52 64 Q60 69 68 64" stroke="#5ee6ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <rect x="34" y="86" width="52" height="38" rx="18" fill="url(#rb1)" stroke="#c4d4ea" stroke-width="2"/>
 <rect x="50" y="96" width="20" height="14" rx="5" fill="url(#rb3)"/><circle cx="60" cy="103" r="3" fill="#5ee6ff"/>
</svg>`,
atom:(s=56)=>`<svg viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="3"><ellipse cx="32" cy="32" rx="28" ry="11"/><ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="5" fill="#fff"/></svg>`,
books:()=>`<svg viewBox="0 0 200 140" class="ill" aria-hidden="true">
 <ellipse cx="100" cy="128" rx="78" ry="9" fill="#d9e4f5"/>
 <g><rect x="38" y="88" width="128" height="30" rx="7" fill="#1d5fc2"/><rect x="44" y="92" width="116" height="12" rx="3" fill="#fff"/><rect x="38" y="104" width="128" height="14" rx="5" fill="#2f7be6"/></g>
 <g transform="rotate(-4 100 70)"><rect x="46" y="58" width="116" height="28" rx="7" fill="#f2b33d"/><rect x="52" y="62" width="104" height="11" rx="3" fill="#fff"/><rect x="46" y="73" width="116" height="13" rx="5" fill="#f6c768"/></g>
 <g transform="rotate(3 100 40)"><rect x="54" y="30" width="100" height="26" rx="7" fill="#e9a72d"/><rect x="58" y="34" width="90" height="10" rx="3" fill="#fff3d6"/><rect x="88" y="20" width="30" height="20" rx="4" fill="#d9921f"/></g>
</svg>`,
target:()=>`<svg viewBox="0 0 200 140" class="ill" aria-hidden="true">
 <path d="M30 120 Q30 92 60 96 Q66 70 98 80 Q120 60 146 82 Q176 80 172 120Z" fill="#dbe8fb"/>
 <circle cx="100" cy="72" r="50" fill="#e0474c"/><circle cx="100" cy="72" r="40" fill="#fff"/><circle cx="100" cy="72" r="30" fill="#e0474c"/><circle cx="100" cy="72" r="19" fill="#fff"/><circle cx="100" cy="72" r="9" fill="#e0474c"/>
 <line x1="100" y1="72" x2="150" y2="24" stroke="#1d3a66" stroke-width="5" stroke-linecap="round"/>
 <path d="M146 16 L160 14 L158 28 Z" fill="#2f7be6"/><path d="M152 20 L166 22 L156 30Z" fill="#1d5fc2"/>
 <g fill="#f2b33d"><path d="M36 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"/><path d="M168 54 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/></g>
</svg>`,
rocket:()=>`<svg viewBox="0 0 200 140" class="ill" aria-hidden="true">
 <path d="M24 122 Q24 98 52 102 Q60 80 92 90 Q112 74 136 94 Q170 88 176 122Z" fill="#e3ecfb"/>
 <g transform="rotate(38 104 66)">
  <path d="M104 6 C126 26 130 60 124 96 L84 96 C78 60 82 26 104 6Z" fill="#2f7be6"/>
  <path d="M104 6 C114 15 120 26 123 38 L85 38 C88 26 94 15 104 6Z" fill="#e0474c"/>
  <circle cx="104" cy="58" r="13" fill="#fff"/><circle cx="104" cy="58" r="8" fill="#5ec8ff"/>
  <path d="M84 76 L66 102 L86 96Z" fill="#e0474c"/><path d="M124 76 L142 102 L122 96Z" fill="#e0474c"/>
  <path d="M90 96 Q104 132 118 96Z" fill="#f2b33d"/><path d="M96 96 Q104 118 112 96Z" fill="#fff1b8"/>
 </g>
 <g fill="#f2b33d"><path d="M40 30 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"/><path d="M170 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z"/></g>
</svg>`,
flasks:()=>`<svg viewBox="0 0 220 150" width="210" aria-hidden="true">
 <path d="M18 140 Q8 100 30 92 Q24 120 40 140Z" fill="#9bd1a8"/><path d="M30 140 Q34 108 56 104 Q44 124 48 140Z" fill="#7cc08f"/>
 <path d="M70 20 h30 v40 l34 66 a10 10 0 0 1 -9 14 h-80 a10 10 0 0 1 -9 -14 l34 -66z" fill="#eaf4ff" stroke="#b9cfe8" stroke-width="3"/>
 <path d="M58 94 h54 l18 34 a8 8 0 0 1 -7 11 h-76 a8 8 0 0 1 -7 -11z" fill="#3d8df0" opacity=".85"/>
 <rect x="66" y="12" width="38" height="10" rx="4" fill="#cfe0f5"/>
 <path d="M152 52 h20 v26 l26 50 a8 8 0 0 1 -7 12 h-58 a8 8 0 0 1 -7 -12 l26 -50z" fill="#fdf0f5" stroke="#e8c4d3" stroke-width="3"/>
 <path d="M140 104 h44 l12 24 a7 7 0 0 1 -6 10 h-56 a7 7 0 0 1 -6 -10z" fill="#ef7fa8" opacity=".85"/>
 <rect x="148" y="44" width="28" height="9" rx="4" fill="#f3d6e2"/>
 <circle cx="80" cy="112" r="4" fill="#fff" opacity=".6"/><circle cx="92" cy="122" r="3" fill="#fff" opacity=".6"/><circle cx="160" cy="118" r="3" fill="#fff" opacity=".6"/>
</svg>`,
spark:(c='#f2b33d')=>`<svg viewBox="0 0 46 30" class="spark" aria-hidden="true"><g stroke="${c}" stroke-width="4" stroke-linecap="round"><line x1="4" y1="6" x2="16" y2="12"/><line x1="2" y1="18" x2="16" y2="18"/><line x1="4" y1="28" x2="16" y2="24"/></g></svg>`,
check:(c='#15a46d')=>`<svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="10" fill="${c}"/><path d="M6 11.5l3.2 3 6.5-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
i:{home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 12h3v8h5v-6h4v6h5v-8h3z"/></svg>',
   chart:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/></svg>',
   help:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 17h-2v-2h2zm2.1-7.7-.9.9c-.7.8-1.2 1.4-1.2 2.8h-2v-.5c0-1.1.5-2.1 1.2-2.8l1.2-1.3A2 2 0 1 0 10 9H8a4 4 0 1 1 7.1 2.3z"/></svg>',
   out:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></svg>',
   globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
   play:'<svg viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
   book:'<svg viewBox="0 0 24 24" width="26" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg>',
   cycle:'<svg viewBox="0 0 24 24" width="26" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 8a8 8 0 0 0-14-2L4 8M4 4v4h4M4 16a8 8 0 0 0 14 2l2-2M20 20v-4h-4"/></svg>',
   star:'<svg viewBox="0 0 24 24" width="26" fill="#f6c443"><path d="M12 2l3 7 7 .6-5.3 4.7L18.3 22 12 18l-6.3 4 1.6-7.7L2 9.6 9 9z"/></svg>',
   send:'<svg viewBox="0 0 24 24" width="20" fill="currentColor"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg>'}
};
