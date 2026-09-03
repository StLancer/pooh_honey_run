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

  function playWizardLaugh() {
    try {
      const ac = getCtx();
      // Three warm, slightly detuned "ha ha ha" chords
      [0, 0.2, 0.4].forEach((delay) => {
        [220, 277, 330].forEach((freq) => {
          const osc = ac.createOscillator(); const gain = ac.createGain();
          osc.connect(gain); gain.connect(ac.destination);
          osc.type = 'triangle';
          const t = ac.currentTime + delay;
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.15); // drop in pitch
          envelope(gain, t, 0.02, 0.05, 0.1, 0.3);
          osc.start(t); osc.stop(t + 0.25);
        });
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

  function playMushroom() {
    try {
      const ac = getCtx();
      [330, 392, 659, 523, 587, 784].forEach((freq, i) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'triangle';
        const t = ac.currentTime + i * 0.08;
        osc.frequency.setValueAtTime(freq, t);
        envelope(gain, t, 0.01, 0.05, 0.12, 0.5);
        osc.start(t); osc.stop(t + 0.25);
      });
    } catch (_) {}
  }

  function playVictory() {
    try {
      const ac = getCtx();
      // Victory fanfare: G, C, E, G, C(high)
      const notes = [
        [392, 0.15], [523, 0.15], [659, 0.15], [784, 0.3], [659, 0.15], [784, 0.5], [1046, 0.8]
      ];
      let curTime = ac.currentTime;
      notes.forEach(([freq, dur]) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, curTime);
        envelope(gain, curTime, 0.02, dur * 0.7, dur * 0.25, 0.4);
        osc.start(curTime); osc.stop(curTime + dur + 0.05);
        curTime += dur * 0.9;
      });
    } catch (_) {}
  }

  function playMajesticKey() {
    try {
      const ac = getCtx();
      // Grand synth chime: C, E, G, B, high C
      const notes = [
        [523.25, 0.2], [659.25, 0.2], [783.99, 0.2], [987.77, 0.3], [1046.50, 0.8]
      ];
      let curTime = ac.currentTime;
      notes.forEach(([freq, dur]) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, curTime);
        envelope(gain, curTime, 0.05, dur * 0.5, dur * 0.45, 0.6);
        osc.start(curTime); osc.stop(curTime + dur + 0.5);
        curTime += dur * 0.9;
      });
    } catch (_) {}
  }

  function playMajesticEgg() {
    try {
      const ac = getCtx();
      // Triumphant, slow fanfare: C, G, C(high), E(high), G(high)
      const notes = [
        [261.63, 0.4], [392.00, 0.4], [523.25, 0.4], [659.25, 0.4], [783.99, 1.5]
      ];
      let curTime = ac.currentTime;
      notes.forEach(([freq, dur]) => {
        // Layered synth (square + sine)
        const osc1 = ac.createOscillator(); const gain1 = ac.createGain();
        const osc2 = ac.createOscillator(); const gain2 = ac.createGain();
        osc1.connect(gain1); gain1.connect(ac.destination);
        osc2.connect(gain2); gain2.connect(ac.destination);
        
        osc1.type = 'square';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(freq, curTime);
        osc2.frequency.setValueAtTime(freq, curTime);
        
        envelope(gain1, curTime, 0.1, dur * 0.6, dur * 0.3, 0.25);
        envelope(gain2, curTime, 0.1, dur * 0.6, dur * 0.3, 0.5);
        
        osc1.start(curTime); osc1.stop(curTime + dur + 0.5);
        osc2.start(curTime); osc2.stop(curTime + dur + 0.5);
        
        curTime += dur * 0.95;
      });
    } catch (_) {}
  }

  function playBossAlert() {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. Arcade Warning Siren sweeps
      [0, 0.25, 0.5].forEach(st => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t + st);
        osc.frequency.linearRampToValueAtTime(700, t + st + 0.12);
        osc.frequency.linearRampToValueAtTime(350, t + st + 0.24);
        envelope(gain, t + st, 0.01, 0.15, 0.08, 0.45);
        osc.start(t + st); osc.stop(t + st + 0.25);
      });

      // 2. High-energy "BOSS TIME" Synth Fanfare
      const notes = [
        [220, 0.15, 0.75],
        [220, 0.15, 0.90],
        [220, 0.15, 1.05],
        [293, 0.18, 1.20],
        [329, 0.18, 1.38],
        [440, 0.45, 1.56]
      ];
      notes.forEach(([freq, dur, offset]) => {
        const osc = ac.createOscillator(); const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'square';
        const st = t + offset;
        osc.frequency.setValueAtTime(freq, st);
        envelope(gain, st, 0.02, dur * 0.7, dur * 0.28, 0.6);
        osc.start(st); osc.stop(st + dur + 0.05);
      });

      // 3. Impact Sub Bass
      const subOsc = ac.createOscillator(); const subGain = ac.createGain();
      subOsc.connect(subGain); subGain.connect(ac.destination);
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, t + 1.56);
      subOsc.frequency.exponentialRampToValueAtTime(40, t + 2.2);
      envelope(subGain, t + 1.56, 0.01, 0.4, 0.3, 0.8);
      subOsc.start(t + 1.56); subOsc.stop(t + 2.3);
    } catch (_) {}
  }

  function playStomp() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      envelope(gain, t, 0.005, 0.04, 0.12, 0.55);
      osc.start(t); osc.stop(t + 0.18);
    } catch (_) {}
  }

  function playBossHit() {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator(); const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sawtooth';
      const t = ac.currentTime;
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
      envelope(gain, t, 0.005, 0.04, 0.18, 0.7);
      osc.start(t); osc.stop(t + 0.22);
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

  // Hard Mode (Level 3) Melody (Minor, depressing, nervous)
  const HARD_MELODY = [
    [293,2],[349,1],[440,1],[440,2],[349,1],[293,1], // D minor
    [329,2],[440,1],[392,1],[329,2],[293,1],[277,1], // Tension
    [293,4],[349,2],[293,2],
    [440,8],
  ];

  const HARD_BASS = [
    [73,4], [73,4], [73,4], [82,4], // Low D and E
    [73,4], [73,4], [65,4], [65,4], // D and C#
  ];

  const BEAT = 60 / 168 / 2; // 8th-note at 168 BPM
  let currentMelody = BG_MELODY;
  let currentBass = BG_BASS;

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
        const [freq, beats] = currentMelody[bgMelodyIdx % currentMelody.length];
        _scheduleNote(freq, beats, bgMelNextTime, 'square', bgMasterGain, 0.12);
        bgMelNextTime += beats * BEAT;
        bgMelodyIdx++;
      }

      // Bass
      while (bgBassNextTime < now + aheadTime) {
        const [freq, beats] = currentBass[bgBassIdx % currentBass.length];
        _scheduleNote(freq, beats, bgBassNextTime, 'triangle', bgMasterGain, 0.08);
        bgBassNextTime += beats * BEAT;
        bgBassIdx++;
      }
    } catch (_) {}
  }

  function startBgMusic(vol = 0.3, isHardMode = false) {
    stopBgMusic();
    try {
      currentMelody = isHardMode ? HARD_MELODY : BG_MELODY;
      currentBass = isHardMode ? HARD_BASS : BG_BASS;
      
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

  function playDoorOpen() {
    try {
      const ac = getCtx();
      const t = ac.currentTime;

      // 1. Heavy metallic latch release click / clunk
      const oscClunk = ac.createOscillator();
      const gainClunk = ac.createGain();
      oscClunk.connect(gainClunk);
      gainClunk.connect(ac.destination);
      oscClunk.type = 'triangle';
      oscClunk.frequency.setValueAtTime(220, t);
      oscClunk.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      envelope(gainClunk, t, 0.01, 0.05, 0.25, 0.1);
      oscClunk.start(t);
      oscClunk.stop(t + 0.2);

      // 2. Heavy stone / iron door creaking open sweep
      const oscCreak = ac.createOscillator();
      const gainCreak = ac.createGain();
      oscCreak.connect(gainCreak);
      gainCreak.connect(ac.destination);
      oscCreak.type = 'sawtooth';
      oscCreak.frequency.setValueAtTime(130, t + 0.08);
      oscCreak.frequency.linearRampToValueAtTime(180, t + 0.35);
      oscCreak.frequency.exponentialRampToValueAtTime(75, t + 0.75);
      envelope(gainCreak, t + 0.08, 0.05, 0.25, 0.2, 0.35);
      oscCreak.start(t + 0.08);
      oscCreak.stop(t + 0.85);

      // 3. Resonant unlock chime
      const oscChime = ac.createOscillator();
      const gainChime = ac.createGain();
      oscChime.connect(gainChime);
      gainChime.connect(ac.destination);
      oscChime.type = 'sine';
      oscChime.frequency.setValueAtTime(523.25, t + 0.15); // C5
      oscChime.frequency.setValueAtTime(659.25, t + 0.3);  // E5
      oscChime.frequency.setValueAtTime(783.99, t + 0.45); // G5
      envelope(gainChime, t + 0.15, 0.02, 0.2, 0.3, 0.45);
      oscChime.start(t + 0.15);
      oscChime.stop(t + 0.95);
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
    playMushroom, playVictory, playBossAlert, playBossHit, playStomp,
    playMajesticKey, playMajesticEgg, playWizardLaugh, playDoorOpen,
    startBgMusic, stopBgMusic, pauseBgMusic, resumeBgMusic,
    setBgVolume, getBgVolume, isBgPlaying: () => bgSchedulerTimer !== null,
  };
})();
