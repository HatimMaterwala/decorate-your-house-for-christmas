/* Christmas music player.
 * Default playlist = traditional public-domain carols played by a built-in Web Audio "music box"
 * (no audio files and no licensing needed). Users can add their own MP3s to the playlist.
 * Note format: NOTE[:beats], e.g. "E4:2", "F#4:0.5", "R" = rest.
 */
window.Music = (function () {
  const SONGS = [
    {
      title: 'Jingle Bells', bpm: 168, jingle: true, notes: `
      G3 E4 D4 C4 G3:3 G3:0.5 G3:0.5 G3 E4 D4 C4 A3:4 A3 F4 E4 D4 B3:4 G4 G4 F4 D4 E4:4
      G3 E4 D4 C4 G3:4 G3 E4 D4 C4 A3:3 A3 A3 F4 E4 D4 G4 G4 G4 G4 A4 G4 F4 D4 C4:2 G4:2
      E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:0.5 E4:4 F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5 E4 D4 D4 E4 D4:2 G4:2
      E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:0.5 E4:4 F4 F4 F4:1.5 F4:0.5 F4 E4 E4 E4:0.5 E4:0.5 G4 G4 F4 D4 C4:4` },
    {
      title: 'Deck the Halls', bpm: 132, jingle: true, notes: `
      G4:1.5 F4:0.5 E4 D4 C4 D4 E4 C4 D4:0.5 E4:0.5 F4:0.5 D4:0.5 E4:1.5 D4:0.5 C4 B3 C4:2
      G4:1.5 F4:0.5 E4 D4 C4 D4 E4 C4 D4:0.5 E4:0.5 F4:0.5 D4:0.5 E4:1.5 D4:0.5 C4 B3 C4:2
      D4:1.5 E4:0.5 F4 D4 E4:1.5 F4:0.5 G4 D4 E4:0.5 F#4:0.5 G4 A4:0.5 B4:0.5 C5 B4 A4 G4:2
      G4:1.5 F4:0.5 E4 D4 C4 D4 E4 C4 A4:0.5 A4:0.5 A4:0.5 A4:0.5 G4:1.5 F4:0.5 E4 D4 C4:2` },
    {
      title: 'Silent Night', bpm: 170, notes: `
      G4:3 A4:1 G4:2 E4:6 G4:3 A4:1 G4:2 E4:6 D5:4 D5:2 B4:6 C5:4 C5:2 G4:6
      A4:4 A4:2 C5:3 B4:1 A4:2 G4:3 A4:1 G4:2 E4:6 A4:4 A4:2 C5:3 B4:1 A4:2 G4:3 A4:1 G4:2 E4:6
      D5:4 D5:2 F5:3 D5:1 B4:2 C5:6 E5:6 C5:3 G4:1 E4:2 G4:3 F4:1 D4:2 C4:12` },
    {
      title: 'We Wish You a Merry Christmas', bpm: 160, jingle: true, notes: `
      G3 C4 C4:0.5 D4:0.5 C4:0.5 B3:0.5 A3 A3 A3 D4 D4:0.5 E4:0.5 D4:0.5 C4:0.5 B3 G3 G3
      E4 E4:0.5 F4:0.5 E4:0.5 D4:0.5 C4 A3 G3:0.5 G3:0.5 A3 D4 B3 C4:2
      G3 C4 C4 C4 B3:2 B3 C4 B3 A3 G3:2 D4 E4 D4:0.5 D4:0.5 C4:0.5 C4:0.5 G4 G3 G3:0.5 G3:0.5 A3 D4 B3 C4:3` },
    {
      title: 'Joy to the World', bpm: 200, notes: `
      C5:2 B4:1.5 A4:0.5 G4:3 F4:1 E4:2 D4:2 C4:3 G4:1 A4:3 A4:1 B4:3 B4:1 C5:6
      C5:1 C5:1 B4:1 A4:1 G4:1 G4:1.5 F4:0.5 E4:1 C5:1 C5:1 B4:1 A4:1 G4:1 G4:1.5 F4:0.5 E4:1
      E4:1 E4:1 E4:1 E4:1 E4:1 E4:0.5 F4:0.5 G4:3 F4:0.5 E4:0.5 D4:1 D4:1 D4:1 D4:0.5 E4:0.5 F4:3
      E4:0.5 D4:0.5 C4:1 C5:2 A4:1 G4:1.5 F4:0.5 E4:1 F4:1 E4:2 D4:2 C4:4` },
  ];

  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(name) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(name);
    if (!m) return null;
    const n = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (+m[3] + 1) * 12 + n;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  const parse = str => str.trim().split(/\s+/).map(tok => {
    const [n, d] = tok.split(':');
    return { f: n === 'R' ? null : freq(n), d: d ? parseFloat(d) : 1 };
  });

  /* Famous (copyrighted) Christmas hits are streamed through YouTube's embedded player, which
   * handles the licensing and plays full songs for everyone. All IDs were checked to allow embedding.
   * YouTube's rules: the player must stay visible (min 200×200), so it lives in the right-hand music panel. */
  const HITS = [
    ['All I Want for Christmas Is You', 'Mariah Carey', 'aAkMkVFwAoo'],
    ['Last Christmas', 'Wham!', 'E8gmARGvPlI'],
    ["Rockin' Around the Christmas Tree", 'Brenda Lee', '1qYz7rfgLWE'],
    ['Jingle Bell Rock', 'Bobby Helms', 'itcMLwMEeMQ'],
    ['Santa Tell Me', 'Ariana Grande', 'nlR0MkrRklg'],
    ["It's Beginning to Look a Lot Like Christmas", 'Michael Bublé', 'QJ5DOWPGxwg'],
    ["It's the Most Wonderful Time of the Year", 'Andy Williams', 'AN_R4pR1hck'],
    ['Feliz Navidad', 'José Feliciano', 'N8NcQzMQN_U'],
    ['Mistletoe', 'Justin Bieber', 'LUjn3RpkcKY'],
    ['Merry Christmas', 'Ed Sheeran & Elton John', 'Q_yuO8UNGmY'],
    ['Let It Snow!', 'Dean Martin', 'mN7LW0Y00kE'],
    ['A Holly Jolly Christmas', 'Burl Ives', 'nVMCUtsmWmQ'],
    ['The Christmas Song', 'Nat King Cole', 'hwacxSnc4tI'],
    ['Happy Xmas (War Is Over)', 'John Lennon', 'z8Vfp48laS8'],
    ['Wonderful Christmastime', 'Paul McCartney', 'V9BZDpni56Y'],
    ['Fairytale of New York', 'The Pogues', 'j9jbdgZidu8'],
    ['Merry Christmas Everyone', "Shakin' Stevens", 'N-PyWfVkjZc'],
    ['Snowman', 'Sia', 'gset79KMmt0'],
    ["Do They Know It's Christmas?", 'Band Aid', 'bjQzJAKxTrE'],
  ];

  const tracks = [
    ...HITS.map(([title, artist, videoId]) => ({ type: 'youtube', title, artist, videoId })),
    ...SONGS.map(s => ({ type: 'synth', title: s.title, artist: 'Music-box carol', bpm: s.bpm, jingle: !!s.jingle, notes: parse(s.notes) })),
  ];

  /* ---- YouTube player (loaded on first use) ---- */
  // YouTube refuses to play embeds on pages opened straight from disk (file://), so skip the hits there.
  const OPENED_AS_FILE = location.protocol === 'file:';
  let yt = null, ytPromise = null, ytFailed = OPENED_AS_FILE, ytErrors = 0, noticeShown = false;
  const noticeListeners = [];
  function ytUnavailable() {
    ytFailed = true;
    if (noticeShown) return;
    noticeShown = true;
    const msg = OPENED_AS_FILE
      ? 'The hit songs need the site opened from a web address. Double-click start.bat (or go to http://localhost:5173). Playing carols for now.'
      : "Couldn't load the hit songs from YouTube (offline or blocked). Playing carols instead.";
    noticeListeners.forEach(f => f(msg));
  }
  function loadYT() {
    if (ytPromise) return ytPromise;
    ytPromise = new Promise((resolve, reject) => {
      const fail = setTimeout(() => reject(new Error('YouTube took too long to load')), 12000);
      window.onYouTubeIframeAPIReady = () => {
        yt = new YT.Player('ytPlayer', {
          width: '100%', height: '100%',
          // Clean look: no YouTube control bar / annotations; our own buttons control playback.
          playerVars: { playsinline: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3 },
          events: {
            onReady: () => { clearTimeout(fail); resolve(yt); },
            onStateChange: onYtState,
            onError: onYtError,
          },
        });
      };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => { clearTimeout(fail); reject(new Error('YouTube blocked or offline')); };
      document.head.appendChild(s);
    });
    return ytPromise;
  }
  const isYT = () => tracks[index].type === 'youtube';

  function onYtState(e) {
    if (!isYT()) return;
    if (e.data === 0) { ytErrors = 0; if (playing) next(); }                            // ended
    else if (e.data === 1) { ytErrors = 0; if (!playing) { playing = true; emit(); } }  // played from YouTube's own UI
    else if (e.data === 2 && playing) { playing = false; emit(); }                     // paused from YouTube's own UI
  }
  function onYtError() {
    if (!isYT()) return;
    // A video was removed or blocked in this country: skip it. If they all fail, fall back to the carols.
    if (++ytErrors >= HITS.length) { ytUnavailable(); playIndex(firstNonYT()); } else next();
  }
  const firstNonYT = () => tracks.findIndex(t => t.type !== 'youtube');

  function startYouTubeTrack(tr) {
    loadYT().then(p => {
      if (tracks[index] !== tr) return; // user skipped while it was loading
      p.setVolume(Math.round(volume * 100));
      p.loadVideoById(tr.videoId);
      if (!playing) p.pauseVideo();
    }).catch(() => {
      ytUnavailable();
      if (tracks[index] === tr) playIndex(firstNonYT());
    });
  }

  let ctx = null, master, dry, reverbIn, noiseBuf, bus = null;
  let index = 0, playing = false, started = false, loaded = false, volume = 0.6;
  let noteIdx = 0, nextTime = 0, beatPos = 0, endAt = null, timer = null;
  const audio = new Audio();
  const listeners = [];

  const state = () => ({ index, playing, started, title: tracks[index].title, artist: tracks[index].artist, type: tracks[index].type, tracks });
  const emit = () => listeners.forEach(f => f(state()));

  function ensureCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = volume; master.connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = 0.8; dry.connect(master);
    const conv = ctx.createConvolver(); conv.buffer = impulse(2.8, 2.4);
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    conv.connect(wet); wet.connect(master); reverbIn = conv;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  // Each track plays through its own bus so skipping can fade the previous song out cleanly.
  function newBus() {
    if (bus) {
      const old = bus;
      old.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      setTimeout(() => old.disconnect(), 800);
    }
    bus = ctx.createGain();
    bus.connect(dry); bus.connect(reverbIn);
  }

  // Music-box / celesta-like tone.
  function bell(f, t, dur) {
    const decay = Math.max(1.1, dur * 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + decay);
    g.connect(bus);
    [[1, 'sine', 1], [2, 'sine', 0.35], [3.01, 'triangle', 0.08], [0.5, 'sine', 0.25]].forEach(([m, type, amp]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f * m;
      const og = ctx.createGain(); og.gain.value = amp;
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + decay + 0.05);
    });
  }

  // Sleigh-bell shake.
  function jingle(t, amp) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    src.connect(hp); hp.connect(g); g.connect(bus);
    src.start(t); src.stop(t + 0.2);
  }

  function tick() {
    if (!playing || !ctx) return;
    const tr = tracks[index];
    if (tr.type !== 'synth') return;
    if (endAt !== null) { if (ctx.currentTime >= endAt) next(); return; }
    const spb = 60 / tr.bpm;
    while (nextTime < ctx.currentTime + 0.2) {
      if (noteIdx >= tr.notes.length) { endAt = nextTime + 1.8; return; }
      const n = tr.notes[noteIdx];
      const dur = n.d * spb;
      if (n.f) bell(n.f, nextTime, dur);
      if (tr.jingle) {
        for (let b = Math.ceil(beatPos - 1e-6); b < beatPos + n.d - 1e-6; b++) {
          jingle(nextTime + (b - beatPos) * spb, b % 2 === 0 ? 0.05 : 0.025);
        }
      }
      beatPos += n.d; nextTime += dur; noteIdx++;
    }
  }

  function load(i, dir = 1) {
    index = (i + tracks.length) % tracks.length;
    // If YouTube can't load here, skip the hits.
    if (ytFailed && isYT()) ytUnavailable();
    if (ytFailed) { let guard = tracks.length; while (isYT() && guard--) index = (index + dir + tracks.length) % tracks.length; }
    const tr = tracks[index];
    audio.pause();
    if (yt && tr.type !== 'youtube') yt.pauseVideo();
    newBus();
    if (tr.type === 'youtube') {
      startYouTubeTrack(tr);
    } else if (tr.type === 'synth') {
      noteIdx = 0; beatPos = 0; endAt = null;
      nextTime = ctx.currentTime + 0.12;
      if (!timer) timer = setInterval(tick, 25);
    } else {
      audio.src = tr.url;
      audio.volume = volume;
      audio.play().catch(() => {});
    }
    emit();
  }

  function playIndex(i, dir = 1) {
    ensureCtx();
    started = true; playing = true; loaded = true;
    if (ctx.state === 'suspended') ctx.resume();
    load(i, dir);
  }

  function play() {
    ensureCtx();
    started = true; playing = true;
    if (ctx.state === 'suspended') ctx.resume();
    if (!loaded) { loaded = true; load(index); return; }
    if (tracks[index].type === 'file') audio.play().catch(() => {});
    if (isYT() && yt) yt.playVideo();
    emit();
  }

  function pause() {
    playing = false;
    if (ctx) ctx.suspend();
    audio.pause();
    if (yt) yt.pauseVideo();
    emit();
  }

  const next = () => playIndex(index + 1, 1);
  const prev = () => playIndex(index - 1, -1);

  audio.addEventListener('ended', () => { if (playing) next(); });
  audio.addEventListener('error', () => { if (playing && tracks[index].type === 'file') next(); });

  return {
    play, pause, next, prev, playIndex,
    _debug: () => ({ ytState: yt && yt.getPlayerState ? yt.getPlayerState() : null, ytFailed, ytErrors, ctx: ctx && ctx.state }),
    toggle: () => (playing ? pause() : play()),
    state,
    onChange: f => { listeners.push(f); f(state()); },
    onNotice: f => noticeListeners.push(f),
    setVolume(v) {
      volume = v;
      if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
      audio.volume = v;
      if (yt) yt.setVolume(Math.round(v * 100));
    },
    addFiles(files) {
      const first = tracks.length;
      [...files].forEach(file => {
        if (!file.type.startsWith('audio/')) return;
        tracks.push({ type: 'file', title: file.name.replace(/\.[^.]+$/, ''), artist: 'Your song', url: URL.createObjectURL(file) });
      });
      if (tracks.length > first) playIndex(first); else emit();
    },
  };
})();
