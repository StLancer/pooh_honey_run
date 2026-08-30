/**
 * player.js — Pooh player class: asset loading, input, physics, rendering
 *
 * Jump model: immediate full-power jump on press, early release cuts apex.
 */

class Player {
  constructor(canvasW, canvasH, characterId = 'pooh') {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.characterId = characterId;

    // Dimensions
    this.width   = 32;
    this.height  = 32;

    // Position — fixed at 25% horizontal, starts on floor 1
    this.x = canvasW * 0.25 - 35; // 35 is half of 70 (renderW)
    // ── Hitbox & Rendering ──
    // Base width 70px. Height will be determined by image aspect ratio.
    this.renderW = 70;
    this.renderH = 70;
    this._imgAspectSet = false;
    this.floorY = [
      canvasH * 0.80 - this.renderH,   // Floor 1 (ground)
      canvasH * 0.55 - this.renderH,   // Floor 2 (canopy)
      canvasH * 0.30 - this.renderH,   // Floor 3 (boughs)
    ];
    this.y = this.floorY[0];

    // Physics
    this.vy = 0;
    this.onGround  = true;
    this.currentPlatform = null;
    this.prevBottom = this.y + this.renderH;

    // Jump state (press-for-full, early-release-cuts-apex)
    this.jumpHeld     = false;
    this.jumpStart    = 0;
    this.jumpReleased = true;   // prevents jump repeat until re-grounded

    // Drop-down
    this.downHeld       = false;
    this.droppingThrough = false;
    this.dropTimer      = 0;

    // Health & invincibility
    this.hearts     = 3;
    this.maxHearts  = 3;
    this.invincible = false;
    this.invTimer   = 0;
    this.blinkOn    = true;
    this.blinkTimer = 0;

    // Sweet Rush
    this.sweetRush      = false;
    this.sweetRushTimer = 0;
    this.rainbowHue     = 0;
    this.trailParticles = [];
    this.honeyStreak    = 0;

    // Giant Mode
    this.giantMode      = false;
    this.giantTimer     = 0;
    this.scaleMult      = 1.0;

    // Bump-back on damage
    this.bumpVx = 0;

    // Sprite
    this.sprite = new Image();
    this.sprite.src = `assets/${this.characterId}.png`;
    this.spriteLoaded = false;
    this.sprite.onload = () => { this.spriteLoaded = true; };

    // Running animation
    this.animTimer = 0;
    this.animFrame = 0;
  }

  // ── Input handlers ────────────────────────────────────────
  startJump(now) {
    if (!this.jumpReleased) return;
    if (this.onGround || this.springLaunched) {
      this.jumpStart    = now;
      this.jumpHeld     = true;
      this.jumpReleased = false;
      this.vy           = Physics.JUMP_VY;   // -350: short hop baseline
      this.onGround     = false;
      this.currentPlatform = null;
      this.springLaunched = false; // consume the mid-air jump
      AudioEngine.playJump();
    }
  }

  endJump(now) {
    // Simply release hold — gravity multiplier returns to 1.0 immediately
    this.jumpHeld = false;
  }

  startDown() {
    this.downHeld = true;
    if (!this.onGround) return;
    if (this.currentPlatform && this.currentPlatform.tier > 0) {
      this.droppingThrough = true;
      this.dropTimer = 0.3;
      this.onGround  = false;
      this.vy = 80;
      this.currentPlatform = null;
    }
  }

  endDown() { this.downHeld = false; }

  // ── Damage / power-ups ────────────────────────────────────
  takeDamage() {
    if (this.invincible || this.sweetRush || this.giantMode) return false;
    this.hearts--;
    this.invincible = true;
    this.invTimer   = 1.5;
    this.blinkTimer = 0;
    this.bumpVx     = -180;
    AudioEngine.playDamage();
    return true;
  }

  restoreHeart() {
    if (this.hearts < this.maxHearts) this.hearts++;
  }

  activateSweetRush() {
    this.sweetRush      = true;
    this.sweetRushTimer = 5.0;
    this.honeyStreak    = 0;
    this.invincible     = true;
    AudioEngine.playSweetRush();
  }

  activateGiantMode(duration) {
    this.giantMode  = true;
    this.giantTimer = duration;
    this.scaleMult  = 3.86; // 60% of screen height
    this._imgAspectSet = false; // force recalculation of bounds
  }

  /** Launched by a springboard */
  springBoost() {
    this.vy = Physics.SPRING_VY;
    this.onGround = false;
    this.currentPlatform = null;
    this.jumpReleased = true;
    this.jumpHeld = false;
    this.springLaunched = true;
  }

  // ── Update ────────────────────────────────────────────────
  update(dt, platforms, worldSpeed) {
    if (this.giantMode) {
      this.giantTimer -= dt;
      if (this.giantTimer <= 0) {
        this.giantMode = false;
        this.scaleMult = 1.0;
        this._imgAspectSet = false;
      }
    }

    // Dynamic image aspect ratio and floor recalculation to fix stretching/floating
    if (this.sprite.complete && this.sprite.naturalWidth > 0 && !this._imgAspectSet) {
      const aspect = this.sprite.naturalHeight / this.sprite.naturalWidth;
      this.renderW = 70 * this.scaleMult;
      this.renderH = Math.floor(70 * aspect * this.scaleMult);
      this.floorY = [
        this.canvasH * 0.80 - this.renderH,
        this.canvasH * 0.55 - this.renderH,
        this.canvasH * 0.30 - this.renderH
      ];
      this._imgAspectSet = true;
      // Snap to ground if currently idling on the first floor
      if (this.onGround && !this.currentPlatform) {
        this.y = this.floorY[0];
      }
    }

    // Gravity — reduced while hold button pressed (lets Pooh float higher)
    if (!this.onGround) {
      const now2 = performance.now();
      let gravMult = 1.0;
      if (this.jumpHeld && this.vy < 0) {
        const held = now2 - this.jumpStart;
        if (held < Physics.HOLD_MAX_MS) {
          gravMult = Physics.HOLD_GRAVITY_MULT; // 0.25 — reduces gravity to 25%
        }
      }
      this.vy = Physics.applyGravity(this.vy, dt, gravMult);
    }

    // Drop timer
    if (this.droppingThrough) {
      this.dropTimer -= dt;
      if (this.dropTimer <= 0) this.droppingThrough = false;
    }

    // Vertical movement
    this.prevBottom = this.y + this.renderH;
    this.y += this.vy * dt;

    // Bump-back on damage & recovery
    const targetX = this.canvasW * 0.25 - this.renderW / 2;
    if (this.bumpVx !== 0) {
      this.x += this.bumpVx * dt;
      this.bumpVx *= (1 - dt * 8);
      if (Math.abs(this.bumpVx) < 1) this.bumpVx = 0;
      const minX = this.canvasW * 0.05;
      this.x = Math.max(minX, this.x);
    } else if (this.x < targetX) {
      // Slowly drift back to original position
      this.x += 35 * dt;
      if (this.x > targetX) this.x = targetX;
    }

    // Platform collision
    this.onGround = false;
    this.currentPlatform = null;

    for (const plat of platforms) {
      if (this.droppingThrough) continue;
      // Mega Size characters don't stand on elevated platforms, they burst them!
      if (this.giantMode && plat.tier > 0) continue;
      if (Physics.platformCollision(
        { x: this.x, y: this.y, width: this.renderW, height: this.renderH, vy: this.vy },
        { x: plat.screenX, y: plat.y, width: plat.width, height: plat.height },
        this.prevBottom
      )) {
        this.y = plat.y - this.renderH;
        this.vy = 0;
        this.onGround = true;
        this.jumpReleased = true;
        this.currentPlatform = plat;
        break;
      }
    }

    // Ground floor safety net
    const groundY = this.floorY[0];
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
      this.jumpReleased = true;
      this.springLaunched = false;
      this.bumpVx = 0;
    }

    // Invincibility blink
    if (this.invincible && !this.sweetRush && !this.giantMode) {
      this.invTimer   -= dt;
      this.blinkTimer += dt;
      if (this.blinkTimer >= 0.1) { this.blinkOn = !this.blinkOn; this.blinkTimer = 0; }
      if (this.invTimer <= 0)     { this.invincible = false; this.blinkOn = true; }
    }

    // Sweet Rush timer & particles
    if (this.sweetRush) {
      this.sweetRushTimer -= dt;
      if (this.sweetRushTimer <= 0) {
        this.sweetRush  = false;
        this.invincible = false;
        this.blinkOn    = true;
      }
      // Golden Pixel Trail
      if (this.sweetRush && Math.random() < 0.6) {
        this.trailParticles.push({
          x: this.x + Math.random() * this.renderW,
          y: this.y + this.renderH * 0.5 + Math.random() * (this.renderH * 0.5), // Mostly lower half
          life: 1.5,
          maxLife: 1.5,
          size: 6 + Math.random() * 8,
          color: '#FFD700' // Gold
        });
      }
    }

    // Trail particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x -= worldSpeed * dt;
      p.life -= dt;
      if (p.life <= 0) this.trailParticles.splice(i, 1);
    }

    // Running animation
    this.animTimer += dt;
    if (this.animTimer > 0.12) { this.animFrame = (this.animFrame + 1) % 4; this.animTimer = 0; }
  }

  getHitbox() {
    const inset = 10;
    return { x: this.x + inset, y: this.y + inset, width: this.renderW - inset*2, height: this.renderH - inset*2 };
  }

  draw(ctx) {
    ctx.save();

    // Trail particles
    for (const p of this.trailParticles) {
      ctx.globalAlpha = (p.life / p.maxLife) * 0.8;
      ctx.fillStyle = p.color || '#FFD700';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Blinking effect
    if (this.invincible && !this.sweetRush && !this.giantMode && !this.blinkOn) {
      ctx.globalAlpha = 0.3;
    }

    const px = Math.floor(this.x);
    const py = Math.floor(this.y);
    const pw = this.renderW;
    const ph = this.renderH;

    // Sweet Rush aura
    if (this.sweetRush) {
      ctx.shadowColor = '#FFD700'; // Bright gold
      ctx.shadowBlur = 30;
    }

    if (this.spriteLoaded) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.sprite, px, py, pw, ph);
    } else {
      drawPoohFallback(ctx, px, py, pw, ph, this.animFrame);
    }

    // Sweet Rush golden overlay
    if (this.sweetRush) {
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = `hsl(45, 100%, 55%)`; // solid gold
      ctx.fillRect(px, py, pw, ph);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// Canvas-drawn Pooh fallback (pixel art style)
function drawPoohFallback(ctx, x, y, w, h, frame) {
  const s = w / 32;
  ctx.fillStyle = '#FAB82C';
  ctx.fillRect(x + 6*s, y + 12*s, 20*s, 18*s);
  ctx.beginPath(); ctx.arc(x + 16*s, y + 10*s, 10*s, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FAB82C';
  ctx.beginPath(); ctx.arc(x + 6*s,  y + 4*s, 4*s, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 26*s, y + 4*s, 4*s, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#C82228';
  ctx.fillRect(x + 7*s, y + 16*s, 18*s, 10*s);
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 11*s, y + 8*s, 3*s, 3*s);
  ctx.fillRect(x + 18*s, y + 8*s, 3*s, 3*s);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x + 14*s, y + 12*s, 4*s, 2*s);
  ctx.strokeStyle = '#000'; ctx.lineWidth = s;
  ctx.beginPath(); ctx.arc(x + 16*s, y + 14*s, 3*s, 0.1, Math.PI - 0.1); ctx.stroke();
  ctx.fillStyle = '#FAB82C';
  const legOff = Math.sin(frame * Math.PI / 2) * 4 * s;
  ctx.fillRect(x + 9*s,  y + 28*s + legOff, 5*s, 4*s);
  ctx.fillRect(x + 18*s, y + 28*s - legOff, 5*s, 4*s);
}
