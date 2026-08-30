/**
 * game.js — Main loop, state machine, input, collision, pause/settings
 */

// ── Constants ─────────────────────────────────────────────────
const CANVAS_W = 800;
const CANVAS_H = 450;
const BASE_SPEED = 240;
const SPEED_SCALE_INTERVAL = 500;
const SPEED_SCALE_FACTOR = 1.05;
const SWEET_RUSH_SPEED_MULT = 1.5;
const HONEY_STREAK_TARGET = 5;

// ── States ─────────────────────────────────────────────────────
const STATE = { MENU: 'MENU', PLAYING: 'PLAYING', PAUSED: 'PAUSED', GAMEOVER: 'GAMEOVER' };

// ── Canvas Setup ───────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
window.canvasW = CANVAS_W;

// ── Game State ────────────────────────────────────────────────
let state = STATE.MENU;
let score = 0;
let highScore = parseInt(localStorage.getItem('pooh_highscore') || '0', 10);
let coins = parseInt(localStorage.getItem('pooh_coins') || '0', 10);
let unlockedChars = JSON.parse(localStorage.getItem('pooh_unlocked') || '["pooh"]');
let activeChar = localStorage.getItem('pooh_active_char') || 'pooh';
let bossSpawned = false;
let showingHoneyBanner = false;
let bannerTimer = 0;
let distance = 0;
let speedMult = 1.0;
let bgVolume = 0.25; // 0–1

let player = null;
let level = null;
let lastTime = 0;
let rafId = null;
let collectParticles = [];
let floatingTexts = [];

// ── DOM ───────────────────────────────────────────────────────
const screenStart = document.getElementById('screen-start');
const screenGameover = document.getElementById('screen-gameover');
const screenPause = document.getElementById('screen-pause');
const btnStart = document.getElementById('btn-start');
const btnRestart = document.getElementById('btn-restart');
const btnPause = document.getElementById('btn-pause');
const btnResume = document.getElementById('btn-resume');
const btnRestartPause = document.getElementById('btn-restart-pause');
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const displayHS = document.getElementById('display-highscore');
const goScore = document.getElementById('go-score');
const goDistance = document.getElementById('go-distance');
const goHighscore = document.getElementById('go-highscore');
const displayCoins = document.getElementById('display-coins');
const btnHomePause = document.getElementById('btn-home-pause');
const btnHomeGameover = document.getElementById('btn-home-gameover');

// ── Init / Reset ──────────────────────────────────────────────
function initGame() {
  score = 0; distance = 0; speedMult = 1.0;
  collectParticles = [];
  floatingTexts = [];
  player = new Player(CANVAS_W, CANVAS_H, activeChar);
  level = new Level(CANVAS_W, CANVAS_H);
  bossSpawned = false;
  showingHoneyBanner = false;
  bannerTimer = 0;
  MILESTONES.forEach(m => m.completed = false);
}

// ── Screen Management ─────────────────────────────────────────
function showScreen(id) {
  [screenStart, screenGameover, screenPause].forEach(s => s.classList.remove('active'));
  btnPause.style.display = 'none';
  if (id) document.getElementById(id).classList.add('active');

  if (id === 'screen-start') {
    displayCoins.innerText = coins;
    updateStoreUI();
  }
}

function showGameUI() {
  [screenStart, screenGameover, screenPause].forEach(s => s.classList.remove('active'));
  btnPause.style.display = 'flex';
  // Strip focus from any hidden overlay button so Space/Enter can't accidentally activate it
  if (document.activeElement && document.activeElement !== document.body) {
    document.activeElement.blur();
  }
}

// ── Game Flow ─────────────────────────────────────────────────
function startGame() {
  initGame();
  state = STATE.PLAYING;
  showGameUI();
  AudioEngine.startBgMusic(bgVolume);
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
  // Save coins
  localStorage.setItem('pooh_coins', coins);

  goScore.textContent = score;
  goDistance.textContent = `${Math.floor(distance)} m`;
  goHighscore.textContent = highScore;
  showScreen('screen-gameover');
}

// ── Input ─────────────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', e => {
  // Always block Tab from cycling browser focus — it would land on hidden overlay buttons
  // and cause Space/Enter to accidentally restart/resume the game.
  if (e.code === 'Tab') { e.preventDefault(); return; }

  if (keys[e.code]) return;
  keys[e.code] = true;

  if (state === STATE.MENU) { if (['Space', 'Enter', 'ArrowUp'].includes(e.code)) startGame(); return; }
  if (state === STATE.GAMEOVER) { if (['Space', 'Enter'].includes(e.code)) startGame(); return; }
  if (state === STATE.PAUSED) { if (['Space', 'Enter', 'KeyP'].includes(e.code)) resumeGame(); return; }

  if (state === STATE.PLAYING) {
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) player.startJump(performance.now());
    if (['ArrowDown', 'KeyS'].includes(e.code)) player.startDown();
    if (e.code === 'KeyP') pauseGame();
  }
});

document.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (state !== STATE.PLAYING) return;
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) player.endJump(performance.now());
  if (['ArrowDown', 'KeyS'].includes(e.code)) player.endDown();
});

// ── Touch controls ────────────────────────────────────────────
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  touchStartY = e.touches[0].clientY;
  if (state === STATE.MENU) { startGame(); return; }
  if (state === STATE.GAMEOVER) { startGame(); return; }
  if (state === STATE.PAUSED) { resumeGame(); return; }

  const rect = canvas.getBoundingClientRect();
  const relY = e.touches[0].clientY - rect.top;
  if (relY < rect.height / 2) player.startJump(performance.now());
  else player.startDown();
}, { passive: false });

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  if (state !== STATE.PLAYING) return;
  const dy = (e.changedTouches[0]?.clientY || touchStartY) - touchStartY;
  if (dy > 40) player.endDown();
  player.endJump(performance.now());
  player.endDown();
}, { passive: false });

// ── Store Logic ───────────────────────────────────────────────
const CHAR_PRICES = { pooh: 0, capybara: 1000, batman: 5000 };

window.selectCharacter = function (charId) {
  if (unlockedChars.includes(charId)) {
    activeChar = charId;
    localStorage.setItem('pooh_active_char', activeChar);
    updateStoreUI();
  } else {
    // Attempt to buy
    if (coins >= CHAR_PRICES[charId]) {
      coins -= CHAR_PRICES[charId];
      unlockedChars.push(charId);
      localStorage.setItem('pooh_coins', coins);
      localStorage.setItem('pooh_unlocked', JSON.stringify(unlockedChars));

      activeChar = charId;
      localStorage.setItem('pooh_active_char', activeChar);

      displayCoins.innerText = coins;
      updateStoreUI();
    } else {
      alert(`Not enough coins! You need ${CHAR_PRICES[charId]} 💰`);
    }
  }
};

function updateStoreUI() {
  ['pooh', 'capybara', 'batman'].forEach(charId => {
    const card = document.getElementById(`char-${charId}`);
    if (unlockedChars.includes(charId)) {
      card.classList.remove('locked');
      card.querySelector('.char-price').innerText = 'Unlocked';
    } else {
      card.classList.add('locked');
      card.querySelector('.char-price').innerText = `${CHAR_PRICES[charId].toLocaleString()} 💰`;
    }

    if (activeChar === charId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

// ── Event Listeners ───────────────────────────────────────────
btnStart.addEventListener('click', startGame);
btnRestart.addEventListener('click', startGame);
btnRestartPause.addEventListener('click', startGame);
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

volumeSlider.addEventListener('input', e => {
  bgVolume = parseInt(e.target.value, 10) / 100;
  volumeValue.textContent = `${e.target.value}%`;
  AudioEngine.setBgVolume(bgVolume);
});

// ── Milestones ──────────────────────────────────────────────────
const MILESTONES = [
  { points: 200, imgType: 'boss' },
  { points: 400, imgType: 'cat' },
  { points: 600, imgType: 'joker' }
];

// ── Collision Detection ───────────────────────────────────────
function handleCollisions() {
  const hb = player.getHitbox();

  // Bees, Enemies & Bosses
  for (const bee of level.bees) {
    if (!bee.active) continue;
    const bhb = bee.getHitbox();
    if (Physics.aabb(hb, bhb)) {
      if (player.giantMode) {
        bee.active = false; // Burst ANY enemy!
        AudioEngine.playDamage();
      } else {
        if (bee.type !== 'boss') {
          if (player.takeDamage() && player.hearts <= 0) { gameOver(); return; }
        }
      }
    }
  }

  // Collectibles
  for (const c of level.collectibles) {
    if (!c.active) continue;
    const chb = c.getHitbox();
    if (Physics.aabb(hb, chb)) {
      c.active = false;
      spawnCollectParticles(c.screenX + c.width / 2, c.y + c.height / 2, c.type);

      const points = 10;

      // Gain coins every time you collect honey
      coins += points;
      // Gain score only if not in giant mode
      if (!player.giantMode) {
        score += points;
        spawnFloatingText(c.screenX + c.width / 2, c.y - 10, '+10 Points', '#FFFFFF');
      } else {
        spawnFloatingText(c.screenX + c.width / 2, c.y - 10, '+10 Coins', '#FFD700');
      }

      if (c.type === 'honeycomb') {
        player.restoreHeart();
        player.honeyStreak = 0;
        AudioEngine.playHoneycomb();
      } else {
        player.honeyStreak++;
        AudioEngine.playCollect();
        if (player.honeyStreak >= HONEY_STREAK_TARGET && !player.sweetRush) {
          player.activateSweetRush();
        }
      }
    }
  }

  // Springboards
  for (const sb of level.springboards) {
    if (!sb.active || sb.bounceTimer > 0.05) continue;
    const sbhb = sb.getHitbox();
    const hOverlap = hb.x + hb.width > sbhb.x && hb.x < sbhb.x + sbhb.width;
    const atGroundFloor = player.onGround &&
      (!player.currentPlatform || player.currentPlatform.tier === 0);

    if (hOverlap && atGroundFloor) {
      player.springBoost();
      sb.trigger();
      AudioEngine.playSpring();
      break;
    }
  }

  // Giant Mode platform crushing
  if (player.giantMode) {
    for (const plat of level.platforms) {
      if (!plat.active) continue;
      const platHb = { x: plat.screenX, y: plat.y, width: plat.width, height: plat.height };
      if (Physics.aabb(hb, platHb)) {
        plat.active = false; // Burst the platform!
        AudioEngine.playDamage();
      }
    }
  }
}

// ── Collect Particles ─────────────────────────────────────────
function spawnCollectParticles(x, y, type) {
  const count = type === 'honeycomb' ? 18 : 12;
  const col = type === 'honeycomb' ? '#FFAE00' : '#BA85E0';
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

function updateCollectParticles(dt, worldSpeed) {
  for (let i = collectParticles.length - 1; i >= 0; i--) {
    const p = collectParticles[i];
    p.x -= worldSpeed * dt; // SCROLL WITH WORLD!
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    p.life -= dt;
    if (p.life <= 0) collectParticles.splice(i, 1);
  }
}

function drawCollectParticles() {
  for (const p of collectParticles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Floating Text ─────────────────────────────────────────────
function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({ x, y, text, color, life: 1.0, maxLife: 1.0, vy: -40 });
}

function updateFloatingTexts(dt, worldSpeed) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ft.x -= worldSpeed * dt; // SCROLL WITH WORLD!
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function drawFloatingTexts() {
  ctx.save();
  ctx.font = 'bold 12px "Press Start 2P", monospace';
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

function getWorldSpeed() {
  let spd = BASE_SPEED * speedMult;
  if (player && player.sweetRush) spd *= SWEET_RUSH_SPEED_MULT;
  return spd;
}

// ── Game Loop ─────────────────────────────────────────────────
function gameLoop(timestamp) {
  if (state !== STATE.PLAYING) return;

  const dt = Math.min((timestamp - lastTime) / 1000, 0.08);
  lastTime = timestamp;

  const worldSpeed = getWorldSpeed();

  // Distance & speed scaling
  distance += (worldSpeed * dt) / 100;
  speedMult = Math.pow(SPEED_SCALE_FACTOR, Math.floor(distance / SPEED_SCALE_INTERVAL));

  // ── BOSS PHASE TRIGGER ──
  const nextMilestone = MILESTONES.find(m => score >= m.points && !m.completed);
  if (nextMilestone) {
    nextMilestone.completed = true;
    level.triggerBossPhase(nextMilestone.imgType);
    showingHoneyBanner = true;
    bannerTimer = 3.0;
    player.activateGiantMode(7.5);
  }

  if (showingHoneyBanner) {
    bannerTimer -= dt;
    if (bannerTimer <= 0) showingHoneyBanner = false;
  }

  // Update
  level.update(dt, worldSpeed, score);
  player.update(dt, level.getAllPlatforms(), worldSpeed);
  handleCollisions();
  if (state !== STATE.PLAYING) return;
  updateCollectParticles(dt, worldSpeed);
  updateFloatingTexts(dt, worldSpeed);

  // ══ Render ═══════════════════════════════════════════════
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.imageSmoothingEnabled = false;

  Background.draw(ctx, CANVAS_W, CANVAS_H, level.worldX);
  level.draw(ctx);
  player.draw(ctx);
  drawCollectParticles();
  drawFloatingTexts();

  // HUD
  HUD.drawHearts(ctx, player.hearts, player.maxHearts);
  HUD.drawScore(ctx, score, distance, CANVAS_W);
  HUD.drawSweetRushGauge(ctx, player.honeyStreak, HONEY_STREAK_TARGET,
    player.sweetRush, player.sweetRushTimer, CANVAS_W);
  HUD.drawSpeedBadge(ctx, speedMult);

  // Sweet Rush screen flash
  if (player.sweetRush) {
    const flashA = Math.sin(performance.now() / 90) * 0.03 + 0.04;
    ctx.fillStyle = `hsla(45,100%,60%,${flashA})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Honey Time Banner ──
  if (showingHoneyBanner) {
    ctx.save();
    const alpha = Math.min(1, bannerTimer, 3.0 - bannerTimer);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FFF500';
    ctx.font = 'bold 36px "Fredoka One", cursive'; // Smaller font
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 10;

    // Move to uppermost part of screen
    const bannerY = 80 + Math.sin(performance.now() / 150) * 10;
    ctx.strokeText('HONEY TIME!', CANVAS_W / 2, bannerY);
    ctx.fillText('HONEY TIME!', CANVAS_W / 2, bannerY);

    ctx.font = 'bold 16px "Fredoka One", cursive';
    ctx.lineWidth = 3;
    ctx.strokeText('MEGA COIN RUSH!', CANVAS_W / 2, bannerY + 30);
    ctx.fillText('MEGA COIN RUSH!', CANVAS_W / 2, bannerY + 30);
    ctx.restore();
  }

  rafId = requestAnimationFrame(gameLoop);
}

// ── Startup ───────────────────────────────────────────────────
displayHS.textContent = highScore;
showScreen('screen-start');

// Draw background on idle canvas
Background.draw(ctx, CANVAS_W, CANVAS_H, 0);
