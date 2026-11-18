/* Decoration artwork as inline SVG — no external assets, scales crisply.
 * Each item: id, name, w/h (SVG canvas), size (display width in a 1600px-wide scene), glow (optional colour).
 */
(function () {
  const svg = (w, h, body) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

  const item = (id, name, w, h, size, body, glow) => ({ id, name, w, h, size, glow, svg: svg(w, h, body) });

  const ornament = (c1, c2, band) => `
    <defs><radialGradient id="g" cx="35%" cy="35%" r="70%">
      <stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs>
    <line x1="40" y1="0" x2="40" y2="22" stroke="#c9b37a" stroke-width="2"/>
    <rect x="31" y="20" width="18" height="12" rx="2" fill="#d9b24a"/>
    <circle cx="40" cy="64" r="32" fill="url(#g)"/>
    <path d="M9 58 Q40 70 71 58 L71 66 Q40 78 9 66Z" fill="${band}" opacity=".85"/>
    <ellipse cx="28" cy="50" rx="8" ry="5" fill="#fff" opacity=".55" transform="rotate(-30 28 50)"/>`;

  const bow = (x, y, s = 1) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0 C-22 -18 -34 -2 -26 8 C-20 15 -8 8 0 0Z" fill="#d62839"/>
      <path d="M0 0 C22 -18 34 -2 26 8 C20 15 8 8 0 0Z" fill="#d62839"/>
      <path d="M-3 2 L-14 30 L-6 26 L-2 32Z M3 2 L14 30 L6 26 L2 32Z" fill="#b51f2e"/>
      <circle r="6" fill="#ef4a5a"/>
    </g>`;

  const hanging = [
    item('moon', 'Moon', 100, 100, 150, `
      <defs><radialGradient id="m" cx="35%" cy="40%" r="75%">
        <stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#f5d26a"/></radialGradient></defs>
      <path d="M50 5 A45 45 0 1 0 95 50 A35 35 0 1 1 50 5Z" fill="url(#m)"/>
      <circle cx="30" cy="62" r="4" fill="#e8c35a" opacity=".6"/>
      <circle cx="42" cy="80" r="3" fill="#e8c35a" opacity=".5"/>`, '#ffe48a'),

    item('star', 'Star', 100, 100, 110, `
      <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#f2b705"/></linearGradient></defs>
      <polygon points="50,4 61,37 96,37 68,58 79,93 50,72 21,93 32,58 4,37 39,37"
        fill="url(#s)" stroke="#e0a100" stroke-width="2" stroke-linejoin="round"/>`, '#ffd34d'),

    item('bells', 'Bells', 120, 110, 120, `
      <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffe18a"/><stop offset="1" stop-color="#c98d0a"/></linearGradient></defs>
      <g transform="translate(42 62) rotate(-16)">
        <path d="M0 -30 C-18 -30 -22 -10 -22 8 C-22 20 -30 24 -30 28 L30 28 C30 24 22 20 22 8 C22 -10 18 -30 0 -30Z" fill="url(#b)" stroke="#a87405" stroke-width="2"/>
        <circle cy="32" r="6" fill="#a87405"/></g>
      <g transform="translate(78 62) rotate(16)">
        <path d="M0 -30 C-18 -30 -22 -10 -22 8 C-22 20 -30 24 -30 28 L30 28 C30 24 22 20 22 8 C22 -10 18 -30 0 -30Z" fill="url(#b)" stroke="#a87405" stroke-width="2"/>
        <circle cy="32" r="6" fill="#a87405"/></g>
      <path d="M44 28 Q30 18 22 26 M76 28 Q90 18 98 26" stroke="#1f6b3a" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${bow(60, 24, 0.9)}`),

    item('wreath', 'Wreath', 120, 130, 150, `
      <circle cx="60" cy="60" r="40" fill="none" stroke="#17532f" stroke-width="26"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke="#2c8a4e" stroke-width="16" stroke-dasharray="5 6"/>
      <circle cx="60" cy="60" r="32" fill="none" stroke="#3aa860" stroke-width="5" stroke-dasharray="3 9"/>
      <g fill="#e0283a">
        <circle cx="30" cy="40" r="4.5"/><circle cx="36" cy="34" r="4.5"/><circle cx="88" cy="44" r="4.5"/>
        <circle cx="94" cy="70" r="4.5"/><circle cx="60" cy="22" r="4.5"/><circle cx="28" cy="76" r="4.5"/></g>
      ${bow(60, 98, 1.2)}`),

    item('garland', 'Garland', 300, 90, 360, `
      <path d="M8 12 Q150 112 292 12" fill="none" stroke="#17532f" stroke-width="24" stroke-linecap="round"/>
      <path d="M8 12 Q150 112 292 12" fill="none" stroke="#2c8a4e" stroke-width="14" stroke-dasharray="4 6"/>
      <circle cx="79" cy="60" r="9" fill="#e0283a"/><circle cx="150" cy="74" r="10" fill="#f2b705"/>
      <circle cx="221" cy="60" r="9" fill="#e0283a"/>
      ${bow(12, 14, 0.8)}${bow(288, 14, 0.8)}`),

    item('ornament-red', 'Red bauble', 80, 100, 70, ornament('#a3121f', '#ff6b6b', '#f2c14e')),
    item('ornament-gold', 'Gold bauble', 80, 100, 70, ornament('#b07d05', '#ffe08a', '#d62839')),
    item('ornament-blue', 'Blue bauble', 80, 100, 70, ornament('#123f8c', '#7fb2ff', '#ffffff')),

    item('snowflake', 'Snowflake', 100, 100, 100, `
      <g stroke="#eaf6ff" stroke-width="5" stroke-linecap="round" fill="none">
        ${[0, 60, 120].map(a => `<g transform="rotate(${a} 50 50)">
          <line x1="50" y1="6" x2="50" y2="94"/>
          <path d="M40 16 L50 26 L60 16 M40 84 L50 74 L60 84"/></g>`).join('')}
      </g><circle cx="50" cy="50" r="6" fill="#ffffff"/>`, '#a8dcff'),

    item('candycane', 'Candy cane', 70, 150, 70, `
      <path d="M22 140 L22 42 A20 20 0 0 1 62 42 L62 52" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
      <path d="M22 140 L22 42 A20 20 0 0 1 62 42 L62 52" fill="none" stroke="#e0283a" stroke-width="14" stroke-dasharray="9 9"/>
      ${bow(22, 92, 0.6)}`),

    item('mistletoe', 'Mistletoe', 100, 120, 90, `
      <line x1="50" y1="0" x2="50" y2="30" stroke="#d62839" stroke-width="3"/>
      <g fill="#2c8a4e">
        <ellipse cx="34" cy="62" rx="10" ry="24" transform="rotate(35 34 62)"/>
        <ellipse cx="66" cy="62" rx="10" ry="24" transform="rotate(-35 66 62)"/>
        <ellipse cx="50" cy="76" rx="9" ry="22"/></g>
      <g fill="#f6f6ee" stroke="#d8d8c8"><circle cx="46" cy="44" r="6"/><circle cx="56" cy="46" r="6"/><circle cx="51" cy="38" r="6"/></g>
      ${bow(50, 30, 0.8)}`),

    item('bow', 'Big bow', 120, 100, 100, bow(60, 36, 1.7)),
  ];

  const figures = [
    item('santa', 'Santa', 200, 280, 180, `
      <rect x="55" y="248" width="40" height="24" rx="9" fill="#222"/>
      <rect x="105" y="248" width="40" height="24" rx="9" fill="#222"/>
      <rect x="62" y="212" width="76" height="42" fill="#b71c1c"/>
      <path d="M50 145 Q22 172 30 202" stroke="#d32f2f" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M150 145 Q178 172 170 202" stroke="#d32f2f" stroke-width="26" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="208" r="13" fill="#2e7d32"/><circle cx="170" cy="208" r="13" fill="#2e7d32"/>
      <path d="M45 140 Q100 116 155 140 L166 226 Q100 242 34 226Z" fill="#d32f2f"/>
      <rect x="94" y="138" width="12" height="82" fill="#fff"/>
      <rect x="34" y="214" width="132" height="18" rx="9" fill="#fff"/>
      <rect x="40" y="184" width="120" height="17" fill="#222"/>
      <rect x="87" y="180" width="26" height="25" rx="3" fill="none" stroke="#f4c430" stroke-width="5"/>
      <circle cx="100" cy="95" r="34" fill="#f6c9a8"/>
      <circle cx="80" cy="102" r="7" fill="#f29c9c" opacity=".6"/><circle cx="120" cy="102" r="7" fill="#f29c9c" opacity=".6"/>
      <path d="M64 100 Q60 152 100 162 Q140 152 136 100 Q120 122 100 120 Q80 122 64 100Z" fill="#fff"/>
      <ellipse cx="88" cy="112" rx="14" ry="7" fill="#fff"/><ellipse cx="112" cy="112" rx="14" ry="7" fill="#fff"/>
      <circle cx="100" cy="104" r="6" fill="#e8998d"/>
      <circle cx="88" cy="91" r="3.5" fill="#333"/><circle cx="112" cy="91" r="3.5" fill="#333"/>
      <path d="M66 76 Q88 20 140 38 Q156 48 160 70 L134 76Z" fill="#d32f2f"/>
      <rect x="60" y="66" width="82" height="19" rx="9.5" fill="#fff"/>
      <circle cx="160" cy="72" r="11" fill="#fff"/>`),

    item('reindeer', 'Reindeer', 250, 230, 220, `
      <g fill="#7a4a2a">
        <rect x="56" y="140" width="14" height="72" rx="5"/><rect x="82" y="140" width="14" height="72" rx="5"/>
        <rect x="148" y="140" width="14" height="72" rx="5"/><rect x="170" y="140" width="14" height="72" rx="5"/></g>
      <g fill="#3b2516">
        <rect x="54" y="206" width="18" height="10" rx="3"/><rect x="80" y="206" width="18" height="10" rx="3"/>
        <rect x="146" y="206" width="18" height="10" rx="3"/><rect x="168" y="206" width="18" height="10" rx="3"/></g>
      <ellipse cx="38" cy="114" rx="11" ry="8" fill="#f3e6d4"/>
      <ellipse cx="112" cy="130" rx="76" ry="38" fill="#9c6236"/>
      <ellipse cx="118" cy="148" rx="50" ry="17" fill="#c99a6a"/>
      <path d="M158 122 L184 58 L208 68 L192 132Z" fill="#9c6236"/>
      <path d="M195 44 L184 14 M187 24 L173 18 M185 17 L191 5 M210 42 L216 11 M214 22 L227 14 M215 13 L210 3"
        stroke="#6d4c2f" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="188" cy="46" rx="11" ry="5" fill="#7a4a2a" transform="rotate(-30 188 46)"/>
      <ellipse cx="206" cy="60" rx="27" ry="18" fill="#9c6236"/>
      <ellipse cx="226" cy="66" rx="13" ry="11" fill="#b07a4a"/>
      <circle cx="237" cy="63" r="9" fill="#e53935"/><circle cx="234" cy="60" r="3" fill="#ff9e9e"/>
      <circle cx="210" cy="54" r="3.5" fill="#222"/>
      <path d="M167 104 L198 112" stroke="#c62828" stroke-width="9" stroke-linecap="round"/>
      <circle cx="183" cy="119" r="7" fill="#f2b705" stroke="#a87405" stroke-width="2"/>`),

    item('sleigh', 'Sleigh', 320, 200, 300, `
      <path d="M20 178 L268 178 Q306 178 300 140" stroke="#d4a017" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M72 150 L72 178 M222 150 L222 178" stroke="#d4a017" stroke-width="7"/>
      <path d="M130 92 Q124 42 166 38 Q208 42 202 92Z" fill="#8d6e63"/>
      <path d="M150 46 Q166 54 182 46" stroke="#5d4037" stroke-width="4" fill="none"/>
      <rect x="196" y="60" width="34" height="34" fill="#2e7d32"/><rect x="209" y="60" width="8" height="34" fill="#f2b705"/>
      <rect x="110" y="66" width="28" height="28" fill="#1565c0"/><rect x="120" y="66" width="8" height="28" fill="#fff"/>
      <path d="M40 152 L250 152 Q286 152 292 106 L292 70 Q262 92 240 92 L120 92 L110 40 Q60 30 40 62 Z"
        fill="#c62828" stroke="#8e1b1b" stroke-width="3"/>
      <path d="M110 40 Q60 30 40 62" stroke="#f2c14e" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M292 70 Q262 92 240 92" stroke="#f2c14e" stroke-width="5" fill="none"/>
      <circle cx="78" cy="118" r="18" fill="none" stroke="#f2c14e" stroke-width="4"/>
      <path d="M100 136 L260 136" stroke="#f2c14e" stroke-width="4"/>`),

    item('snowman', 'Snowman', 160, 240, 150, `
      <path d="M46 112 L10 86 M20 94 L10 80 M114 112 L150 86 M140 94 L150 80" stroke="#6d4c2f" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="80" cy="186" r="52" fill="#fff" stroke="#cfd8e3" stroke-width="3"/>
      <circle cx="80" cy="116" r="38" fill="#fff" stroke="#cfd8e3" stroke-width="3"/>
      <circle cx="80" cy="60" r="28" fill="#fff" stroke="#cfd8e3" stroke-width="3"/>
      <rect x="58" y="6" width="44" height="34" rx="3" fill="#222"/>
      <rect x="58" y="28" width="44" height="7" fill="#c62828"/>
      <rect x="46" y="36" width="68" height="9" rx="4" fill="#222"/>
      <circle cx="70" cy="54" r="3.5" fill="#222"/><circle cx="90" cy="54" r="3.5" fill="#222"/>
      <path d="M80 61 L106 67 L80 68Z" fill="#f57c00"/>
      <g fill="#444"><circle cx="68" cy="74" r="2"/><circle cx="74" cy="77" r="2"/><circle cx="80" cy="78" r="2"/><circle cx="86" cy="77" r="2"/><circle cx="92" cy="74" r="2"/></g>
      <rect x="50" y="82" width="60" height="13" rx="6" fill="#c62828"/>
      <rect x="88" y="88" width="13" height="36" rx="5" fill="#c62828" transform="rotate(12 94 88)"/>
      <g fill="#222"><circle cx="80" cy="108" r="4"/><circle cx="80" cy="124" r="4"/><circle cx="80" cy="142" r="4"/></g>`),

    item('tree', 'Xmas tree', 180, 260, 200, `
      <rect x="77" y="218" width="26" height="34" fill="#6d4c2f"/>
      <polygon points="90,36 142,104 38,104" fill="#2e7d32"/>
      <polygon points="90,76 156,164 24,164" fill="#27702c"/>
      <polygon points="90,124 172,228 8,228" fill="#1f6326"/>
      <path d="M48 98 Q90 116 132 96 M36 158 Q90 182 146 156 M22 220 Q90 246 160 218" stroke="#f2c14e" stroke-width="4" fill="none"/>
      <g><circle cx="72" cy="88" r="6" fill="#e0283a"/><circle cx="110" cy="80" r="6" fill="#1e88e5"/>
        <circle cx="60" cy="146" r="7" fill="#f2b705"/><circle cx="118" cy="140" r="7" fill="#e0283a"/>
        <circle cx="90" cy="128" r="6" fill="#ffffff"/><circle cx="46" cy="208" r="7" fill="#1e88e5"/>
        <circle cx="90" cy="196" r="7" fill="#e0283a"/><circle cx="136" cy="204" r="7" fill="#f2b705"/></g>
      <polygon points="90,4 98,26 120,26 102,39 109,60 90,47 71,60 78,39 60,26 82,26" fill="#ffd34d" stroke="#e0a100" stroke-width="2"/>`),

    item('gifts', 'Presents', 200, 150, 170, `
      <rect x="140" y="42" width="52" height="100" fill="#2e7d32"/><rect x="161" y="42" width="10" height="100" fill="#e0283a"/>
      <rect x="10" y="62" width="84" height="80" fill="#d62839"/><rect x="46" y="62" width="12" height="80" fill="#2fa36b"/>
      <rect x="10" y="96" width="84" height="12" fill="#2fa36b"/>
      <rect x="88" y="84" width="64" height="58" fill="#1565c0"/><rect x="114" y="84" width="10" height="58" fill="#f2c14e"/>
      <rect x="88" y="108" width="64" height="10" fill="#f2c14e"/>
      ${bow(52, 60, 0.75)}${bow(166, 42, 0.6)}`),

    item('gingerbread', 'Gingerbread', 120, 150, 100, `
      <g stroke="#b5703a" stroke-width="26" stroke-linecap="round">
        <line x1="60" y1="70" x2="18" y2="82"/><line x1="60" y1="70" x2="102" y2="82"/>
        <line x1="52" y1="100" x2="34" y2="134"/><line x1="68" y1="100" x2="86" y2="134"/></g>
      <rect x="36" y="56" width="48" height="56" rx="20" fill="#b5703a"/>
      <circle cx="60" cy="34" r="26" fill="#b5703a"/>
      <g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M50 42 Q60 50 70 42"/><path d="M10 76 l4 6 l4 -6 M102 76 l4 6 l4 -6 M28 130 l4 6 l4 -6 M82 130 l4 6 l4 -6"/></g>
      <circle cx="51" cy="30" r="3.5" fill="#fff"/><circle cx="69" cy="30" r="3.5" fill="#fff"/>
      <circle cx="60" cy="72" r="5" fill="#e0283a"/><circle cx="60" cy="88" r="5" fill="#2fa36b"/>`),
  ];

  /* Placeholder scene so people can try decorating before uploading a photo. */
  let stars = '';
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    stars += `<circle cx="${(rnd() * 1600).toFixed(0)}" cy="${(rnd() * 560).toFixed(0)}" r="${(0.6 + rnd() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.3 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  const pine = (x, y, s, c) =>
    `<polygon points="${x},${y - 160 * s} ${x + 55 * s},${y - 60 * s} ${x + 30 * s},${y - 60 * s} ${x + 70 * s},${y} ${x - 70 * s},${y} ${x - 30 * s},${y - 60 * s} ${x - 55 * s},${y - 60 * s}" fill="${c}"/>`;

  const DEFAULT_HOUSE = svg(1600, 1000, `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a1430"/><stop offset=".65" stop-color="#1d2f60"/><stop offset="1" stop-color="#3a4d86"/></linearGradient>
      <linearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eef3ff"/><stop offset="1" stop-color="#b6c4e6"/></linearGradient>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8a5a44"/><stop offset="1" stop-color="#6a4232"/></linearGradient>
      <radialGradient id="win" cx="50%" cy="50%" r="65%">
        <stop offset="0" stop-color="#fff0b8"/><stop offset="1" stop-color="#f0a238"/></radialGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#sky)"/>
    ${stars}
    <path d="M0 700 Q300 620 600 690 T1200 670 T1600 690 V1000 H0Z" fill="#26386a"/>
    ${pine(120, 800, 1.5, '#142146')}${pine(250, 790, 1.1, '#18264f')}${pine(1380, 795, 1.4, '#142146')}${pine(1500, 800, 1.0, '#18264f')}
    <path d="M0 790 Q400 758 800 784 T1600 778 V1000 H0Z" fill="url(#snow)"/>
    <rect x="920" y="250" width="70" height="170" fill="#6b3b2e"/>
    <rect x="910" y="238" width="90" height="22" fill="#4a2a21"/>
    <path d="M908 240 Q955 222 1002 240 Z" fill="#eef3ff"/>
    <rect x="480" y="450" width="640" height="360" fill="url(#wall)"/>
    <g stroke="rgba(0,0,0,.10)" stroke-width="3">
      ${Array.from({ length: 11 }, (_, i) => `<line x1="480" y1="${480 + i * 30}" x2="1120" y2="${480 + i * 30}"/>`).join('')}</g>
    <polygon points="430,472 800,200 1170,472" fill="#3a2a35"/>
    <path d="M422 474 L800 196 L1178 474 L1150 474 L800 226 L450 474Z" fill="#eef3ff"/>
    <circle cx="800" cy="365" r="42" fill="url(#win)" stroke="#f5efe6" stroke-width="9"/>
    <path d="M800 323 V407 M758 365 H842" stroke="#f5efe6" stroke-width="5"/>
    <g stroke="#f5efe6">
      <rect x="540" y="540" width="140" height="120" fill="url(#win)" stroke-width="10"/>
      <rect x="920" y="540" width="140" height="120" fill="url(#win)" stroke-width="10"/>
      <path d="M610 540 V660 M540 600 H680 M990 540 V660 M920 600 H1060" stroke-width="6"/></g>
    <rect x="528" y="660" width="164" height="14" rx="4" fill="#eef3ff"/>
    <rect x="908" y="660" width="164" height="14" rx="4" fill="#eef3ff"/>
    <rect x="745" y="606" width="110" height="204" rx="8" fill="#7b1f24"/>
    <path d="M760 650 Q800 620 840 650" stroke="#f0a238" stroke-width="10" fill="none"/>
    <circle cx="836" cy="712" r="7" fill="#f2c14e"/>
    <rect x="715" y="806" width="170" height="20" rx="4" fill="#9aa4bd"/>
    <ellipse cx="575" cy="804" rx="95" ry="46" fill="#1b4535"/>
    <ellipse cx="1025" cy="804" rx="95" ry="46" fill="#1b4535"/>
    <path d="M490 790 Q575 742 660 790 Q575 770 490 790Z M940 790 Q1025 742 1110 790 Q1025 770 940 790Z" fill="#eef3ff"/>
  `);

  window.DECORATIONS = { hanging, figures };
  window.DEFAULT_HOUSE = DEFAULT_HOUSE;
})();
