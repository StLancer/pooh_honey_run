/**
 * game.js — Main game engine: State machine, two-step level select & briefing, water hazard, sky lightning & enemy stomp
 */

// ── Constants ─────────────────────────────────────────────────
const CANVAS_W = 1100;
const CANVAS_H = 620;
const HONEY_STREAK_TARGET = 5;

// ── States ─────────────────────────────────────────────────────
const STATE = {
  MENU: 'MENU',
  STORE: 'STORE',
  LEVEL_SELECT: 'LEVEL_SELECT',
  LEVEL_INFO: 'LEVEL_INFO',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY',
  DIALOGUE: 'DIALOGUE'
};

// ── Canvas Setup ───────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
window.canvasW = CANVAS_W;

// ── Game State ────────────────────────────────────────────────
let state = STATE.MENU;
let score = 0;
let coinsGainedThisRun = 0;
let highScore = parseInt(localStorage.getItem('pooh_highscore') || '0', 10);
let coins = parseInt(localStorage.getItem('pooh_coins') || '0', 10);
let unlockedChars = JSON.parse(localStorage.getItem('pooh_unlocked') || '["pooh", "goku", "powerpuff"]');
if (!unlockedChars.includes('goku')) unlockedChars.push('goku');
if (!unlockedChars.includes('powerpuff')) unlockedChars.push('powerpuff');
let activeChar = localStorage.getItem('pooh_active_char') || 'pooh';

let showingHoneyBanner = false;
let bannerTimer = 0;

let showingBossBanner = false;
let bossBannerTimer = 0;
let thunderTimer = 0;

let showingFogBanner = false;
let fogBannerTimer = 0;
let fogPermanentlyDisabled = false;

// Dialogue & Easter Egg State
let pKeyHeld = false;
let eggHoldTime = 0;
let activeWizard = null;

// Camera
let cameraX = 0;

let player = null;
let level = null;
let lastTime = 0;
let rafId = null;
let collectParticles = [];
let confettiParticles = [];
let floatingTexts = [];
let currentSelectedLevel = 1;

// ── DOM ───────────────────────────────────────────────────────
const screenStart = document.getElementById('screen-start');
const screenStore = document.getElementById('screen-store');
const screenLevelSelect = document.getElementById('screen-level-select');
const screenLevelInfo = document.getElementById('screen-level-info');
const screenGameover = document.getElementById('screen-gameover');
const screenPause = document.getElementById('screen-pause');
const screenVictory = document.getElementById('screen-victory');

const btnStart = document.getElementById('btn-start');
const btnOpenStore = document.getElementById('btn-open-store');
const btnBackStore = document.getElementById('btn-back-store');
const btnChooseLvl1 = document.getElementById('btn-choose-lvl1');
const btnChooseLvl2 = document.getElementById('btn-choose-lvl2');
const btnChooseLvl3 = document.getElementById('btn-choose-lvl3');
const btnStartLevelGame = document.getElementById('btn-start-level-game');
const btnBackLevelInfo = document.getElementById('btn-back-level-info');
const btnBackLevelSelect = document.getElementById('btn-back-level-select');

const lvlInfoIcon = document.getElementById('lvl-info-icon');
const lvlInfoTitle = document.getElementById('lvl-info-title');
const lvlInfoName = document.getElementById('lvl-info-name');
const lvlInfoBadge = document.getElementById('lvl-info-badge');
const lvlInfoTheme = document.getElementById('lvl-info-theme');
const lvlInfoMission = document.getElementById('lvl-info-mission');
const lvlInfoTip = document.getElementById('lvl-info-tip');
const lvlInfoBox = document.getElementById('lvl-info-box');

const menuActiveCharImg = document.getElementById('menu-active-char-img');
const menuActiveCharName = document.getElementById('menu-active-char-name');
const displayCoinsStore = document.getElementById('display-coins-store');

const btnRestart = document.getElementById('btn-restart');
const btnPause = document.getElementById('btn-pause');
const btnResume = document.getElementById('btn-resume');
const btnRestartPause = document.getElementById('btn-restart-pause');
const btnVictoryReplay = document.getElementById('btn-victory-replay');
const btnHomeVictory = document.getElementById('btn-home-victory');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const displayHS = document.getElementById('display-highscore');
const goScore = document.getElementById('go-score');
const vicScore = document.getElementById('vic-score');
const vicCoins = document.getElementById('vic-coins');
const vicHighscore = document.getElementById('vic-highscore');
const displayCoins = document.getElementById('display-coins');
const btnHomePause = document.getElementById('btn-home-pause');
const btnHomeGameover = document.getElementById('btn-home-gameover');
let bgVolume = 0.25;

// ── Dynamic Level Briefing ────────────────────────────────────
function openLevelInfo(lvlId) {
  currentSelectedLevel = lvlId;
  const cfg = (typeof LEVEL_CONFIGS !== 'undefined' && LEVEL_CONFIGS[lvlId]) ? LEVEL_CONFIGS[lvlId] : {
    id: lvlId,
    name: `Level ${lvlId}`,
    icon: '🗺️',
    difficultyBadge: 'EASY',
    theme: 'Standard Map',
    mission: 'Reach the goal safely!',
    tip: 'Watch out for obstacles!',
    color: '#4CAF50',
    shadowColor: '#1B5E20'
  };

  if (lvlInfoIcon) lvlInfoIcon.textContent = cfg.icon;
  if (lvlInfoTitle) {
    lvlInfoTitle.textContent = `LEVEL ${lvlId} INFO`;
    lvlInfoTitle.style.color = cfg.color;
    lvlInfoTitle.style.textShadow = `3px 3px 0 ${cfg.shadowColor}`;
  }
  if (lvlInfoName) {
    lvlInfoName.textContent = cfg.name;
    lvlInfoName.style.color = cfg.color;
  }
  if (lvlInfoBadge) {
    lvlInfoBadge.textContent = cfg.difficultyBadge;
    lvlInfoBadge.style.background = cfg.color;
  }
  if (lvlInfoTheme) lvlInfoTheme.textContent = cfg.theme;
  if (lvlInfoMission) lvlInfoMission.textContent = cfg.mission;
  if (lvlInfoTip) lvlInfoTip.textContent = cfg.tip;
  if (btnStartLevelGame) {
    btnStartLevelGame.textContent = `▶ START LEVEL ${lvlId}`;
    btnStartLevelGame.style.background = cfg.color;
    btnStartLevelGame.style.boxShadow = `0 4px 0 ${cfg.shadowColor}`;
  }
  if (lvlInfoBox) {
    lvlInfoBox.style.borderColor = cfg.color;
  }

  showScreen('screen-level-info');
  state = STATE.LEVEL_INFO;
}

// ── Init / Reset ──────────────────────────────────────────────
function initGame() {
  score = 0;
  coinsGainedThisRun = 0;
  cameraX = 0;
  collectParticles = [];
  confettiParticles = [];
  floatingTexts = [];
  player = new Player(CANVAS_W, CANVAS_H, activeChar);
  level = new Level(CANVAS_W, CANVAS_H, currentSelectedLevel);

  showingHoneyBanner = false;
  bannerTimer = 0;
  showingBossBanner = false;
  bossBannerTimer = 0;
  thunderTimer = 0;
  showingFogBanner = false;
  fogBannerTimer = 0;
  fogPermanentlyDisabled = false;
  pKeyHeld = false;
  eggHoldTime = 0;
  activeWizard = null;
}

// ── Dialogue Dismissal & Easter Egg Reveal ─────────────────────
function dismissDialogue() {
  if (state !== STATE.DIALOGUE) return;
  state = STATE.PLAYING;
  fogPermanentlyDisabled = true;
  if (typeof AudioEngine.isBgPlaying === 'function' && !AudioEngine.isBgPlaying()) {
    AudioEngine.resumeBgMusic();
  }
  if (activeWizard) {
    activeWizard.dialogueDone = true;
  }
  activeWizard = null;

  // Reveal the Easter Egg behind the wizard (to the left of the wizard)!
  if (level && level.easterEgg && !level.easterEgg.revealed) {
    level.easterEgg.revealed = true;
    AudioEngine.playCollect();
    spawnFloatingText(level.easterEgg.screenX + 25, level.easterEgg.y - 25, '✨ EASTER EGG REVEALED! ✨', '#FFD700', 3.5);
    for (let i = 0; i < 25; i++) {
      spawnCollectParticles(level.easterEgg.screenX + 25, level.easterEgg.y + 25, 'honey');
    }
  }
}

// ── Screen Management ─────────────────────────────────────────
function showScreen(id) {
  [screenStart, screenStore, screenLevelSelect, screenLevelInfo, screenGameover, screenPause, screenVictory].forEach(s => {
    if (s) s.classList.remove('active');
  });
  btnPause.style.display = 'none';
  if (id) {
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  if (id === 'screen-start') {
    displayCoins.innerText = coins;
    updateStoreUI();
  }
}

function showGameUI() {
  [screenStart, screenStore, screenLevelSelect, screenLevelInfo, screenGameover, screenPause, screenVictory].forEach(s => {
    if (s) s.classList.remove('active');
  });
  btnPause.style.display = 'flex';
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
}

// ── Game Flow ─────────────────────────────────────────────────
function startGame() {
  initGame();
  state = STATE.PLAYING;
  showGameUI();
  AudioEngine.startBgMusic(bgVolume, currentSelectedLevel === 3);
  if (rafId) cancelAnimationFrame(rafId);
  lastTime = performance.now();
  rafId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (state !== STATE.PLAYING) return;
  state = STATE.PAUSED;
  AudioEngine.pauseBgMusic();
  showScreen('screen-pause');
  if (rafId) cancelAnimationFrame(rafId);
}

function resumeGame() {
  if (state !== STATE.PAUSED) return;
  state = STATE.PLAYING;
  showGameUI();
  AudioEngine.resumeBgMusic();
  lastTime = performance.now();
  rafId = requestAnimationFrame(gameLoop);
}

function gameOver() {
  state = STATE.GAMEOVER;
  AudioEngine.stopBgMusic();
  AudioEngine.playGameOver();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pooh_highscore', highScore);
  }
  localStorage.setItem('pooh_coins', coins);

  goScore.textContent = score;
  showScreen('screen-gameover');
}

function stageClear() {
  state = STATE.VICTORY;
  AudioEngine.stopBgMusic();
  AudioEngine.playVictory();

  spawnVictoryRibbons();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('pooh_highscore', highScore);
  }
  localStorage.setItem('pooh_coins', coins);

  vicScore.textContent = score;
  vicCoins.textContent = `+${coinsGainedThisRun} 💰`;
  vicHighscore.textContent = highScore;
  showScreen('screen-victory');
}

// ── Input ─────────────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', e => {
  if (e.code === 'Tab') { e.preventDefault(); return; }
  if (keys[e.code]) return;
  keys[e.code] = true;

  if (state === STATE.MENU) {
    if (['Space', 'Enter', 'ArrowUp', 'KeyW'].includes(e.code)) {
      showScreen('screen-level-select');
      state = STATE.LEVEL_SELECT;
      return;
    }
  }
  if (state === STATE.LEVEL_SELECT) {
    if (['Space', 'Enter', 'KeyW'].includes(e.code)) {
      showScreen('screen-level-info');
      state = STATE.LEVEL_INFO;
      return;
    }
  }
  if (state === STATE.LEVEL_INFO) {
    if (['Space', 'Enter', 'KeyW'].includes(e.code)) {
      startGame();
      return;
    }
  }
  if (state === STATE.GAMEOVER) { if (['Space', 'Enter'].includes(e.code)) startGame(); return; }
  if (state === STATE.VICTORY) { if (['Space', 'Enter'].includes(e.code)) startGame(); return; }
  if (state === STATE.PAUSED) { if (['Space', 'Enter', 'KeyP'].includes(e.code)) resumeGame(); return; }

  if (state === STATE.DIALOGUE) {
    dismissDialogue();
    return;
  }

  if (state === STATE.PLAYING) {
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) player.startJump(performance.now());
    if (['ArrowDown', 'KeyS'].includes(e.code)) player.startDown();
    if (['ArrowLeft', 'KeyA'].includes(e.code)) player.startLeft();
    if (['ArrowRight', 'KeyD'].includes(e.code)) player.startRight();
    if (e.code === 'KeyP') {
      const nearEgg = level && level.easterEgg && level.easterEgg.active && level.easterEgg.revealed &&
        Math.abs((player.x + player.renderW / 2) - (level.easterEgg.worldX + level.easterEgg.width / 2)) < 85;
      if (nearEgg) {
        pKeyHeld = true;
      } else {
        pauseGame();
      }
    }
    // Press 'K' to open Dungeon Door if holding the key
    if (e.code === 'KeyK') {
      const door = level && (level.dungeonDoor || level.lockedGate);
      if (door && !door.unlocked) {
        const pMidX = player.x + player.renderW / 2;
        const doorMidX = door.worldX + door.width / 2;
        const nearDoor = Math.abs(pMidX - doorMidX) < 160 &&
          (player.y + player.renderH > door.y - 40 && player.y < door.y + door.height + 40);
        if (nearDoor) {
          if (player.hasKey) {
            door.unlocked = true;
            AudioEngine.playDoorOpen();
            spawnFloatingText(door.screenX + door.width / 2, door.y - 18, '🔓 DOOR OPENED! 🔓', '#69F0AE', 3.0);
          } else {
            spawnFloatingText(door.screenX + door.width / 2, door.y - 18, '🔒 NEED KEY 🗝️', '#FF5252', 2.0);
          }
        }
      }
    }
    // Press 'R' to activate Mega Mode if holding a Mushroom
    if (e.code === 'KeyR') {
      if (player.useMushroom()) {
        showingHoneyBanner = true;
        bannerTimer = 3.0;
        spawnFloatingText(player.screenX + player.renderW / 2, player.y - 20, 'MEGA MODE ACTIVATED! 👑', '#FFF500');
      }
    }
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'KeyP') {
    pKeyHeld = false;
    eggHoldTime = 0;
  }

  if (state !== STATE.PLAYING) return;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) player.endJump(performance.now());
  if (['ArrowDown', 'KeyS'].includes(e.code)) player.endDown();
  if (['ArrowLeft', 'KeyA'].includes(e.code)) player.endLeft();
  if (['ArrowRight', 'KeyD'].includes(e.code)) player.endRight();
});

// ── Touch & Click controls (mobile-ready & desktop friendly) ───
canvas.addEventListener('click', () => {
  if (state === STATE.DIALOGUE) {
    dismissDialogue();
    return;
  }
  const door = level && (level.dungeonDoor || level.lockedGate);
  if (door && !door.unlocked) {
    const pMidX = player.x + player.renderW / 2;
    const doorMidX = door.worldX + door.width / 2;
    const nearDoor = Math.abs(pMidX - doorMidX) < 160 &&
      (player.y + player.renderH > door.y - 40 && player.y < door.y + door.height + 40);
    if (nearDoor && player.hasKey) {
      door.unlocked = true;
      AudioEngine.playDoorOpen();
      spawnFloatingText(door.screenX + door.width / 2, door.y - 18, '🔓 DOOR OPENED! 🔓', '#69F0AE', 3.0);
    }
  }
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (state === STATE.DIALOGUE) { dismissDialogue(); return; }
  const door = level && (level.dungeonDoor || level.lockedGate);
  if (door && !door.unlocked) {
    const pMidX = player.x + player.renderW / 2;
    const doorMidX = door.worldX + door.width / 2;
    const nearDoor = Math.abs(pMidX - doorMidX) < 160 &&
      (player.y + player.renderH > door.y - 40 && player.y < door.y + door.height + 40);
    if (nearDoor && player.hasKey) {
      door.unlocked = true;
      AudioEngine.playDoorOpen();
      spawnFloatingText(door.screenX + door.width / 2, door.y - 18, '🔓 DOOR OPENED! 🔓', '#69F0AE', 3.0);
      return;
    }
  }
  if (state === STATE.MENU) { showScreen('screen-level-select'); state = STATE.LEVEL_SELECT; return; }
  if (state === STATE.LEVEL_SELECT) { showScreen('screen-level-info'); state = STATE.LEVEL_INFO; return; }
  if (state === STATE.LEVEL_INFO) { startGame(); return; }
  if (state === STATE.GAMEOVER) { startGame(); return; }
  if (state === STATE.VICTORY) { startGame(); return; }
  if (state === STATE.PAUSED) { resumeGame(); return; }
  if (state === STATE.PLAYING) {
    const rect = canvas.getBoundingClientRect();
    const relX = e.touches[0].clientX - rect.left;
    const relY = e.touches[0].clientY - rect.top;
    const normX = relX / rect.width;
    const normY = relY / rect.height;
    if (normY < 0.35) {
      if (player.hasMushroom) {
        player.useMushroom();
        showingHoneyBanner = true;
        bannerTimer = 3.0;
      } else {
        player.startJump(performance.now());
      }
    } else if (normX < 0.35) {
      player.startLeft();
    } else if (normX > 0.65) {
      player.startRight();
    } else {
      player.startDown();
    }
  }
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (state !== STATE.PLAYING) return;
  player.endJump(performance.now());
  player.endLeft();
  player.endRight();
  player.endDown();
}, { passive: false });

// ── Store Logic ───────────────────────────────────────────────
const CHAR_PRICES = { pooh: 0, goku: 0, powerpuff: 0, capybara: 1000, batman: 5000 };

const CHAR_NAMES = {
  pooh: 'Pooh',
  goku: 'Goku',
  powerpuff: 'Powerpuff Girls',
  capybara: 'Capybara',
  batman: 'Batman'
};

const CHAR_FILES = {
  pooh: 'pooh.png',
  goku: 'Goku.png',
  powerpuff: 'Powerpuff Girls.png',
  capybara: 'capybara.png',
  batman: 'batman.png'
};

window.selectCharacter = function (charId) {
  if (unlockedChars.includes(charId)) {
    activeChar = charId;
    localStorage.setItem('pooh_active_char', activeChar);
    updateStoreUI();
  } else {
    if (coins >= CHAR_PRICES[charId]) {
      coins -= CHAR_PRICES[charId];
      unlockedChars.push(charId);
      localStorage.setItem('pooh_coins', coins);
      localStorage.setItem('pooh_unlocked', JSON.stringify(unlockedChars));
      activeChar = charId;
      localStorage.setItem('pooh_active_char', activeChar);
      updateStoreUI();
    } else {
      alert(`Not enough coins! You need ${CHAR_PRICES[charId]} 💰`);
    }
  }
};

function updateStoreUI() {
  if (displayCoins) displayCoins.innerText = coins;
  if (displayCoinsStore) displayCoinsStore.innerText = coins;

  if (menuActiveCharImg) {
    menuActiveCharImg.src = `assets/${CHAR_FILES[activeChar] || 'pooh.png'}`;
  }
  if (menuActiveCharName) {
    menuActiveCharName.innerText = CHAR_NAMES[activeChar] || 'Pooh';
  }

  ['pooh', 'goku', 'powerpuff', 'capybara', 'batman'].forEach(charId => {
    const card = document.getElementById(`char-${charId}`);
    if (!card) return;
    const statusEl = card.querySelector('.store-status');
    const isUnlocked = unlockedChars.includes(charId);
    const isSelected = activeChar === charId;

    if (isUnlocked) {
      card.classList.remove('locked');
      if (statusEl) {
        statusEl.innerText = isSelected ? 'Selected' : (CHAR_PRICES[charId] === 0 ? 'Free' : 'Unlocked');
      }
    } else {
      card.classList.add('locked');
      if (statusEl) {
        statusEl.innerText = `${CHAR_PRICES[charId].toLocaleString()} 💰`;
      }
    }

    if (isSelected) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

// ── Event Listeners ───────────────────────────────────────────
btnStart.addEventListener('click', () => {
  showScreen('screen-level-select');
  state = STATE.LEVEL_SELECT;
});

if (btnOpenStore) {
  btnOpenStore.addEventListener('click', () => {
    showScreen('screen-store');
    state = STATE.STORE;
    updateStoreUI();
  });
}

if (btnBackStore) {
  btnBackStore.addEventListener('click', () => {
    showScreen('screen-start');
    state = STATE.MENU;
    updateStoreUI();
  });
}

if (btnChooseLvl1) {
  btnChooseLvl1.addEventListener('click', () => openLevelInfo(1));
}

if (btnChooseLvl2) {
  btnChooseLvl2.addEventListener('click', () => {
    if (typeof LEVEL_CONFIGS !== 'undefined' && LEVEL_CONFIGS[2] && !LEVEL_CONFIGS[2].unlocked) return;
    openLevelInfo(2);
  });
}

if (btnChooseLvl3) {
  btnChooseLvl3.addEventListener('click', () => openLevelInfo(3));
}

btnBackLevelInfo.addEventListener('click', () => {
  showScreen('screen-level-select');
  state = STATE.LEVEL_SELECT;
});

btnStartLevelGame.addEventListener('click', startGame);

btnBackLevelSelect.addEventListener('click', () => {
  showScreen('screen-start');
  state = STATE.MENU;
});

btnRestart.addEventListener('click', startGame);
btnRestartPause.addEventListener('click', startGame);
btnVictoryReplay.addEventListener('click', startGame);
btnPause.addEventListener('click', pauseGame);
btnResume.addEventListener('click', resumeGame);

btnHomePause.addEventListener('click', () => {
  AudioEngine.stopBgMusic();
  showScreen('screen-start');
  state = STATE.MENU;
});

btnHomeGameover.addEventListener('click', () => {
  showScreen('screen-start');
  state = STATE.MENU;
});

btnHomeVictory.addEventListener('click', () => {
  showScreen('screen-start');
  state = STATE.MENU;
});

volumeSlider.addEventListener('input', e => {
  bgVolume = parseInt(e.target.value, 10) / 100;
  volumeValue.textContent = `${e.target.value}%`;
  AudioEngine.setBgVolume(bgVolume);
});

// ── Collision Detection ───────────────────────────────────────
function handleCollisions() {
  const hb = player.getHitbox();

  // 1. Solid Level Boundaries (Left side)
  if (player.x < 0) {
    player.x = 0;
    player.vx = 0;
  }

  // 1a. Locked Gate Collision
  if (level.lockedGate && !level.lockedGate.unlocked) {
    const gateHb = level.lockedGate.getHitbox();
    if (Physics.aabb(hb, gateHb)) {
      if (player.hasKey) {
        level.lockedGate.unlocked = true;
        AudioEngine.playCollect();
        spawnFloatingText(gateHb.x + gateHb.width / 2, gateHb.y - 20, 'GATE UNLOCKED! 🔓', '#69F0AE');
      } else {
        if (player.facingLeft) {
          player.x = level.lockedGate.worldX + level.lockedGate.width + 10;
        } else {
          player.x = level.lockedGate.worldX - player.renderW - 10;
        }
        player.vx = 0;
        spawnFloatingText(gateHb.x + gateHb.width / 2, gateHb.y - 10, 'NEEDED KEY 🔒', '#FF5252');
      }
    }
  }

  // 1. Goal: Pooh's Home
  if (level.poohHome && Physics.aabb(hb, level.poohHome.getHitbox())) {
    stageClear();
    return;
  }

  // 2. Water Hazards Collision (Instant Death on contact)
  if (level.waters && !player.giantMode) {
    const playerBottom = player.y + player.renderH;
    for (const water of level.waters) {
      const inWaterX = (player.x + player.renderW - 10 > water.worldX) && (player.x + 10 < water.worldX + water.width);
      const onWaterY = playerBottom >= (water.y - 4) && player.y <= water.y + water.height;
      if (inWaterX && onWaterY) {
        spawnCollectParticles(player.screenX + player.renderW / 2, water.y + 10, 'water');
        player.hearts = 0;
        gameOver();
        return;
      }
    }
  }

  // 2b. Lava Hazards Collision (Deduct 1 heart with knockback & invincibility)
  if (level.lavas && !player.giantMode && !player.invincible && !player.sweetRush) {
    const playerBottom = player.y + player.renderH;
    for (const lava of level.lavas) {
      const inLavaX = (player.x + player.renderW - 10 > lava.worldX) && (player.x + 10 < lava.worldX + lava.width);
      const onLavaY = playerBottom >= (lava.y - 4) && player.y <= lava.y + lava.height;
      if (inLavaX && onLavaY) {
        const fatal = player.takeDamage();
        player.vy = -340; // upward bounce recoil from hot lava
        player.onGround = false;
        spawnCollectParticles(player.screenX + player.renderW / 2, lava.y + 10, 'honeycomb');
        spawnFloatingText(player.screenX + player.renderW / 2, player.y - 15, '-1 HEART! (HOT LAVA) 🔥', '#FF5722');
        if (fatal) {
          gameOver();
          return;
        }
        break;
      }
    }
  }

  // 2c. Hollow Tree Locked Door Barrier (Requires Key)
  if (level.hollowTree) {
    const treeX = level.hollowTree.worldX;
    const playerWorldX = player.x;
    if (!player.hasKey && playerWorldX >= treeX && playerWorldX <= treeX + 110 && player.y + player.renderH >= CANVAS_H * 0.70) {
      player.x = treeX - 5;
      player.vx = 0;
      spawnFloatingText(level.hollowTree.screenX + 70, level.hollowTree.y - 15, '🔒 NEED KEY FROM FOG! 🗝️', '#FF5252');
    }
  }

  // 2c2. Dungeon Door Barrier (Level 3)
  const dungeonDoor = level.dungeonDoor || level.lockedGate;
  if (dungeonDoor) {
    const doorX = dungeonDoor.worldX;
    const doorW = dungeonDoor.width;
    const doorY = dungeonDoor.y;
    const doorH = dungeonDoor.height;
    const pRight = player.x + player.renderW;
    const pLeft = player.x;
    const pBottom = player.y + player.renderH;
    const pTop = player.y;

    // Check if player entered the secret chamber to the left of the door
    if (dungeonDoor.unlocked && player.x < doorX && player.x > 9200) {
      if (!fogPermanentlyDisabled) {
        fogPermanentlyDisabled = true;
        if (typeof AudioEngine.isBgPlaying === 'function' && !AudioEngine.isBgPlaying()) {
          AudioEngine.resumeBgMusic();
        }
      }
    }

    if (!dungeonDoor.unlocked) {
      const overlapX = pRight > doorX && pLeft < doorX + doorW;
      const overlapY = pBottom > doorY + 4 && pTop < doorY + doorH;

      if (overlapX && overlapY) {
        // Solid blocking barrier until opened with [K]
        const playerCenterX = player.x + player.renderW / 2;
        const doorCenterX = doorX + doorW / 2;
        if (playerCenterX >= doorCenterX) {
          // Approaching from right side, block left movement
          player.x = doorX + doorW + 2;
        } else {
          // Approaching from left side, block right movement
          player.x = doorX - player.renderW - 2;
        }
        player.vx = 0;

        if (player.hasKey) {
          spawnFloatingText(dungeonDoor.screenX + doorW / 2, doorY - 18, 'PRESS [K] TO OPEN 🗝️', '#69F0AE', 0.8);
        } else {
          spawnFloatingText(dungeonDoor.screenX + doorW / 2, doorY - 18, '🔒 NEED KEY 🗝️', '#FF5252', 0.8);
        }
      }
    }
  }

  // 2d. Fog Warning Alert (Big unmissable screen banner)
  if (level.fogZones && level.fogZones.length > 0) {
    for (const fog of level.fogZones) {
      if (!fog.alerted && player.x >= fog.worldX - 700 && player.x < fog.worldX) {
        fog.alerted = true;
        showingFogBanner = true;
        fogBannerTimer = 4.0;
        AudioEngine.playBossAlert();
      }
    }
  }

  // 3. Enemies & Bosses (BossBee, JokerBoss, Tigers, Bees)
  for (const bee of level.bees) {
    if (!bee.active) continue;
    if (Physics.aabb(hb, bee.getHitbox())) {

      // Boss 1 Encounter (Mega Mode combat)
      if (bee.type === 'boss') {
        if (player.giantMode) {
          player.vx = player.facingLeft ? 650 : -650;
          player.vy = -350;
          player.onGround = false;
          const defeated = bee.takeHit();

          if (defeated) {
            AudioEngine.playDamage();
            spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'mushroom');
            score += 200;
            spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, 'BOSS 1 DEFEATED! 🏆', '#FFD700');
            level.spawnGiantHoney(bee.worldX + bee.width / 2 - 90, CANVAS_H * 0.80);
          } else {
            AudioEngine.playBossHit();
            spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'mushroom');
            spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, `BOSS HIT! (${bee.hp}/3 HP)`, '#FF1744');
          }
        } else {
          player.vx = player.facingLeft ? 450 : -450;
          player.vy = -280;
          player.onGround = false;
          const fatal = player.takeDamage();
          if (fatal) { gameOver(); return; }
          spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, 'USE MEGA MODE! (Press R)', '#FFD700');
        }

        // Joker Boss Encounter (Stomp head combat)
      } else if (bee.type === 'joker_boss') {
        const playerBottom = player.y + player.renderH;
        const isStomp = player.vy > 0 && playerBottom <= bee.y + 35;

        if (isStomp || player.giantMode) {
          player.enemyBounce();
          const defeated = bee.takeHit();
          if (defeated) {
            AudioEngine.playDamage();
            spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'mushroom');
            score += 300;
            spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, 'JOKER DEFEATED! 🏆', '#FFD700');
            // No giant honey reward on Joker defeat
          } else {
            AudioEngine.playBossHit();
            spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'mushroom');
            spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, `JOKER HIT! (${bee.hp}/3 HP)`, '#FF1744');
          }
        } else {
          player.vx = player.facingLeft ? 450 : -450;
          player.vy = -280;
          player.onGround = false;
          const fatal = player.takeDamage();
          if (fatal) { gameOver(); return; }
          spawnFloatingText(bee.screenX + bee.width / 2, bee.y - 20, 'STOMP ON JOKER\'S HEAD! 💥', '#FFD700');
        }

      } else if (bee.type === 'bee' || bee.type === 'tiger') {
        // Stomp Mechanic
        const playerBottom = player.y + player.renderH;
        const enemyTop = bee.y;
        const isStomp = player.vy > 0 && playerBottom <= enemyTop + 24;

        if (player.giantMode) {
          bee.active = false;
          AudioEngine.playDamage();
          spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'honeycomb');
          score += 50;
        } else if (isStomp) {
          bee.active = false;
          player.enemyBounce();
          spawnCollectParticles(bee.screenX + bee.width / 2, bee.y + bee.height / 2, 'honey');
        } else {
          const fatal = player.takeDamage();
          if (fatal) { gameOver(); return; }
        }

      } else if (bee.type === 'fireball') {
        if (player.giantMode) {
          bee.active = false;
          AudioEngine.playDamage();
        } else {
          const fatal = player.takeDamage();
          if (fatal) { gameOver(); return; }
        }
      }
    }
  }

  // 3b. Red Balloons (Fired by Joker)
  if (level.jokerBoss && level.jokerBoss.balloons) {
    for (const balloon of level.jokerBoss.balloons) {
      if (!balloon.active) continue;
      if (Physics.aabb(hb, balloon.getHitbox())) {
        const playerBottom = player.y + player.renderH;
        const isStomp = player.vy > 0 && playerBottom <= balloon.y + 24;
        if (isStomp || player.giantMode) {
          balloon.active = false;
          player.enemyBounce();
          spawnCollectParticles(balloon.screenX + balloon.width / 2, balloon.y + balloon.height / 2, 'honey');
          AudioEngine.playDamage();
          spawnFloatingText(balloon.screenX + balloon.width / 2, balloon.y - 15, 'POPPED BALLOON! 🎈', '#FF1744');
        } else {
          balloon.active = false;
          const fatal = player.takeDamage();
          if (fatal) { gameOver(); return; }
        }
      }
    }
  }

  // 4. Collectibles (Hearts, Mushroom, Honey Pots, Giant Honey, Key, Easter Egg)
  for (const c of level.collectibles) {
    if (!c.active) continue;
    if (Physics.aabb(hb, c.getHitbox())) {
      c.active = false;

      if (c.type === 'heart') {
        player.addHeart();
        spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, 'heart');
        spawnFloatingText(c.screenX + c.width / 2, c.y - 15, '+1 HEART! ❤️', '#FF4466');

      } else if (c.type === 'mushroom') {
        player.collectMushroom();
        spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, 'mushroom');
        spawnFloatingText(c.screenX + c.width / 2, c.y - 15, '+MEGA MUSHROOM! (Press R)', '#FFD700');

      } else if (c.type === 'key') {
        player.hasKey = true;
        spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, 'heart');
        AudioEngine.playMajesticKey();
        spawnFloatingText(c.screenX + c.width / 2, c.y - 20, '🗝️ FOUND SECRET KEY! 🗝️', '#FFD700');

      } else if (c.type === 'easter_egg') {
        // Easter Egg is collected exclusively by holding [P] for 2 seconds after talking to the wizard
        continue;

      } else if (c.type === 'giant_honey') {
        spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, 'honey');
        coins += 100;
        coinsGainedThisRun += 100;
        score += 100;
        AudioEngine.playHoneycomb();
        spawnFloatingText(c.screenX + c.width / 2, c.y - 20, '+100 GIANT HONEY BONUS! 🍯', '#FFD700');

      } else {
        spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, 'honey');
        const points = 10;
        coins += points;
        coinsGainedThisRun += points;
        score += points;
        spawnFloatingText(c.screenX + c.width / 2, c.y - 10, '+10 Points', '#FFFFFF');

        player.honeyStreak++;
        AudioEngine.playCollect();
        if (player.honeyStreak >= HONEY_STREAK_TARGET && !player.sweetRush) {
          player.activateSweetRush();
        }
      }
    }
  }

  // 5. Springboards
  for (const sb of level.springboards) {
    if (!sb.active || sb.bounceTimer > 0.05) continue;
    const sbhb = sb.getHitbox();
    const hOverlap = hb.x + hb.width > sbhb.x && hb.x < sbhb.x + sbhb.width;
    const vOverlap = hb.y + hb.height >= sbhb.y && hb.y + hb.height <= sbhb.y + 24;
    if (hOverlap && vOverlap && player.vy >= 0) {
      player.springBoost();
      sb.trigger();
      AudioEngine.playSpring();
      break;
    }
  }

  // 5b. Crumbling Platform Step Trigger
  for (const plat of level.platforms) {
    if (plat.active && plat instanceof CrumblingPlatform) {
      const platHb = { x: plat.screenX, y: plat.y, width: plat.width, height: plat.height };
      const onPlat = hb.x + hb.width > platHb.x && hb.x < platHb.x + platHb.width && (player.y + player.renderH >= plat.y - 2) && (player.y + player.renderH <= plat.y + 12);
      if (onPlat) {
        plat.stepOn();
      }
    }
  }

  // 6. Giant Mode Platform Smashing
  if (player.giantMode) {
    for (const plat of level.platforms) {
      if (!plat.active || plat.tier === 0) continue;
      const platHb = { x: plat.screenX, y: plat.y, width: plat.width, height: plat.height };
      if (Physics.aabb(hb, platHb)) {
        plat.active = false;
        AudioEngine.playDamage();
      }
    }
  }
}

// ── Particles & Celebration ───────────────────────────────────

function spawnCollectParticles(x, y, type) {
  const count = type === 'heart' ? 16 : (type === 'mushroom' ? 20 : 12);
  let col = '#FFAE00';
  if (type === 'heart') col = '#FF4466';
  if (type === 'mushroom') col = '#FFD700';
  if (type === 'water') col = '#4FC3F7';

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
    const spd = 90 + Math.random() * 130;
    collectParticles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - 50,
      life: 0.5 + Math.random() * 0.35,
      maxLife: 0.85,
      size: 4 + Math.random() * 5,
      color: col,
    });
  }
}

function spawnVictoryRibbons() {
  const colors = ['#FF5722', '#FFD700', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'];
  for (let i = 0; i < 80; i++) {
    confettiParticles.push({
      x: CANVAS_W * 0.5 + (Math.random() - 0.5) * 400,
      y: 100 + Math.random() * 100,
      vx: (Math.random() - 0.5) * 200,
      vy: -150 - Math.random() * 200,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 8,
      w: 8 + Math.random() * 8,
      h: 14 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 3.5,
      maxLife: 3.5
    });
  }
}

function updateParticles(dt) {
  for (let i = collectParticles.length - 1; i >= 0; i--) {
    const p = collectParticles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    p.life -= dt;
    if (p.life <= 0) collectParticles.splice(i, 1);
  }

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const c = confettiParticles[i];
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    c.vy += 180 * dt;
    c.rot += c.vrot * dt;
    c.life -= dt;
    if (c.life <= 0) confettiParticles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of collectParticles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }

  for (const c of confettiParticles) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, c.life / 0.8);
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ── Floating Text ─────────────────────────────────────────────
function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 1.2, maxLife: 1.2, vy: -35 });
}

function updateFloatingTexts(dt) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function drawFloatingTexts() {
  ctx.save();
  ctx.font = 'bold 11px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  for (const ft of floatingTexts) {
    ctx.globalAlpha = ft.life / ft.maxLife;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.restore();
}

// ── Camera Update ─────────────────────────────────────────────
function updateCamera() {
  const targetX = player.x + player.renderW / 2 - CANVAS_W / 2;
  cameraX = Math.max(0, Math.min(level.mapWidth - CANVAS_W, targetX));
}

// ── Draw Thunder Storm (Upper Half of Sky Only) ───────────────
function drawThunderEffects() {
  if (thunderTimer <= 0) return;
  ctx.save();

  // Rapid white / cyan lightning flash
  const flash = Math.sin(thunderTimer * 30) > 0.1 ? 0.40 : (Math.random() < 0.2 ? 0.30 : 0.06);
  ctx.fillStyle = `rgba(220, 245, 255, ${flash})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H * 0.50);

  // Jagged lightning bolts restricted to upper half of the sky
  if (Math.random() < 0.6) {
    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowColor = '#80D8FF';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3 + Math.random() * 3;

    let lx = 300 + Math.random() * (CANVAS_W - 500);
    let ly = 0;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    while (ly < CANVAS_H * 0.42) {
      lx += (Math.random() - 0.5) * 50;
      ly += 20 + Math.random() * 30;
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ── Game Loop ─────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (state !== STATE.PLAYING && state !== STATE.VICTORY && state !== STATE.DIALOGUE) return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.08);
  lastTime = timestamp;

  if (showingHoneyBanner) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) showingHoneyBanner = false;
  }

  if (showingBossBanner) {
    bossBannerTimer -= dt;
    if (bossBannerTimer <= 0) showingBossBanner = false;
  }

  if (thunderTimer > 0) {
    thunderTimer -= dt;
  }

  if (showingFogBanner) {
    fogBannerTimer -= dt;
    if (fogBannerTimer <= 0) showingFogBanner = false;
  }

  if (state === STATE.PLAYING) {
    player.update(dt, level.getAllPlatforms(), cameraX, level.mapWidth);
    updateCamera();
    player.screenX = player.x - cameraX;
    level.update(dt, cameraX);

    // Check Wizard Proximity for Dialogue (must touch wizard)
    if (level.wizards && level.wizards.length > 0) {
      for (const wiz of level.wizards) {
        if (!wiz.greeted && Physics.aabb(player.getHitbox(), wiz.getHitbox())) {
          wiz.greeted = true;
          activeWizard = wiz;
          state = STATE.DIALOGUE;
          fogPermanentlyDisabled = true;
          if (typeof AudioEngine.isBgPlaying === 'function' && !AudioEngine.isBgPlaying()) {
            AudioEngine.resumeBgMusic();
          }
          pKeyHeld = false;
          eggHoldTime = 0;
          AudioEngine.playWizardLaugh();

          // Force player to stop moving
          player.endLeft();
          player.endRight();
          player.vx = 0;
        }
      }
    }

    // Easter Egg Hold [P] for 2 seconds mechanic (collectible only after talking to wizard)
    if (level.easterEgg && level.easterEgg.active && level.easterEgg.revealed) {
      const dist = Math.abs((player.x + player.renderW / 2) - (level.easterEgg.worldX + level.easterEgg.width / 2));
      const yDist = Math.abs(player.y - level.easterEgg.y);
      const nearEgg = dist < 75 && yDist < 80;
      if (nearEgg && pKeyHeld) {
        eggHoldTime += dt;
        if (eggHoldTime >= 2.0) {
          eggHoldTime = 0;
          pKeyHeld = false;
          level.easterEgg.active = false;
          player.hasEasterEgg = true;
          score += 10000;
          coins += 1000;
          coinsGainedThisRun += 1000;
          AudioEngine.playCollect();
          spawnFloatingText(player.screenX + player.renderW / 2, player.y - 30, '+1 ITEM IN BAG 🎒', '#FFD700', 3.0);
        }
      } else if (!nearEgg) {
        eggHoldTime = 0;
      }
    }

    // Trigger "BOSS TIME!" + Thunder Storm when boss enters viewport
    const bossEntity = level.boss || level.jokerBoss;
    if (bossEntity && bossEntity.active && !bossEntity.alertTriggered) {
      if (bossEntity.screenX < CANVAS_W - 80 && bossEntity.screenX > 0) {
        bossEntity.alertTriggered = true;
        showingBossBanner = true;
        bossBannerTimer = 3.5;
        thunderTimer = 1.5;
        AudioEngine.playBossAlert();
      }
    }

    handleCollisions();
  }

  updateParticles(dt);
  updateFloatingTexts(dt);

  // ══ Render ═══════════════════════════════════════════════
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.imageSmoothingEnabled = false;

  Background.draw(ctx, CANVAS_W, CANVAS_H, cameraX, currentSelectedLevel);

  level.draw(ctx, player.hasKey);
  player.draw(ctx, cameraX);
  drawParticles();
  drawFloatingTexts();
  drawThunderEffects();

  // ── Fog of War Spotlight & Music Cutoff (Pitch Black Fog Zone) ──
  if (!fogPermanentlyDisabled && level && level.fogZones && level.fogZones.length > 0) {
    const inFog = level.fogZones.some(z => z.contains(player.x));
    if (inFog) {
      // Cut off background music inside fog
      if (typeof AudioEngine.isBgPlaying === 'function' && AudioEngine.isBgPlaying()) {
        AudioEngine.pauseBgMusic();
      }

      const pScreenX = Math.floor(player.screenX + player.renderW / 2);
      const pScreenY = Math.floor(player.y + player.renderH / 2);
      const innerRadius = 55;
      const outerRadius = 185;

      ctx.save();
      // Smooth radial gradient mask on top of game scene
      const fogGrd = ctx.createRadialGradient(pScreenX, pScreenY, innerRadius, pScreenX, pScreenY, outerRadius);
      fogGrd.addColorStop(0, 'rgba(10, 4, 14, 0)');
      fogGrd.addColorStop(0.45, 'rgba(10, 4, 14, 0.45)');
      fogGrd.addColorStop(0.85, 'rgba(10, 4, 14, 0.92)');
      fogGrd.addColorStop(1, 'rgba(10, 4, 14, 0.99)');

      ctx.fillStyle = fogGrd;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Deep dark perimeter vignette
      ctx.fillStyle = 'rgba(8, 2, 10, 0.7)';
      ctx.fillRect(0, 0, CANVAS_W, 25);
      ctx.fillRect(0, CANVAS_H - 25, CANVAS_W, 25);

      // Fog hint banner
      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText('🔦 PITCH BLACK FOG (FIND THE SECRET KEY!)', CANVAS_W / 2, 85);
      ctx.restore();
    } else {
      // Resume background music when outside fog
      if (state === STATE.PLAYING && typeof AudioEngine.isBgPlaying === 'function' && !AudioEngine.isBgPlaying()) {
        AudioEngine.resumeBgMusic();
      }
    }
  } else if (fogPermanentlyDisabled) {
    // If fog is permanently disabled, ensure background music keeps playing!
    if (state === STATE.PLAYING && typeof AudioEngine.isBgPlaying === 'function' && !AudioEngine.isBgPlaying()) {
      AudioEngine.resumeBgMusic();
    }
  }

  // HUD
  HUD.drawHearts(ctx, player.hearts, player.maxHearts);
  HUD.drawMushroomStatus(ctx, player.hasMushroom);
  HUD.drawScore(ctx, score, CANVAS_W);
  HUD.drawSweetRushGauge(ctx, player.honeyStreak, HONEY_STREAK_TARGET,
    player.sweetRush, player.sweetRushTimer, CANVAS_W);

  // Sweet Rush screen flash
  if (player.sweetRush) {
    const flashA = Math.sin(performance.now() / 90) * 0.03 + 0.04;
    ctx.fillStyle = `hsla(45,100%,60%,${flashA})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Honey Time / Mega Banner ──
  if (showingHoneyBanner) {
    ctx.save();
    const alpha = Math.min(1, bannerTimer, 3.0 - bannerTimer);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = '#FFF500';
    ctx.font = 'bold 36px "Fredoka One", cursive';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;
    const bannerY = 80 + Math.sin(performance.now() / 150) * 10;
    ctx.strokeText('MEGA MODE!', CANVAS_W / 2, bannerY);
    ctx.fillText('MEGA MODE!', CANVAS_W / 2, bannerY);
    ctx.font = 'bold 16px "Fredoka One", cursive';
    ctx.lineWidth = 3;
    ctx.strokeText('INVINCIBLE DESTRUCTION!', CANVAS_W / 2, bannerY + 30);
    ctx.fillText('INVINCIBLE DESTRUCTION!', CANVAS_W / 2, bannerY + 30);
    ctx.restore();
  }

  // ── Boss Time Banner ──
  if (showingBossBanner) {
    ctx.save();
    const alpha = Math.min(1, bossBannerTimer, 3.5 - bossBannerTimer);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = level.jokerBoss ? '#FF1744' : '#E040FB';
    ctx.font = 'bold 32px "Fredoka One", cursive';
    ctx.textAlign = 'center';
    ctx.strokeStyle = level.jokerBoss ? '#B71C1C' : '#4A148C';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
    const bY = 90 + Math.sin(performance.now() / 120) * 8;
    const title = level.jokerBoss ? '🃏 JOKER TIME! 🃏' : '⚡ BOSS TIME! ⚡';
    const subtitle = level.jokerBoss ? 'DEFEAT JOKER (STOMP HIS HEAD & DODGE BALLOONS)' : 'DEFEAT BOSS 1 (PRESS R TO RELEASE MEGA)';
    ctx.strokeText(title, CANVAS_W / 2, bY);
    ctx.fillText(title, CANVAS_W / 2, bY);
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#FFF';
    ctx.strokeText(subtitle, CANVAS_W / 2, bY + 32);
    ctx.fillText(subtitle, CANVAS_W / 2, bY + 32);
    ctx.restore();
  }

  // ── Big Obvious Fog Warning Banner ──
  if (showingFogBanner) {
    ctx.save();
    const alpha = Math.min(1, fogBannerTimer, 4.0 - fogBannerTimer);
    ctx.globalAlpha = Math.max(0, alpha);

    const bannerH = 110;
    const bannerY = 65;

    // Dark danger backdrop across whole canvas width
    ctx.fillStyle = 'rgba(18, 4, 30, 0.94)';
    ctx.fillRect(0, bannerY - 15, CANVAS_W, bannerH + 30);

    // Hazard Stripes on top and bottom borders
    ctx.fillStyle = '#FF1744';
    ctx.fillRect(0, bannerY - 15, CANVAS_W, 6);
    ctx.fillRect(0, bannerY + bannerH + 9, CANVAS_W, 6);

    const flash = Math.sin(performance.now() / 85) > 0;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FF1744';
    ctx.shadowBlur = 20;

    // Big Flashing Headline Text
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.fillStyle = flash ? '#FFEB3B' : '#FF1744';
    ctx.fillText('⚠️ DANGER: ENTERING DARK FOG! ⚠️', CANVAS_W / 2, bannerY + 32);

    ctx.shadowBlur = 6;
    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('EXTREME VISIBILITY DROP • HIDDEN TRAPS & LAVA AHEAD!', CANVAS_W / 2, bannerY + 66);

    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = '#80D8FF';
    ctx.fillText('FIND THE SECRET KEY TO UNLOCK THE ANCIENT CHAMBER!', CANVAS_W / 2, bannerY + 92);

    ctx.restore();
  }

  // ── Easter Egg Hold [P] Indicator (when near egg after dialogue) ──
  if (level && level.easterEgg && level.easterEgg.active && level.easterEgg.revealed) {
    const dist = Math.abs((player.x + player.renderW / 2) - (level.easterEgg.worldX + level.easterEgg.width / 2));
    const yDist = Math.abs(player.y - level.easterEgg.y);
    if (dist < 85 && yDist < 90) {
      const eggScrX = Math.floor(level.easterEgg.screenX + level.easterEgg.width / 2);
      const eggScrY = Math.floor(level.easterEgg.y - 30);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillStyle = pKeyHeld ? '#69F0AE' : '#FFE082';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(pKeyHeld ? 'HOLDING [P]...' : 'HOLD [P] (2s) TO CLAIM', eggScrX, eggScrY - 14);

      // Progress Bar Outer Box
      const barW = 100;
      const barH = 12;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(eggScrX - barW / 2, eggScrY - 6, barW, barH, 4);
      ctx.fill();
      ctx.stroke();

      // Progress Bar Fill
      const frac = Math.min(1.0, eggHoldTime / 2.0);
      if (frac > 0) {
        ctx.fillStyle = '#00E5FF';
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(eggScrX - barW / 2 + 1, eggScrY - 5, (barW - 2) * frac, barH - 2, 3);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // ── Simple & Beautiful Wizard Dialogue Box ──
  if (state === STATE.DIALOGUE && activeWizard) {
    ctx.save();

    // Dim background overlay
    ctx.fillStyle = 'rgba(10, 15, 30, 0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Dialogue Card Dimensions
    const boxW = 680;
    const boxH = 180;
    const boxX = Math.floor((CANVAS_W - boxW) / 2);
    const boxY = CANVAS_H - boxH - 45;

    // Glowing Card Body
    const cardGrd = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    cardGrd.addColorStop(0, '#0d1b2a');
    cardGrd.addColorStop(1, '#1b263b');
    ctx.fillStyle = cardGrd;
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Wizard Avatar Circle on Left
    const avaX = boxX + 60;
    const avaY = boxY + 75;
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(avaX, avaY, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wizard Graphic inside avatar circle
    if (WIZARD_IMG.complete && WIZARD_IMG.naturalWidth > 0) {
      ctx.drawImage(WIZARD_IMG, avaX - 28, avaY - 28, 56, 56);
    } else {
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧙‍♂️', avaX, avaY);
    }

    // Name Tag
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText('🧙 ANCIENT WOODLAND WIZARD', boxX + 118, boxY + 38);

    // Dialogue Lines (Smaller font so wide pixel lettering fits comfortably)
    ctx.font = '7.5px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('"Ho ho ho! Welcome, brave traveler!"', boxX + 118, boxY + 64);
    ctx.fillText('"I have a magical gift for you..."', boxX + 118, boxY + 86);
    ctx.fillStyle = '#69F0AE';
    ctx.fillText('"Look behind me on my left! The Easter Egg awaits!"', boxX + 118, boxY + 108);

    // Bottom Action Prompt Button
    const btnPulse = (Math.sin(performance.now() / 150) + 1) / 2;
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = btnPulse > 0.5 ? '#FFEB3B' : '#FFF9C4';
    ctx.textAlign = 'center';
    ctx.fillText('▶ PRESS [SPACE] OR CLICK TO CONTINUE ◀', boxX + boxW / 2, boxY + 150);

    ctx.restore();
  }

  // ── Dungeon Door Pop-out Box (Always illuminated on top of fog) ──
  const nearDungeonDoor = (() => {
    const door = level && (level.dungeonDoor || level.lockedGate);
    if (!door || door.unlocked) return null;
    const pMidX = player.x + player.renderW / 2;
    const doorMidX = door.worldX + door.width / 2;
    const dist = Math.abs(pMidX - doorMidX);
    const nearY = (player.y + player.renderH > door.y - 40) && (player.y < door.y + door.height + 40);
    if (dist < 160 && nearY) {
      return door;
    }
    return null;
  })();

  if (nearDungeonDoor && state !== STATE.DIALOGUE) {
    ctx.save();
    const boxW = 580;
    const boxH = 92;
    const boxX = (CANVAS_W - boxW) / 2;
    const boxY = 35; // Top-center HUD banner position (completely visible above fog)
    const hasKey = player.hasKey;

    // Outer Glowing Card Body
    const cardGrd = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
    cardGrd.addColorStop(0, '#0d1b2a');
    cardGrd.addColorStop(1, '#1b263b');
    ctx.fillStyle = cardGrd;
    ctx.strokeStyle = hasKey ? '#69F0AE' : '#FF1744';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = hasKey ? '#00E5FF' : '#FF1744';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Avatar Circle on Left
    const avaX = boxX + 48;
    const avaY = boxY + boxH / 2;
    ctx.fillStyle = hasKey ? '#004D40' : '#4A0000';
    ctx.beginPath();
    ctx.arc(avaX, avaY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hasKey ? '#69F0AE' : '#FF5252';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Icon inside circle
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hasKey ? '🗝️' : '🔒', avaX, avaY);

    // Title Tag
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillStyle = hasKey ? '#69F0AE' : '#FF5252';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(hasKey ? '🗝️ SECRET DUNGEON KEY DETECTED!' : '🔒 ANCIENT DUNGEON DOOR LOCKED!', boxX + 90, boxY + 28);

    // Subtitle / Narrative
    ctx.font = '7.5px "Press Start 2P", monospace';
    ctx.fillStyle = '#E0E0E0';
    if (hasKey) {
      ctx.fillText('"You possess the ancient key to unlock this chamber."', boxX + 90, boxY + 50);
    } else {
      ctx.fillText('"Entry Denied: You need the secret key to open this gate."', boxX + 90, boxY + 50);
    }

    // Flashing Action Call to Action
    const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
    ctx.font = 'bold 8.5px "Press Start 2P", monospace';
    ctx.shadowBlur = 4;
    if (hasKey) {
      ctx.fillStyle = pulse > 0.5 ? '#FFEB3B' : '#69F0AE';
      ctx.fillText('▶ PRESS [K] OR CLICK TO OPEN THE DOOR ◀', boxX + 90, boxY + 74);
    } else {
      ctx.fillStyle = pulse > 0.5 ? '#FF8A80' : '#FFD54F';
      ctx.fillText('⚠️ FIND THE KEY ON FLOOR 3 (LAVA TRENCHES) ⚠️', boxX + 90, boxY + 74);
    }

    ctx.restore();
  }

  rafId = requestAnimationFrame(gameLoop);
}

// ── Startup ───────────────────────────────────────────────────
displayHS.textContent = highScore;
updateStoreUI();
showScreen('screen-start');
Background.draw(ctx, CANVAS_W, CANVAS_H, 0);
