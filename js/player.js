/**
 * player.js — Pooh player class: asset loading, input, physics, rendering
 *
 * Fixed map platformer player:
 * - Starts with 1 Heart (max 3, collectable)
 * - 3-second invincibility after damage
 * - Mushroom power-up held in inventory, released by pressing 'R'
 * - Two-way horizontal movement with full world boundaries
 */

class Player {
  constructor(canvasW, canvasH, characterId = 'pooh') {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.characterId = characterId;

    // Base render size (55px for 1100x620 canvas)
    this.renderW = 55;
    this.renderH = 55;
    this._imgAspectSet = false;
    this.scaleMult = 1.0;

    // Starting position: standing next to the start flag on Floor 1
    this.x = 140;
    this.floorY = [
      canvasH * 0.80 - this.renderH,
      canvasH * 0.55 - this.renderH,
      canvasH * 0.30 - this.renderH,
    ];
    this.y = this.floorY[0];
    this.screenX = this.x;

    // Velocity
    this.vx = 0;
    this.vy = 0;
    this.facingLeft = false;

    // Ground state
    this.onGround = true;
    this.currentPlatform = null;
    this.prevBottom = this.y + this.renderH;
    this.prevTop = this.y;

    // Jump state
    this.jumpHeld = false;
    this.jumpStart = 0;
    this.jumpReleased = true;
    this.springLaunched = false;

    // Drop-down
    this.downHeld = false;
    this.droppingThrough = false;
    this.dropTimer = 0;

    // Horizontal input flags
    this.movingLeft = false;
    this.movingRight = false;

    // Health & Revive (starts at 1, max 3)
    this.hearts = 1;
    this.maxHearts = 3;
    this.invincible = false;
    this.invTimer = 0;
    this.blinkOn = true;
    this.blinkTimer = 0;

    // Mushroom Inventory (Press R to activate Mega Mode)
    this.hasMushroom = false;

    // Quest Items (Level 3 Key & Easter Egg)
    this.hasKey = false;
    this.hasEasterEgg = false;

    // Sweet Rush
    this.sweetRush = false;
    this.sweetRushTimer = 0;
    this.trailParticles = [];
    this.honeyStreak = 0;

    // Giant / Mega Mode
    this.giantMode = false;
    this.giantTimer = 0;

    // Sprite
    const CHAR_FILES = {
      pooh: 'pooh.png',
      goku: 'Goku.png',
      powerpuff: 'Powerpuff Girls.png',
      capybara: 'capybara.png',
      batman: 'batman.png'
    };
    this.sprite = new Image();
    this.sprite.src = `assets/${CHAR_FILES[this.characterId] || this.characterId + '.png'}`;
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };

    // Running animation
    this.animTimer = 0;
    this.animFrame = 0;
  }

  // ── Input handlers ─────────────────────────────────────────

  startLeft() { this.movingLeft = true; this.facingLeft = true; }
  endLeft() { this.movingLeft = false; }
  startRight() { this.movingRight = true; this.facingLeft = false; }
  endRight() { this.movingRight = false; }

  startJump(now) {
    if (!this.jumpReleased) return;
    if (this.onGround || this.springLaunched) {
      this.jumpStart = now;
      this.jumpHeld = true;
      this.jumpReleased = false;
      this.vy = Physics.JUMP_VY;
      this.onGround = false;
      this.currentPlatform = null;
      this.springLaunched = false;
      AudioEngine.playJump();
    }
  }

  endJump(now) {
    this.jumpHeld = false;
  }

  startDown() {
    this.downHeld = true;
    if (!this.onGround) return;
    if (this.currentPlatform && this.currentPlatform.tier > 0) {
      this.droppingThrough = true;
      this.dropTimer = 0.3;
      this.onGround = false;
      this.vy = 80;
      this.currentPlatform = null;
    }
  }

  endDown() { this.downHeld = false; }

  // ── Power-Ups & Items ─────────────────────────────────────

  collectMushroom() {
    this.hasMushroom = true;
    AudioEngine.playMushroom();
  }

  useMushroom() {
    if (this.hasMushroom && !this.giantMode) {
      this.hasMushroom = false;
      this.activateGiantMode(12.0);
      AudioEngine.playSweetRush();
      return true;
    }
    return false;
  }

  addHeart() {
    if (this.hearts < this.maxHearts) {
      this.hearts++;
      AudioEngine.playHoneycomb();
      return true;
    }
    return false;
  }

  takeDamage() {
    if (this.invincible || this.sweetRush || this.giantMode) return false;
    this.hearts--;
    if (this.hearts <= 0) {
      return true; // Fatal damage
    }
    // Revive / Hurt: 3 seconds invincibility with intense knockback
    this.invincible = true;
    this.invTimer = 3.0;
    this.blinkTimer = 0;
    this.vx = this.facingLeft ? 380 : -380;
    this.vy = -260; // upward bounce arc
    this.onGround = false;
    AudioEngine.playDamage();
    return false;
  }

  enemyBounce() {
    // Passive upward bounce from stepping on an enemy (higher bounce, no mid-air re-jump)
    this.vy = -480;
    this.onGround = false;
    this.currentPlatform = null;
    this.jumpHeld = false;
    this.jumpReleased = false; // prevents mid-air double jump
    this.springLaunched = false;
    AudioEngine.playStomp();
  }

  activateSweetRush() {
    this.sweetRush = true;
    this.sweetRushTimer = 7.0;
    this.honeyStreak = 0;
    this.invincible = true;
    AudioEngine.playSweetRush();
  }

  activateGiantMode(duration = 12.0) {
    this.giantMode = true;
    this.giantTimer = duration;
    this.scaleMult = 3.86; // 60% of viewport height (372px)
    this._imgAspectSet = false;
  }

  springBoost() {
    this.vy = Physics.SPRING_VY;
    this.onGround = false;
    this.currentPlatform = null;
    this.jumpReleased = true;
    this.jumpHeld = false;
    this.springLaunched = true;
  }

  // ── Update ────────────────────────────────────────────────
  update(dt, platforms, cameraX, mapWidth = 7000) {
    // Giant mode timer
    if (this.giantMode) {
      this.giantTimer -= dt;
      if (this.giantTimer <= 0) {
        this.giantMode = false;
        this.scaleMult = 1.0;
        this._imgAspectSet = false;
      }
    }

    // Dynamic image aspect ratio
    if (this.sprite.complete && this.sprite.naturalWidth > 0 && !this._imgAspectSet) {
      const aspect = this.sprite.naturalHeight / this.sprite.naturalWidth;
      this.renderW = 55 * this.scaleMult;
      this.renderH = Math.floor(55 * aspect * this.scaleMult);
      this.floorY = [
        this.canvasH * 0.80 - this.renderH,
        this.canvasH * 0.55 - this.renderH,
        this.canvasH * 0.30 - this.renderH,
      ];
      this._imgAspectSet = true;
      if (this.onGround && !this.currentPlatform) {
        this.y = this.floorY[0];
      }
    }

    // ── Horizontal movement (1.5x speed during Sweet Rush) ──
    const speedMult = this.sweetRush ? 1.5 : 1.0;
    const accel = Physics.ACCELERATION * speedMult;
    const maxSpd = Physics.MOVE_SPEED * speedMult;

    if (this.movingLeft && !this.movingRight) {
      this.vx -= accel * dt;
    } else if (this.movingRight && !this.movingLeft) {
      this.vx += accel * dt;
    } else {
      // Friction
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - Physics.FRICTION * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + Physics.FRICTION * dt);
      }
    }

    // Clamp horizontal speed
    this.vx = Math.max(-maxSpd, Math.min(maxSpd, this.vx));

    // Apply horizontal position
    this.x += this.vx * dt;

    // Full map boundaries (can explore both left and right across the fixed map)
    if (this.x < 0) {
      this.x = 0;
      if (this.vx < 0) this.vx = 0;
    }
    if (this.x > mapWidth - this.renderW) {
      this.x = mapWidth - this.renderW;
      if (this.vx > 0) this.vx = 0;
    }

    this.screenX = this.x - cameraX;

    // ── Gravity ──
    if (!this.onGround) {
      const now2 = performance.now();
      let gravMult = 1.0;
      if (this.jumpHeld && this.vy < 0) {
        const held = now2 - this.jumpStart;
        if (held < Physics.HOLD_MAX_MS) gravMult = Physics.HOLD_GRAVITY_MULT;
      }
      this.vy = Physics.applyGravity(this.vy, dt, gravMult);
    }

    // Drop timer
    if (this.droppingThrough) {
      this.dropTimer -= dt;
      if (this.dropTimer <= 0) this.droppingThrough = false;
    }

    // ── Vertical movement ──
    this.prevBottom = this.y + this.renderH;
    this.prevTop = this.y;
    this.y += this.vy * dt;

    // ── Ceiling collision (solid from below, skipped in Mega Mode) ──
    for (const plat of platforms) {
      if (plat.y >= this.canvasH * 0.80 - 2) continue;
      if (this.droppingThrough) continue;
      if (this.giantMode) continue;
      const platBottom = plat.y + plat.height;
      const eLeft = this.x + 6;
      const eRight = this.x + this.renderW - 6;
      const horizOverlap = eRight > plat.worldX && eLeft < plat.worldX + plat.width;
      if (horizOverlap && this.vy < 0) {
        if (this.y <= platBottom && this.prevTop >= platBottom) {
          this.y = platBottom + 1;
          this.vy = -this.vy; // bounce down
          this.jumpHeld = false;
          AudioEngine.playDamage();
          break;
        }
      }
    }

    // ── Platform collision (landing on elevated platforms) ──
    this.onGround = false;
    this.currentPlatform = null;

    for (const plat of platforms) {
      if (plat.y >= this.canvasH * 0.80 - 2) continue; // skip flat bottom ground (handled below)
      if (this.droppingThrough) continue;
      if (this.giantMode) continue;
      if (Physics.platformCollision(
        { x: this.x, y: this.y, width: this.renderW, height: this.renderH, vy: this.vy },
        { x: plat.worldX, y: plat.y, width: plat.width, height: plat.height },
        this.prevBottom
      )) {
        this.y = plat.y - this.renderH;
        this.vy = 0;
        this.onGround = true;
        this.jumpReleased = true;
        this.springLaunched = false;
        this.currentPlatform = plat;
        break;
      }
    }

    // ── Solid Ground Floor Everywhere ──
    const groundY = this.floorY[0];
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
      this.jumpReleased = true;
      this.springLaunched = false;
    }

    // ── Invincibility blink (3.0s duration after hit) ──
    if (this.invincible && !this.sweetRush && !this.giantMode) {
      this.invTimer -= dt;
      this.blinkTimer += dt;
      if (this.blinkTimer >= 0.1) { this.blinkOn = !this.blinkOn; this.blinkTimer = 0; }
      if (this.invTimer <= 0) { this.invincible = false; this.blinkOn = true; }
    }

    // ── Sweet Rush timer & particles ──
    if (this.sweetRush) {
      this.sweetRushTimer -= dt;
      if (this.sweetRushTimer <= 0) {
        this.sweetRush = false;
        this.invincible = false;
        this.blinkOn = true;
      }
      if (Math.random() < 0.6) {
        this.trailParticles.push({
          x: this.x + Math.random() * this.renderW,
          y: this.y + this.renderH * 0.5 + Math.random() * (this.renderH * 0.5),
          life: 1.5,
          maxLife: 1.5,
          size: 6 + Math.random() * 8,
          color: '#FFD700'
        });
      }
    }

    // Trail particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.life -= dt;
      if (p.life <= 0) this.trailParticles.splice(i, 1);
    }

    // Running animation
    if (this.vx !== 0 || !this.onGround) {
      this.animTimer += dt;
      if (this.animTimer > 0.12) { this.animFrame = (this.animFrame + 1) % 4; this.animTimer = 0; }
    }
  }

  getHitbox() {
    const inset = 8;
    return { x: this.screenX + inset, y: this.y + inset, width: this.renderW - inset * 2, height: this.renderH - inset * 2 };
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    ctx.save();

    // Trail particles
    for (const p of this.trailParticles) {
      ctx.globalAlpha = (p.life / p.maxLife) * 0.8;
      ctx.fillStyle = p.color || '#FFD700';
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Blinking effect
    if (this.invincible && !this.sweetRush && !this.giantMode && !this.blinkOn) {
      ctx.globalAlpha = 0.25;
    }

    const px = Math.floor(screenX);
    const py = Math.floor(this.y);
    const pw = this.renderW;
    const ph = this.renderH;

    // Sweet Rush aura
    if (this.sweetRush) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
    }

    if (this.spriteLoaded) {
      ctx.imageSmoothingEnabled = false;
      if (this.facingLeft) {
        ctx.translate(px + pw, py);
        ctx.scale(-1, 1);
        ctx.drawImage(this.sprite, 0, 0, pw, ph);
      } else {
        ctx.drawImage(this.sprite, px, py, pw, ph);
      }
    } else {
      drawPoohFallback(ctx, px, py, pw, ph, this.animFrame);
    }

    // Red flashing tint when taking damage
    if (this.invincible && !this.sweetRush && !this.giantMode && this.blinkOn) {
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#FF0000';
      if (this.facingLeft) {
        ctx.fillRect(0, 0, pw, ph);
      } else {
        ctx.fillRect(px, py, pw, ph);
      }
      ctx.globalAlpha = 1;
    }

    // Sweet Rush golden overlay
    if (this.sweetRush) {
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = `hsl(45, 100%, 55%)`;
      if (this.facingLeft) {
        ctx.fillRect(0, 0, pw, ph);
      } else {
        ctx.fillRect(px, py, pw, ph);
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// Canvas-drawn Pooh fallback
function drawPoohFallback(ctx, x, y, w, h, frame) {
  const s = w / 32;
  ctx.fillStyle = '#FAB82C';
  ctx.fillRect(x + 6 * s, y + 12 * s, 20 * s, 18 * s);
  ctx.beginPath(); ctx.arc(x + 16 * s, y + 10 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FAB82C';
  ctx.beginPath(); ctx.arc(x + 6 * s, y + 4 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 26 * s, y + 4 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C82228';
  ctx.fillRect(x + 7 * s, y + 16 * s, 18 * s, 10 * s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 11 * s, y + 8 * s, 3 * s, 3 * s);
  ctx.fillRect(x + 18 * s, y + 8 * s, 3 * s, 3 * s);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x + 14 * s, y + 12 * s, 4 * s, 2 * s);
  ctx.strokeStyle = '#000'; ctx.lineWidth = s;
  ctx.beginPath(); ctx.arc(x + 16 * s, y + 14 * s, 3 * s, 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.fillStyle = '#FAB82C';
  const legOff = Math.sin(frame * Math.PI / 2) * 4 * s;
  ctx.fillRect(x + 9 * s, y + 28 * s + legOff, 5 * s, 4 * s);
  ctx.fillRect(x + 18 * s, y + 28 * s - legOff, 5 * s, 4 * s);
}
