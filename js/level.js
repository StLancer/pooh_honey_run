/**
 * level.js — Procedural world: platforms, bees (bee.png), honey pots, springboards
 */

// ── Enemy Images (loaded once) ──────────────────────────────────
const BEE_IMG = (() => { const img = new Image(); img.src = 'assets/bee.png'; return img; })();
const BOSS_IMG = (() => { const img = new Image(); img.src = 'assets/boss1.png'; return img; })();
const CAT_IMG = (() => { const img = new Image(); img.src = 'assets/cat.png'; return img; })();
const JOKER_IMG = (() => { const img = new Image(); img.src = 'assets/joker.png'; return img; })();
const TIGER_IMG = (() => { const img = new Image(); img.src = 'assets/tiger.png'; return img; })();
const FIREBALL_IMG = (() => { const img = new Image(); img.src = 'assets/fireball.png'; return img; })();

// ── Platform ──────────────────────────────────────────────────
class Platform {
  constructor(x, tier, canvasH, width = null) {
    this.tier = tier;
    this.width = width || (90 + Math.random() * 130);
    this.height = 18;
    this.worldX = x;

    const tierYPct = [0.80, 0.55, 0.30];
    this.y = canvasH * tierYPct[tier] - this.height;

    this.screenX = 0;
    this.active = true;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = Math.floor(this.width);
    const h = this.height;
    const P = 4; // pixel block size for platform art

    // Bark body — drawn as pixel blocks
    const barkColors = ['#8D5B3A', '#7A4F30', '#6B4228'];
    for (let bx = 0; bx < w; bx += P) {
      const colIdx = Math.floor((bx / P) % 3);
      ctx.fillStyle = barkColors[colIdx];
      ctx.fillRect(x + bx, y + P, Math.min(P, w - bx), h - P);
    }

    // Grass/moss top (pixelated)
    const grassCol = this.tier === 0 ? '#5BB948' : '#4A7C35';
    const grassDark = this.tier === 0 ? '#3E9034' : '#356029';
    for (let gx = 0; gx < w; gx += P) {
      ctx.fillStyle = (Math.floor(gx / P) % 2 === 0) ? grassCol : grassDark;
      ctx.fillRect(x + gx, y, Math.min(P, w - gx), P);
    }

    // Dark bottom shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + h - 2, w, 2);
  }
}

// ── Bee ──────────────────────────────────────────────────────
class Bee {
  constructor(x, baseY, patrolAmp = 40, patrolSpeed = 2.0) {
    this.worldX = x;
    this.screenX = 0;
    this.baseY = baseY;
    this.y = baseY;
    // 0.75 × 70 = 53 × 53 px
    this.width = 53;
    this.height = 53;
    this.patrolAmp = patrolAmp;
    this.patrolSpeed = patrolSpeed;
    this.patrolTime = Math.random() * Math.PI * 2;
    this.active = true;
    this.wingAnim = 0;
    this.facingLeft = true;
  }

  update(dt) {
    this.patrolTime += dt * this.patrolSpeed;
    this.y = this.baseY + Math.sin(this.patrolTime) * this.patrolAmp;
    this.wingAnim = (this.wingAnim + dt * 20) % (Math.PI * 2);
  }

  getHitbox() {
    return { x: this.screenX + 10, y: this.y + 10, width: this.width - 20, height: this.height - 20 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    if (BEE_IMG.complete && BEE_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (!this.facingLeft) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(BEE_IMG, 0, 0, w, h);
      } else {
        ctx.drawImage(BEE_IMG, x, y, w, h);
      }
      ctx.restore();
    } else {
      _drawFallbackBee(ctx, x, y, w, h, this.wingAnim);
    }
  }
}

// ── BossBee (Giant, non-lethal, bobs in sky) ─────────────────────────
class BossBee {
  constructor(x, baseY, imgType = 'boss') {
    this.worldX = x;
    this.screenX = 0;
    this.baseY = baseY;
    this.y = baseY;
    this.width = 315;
    this.height = 315;
    this.active = true;
    this.bobTime = 0;
    this.type = 'boss';
    
    if (imgType === 'boss') this.img = BOSS_IMG;
    else if (imgType === 'cat') this.img = CAT_IMG;
    else if (imgType === 'joker') this.img = JOKER_IMG;
    else this.img = BOSS_IMG;
  }

  update(dt) {
    this.bobTime += dt * 2.5;
    // Just a subtle breathing effect instead of flying up and down
    this.y = this.baseY + Math.sin(this.bobTime) * 4;
  }

  getHitbox() {
    // Return actual hitbox so Pooh can hit it in Giant Mode
    return { x: this.screenX + 20, y: this.y + 20, width: this.width - 40, height: this.height - 40 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    if (this.img.complete && this.img.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.img, x, y, w, h);
      ctx.restore();
    } else {
      _drawFallbackBee(ctx, x, y, w, h, 0);
    }
  }
}

// ── Tiger (Static Enemy for Level 2+) ──────────────────────────────────
class Tiger {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 53;
    this.height = 53;
    this.y = y - this.height;
    this.active = true;
    this.type = 'tiger';
  }

  update(dt) {} // Static
  getHitbox() { return { x: this.screenX + 10, y: this.y + 10, width: this.width - 20, height: this.height - 20 }; }

  draw(ctx) {
    if (TIGER_IMG.complete && TIGER_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(TIGER_IMG, this.screenX, this.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(this.screenX, this.y, this.width, this.height);
    }
  }
}

// ── Fireball (Falling Enemy for Level 3+) ──────────────────────────────
class Fireball {
  constructor(x) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 140; // 2x character size
    this.height = 140;
    this.y = -140; // spawns off screen top
    // Move slower to create jump danger
    this.vy = Math.random() < 0.5 ? 60 : 90;
    this.active = true;
    this.type = 'fireball';
  }

  update(dt) {
    this.y += this.vy * dt;
    if (this.y > 600) this.active = false; // off screen bottom
  }
  
  getHitbox() { return { x: this.screenX + 8, y: this.y + 8, width: this.width - 16, height: this.height - 16 }; }

  draw(ctx) {
    if (FIREBALL_IMG.complete && FIREBALL_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(FIREBALL_IMG, this.screenX, this.y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#D84315';
      ctx.beginPath();
      ctx.arc(this.screenX + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

function _drawFallbackBee(ctx, x, y, w, h, wingAnim) {
  // Wings
  const wingY = Math.sin(wingAnim) * 3;
  ctx.fillStyle = 'rgba(200,230,255,0.78)';
  ctx.beginPath(); ctx.ellipse(x + 10, y - 3 + wingY, 9, 6, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 24, y - 3 + wingY, 9, 6, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F5C400';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * 0.55, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a00';
  ctx.fillRect(x + 8, y + h * 0.35, 18, 4);
  ctx.fillRect(x + 7, y + h * 0.55, 20, 4);
}

// ── Honey image (loaded once) ───────────────────────────────────
const HONEY_IMG = (() => {
  const img = new Image();
  img.src = 'assets/honey.png';
  return img;
})();

class HoneyPot {
  constructor(x, y) {
    this.worldX  = x;
    this.screenX = 0;
    this.width   = 70; // 1x Pooh size (70)
    this.height  = 70;
    this.baseY   = y - this.height + 10;
    this.y       = this.baseY;
    this.active  = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.type    = 'honey';
  }

  update(dt) {
    this.bobTime += dt * 2.5;
    this.y = this.baseY + Math.sin(this.bobTime) * 6;
  }

  getHitbox() {
    return { x: this.screenX + 15, y: this.y + 15, width: this.width - 30, height: this.height - 30 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    // Glow
    const grd = ctx.createRadialGradient(x+w/2, y+h/2, 4, x+w/2, y+h/2, 40);
    grd.addColorStop(0, 'rgba(255,174,0,0.5)');
    grd.addColorStop(1, 'rgba(255,174,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 20, y - 20, w + 40, h + 40);

    if (HONEY_IMG.complete && HONEY_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(HONEY_IMG, x, y, w, h);
      ctx.restore();
    } else {
      // Fallback golden blob
      ctx.fillStyle = '#FFAE00';
      ctx.beginPath();
      ctx.arc(x+w/2, y+h/2, w/2.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// ── GoldenHoneycomb ──────────────────────────────────────────
class GoldenHoneycomb {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.baseY = y - 44;
    this.y = this.baseY;
    this.width = 36;
    this.height = 36;
    this.active = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.glowAnim = 0;
    this.type = 'honeycomb';
  }

  update(dt) {
    this.bobTime += dt * 2.0;
    this.glowAnim += dt * 4;
    this.y = this.baseY + Math.sin(this.bobTime) * 5;
  }

  getHitbox() {
    return { x: this.screenX + 5, y: this.y + 5, width: this.width - 10, height: this.height - 10 };
  }

  draw(ctx) {
    const cx = Math.floor(this.screenX + this.width / 2);
    const cy = Math.floor(this.y + this.height / 2);
    const r = this.width / 2;

    const glowR = r * (1.5 + Math.sin(this.glowAnim) * 0.35);
    const grd = ctx.createRadialGradient(cx, cy, 1, cx, cy, glowR + 14);
    grd.addColorStop(0, 'rgba(255,220,0,0.75)');
    grd.addColorStop(1, 'rgba(255,220,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(cx, cy, glowR + 14, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#FFAE00'; ctx.strokeStyle = '#F08000'; ctx.lineWidth = 2;
    _hexPath(ctx, 0, 0, r); ctx.fill();

    ctx.fillStyle = '#FFD700';
    const cellR = r * 0.38;
    [[0, 0], [-cellR * 1.1, -cellR * 0.65], [cellR * 1.1, -cellR * 0.65], [-cellR * 1.1, cellR * 0.65], [cellR * 1.1, cellR * 0.65]].forEach(([ox, oy]) => {
      _hexPath(ctx, ox, oy, cellR * 0.85); ctx.fill();
    });
    ctx.restore();

    // Sparkle stars
    const sa = (Math.sin(this.glowAnim * 2) + 1) / 2;
    ctx.fillStyle = `rgba(255,255,200,${sa * 0.9})`;
    [[-r, -r], [r, -r], [0, -r * 1.4], [-r * 1.4, 0], [r * 1.4, 0]].forEach(([sx, sy]) => {
      ctx.save(); ctx.translate(cx + sx, cy + sy); ctx.rotate(this.glowAnim);
      ctx.fillRect(-2, -2, 4, 1); ctx.fillRect(-1, -3, 2, 7); ctx.restore();
    });
  }
}

function _hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx + r, cy);
  for (let i = 1; i < 6; i++) ctx.lineTo(cx + r * Math.cos(i * Math.PI / 3), cy + r * Math.sin(i * Math.PI / 3));
  ctx.closePath();
}

// ── Springboard (“Jump String”) — STEP ON to auto-launch ──────────────
// Pooh just walks over it; it launches automatically. No need to jump on it!
class Springboard {
  constructor(x, canvasH) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 56;           // wide enough to be very visible
    this.height = 30;
    this.y = canvasH * 0.80 - this.height; // pad sits flush on ground
    this.active = true;
    this.type = 'springboard';
    this.bounceTimer = 0;        // >0 = compressed animation active
    this.canvasH = canvasH;
  }

  trigger() { this.bounceTimer = 0.4; }

  update(dt) { if (this.bounceTimer > 0) this.bounceTimer -= dt; }

  // Hitbox: wide horizontal strip at ground level
  getHitbox() {
    return { x: this.screenX + 2, y: this.y, width: this.width - 4, height: 16 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const P = 4;
    const compressed = this.bounceTimer > 0;
    const comp = compressed ? 6 : 0;
    const t = Date.now();

    // ── Glowing aura (pulsing red) ──
    const auraA = 0.15 + Math.sin(t / 300) * 0.08;
    const auraGrd = ctx.createRadialGradient(x + w / 2, y, 2, x + w / 2, y, w * 0.9);
    auraGrd.addColorStop(0, `rgba(255,50,50,${auraA + 0.1})`);
    auraGrd.addColorStop(1, 'rgba(255,50,50,0)');
    ctx.fillStyle = auraGrd;
    ctx.fillRect(x - 28, y - 40, w + 56, this.height + 50);

    // ── Triple bouncing arrows above (signals: step here!) ──
    if (!compressed) {
      const bob = Math.sin(t / 160) * 5;
      const arrowLabels = ['STEP', 'ON!', '↑'];
      for (let i = 0; i < 3; i++) {
        const ay = y - 20 - i * 14 + bob;
        const alpha = 0.35 + i * 0.3;
        const size = 8 + i * 2;
        // Arrow triangle
        ctx.fillStyle = `rgba(255,50,50,${alpha})`;
        ctx.strokeStyle = `rgba(150,0,0,${alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + w / 2, ay);
        ctx.lineTo(x + w / 2 - size, ay + size + 2);
        ctx.lineTo(x + w / 2 + size, ay + size + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // "STEP ON!" label above arrows
      ctx.fillStyle = 'rgba(255,60,60,0.9)';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#330000'; ctx.shadowBlur = 4;
      ctx.fillText('STEP ON!', x + w / 2, y - 58 + Math.sin(t / 160) * 3);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    // ── Base (brown pixel blocks) ──
    for (let bx = 0; bx < w + 6; bx += P) {
      ctx.fillStyle = (Math.floor(bx / P) % 2 === 0) ? '#8D5B3A' : '#7A4F30';
      ctx.fillRect(x - 3 + bx, y + 20, Math.min(P, w + 6 - bx), 10);
    }

    // ── Spring coils (bright yellow-green zigzag) ──
    const coilCols = ['#AAFF00', '#88CC00', '#CCFF44'];
    const coilH = 16 - comp;
    const nCoils = 5;
    const coilW = Math.floor((w - 8) / nCoils);
    for (let ci = 0; ci < nCoils; ci++) {
      for (let cy2 = 0; cy2 < coilH; cy2 += P) {
        ctx.fillStyle = coilCols[ci % 3];
        const zigzag = (Math.floor(cy2 / P) % 2) * 2;
        ctx.fillRect(x + 4 + ci * coilW + zigzag, y + 4 + cy2, P * 2, Math.min(P, coilH - cy2));
      }
    }

    // ── Pad top (bright red, pixel blocks) ──
    const padA = compressed ? '#AA0000' : '#FF2222';
    const padB = compressed ? '#CC0000' : '#FF5555';
    for (let px = 0; px < w; px += P) {
      ctx.fillStyle = (Math.floor(px / P) % 2 === 0) ? padA : padB;
      ctx.fillRect(x + px, y + comp, Math.min(P, w - px), P * 2);
    }

    // Pad label
    ctx.fillStyle = compressed ? '#FFFFFF' : '#330000';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(compressed ? 'BOING!' : 'SPRING', x + w / 2, y + comp + P * 2 - 1);
    ctx.textAlign = 'left';

    // Border outline
    ctx.strokeStyle = compressed ? '#AA0000' : '#BB0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + comp, w, 22 - comp);
  }
}

// ── Level Manager ────────────────────────────────────────────
class Level {
  constructor(canvasW, canvasH) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.worldX = 0;

    this.platforms = [];
    this.bees = [];
    this.collectibles = [];
    this.springboards = [];
    this.bossPhase = false;
    this.lastTier = 0;

    this.nextSpawnX = canvasW;

    // Infinite ground (collision only — drawn separately in ui.js)
    this.groundPlatform = new Platform(-100, 0, canvasH, 99999);
    this.groundPlatform.y = canvasH * 0.80; // ensure collision matches visual grass perfectly
    this.groundPlatform.worldX = -100;
    this.groundPlatform.active = true;

    this._spawnInitialPlatforms();
  }

  _spawnInitialPlatforms() {
    let x = this.canvasW + 80;
    for (let i = 0; i < 6; i++) {
      const tier = 1 + Math.floor(Math.random() * 2);
      const plat = new Platform(x, tier, this.canvasH);
      this.platforms.push(plat);
      // Put a collectible on top
      if (Math.random() < 0.75) {
        const cx = x + plat.width * 0.5;
        this.collectibles.push(new HoneyPot(cx, plat.y));
      }
      x += plat.width + 80 + Math.random() * 80;
    }
    // First springboard near start
    this.springboards.push(new Springboard(this.canvasW + 30, this.canvasH));
    this.nextSpawnX = x;
  }

  toScreen(worldX) { return worldX - this.worldX; }

  update(dt, worldSpeed, currentScore = 0) {
    this.currentLevel = 1;
    if (currentScore >= 200) this.currentLevel = 2;
    if (currentScore >= 400) this.currentLevel = 3;

    this.worldX += worldSpeed * dt;

    // Keep groundPlatform directly under the player to fix any despawn/flashing issues
    this.groundPlatform.worldX = this.worldX - 100;
    this.groundPlatform.screenX = -100;

    for (const p of this.platforms) {
      p.screenX = this.toScreen(p.worldX);
      if (p.screenX + p.width < -60) p.active = false;
    }
    this.platforms = this.platforms.filter(p => p.active);

    for (const b of this.bees) {
      b.screenX = this.toScreen(b.worldX);
      b.update(dt);
      if (b.screenX + b.width < -60) b.active = false;
    }
    this.bees = this.bees.filter(b => b.active);

    for (const c of this.collectibles) {
      c.screenX = this.toScreen(c.worldX);
      c.update(dt);
      if (c.screenX + c.width < -60) c.active = false;
    }
    this.collectibles = this.collectibles.filter(c => c.active);

    for (const s of this.springboards) {
      s.screenX = this.toScreen(s.worldX);
      s.update(dt);
      if (s.screenX + s.width < -60) s.active = false;
    }
    this.springboards = this.springboards.filter(s => s.active);

    // Spawn new chunks ahead
    const edge = this.worldX + this.canvasW + 220;
    while (this.nextSpawnX < edge) this._spawnChunk(this.nextSpawnX);
  }

  _spawnChunk(x) {
    if (this.bossPhase) return;

    const r = Math.random();

    if (r < 0.08) {
      // Springboard on ground
      this.lastTier = 0;
      this.springboards.push(new Springboard(x + 10, this.canvasH));
      this.nextSpawnX = x + 120 + Math.random() * 80;

    } else if (r < 0.60) {
      // Elevated platform
      let tier = 1; // Floor 2
      if (this.lastTier === 1 && Math.random() < 0.5) {
        tier = 2; // Floor 3 only allowed if previous was Floor 2
      } else if (this.lastTier === 2 && Math.random() < 0.4) {
        tier = 2; // Can stay on Floor 3
      }
      this.lastTier = tier;

      const plat = new Platform(x, tier, this.canvasH);
      this.platforms.push(plat);

      // Collectible on platform?
      let hasCollectible = false;
      if (Math.random() < 0.72) {
        hasCollectible = true;
        const cx = x + plat.width * (0.3 + Math.random() * 0.4);
        if (Math.random() < 0.18) {
          this.collectibles.push(new GoldenHoneycomb(cx, plat.y));
        } else {
          this.collectibles.push(new HoneyPot(cx, plat.y));
        }
      }

      // Enemy on/near platform
      if (Math.random() < 0.6) { // Increased from 0.5
        if (this.currentLevel >= 2 && Math.random() < 0.6) { // Increased from 0.35, removed !hasCollectible
          // Static Tiger sitting on platform
          let tx = x + plat.width * 0.5;
          if (hasCollectible) tx = x + plat.width * 0.8; // move to edge if honey is present
          this.bees.push(new Tiger(tx, plat.y));
        } else {
          // Patrol Bee
          const beeY = plat.y - 20 - Math.random() * 50;
          this.bees.push(new Bee(x + plat.width * 0.5, beeY, 28 + Math.random() * 30, 1.4 + Math.random()));
        }
      }

      // Fireball falling from above (Level 3+)
      if (this.currentLevel >= 3 && Math.random() < 0.25) {
        this.bees.push(new Fireball(x + Math.random() * plat.width));
      }

      this.nextSpawnX = x + plat.width + 65 + Math.random() * 100;

    } else if (r < 0.82) {
      // Ground-level honey pot
      this.lastTier = 0;
      const groundY = this.canvasH * 0.80;
      this.collectibles.push(new HoneyPot(x + 20, groundY));
      this.nextSpawnX = x + 90 + Math.random() * 60;

    } else {
      // Ground-level enemy
      this.lastTier = 0;
      const groundY = this.canvasH * 0.80;
      
      if (this.currentLevel >= 2 && Math.random() < 0.55) { // Increased from 0.3
        // Tiger on ground
        this.bees.push(new Tiger(x + 40, groundY));
      } else {
        // Bee patrol
        const beeBaseY = groundY - 53;
        this.bees.push(new Bee(x + 40, beeBaseY, 14, 1.8 + Math.random()));
      }
      
      // Fireball falling from above (Level 3+)
      if (this.currentLevel >= 3 && Math.random() < 0.15) {
        this.bees.push(new Fireball(x + 60));
      }
      
      // Early game spacing: massive gap if currentLevel is 1
      if (this.currentLevel === 1) {
        this.nextSpawnX = x + 350 + Math.random() * 200;
      } else {
        this.nextSpawnX = x + 120 + Math.random() * 80;
      }
    }
  }

  getAllPlatforms() { return [this.groundPlatform, ...this.platforms]; }

  triggerBossPhase(imgType = 'boss') {
    this.bossPhase = true;
    // Spawn the giant Boss bee on the floor
    const groundY = this.canvasH * 0.80;
    this.bees.push(new BossBee(this.nextSpawnX + 200, groundY - 315, imgType));
    
    // Spawn massive Honey Time reward right after the boss
    this.nextSpawnX += 450;
    const cols = 20;
    const rows = 3;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const hx = this.nextSpawnX + c * 70;
        // Wave pattern
        const hy = this.canvasH * 0.35 + r * 70 + Math.sin(c * 0.5) * 60;
        this.collectibles.push(new HoneyPot(hx, hy));
      }
    }
    
    this.nextSpawnX += cols * 70 + 800; // Big clear gap after honey time
    this.bossPhase = false; // Normal spawning resumes after the gap
  }

  draw(ctx) {
    for (const p of this.platforms) p.draw(ctx);
    for (const s of this.springboards) s.draw(ctx);
    for (const c of this.collectibles) c.draw(ctx);
    for (const b of this.bees) b.draw(ctx);
  }
}
