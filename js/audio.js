/**
 * audio.js — Web Audio API: SFX + Background Music with volume control
 */

const AudioEngine = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function envelope(gain, t, attack, hold, decay, peak = 0.5) {
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peak, t + attack);
    gain.gain.setValueAtTime(peak, t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.001, t + attack + hold + decay);
  }

  // ── Sound Effects ─────────────────────────────────────────
  function playJump() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'triangle';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.15);
      envelope(gain, t, 0.01, 0.04, 0.1, 0.4);
      osc.start(t); osc.stop(t + 0.25);
    } catch (_) {}
  }

  function playCollect() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.1);
      envelope(gain, t, 0.005, 0.05, 0.1, 0.5);
      osc.start(t); osc.stop(t + 0.2);
    } catch (_) {}
  }

  function playHoneycomb() {
    try {
      const ac = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        const t = ac.currentTime + i * 0.07;
        osc.frequency.setValueAtTime(freq, t);
        envelope(gain, t, 0.005, 0.05, 0.12, 0.45);
        osc.start(t); osc.stop(t + 0.25);
      });
    } catch (_) {}
  }

  function playDamage() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.linearRampToValueAtTime(60, t + 0.18);
      envelope(gain, t, 0.005, 0.02, 0.18, 0.7);
      osc.start(t); osc.stop(t + 0.22);
    } catch (_) {}
  }

  function playGameOver() {
    try {
      const ac = getCtx();
      [440, 370, 311, 233].forEach((freq, i) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'triangle';
        const t = ac.currentTime + i * 0.2;
        osc.frequency.setValueAtTime(freq, t);
        envelope(gain, t, 0.01, 0.12, 0.22, 0.4);
        osc.start(t); osc.stop(t + 0.38);
      });
    } catch (_) {}
  }

  function playSweetRush() {
    try {
      const ac = getCtx();
      [523, 659, 784, 880, 1047, 880, 1047, 1319].forEach((freq, i) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        const t = ac.currentTime + i * 0.06;
        osc.frequency.setValueAtTime(freq, t);
        envelope(gain, t, 0.01, 0.03, 0.1, 0.4);
        osc.start(t); osc.stop(t + 0.2);
      });
    } catch (_) {}
  }

  function playSpring() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(900, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.22);
      envelope(gain, t, 0.005, 0.1, 0.15, 0.55);
      osc.start(t); osc.stop(t + 0.35);
    } catch (_) {}
  }

  // ── Background Music ──────────────────────────────────────
  // Cheerful 2-channel chiptune (melody + bass) using look-ahead scheduling
  let bgMasterGain = null;
  let bgSchedulerTimer = null;
  let bgMelodyIdx = 0;
  let bgBassIdx   = 0;
  let bgMelNextTime = 0;
  let bgBassNextTime = 0;
  let bgVolume = 0.3;

  // Bright C-major melody (freq, 8th-note beats)
  const BG_MELODY = [
    [523,2],[659,1],[784,1],[784,2],[659,1],[784,1],
    [880,2],[784,1],[659,1],[523,2],[587,1],[659,1],
    [784,4],[523,1],[659,1],[523,1],[440,1],
    [494,2],[440,1],[392,1],[440,4],
    [523,2],[659,1],[784,1],[659,2],[523,1],[440,1],
    [494,2],[523,1],[587,1],[659,4],
    [784,2],[659,1],[523,1],[440,2],[392,1],[440,1],
    [523,8],
  ];

  // Bass line (lower octave, held notes)
  const BG_BASS = [
    [131,4],[98,4],[110,4],[131,4],
    [131,4],[98,4],[110,4],[131,4],
    [131,4],[98,4],[110,4],[131,4],
    [131,4],[98,4],[110,4],[131,4],
  ];

  const BEAT = 60 / 168 / 2; // 8th-note at 168 BPM

  function _scheduleNote(freq, dur, time, type, gainNode, vol) {
    try {
      const ac = getCtx();
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(gainNode);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      const d = dur * BEAT;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.015);
      gain.gain.setValueAtTime(vol, time + d * 0.75);
      gain.gain.linearRampToValueAtTime(0, time + d);
      osc.start(time);
      osc.stop(time + d + 0.01);
    } catch (_) {}
  }

  function _bgSchedule() {
    try {
      const ac  = getCtx();
      const aheadTime = 0.12;
      const now = ac.currentTime;

      // Melody
      while (bgMelNextTime < now + aheadTime) {
        const [freq, beats] = BG_MELODY[bgMelodyIdx % BG_MELODY.length];
        _scheduleNote(freq, beats, bgMelNextTime, 'square', bgMasterGain, 0.12);
        bgMelNextTime += beats * BEAT;
        bgMelodyIdx++;
      }

      // Bass
      while (bgBassNextTime < now + aheadTime) {
        const [freq, beats] = BG_BASS[bgBassIdx % BG_BASS.length];
        _scheduleNote(freq, beats, bgBassNextTime, 'triangle', bgMasterGain, 0.08);
        bgBassNextTime += beats * BEAT;
        bgBassIdx++;
      }
    } catch (_) {}
  }

  function startBgMusic(vol = 0.3) {
    stopBgMusic();
    try {
      const ac = getCtx();
      bgMasterGain = ac.createGain();
      bgMasterGain.gain.setValueAtTime(vol, ac.currentTime);
      bgMasterGain.connect(ac.destination);
      bgMelodyIdx   = 0;
      bgBassIdx     = 0;
      bgMelNextTime = ac.currentTime + 0.1;
      bgBassNextTime = ac.currentTime + 0.1;
      bgVolume = vol;
      bgSchedulerTimer = setInterval(_bgSchedule, 25);
    } catch (_) {}
  }

  function stopBgMusic() {
    if (bgSchedulerTimer) { clearInterval(bgSchedulerTimer); bgSchedulerTimer = null; }
    if (bgMasterGain) {
      try { bgMasterGain.gain.setValueAtTime(0, getCtx().currentTime); } catch (_) {}
      bgMasterGain = null;
    }
  }

  function pauseBgMusic() {
    if (bgMasterGain) {
      try { bgMasterGain.gain.setValueAtTime(0, getCtx().currentTime); } catch (_) {}
    }
    if (bgSchedulerTimer) { clearInterval(bgSchedulerTimer); bgSchedulerTimer = null; }
  }

  function resumeBgMusic() {
    if (!bgMasterGain) { startBgMusic(bgVolume); return; }
    try {
      const ac = getCtx();
      bgMasterGain.gain.setValueAtTime(bgVolume, ac.currentTime);
      bgBassNextTime = ac.currentTime + 0.05;
      bgMelNextTime  = ac.currentTime + 0.05;
      bgSchedulerTimer = setInterval(_bgSchedule, 25);
    } catch (_) {}
  }

  function setBgVolume(vol) {
    bgVolume = vol;
    if (bgMasterGain) {
      try { bgMasterGain.gain.setValueAtTime(vol, getCtx().currentTime); } catch (_) {}
    }
  }

  function getBgVolume() { return bgVolume; }

  return {
    playJump, playCollect, playHoneycomb, playDamage,
    playGameOver, playSweetRush, playSpring,
    startBgMusic, stopBgMusic, pauseBgMusic, resumeBgMusic,
    setBgVolume, getBgVolume,
  };
})();
