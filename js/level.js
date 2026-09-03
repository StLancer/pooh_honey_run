/**
 * level.js — Handcrafted Level 1 Map: Platforms, Water Hazard River, Boss 1, Scenery & Pooh's Home
 *
 * Updates:
 * - Floor 1 Water River Gap (x: 4200 to 4850): Not walkable on ground; player must jump to Floor 2 canopy
 * - Jumping down from Floor 2 enters empty arena field leading to Boss 1
 * - Start Area: Clean walking opening before first items
 * - Spaced-out single honey pots
 * - DecorativeTree (2x Pooh: 110x150)
 * - PoohHome (4x Pooh: 220x220)
 * - Static Boss 1 (x: 5500) with Purple Aura & 3 HP
 * - GiantHoneyPot (180x180) reward
 */

// ── Asset Images (loaded once) ──────────────────────────────────
const START_FLAG_IMG = (() => { const img = new Image(); img.src = 'assets/startFlag.png'; return img; })();
const POOH_HOME_IMG = (() => { const img = new Image(); img.src = 'assets/PoohHome.png'; return img; })();
const TREE_IMG = (() => { const img = new Image(); img.src = 'assets/Tree.png'; return img; })();
const HEART_IMG = (() => { const img = new Image(); img.src = 'assets/heart.png'; return img; })();
const MUSHROOM_IMG = (() => { const img = new Image(); img.src = 'assets/mushroom.png'; return img; })();
const HONEY_IMG = (() => { const img = new Image(); img.src = 'assets/honey.png'; return img; })();
const BEE_IMG = (() => { const img = new Image(); img.src = 'assets/bee.png'; return img; })();
const BOSS1_IMG = (() => { const img = new Image(); img.src = 'assets/boss1.png'; return img; })();
const TIGER_IMG = (() => { const img = new Image(); img.src = 'assets/tiger.png'; return img; })();
const FIREBALL_IMG = (() => { const img = new Image(); img.src = 'assets/fireball.png'; return img; })();
const HOLLOW_TREE_IMG = (() => { const img = new Image(); img.src = 'assets/HollowTree.png'; return img; })();
const KEY_IMG = (() => { const img = new Image(); img.src = 'assets/key.png'; return img; })();
const EASTER_EGG_IMG = (() => { const img = new Image(); img.src = 'assets/EasterEgg.png'; return img; })();
const JOKER_IMG = (() => { const img = new Image(); img.src = 'assets/joker.png'; return img; })();
const RED_BALLOON_IMG = (() => { const img = new Image(); img.src = 'assets/RedBalloon.png'; return img; })();
const WIZARD_IMG = (() => { const img = new Image(); img.src = 'assets/Wizard.png'; return img; })();
const SEAMONSTER_IMG = (() => { const img = new Image(); img.src = 'assets/SeaMonster.png'; return img; })();
const DUNGEON_DOOR_IMG = (() => { const img = new Image(); img.src = 'assets/DungeonDoor.png'; return img; })();

// ── Platform ──────────────────────────────────────────────────
class Platform {
  constructor(x, tier, canvasH, width = 200, customY = null) {
    this.tier = tier;
    this.width = width;
    this.height = 18;
    this.worldX = x;

    const tierYPct = [0.80, 0.55, 0.30];
    this.y = customY !== null ? customY : (canvasH * tierYPct[tier] - this.height);

    this.screenX = 0;
    this.active = true;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = Math.floor(this.width);
    const h = this.height;
    const P = 4;

    // Bark body
    const barkColors = ['#8D5B3A', '#7A4F30', '#6B4228'];
    for (let bx = 0; bx < w; bx += P) {
      const colIdx = Math.floor((bx / P) % 3);
      ctx.fillStyle = barkColors[colIdx];
      ctx.fillRect(x + bx, y + P, Math.min(P, w - bx), h - P);
    }

    // Grass top
    const grassCol = this.tier === 0 ? '#5BB948' : '#4A7C35';
    const grassDark = this.tier === 0 ? '#3E9034' : '#356029';
    for (let gx = 0; gx < w; gx += P) {
      ctx.fillStyle = (Math.floor(gx / P) % 2 === 0) ? grassCol : grassDark;
      ctx.fillRect(x + gx, y, Math.min(P, w - gx), P);
    }

    // Shadow bottom
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + h - 2, w, 2);
  }
}

// ── Decorative Scenery (Trees: 2x of Pooh) ───────────────────
class DecorativeTree {
  constructor(x, groundY, width = 110, height = 150) {
    this.worldX = x;
    this.screenX = 0;
    this.width = width;
    this.height = height;
    this.y = groundY - this.height;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    if (TREE_IMG.complete && TREE_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(TREE_IMG, x, y, this.width, this.height);
      ctx.restore();
    }
  }
}

// ── Collectible Items ─────────────────────────────────────────

class HoneyPot {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 60;
    this.height = 60;
    this.baseY = y - this.height + 8;
    this.y = this.baseY;
    this.active = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.type = 'honey';
  }

  update(dt) {
    this.bobTime += dt * 2.5;
    this.y = this.baseY + Math.sin(this.bobTime) * 5;
  }

  getHitbox() {
    return { x: this.screenX + 10, y: this.y + 10, width: this.width - 20, height: this.height - 20 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    const grd = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, 35);
    grd.addColorStop(0, 'rgba(255,174,0,0.45)');
    grd.addColorStop(1, 'rgba(255,174,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 15, y - 15, w + 30, h + 30);

    if (HONEY_IMG.complete && HONEY_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(HONEY_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFAE00';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class GiantHoneyPot {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 180;
    this.height = 180;
    this.baseY = y - this.height + 10;
    this.y = this.baseY;
    this.active = true;
    this.bobTime = 0;
    this.type = 'giant_honey';
  }

  update(dt) {
    this.bobTime += dt * 2.5;
    this.y = this.baseY + Math.sin(this.bobTime) * 8;
  }

  getHitbox() {
    return { x: this.screenX + 20, y: this.y + 20, width: this.width - 40, height: this.height - 40 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
    const grd = ctx.createRadialGradient(x + w / 2, y + h / 2, 20, x + w / 2, y + h / 2, 130 + pulse * 25);
    grd.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    grd.addColorStop(0.5, 'rgba(255, 174, 0, 0.4)');
    grd.addColorStop(1, 'rgba(255, 174, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 60, y - 60, w + 120, h + 120);

    if (HONEY_IMG.complete && HONEY_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(HONEY_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFAE00';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
    ctx.fillText('GIANT HONEY REWARD! (+100)', x + w / 2, y - 16);
    ctx.restore();
  }
}

class HeartItem {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 48;
    this.height = 48;
    this.baseY = y - this.height;
    this.y = this.baseY;
    this.active = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.type = 'heart';
  }

  update(dt) {
    this.bobTime += dt * 3.0;
    this.y = this.baseY + Math.sin(this.bobTime) * 6;
  }

  getHitbox() {
    return { x: this.screenX + 6, y: this.y + 6, width: this.width - 12, height: this.height - 12 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    const grd = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, 36);
    grd.addColorStop(0, 'rgba(255,50,90,0.6)');
    grd.addColorStop(1, 'rgba(255,50,90,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 15, y - 15, w + 30, h + 30);

    if (HEART_IMG.complete && HEART_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(HEART_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#E8203A';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class MushroomItem {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 52;
    this.height = 52;
    this.baseY = y - this.height;
    this.y = this.baseY;
    this.active = true;
    this.bobTime = Math.random() * Math.PI * 2;
    this.glowAnim = 0;
    this.type = 'mushroom';
  }

  update(dt) {
    this.bobTime += dt * 2.8;
    this.glowAnim += dt * 4.0;
    this.y = this.baseY + Math.sin(this.bobTime) * 6;
  }

  getHitbox() {
    return { x: this.screenX + 6, y: this.y + 6, width: this.width - 12, height: this.height - 12 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    const pulse = (Math.sin(this.glowAnim) + 1) / 2;
    const grd = ctx.createRadialGradient(x + w / 2, y + h / 2, 4, x + w / 2, y + h / 2, 40 + pulse * 10);
    grd.addColorStop(0, 'rgba(255,215,0,0.7)');
    grd.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 20, y - 20, w + 40, h + 40);

    if (MUSHROOM_IMG.complete && MUSHROOM_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(MUSHROOM_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#FFF588';
    const sx = x + w / 2 + Math.sin(this.glowAnim * 1.5) * 15;
    const sy = y - 8 + Math.cos(this.glowAnim * 1.5) * 4;
    ctx.fillRect(sx - 3, sy - 1, 6, 2);
    ctx.fillRect(sx - 1, sy - 3, 2, 6);
  }
}

// ── Landmarks (Start Flag & Pooh's Home Goal) ────────────────

class StartFlag {
  constructor(x, groundY) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 40;
    this.height = 55;
    this.y = groundY - this.height;
    this.active = true;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    if (START_FLAG_IMG.complete && START_FLAG_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(START_FLAG_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(x + 6, y, 5, this.height);
      ctx.fillStyle = '#FF9800';
      ctx.fillRect(x + 11, y, 26, 18);
    }
  }
}

class PoohHome {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 220; // 4x size of character
    this.height = 220;
    this.y = y - this.height;
    this.active = true;
  }

  getHitbox() {
    return { x: this.screenX + 30, y: this.y + 30, width: this.width - 60, height: this.height - 40 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);

    const grd = ctx.createRadialGradient(x + this.width / 2, y + this.height / 2, 20, x + this.width / 2, y + this.height / 2, 180);
    grd.addColorStop(0, 'rgba(255,230,150,0.5)');
    grd.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 50, y - 50, this.width + 100, this.height + 100);

    if (POOH_HOME_IMG.complete && POOH_HOME_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(POOH_HOME_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#8D5B3A';
      ctx.fillRect(x + 20, y + 60, this.width - 40, this.height - 60);
      ctx.fillStyle = '#C82228';
      ctx.beginPath();
      ctx.moveTo(x + this.width / 2, y);
      ctx.lineTo(x + 10, y + 60);
      ctx.lineTo(x + this.width - 10, y + 60);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ── Enemies ───────────────────────────────────────────────────

class Bee {
  constructor(x, baseY, patrolAmp = 40, patrolSpeed = 2.0) {
    this.worldX = x;
    this.screenX = 0;
    this.baseY = baseY;
    this.y = baseY;
    this.width = 53;
    this.height = 53;
    this.patrolAmp = patrolAmp;
    this.patrolSpeed = patrolSpeed;
    this.patrolTime = Math.random() * Math.PI * 2;
    this.active = true;
    this.wingAnim = 0;
    this.facingLeft = true;
    this.type = 'bee';
  }

  update(dt) {
    this.patrolTime += dt * this.patrolSpeed;
    this.y = this.baseY + Math.sin(this.patrolTime) * this.patrolAmp;
    this.wingAnim = (this.wingAnim + dt * 20) % (Math.PI * 2);
  }

  getHitbox() {
    return { x: this.screenX + 8, y: this.y + 8, width: this.width - 16, height: this.height - 16 };
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
      ctx.fillStyle = '#F5C400';
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w / 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }
}

class Tiger {
  constructor(x, y, platWorldX = null, platWidth = null) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 66; // 1.2x of character
    this.height = 66;
    this.y = y - this.height;
    this.active = true;
    this.type = 'tiger';
    this.vx = -50;
    this.facingLeft = true;
    this.platLeft = platWorldX !== null ? platWorldX : null;
    this.platRight = (platWorldX !== null && platWidth !== null) ? platWorldX + platWidth : null;
  }

  update(dt) {
    this.worldX += this.vx * dt;
    if (this.platLeft !== null && this.platRight !== null) {
      if (this.worldX <= this.platLeft) {
        this.worldX = this.platLeft;
        this.vx = 50;
        this.facingLeft = false;
      } else if (this.worldX + this.width >= this.platRight) {
        this.worldX = this.platRight - this.width;
        this.vx = -50;
        this.facingLeft = true;
      }
    }
  }

  getHitbox() {
    return { x: this.screenX + 8, y: this.y + 8, width: this.width - 16, height: this.height - 16 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    if (TIGER_IMG.complete && TIGER_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (!this.facingLeft) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(TIGER_IMG, 0, 0, w, h);
      } else {
        ctx.drawImage(TIGER_IMG, x, y, w, h);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(x, y, w, h);
    }
  }
}

class Fireball {
  constructor(x, vy = 60) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 100;
    this.height = 100;
    this.baseX = x;
    this.y = -100;
    this.vy = vy;
    this.active = true;
    this.type = 'fireball';
  }

  update(dt) {
    this.y += this.vy * dt;
    if (this.y > 650) {
      this.y = -100;
    }
  }

  getHitbox() {
    return { x: this.screenX + 16, y: this.y + 16, width: this.width - 32, height: this.height - 32 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    if (FIREBALL_IMG.complete && FIREBALL_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(FIREBALL_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#D84315';
      ctx.beginPath();
      ctx.arc(x + this.width / 2, y + this.height / 2, this.width / 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class BossBee {
  constructor(x, groundY) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 372;
    this.height = 372;
    this.y = groundY - this.height;
    this.baseY = this.y;
    this.active = true;
    this.bobTime = 0;
    this.type = 'boss';
    this.hp = 3;
    this.maxHp = 3;
    this.hitTimer = 0;
    this.alertTriggered = false;
  }

  update(dt) {
    this.bobTime += dt * 2.5;
    this.y = this.baseY + Math.sin(this.bobTime) * 4;
    if (this.hitTimer > 0) this.hitTimer -= dt;
  }

  getHitbox() {
    return { x: this.screenX + 30, y: this.y + 30, width: this.width - 60, height: this.height - 60 };
  }

  takeHit() {
    this.hp--;
    this.hitTimer = 0.35;
    if (this.hp <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;
    const cx = x + w / 2;
    const cy = y + h / 2;

    const pulse = (Math.sin(performance.now() / 200) + 1) / 2;
    const grd = ctx.createRadialGradient(cx, cy, 40, cx, cy, w * 0.55 + pulse * 25);
    grd.addColorStop(0, 'rgba(170, 0, 255, 0.65)');
    grd.addColorStop(0.5, 'rgba(128, 0, 255, 0.35)');
    grd.addColorStop(1, 'rgba(128, 0, 255, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 70, y - 70, w + 140, h + 140);

    if (this.hitTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#FF1744';
      ctx.beginPath(); ctx.arc(cx, cy, w / 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    if (BOSS1_IMG.complete && BOSS1_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(BOSS1_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#F57C00';
      ctx.beginPath(); ctx.arc(cx, cy, w / 2.2, 0, Math.PI * 2); ctx.fill();
    }

    // Boss Health Bar
    const barW = 200;
    const barH = 14;
    const barX = cx - barW / 2;
    const barY = y - 28;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    ctx.strokeStyle = '#AA00FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    const segW = (barW - 4) / this.maxHp;
    for (let i = 0; i < this.maxHp; i++) {
      if (i < this.hp) {
        ctx.fillStyle = '#E040FB';
        ctx.fillRect(barX + 2 + i * segW + 1, barY + 2, segW - 2, barH - 4);
      }
    }

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText(`BOSS 1: ${this.hp}/${this.maxHp} HP`, cx, barY - 6);
    ctx.restore();
  }
}

// ── Springboard ────────────────────────────────────────────────
class Springboard {
  constructor(x, canvasH) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 56;
    this.height = 30;
    this.y = canvasH * 0.80 - this.height;
    this.active = true;
    this.type = 'springboard';
    this.bounceTimer = 0;
    this.canvasH = canvasH;
  }

  trigger() { this.bounceTimer = 0.4; }
  update(dt) { if (this.bounceTimer > 0) this.bounceTimer -= dt; }

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

    const auraA = 0.15 + Math.sin(t / 300) * 0.08;
    const auraGrd = ctx.createRadialGradient(x + w / 2, y, 2, x + w / 2, y, w * 0.9);
    auraGrd.addColorStop(0, `rgba(255,50,50,${auraA + 0.1})`);
    auraGrd.addColorStop(1, 'rgba(255,50,50,0)');
    ctx.fillStyle = auraGrd;
    ctx.fillRect(x - 28, y - 40, w + 56, this.height + 50);

    if (!compressed) {
      const bob = Math.sin(t / 160) * 5;
      for (let i = 0; i < 3; i++) {
        const ay = y - 20 - i * 14 + bob;
        const alpha = 0.35 + i * 0.3;
        const size = 8 + i * 2;
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
      ctx.fillStyle = 'rgba(255,60,60,0.9)';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#330000'; ctx.shadowBlur = 4;
      ctx.fillText('STEP ON!', x + w / 2, y - 58 + Math.sin(t / 160) * 3);
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }

    for (let bx = 0; bx < w + 6; bx += P) {
      ctx.fillStyle = (Math.floor(bx / P) % 2 === 0) ? '#8D5B3A' : '#7A4F30';
      ctx.fillRect(x - 3 + bx, y + 20, Math.min(P, w + 6 - bx), 10);
    }

    ctx.strokeStyle = compressed ? '#AA0000' : '#FF4444';
    ctx.lineWidth = 3;
    const coilSteps = 5;
    for (let cs = 0; cs < coilSteps; cs++) {
      const cy1 = y + comp + cs * ((22 - comp) / coilSteps);
      const cy2 = y + comp + (cs + 1) * ((22 - comp) / coilSteps);
      ctx.beginPath();
      ctx.moveTo(x + (cs % 2 === 0 ? 0 : w), cy1);
      ctx.lineTo(x + (cs % 2 === 0 ? w : 0), cy2);
      ctx.stroke();
    }

    for (let px2 = 0; px2 < w; px2 += P) {
      ctx.fillStyle = (Math.floor(px2 / P) % 2 === 0) ? '#E53935' : '#C62828';
      ctx.fillRect(x + px2, y + comp, Math.min(P, w - px2), P * 2);
    }

    ctx.fillStyle = compressed ? '#FFFFFF' : '#330000';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(compressed ? 'BOING!' : 'SPRING', x + w / 2, y + comp + P * 2 - 1);
    ctx.textAlign = 'left';

    ctx.strokeStyle = compressed ? '#AA0000' : '#BB0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y + comp, w, 22 - comp);
  }
}

// ── Crumbling Platform (Falls 0.8s after step) ────────────────
class CrumblingPlatform {
  constructor(x, y, width = 180, height = 18) {
    this.worldX = x;
    this.screenX = 0;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tier = 1;
    this.active = true;
    this.isCrumbling = false;
    this.crumbleTimer = 0.8;
    this.fallVy = 0;
    this.shakeOffset = 0;
  }

  stepOn() {
    if (!this.isCrumbling) {
      this.isCrumbling = true;
    }
  }

  update(dt) {
    if (!this.active) return;
    if (this.isCrumbling) {
      this.crumbleTimer -= dt;
      this.shakeOffset = (Math.sin(performance.now() / 25) * 3);
      if (this.crumbleTimer <= 0) {
        this.fallVy += 600 * dt;
        this.y += this.fallVy * dt;
        if (this.y > 1000) this.active = false;
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    const x = Math.floor(this.screenX + (this.crumbleTimer > 0 && this.isCrumbling ? this.shakeOffset : 0));
    const y = Math.floor(this.y);
    const w = Math.floor(this.width);
    const h = this.height;

    // Crumbling leafy bark
    ctx.fillStyle = this.isCrumbling ? '#D84315' : '#8D5B3A';
    ctx.fillRect(x, y + 4, w, h - 4);

    ctx.fillStyle = this.isCrumbling ? '#FF5722' : '#5BB948';
    ctx.fillRect(x, y, w, 4);

    if (this.isCrumbling && this.crumbleTimer > 0) {
      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.fillText('CRUMBLING!', x + 10, y - 6);
    }
  }
}

// ── Water Hazard (Deep River Gaps on Floor 1/2) ──────────────
class WaterHazard {
  constructor(x, width, groundY, canvasH, customHeight = null, label = '⚠️ DEEP RIVER ⚠️') {
    this.worldX = x;
    this.screenX = 0;
    this.width = width;
    this.y = groundY;
    this.height = customHeight !== null ? customHeight : (canvasH - groundY + 20);
    this.label = label;
    this.animTime = 0;
  }

  update(dt) {
    this.animTime += dt * 3.5;
  }

  getHitbox() {
    return { x: this.screenX, y: this.y + 4, width: this.width, height: this.height };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;
    const P = 6;

    // Viewport Culling
    if (x + w < 0 || x > CANVAS_W) return;

    // Deep water body
    const grd = ctx.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, '#1E88E5');
    grd.addColorStop(0.3, '#1565C0');
    grd.addColorStop(1, '#0D47A1');
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, w, h);

    // Animated water surface waves / foam ripples
    const waveOffset = Math.sin(this.animTime) * 3;
    
    // Only draw ripples that are on-screen
    const startWx = Math.max(0, Math.floor(-x / (P * 2)) * (P * 2));
    const endWx = Math.min(w, Math.ceil((CANVAS_W - x) / (P * 2)) * (P * 2));
    
    for (let wx = startWx; wx < endWx; wx += P * 2) {
      const rippleY = y + Math.sin(this.animTime + wx * 0.08) * 3;
      ctx.fillStyle = '#E1F5FE';
      ctx.fillRect(x + wx, rippleY, P, 3);
      ctx.fillStyle = '#81D4FA';
      ctx.fillRect(x + wx + P, rippleY + 2, P, 3);
    }

    if (this.label) {
      ctx.save();
      ctx.fillStyle = '#FFF9C4';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText(this.label, x + w / 2, y + 26 + waveOffset);
      ctx.restore();
    }
  }
}

// ── Lava Hazard (Bubbling hot lava fissures on any floor) ───
class LavaHazard {
  constructor(x, width, groundY, canvasH, customHeight = null, label = '🔥 HOT LAVA 🔥') {
    this.worldX = x;
    this.screenX = 0;
    this.width = width;
    this.y = groundY;
    this.height = customHeight !== null ? customHeight : (canvasH - groundY + 20);
    this.label = label;
    this.animTime = 0;
  }

  update(dt) {
    this.animTime += dt * 4;
  }

  getHitbox() {
    return { x: this.screenX, y: this.y + 4, width: this.width, height: this.height };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    // Viewport Culling
    if (x + w < 0 || x > CANVAS_W) return;

    // Deep volcanic lava
    const grd = ctx.createLinearGradient(0, y, 0, y + h);
    grd.addColorStop(0, '#FF3D00');
    grd.addColorStop(0.4, '#D50000');
    grd.addColorStop(1, '#3E0000');
    ctx.fillStyle = grd;
    ctx.fillRect(x, y, w, h);

    // Bubbling molten ripples - only render what is on-screen
    const startBx = Math.max(0, Math.floor(-x / 20) * 20);
    const endBx = Math.min(w, Math.ceil((CANVAS_W - x) / 20) * 20);
    
    for (let bx = startBx; bx < endBx; bx += 20) {
      const bubbleY = y + Math.sin(this.animTime + bx * 0.15) * 4;
      ctx.fillStyle = '#FFEA00';
      ctx.beginPath();
      ctx.arc(x + bx + 10, bubbleY + 6, 4 + Math.sin(this.animTime * 2 + bx) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lava label
    if (this.label) {
      ctx.save();
      ctx.fillStyle = '#FFEB3B';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
      ctx.fillText(this.label, x + w / 2, y + 26);
      ctx.restore();
    }
  }
}

// ── Fog Zone (Pitch black fog of war area) ─────────────────────
class FogZone {
  constructor(worldX, width) {
    this.worldX = worldX;
    this.width = width;
  }

  contains(playerWorldX) {
    return playerWorldX >= this.worldX && playerWorldX <= this.worldX + this.width;
  }
}

// ── Wizard (NPC) ──────────────────────────────────────────────
class Wizard {
  constructor(x, groundY) {
    this.worldX = x;
    this.screenX = 0;
    // Wizard bigger: 80px width, 85px height (~1.5x of player)
    this.width = 80;
    this.height = 85;
    this.y = groundY - this.height;
    this.bobTime = 0;
    this.greeted = false; // Tracks if dialogue has been triggered
    this.dialogueDone = false; // Tracks if dialogue is finished
  }

  update(dt) {
    this.bobTime += dt * 2;
  }

  getHitbox() {
    return { x: this.screenX, y: this.y, width: this.width, height: this.height };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y + Math.sin(this.bobTime) * 3);
    const cx = x + this.width / 2;
    const cy = y + this.height / 2;

    // Viewport culling
    if (x + this.width < -60 || x > CANVAS_W + 60) return;

    // Mystical Pulsing Blue Glowing Aura
    ctx.save();
    const pulse = (Math.sin(this.bobTime * 3) + 1) / 2;
    const auraRadius = 55 + pulse * 18;
    const grd = ctx.createRadialGradient(cx, cy, 10, cx, cy, auraRadius);
    grd.addColorStop(0, 'rgba(0, 229, 255, 0.95)'); // Brilliant Cyan
    grd.addColorStop(0.35, 'rgba(33, 150, 243, 0.7)'); // Azure Sky Blue
    grd.addColorStop(0.7, 'rgba(13, 71, 161, 0.4)'); // Royal Deep Blue
    grd.addColorStop(1, 'rgba(10, 25, 70, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting blue magical sparks around wizard
    for (let i = 0; i < 6; i++) {
      const angle = this.bobTime * 2.2 + (i * Math.PI * 2) / 6;
      const sparkDist = 42 + Math.sin(this.bobTime * 3.5 + i) * 8;
      const sx = cx + Math.cos(angle) * sparkDist;
      const sy = cy + Math.sin(angle) * sparkDist;
      ctx.fillStyle = '#E0F7FA';
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 8;
      ctx.fillRect(sx - 2.5, sy - 2.5, 5, 5);
    }
    ctx.restore();

    if (WIZARD_IMG.complete && WIZARD_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(WIZARD_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(x, y, this.width, this.height);
    }
  }
}

// ── Sea Monster Decoration ─────────────────────────────────────
class SeaMonster {
  constructor(x, waterY) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 165;
    this.height = 165;
    this.y = waterY - this.height + 30; // partially submerged
    this.bobTime = Math.random() * 10;
  }

  update(dt) {
    this.bobTime += dt * 1.5;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y + Math.sin(this.bobTime) * 10);
    
    // Viewport Culling
    if (x + this.width < 0 || x > 1200) return;

    if (SEAMONSTER_IMG.complete && SEAMONSTER_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 0.8; // slightly ghostly/merged with water
      ctx.drawImage(SEAMONSTER_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#00695C';
      ctx.beginPath();
      ctx.arc(x + this.width/2, y + this.height/2 + 20, 40, Math.PI, 0);
      ctx.fill();
    }
  }
}

// ── Dungeon Door (Blocking Door using DungeonDoor.png) ──────────
class DungeonDoor {
  constructor(x, floor1Y, floor2BottomY, width = 115) {
    this.worldX = x;
    this.screenX = 0;
    this.width = width;
    // Extends from lower horizontal line of Floor 2 to upper horizontal line of Floor 1
    this.y = floor2BottomY;
    this.height = Math.max(80, floor1Y - floor2BottomY);
    this.type = 'dungeon_door';
    this.unlocked = false;
    this.openProgress = 0;
  }

  getHitbox() {
    if (this.unlocked && this.openProgress >= 0.8) {
      return { x: -9999, y: -9999, width: 0, height: 0 };
    }
    return { x: this.screenX, y: this.y, width: this.width, height: this.height };
  }

  update(dt) {
    if (this.unlocked && this.openProgress < 1.0) {
      this.openProgress = Math.min(1.0, this.openProgress + dt * 1.5);
    }
  }

  draw(ctx, playerHasKey = false) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;

    // Viewport culling
    if (x + w < -100 || x > CANVAS_W + 100) return;

    ctx.save();
    if (this.unlocked) {
      // Smooth open door sliding upward into the roof
      const slideUp = this.openProgress * (h - 15);
      ctx.globalAlpha = Math.max(0.15, 1.0 - this.openProgress * 0.85);
      if (DUNGEON_DOOR_IMG.complete && DUNGEON_DOOR_IMG.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(DUNGEON_DOOR_IMG, x, y - slideUp, w, h);
      } else {
        ctx.fillStyle = 'rgba(74, 20, 140, 0.5)';
        ctx.fillRect(x, y - slideUp, w, h);
      }
      ctx.restore();

      // Golden magical open portal glow
      ctx.save();
      const grd = ctx.createLinearGradient(x, y, x + w, y);
      grd.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
      grd.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
      grd.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
      ctx.fillStyle = grd;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      return;
    }

    // Locked Door using DungeonDoor.png (Wider proportioned gate)
    if (DUNGEON_DOOR_IMG.complete && DUNGEON_DOOR_IMG.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(DUNGEON_DOOR_IMG, x, y, w, h);
    } else {
      ctx.fillStyle = '#261C14';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#423224';
      ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    }

    // Heavy glowing Padlock & Keyhole
    const lockCX = x + w / 2;
    const lockCY = y + h / 2 + 10;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = playerHasKey ? '#69F0AE' : '#FF1744';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(lockCX - 12, lockCY - 10, 24, 26, 4);
    ctx.fill();
    ctx.strokeStyle = '#B78103';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lock Shackle
    ctx.beginPath();
    ctx.arc(lockCX, lockCY - 10, 8, Math.PI, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#B0BEC5';
    ctx.stroke();

    // Keyhole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(lockCX, lockCY - 1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(lockCX - 2, lockCY - 1, 4, 8);

    // Indicator label above door
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    if (playerHasKey) {
      ctx.fillStyle = '#69F0AE';
      ctx.fillText('PRESS [K] TO OPEN 🗝️', lockCX, y - 12);
    } else {
      ctx.fillStyle = '#FF5252';
      ctx.fillText('🔒 NEED KEY 🗝️', lockCX, y - 12);
    }
    ctx.restore();
  }
}
class LockedGate extends DungeonDoor {}

// ── Key Item (Used to unlock Hollow Tree) ──────────────────────
class KeyItem {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 44;
    this.height = 44;
    this.baseY = y - this.height - 10;
    this.y = this.baseY;
    this.active = true;
    this.bobTime = 0;
    this.type = 'key';
  }

  update(dt) {
    this.bobTime += dt * 3;
    this.y = this.baseY + Math.sin(this.bobTime) * 6;
  }

  getHitbox() {
    return { x: this.screenX + 4, y: this.y + 4, width: this.width - 8, height: this.height - 8 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);

    // Glowing key aura
    const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
    const grd = ctx.createRadialGradient(x + 22, y + 22, 5, x + 22, y + 22, 35 + pulse * 10);
    grd.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 20, y - 20, 84, 84);

    if (KEY_IMG.complete && KEY_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(KEY_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 10, y + 10, 24, 24);
    }

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SECRET KEY', x + 22, y - 8);
  }
}

// ── Easter Egg Item ───────────────────────────────────────────
class EasterEggItem {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    // 0.7 times the size of the player (55px * 0.7 = 38.5px)
    this.width = 38;
    this.height = 42;
    this.baseY = y - this.height;
    this.y = this.baseY;
    this.active = true;
    this.revealed = false; // Only revealed after talking to wizard!
    this.bobTime = 0;
    this.type = 'easter_egg';
  }

  update(dt) {
    if (!this.revealed || !this.active) return;
    // Moving slowly up and down
    this.bobTime += dt * 1.6;
    this.y = this.baseY + Math.sin(this.bobTime) * 4;
  }

  getHitbox() {
    // Return offscreen hitbox so walking over it NEVER auto-collects or disappears!
    // It remains in place and only disappears when holding P for 2 seconds!
    return { x: -9999, y: -9999, width: 0, height: 0 };
  }

  draw(ctx) {
    if (!this.revealed || !this.active) return;
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const cx = x + this.width / 2;
    const cy = y + this.height / 2;

    // Viewport culling
    if (x + this.width < -50 || x > CANVAS_W + 50) return;

    const time = performance.now() / 240;
    const pulse = (Math.sin(time) + 1) / 2;

    ctx.save();
    // Gentle golden aura (subtle, clean, not overwhelming)
    const haloRadius = 24 + pulse * 8;
    const grd = ctx.createRadialGradient(cx, cy, 3, cx, cy, haloRadius);
    grd.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
    grd.addColorStop(0.3, 'rgba(255, 215, 0, 0.45)');
    grd.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3 small subtle sparkles
    for (let i = 0; i < 3; i++) {
      const angle = time * 1.5 + (i * Math.PI * 2) / 3;
      const dist = 18 + Math.sin(time * 2 + i) * 4;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      ctx.fillStyle = '#FFFDE7';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 4;
      ctx.fillRect(px - 1, py - 1, 2.5, 2.5);
    }
    ctx.restore();

    // Clean egg sprite
    if (EASTER_EGG_IMG.complete && EASTER_EGG_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(EASTER_EGG_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Floating Title Tag
    ctx.save();
    ctx.fillStyle = '#FFE082';
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText('EASTER EGG', cx, y - 8);
    ctx.restore();
  }
}

// ── Red Balloon Projectile (Fired by Joker) ────────────────────
class RedBalloon {
  constructor(x, y) {
    this.worldX = x;
    this.screenX = 0;
    this.y = y;
    this.width = 66;  // 1.2x character size
    this.height = 66;
    this.vx = -320; // Fast projectile speed
    this.active = true;
    this.type = 'red_balloon';
  }

  update(dt) {
    this.worldX += this.vx * dt;
    if (this.worldX < -500) this.active = false;
  }

  getHitbox() {
    return { x: this.screenX + 10, y: this.y + 10, width: this.width - 20, height: this.height - 20 };
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);

    if (RED_BALLOON_IMG.complete && RED_BALLOON_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(RED_BALLOON_IMG, x, y, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#FF1744';
      ctx.beginPath();
      ctx.arc(x + 33, y + 33, 28, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Joker Boss (Level 3 Final Boss) ───────────────────────────
class JokerBoss {
  constructor(x, groundY) {
    this.worldX = x;
    this.screenX = 0;
    this.width = 110; // 2x character size
    this.height = 110;
    this.y = groundY - this.height;
    this.baseY = this.y;
    this.active = true;
    this.type = 'joker_boss';
    this.hp = 3;
    this.maxHp = 3;
    this.hitTimer = 0;
    this.fireTimer = 0;
    this.balloons = [];
    this.alertTriggered = false;
  }

  update(dt) {
    if (this.hitTimer > 0) this.hitTimer -= dt;

    // Fire Red Balloons every 1.8 seconds only if alerted
    this.fireTimer += dt;
    if (this.alertTriggered && this.fireTimer >= 1.8 && this.hp > 0) {
      this.fireTimer = 0;
      this.balloons.push(new RedBalloon(this.worldX - 30, this.y + 20));
    }

    // Update active balloons
    for (const b of this.balloons) {
      if (b.active) {
        b.screenX = b.worldX - (this.worldX - this.screenX);
        b.update(dt);
      }
    }
    this.balloons = this.balloons.filter(b => b.active);
  }

  getHitbox() {
    return { x: this.screenX + 15, y: this.y + 15, width: this.width - 30, height: this.height - 30 };
  }

  takeHit() {
    this.hp--;
    this.hitTimer = 0.4;
    if (this.hp <= 0) {
      this.active = false;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const x = Math.floor(this.screenX);
    const y = Math.floor(this.y);
    const w = this.width;
    const h = this.height;
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Boss Glowing Aura
    const pulse = (Math.sin(performance.now() / 180) + 1) / 2;
    const grd = ctx.createRadialGradient(cx, cy, 20, cx, cy, 75 + pulse * 18);
    grd.addColorStop(0, 'rgba(213, 0, 0, 0.7)');
    grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(x - 30, y - 30, w + 60, h + 60);

    // Hit flash
    if (this.hitTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#FF1744';
      ctx.beginPath(); ctx.arc(cx, cy, w / 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    if (JOKER_IMG.complete && JOKER_IMG.naturalWidth > 0) {
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(JOKER_IMG, x, y, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#6200EA';
      ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
    }

    // Health Bar
    const barW = 140;
    const barH = 12;
    const barX = cx - barW / 2;
    const barY = y - 22;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    ctx.strokeStyle = '#D50000';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    const segW = (barW - 4) / this.maxHp;
    for (let i = 0; i < this.maxHp; i++) {
      if (i < this.hp) {
        ctx.fillStyle = '#FF1744';
        ctx.fillRect(barX + 2 + i * segW + 1, barY + 2, segW - 2, barH - 4);
      }
    }

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText(`JOKER BOSS: ${this.hp}/${this.maxHp} HP`, cx, barY - 6);
    ctx.restore();

    // Draw active red balloons
    for (const b of this.balloons) {
      if (b.active) b.draw(ctx);
    }
  }
}

// ── Dynamic Level Manager (Modular Loader for Levels 1, 2, and 3) ──
class Level {
  constructor(canvasW, canvasH, levelNumber = 1) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    this.levelNumber = levelNumber;
    this.mapWidth = 7200;
    this.cameraX = 0;

    this.platforms = [];
    this.collectibles = [];
    this.bees = [];
    this.springboards = [];
    this.scenery = [];
    this.seaMonsters = [];
    this.fogZones = [];
    this.waters = [];
    this.lavas = [];
    this.wizards = [];
    this.water = null;
    this.lava = null;
    this.startFlag = null;
    this.poohHome = null;
    this.boss = null;
    this.jokerBoss = null;
    this.lockedGate = null;
    this.dungeonDoor = null;
    this.easterEgg = null;

    const groundY = canvasH * 0.80;

    // Call modular level builder
    if (levelNumber === 3 && typeof buildLevel3 === 'function') {
      buildLevel3(this, canvasW, canvasH, groundY);
    } else if (levelNumber === 2 && typeof buildLevel2 === 'function') {
      buildLevel2(this, canvasW, canvasH, groundY);
    } else if (typeof buildLevel1 === 'function') {
      buildLevel1(this, canvasW, canvasH, groundY);
    }

    // Ensure single water/lava references are also in the arrays
    if (this.water && !this.waters.includes(this.water)) this.waters.push(this.water);
    if (this.lava && !this.lavas.includes(this.lava)) this.lavas.push(this.lava);
  }

  spawnGiantHoney(x, y) {
    this.collectibles.push(new GiantHoneyPot(x, y));
  }

  toScreen(worldX) { return worldX - this.cameraX; }

  update(dt, cameraX) {
    this.cameraX = cameraX;

    if (this.groundPlatform) {
      this.groundPlatform.screenX = this.toScreen(this.groundPlatform.worldX);
    }

    for (const w of this.waters) {
      w.screenX = this.toScreen(w.worldX);
      w.update(dt);
    }

    for (const l of this.lavas) {
      l.screenX = this.toScreen(l.worldX);
      l.update(dt);
    }

    const door = this.dungeonDoor || this.lockedGate;
    if (door) {
      door.screenX = this.toScreen(door.worldX);
      if (typeof door.update === 'function') door.update(dt);
    }
    
    for (const w of this.wizards) {
      w.screenX = this.toScreen(w.worldX);
      w.update(dt);
    }

    if (this.startFlag) this.startFlag.screenX = this.toScreen(this.startFlag.worldX);
    if (this.poohHome) this.poohHome.screenX = this.toScreen(this.poohHome.worldX);

    for (const tree of this.scenery) {
      tree.screenX = this.toScreen(tree.worldX);
    }

    for (const sm of this.seaMonsters) {
      sm.screenX = this.toScreen(sm.worldX);
      sm.update(dt);
    }

    for (const p of this.platforms) {
      p.screenX = this.toScreen(p.worldX);
      if (typeof p.update === 'function') p.update(dt);
    }

    for (const c of this.collectibles) {
      if (c.active) {
        c.screenX = this.toScreen(c.worldX);
        c.update(dt);
      }
    }

    for (const b of this.bees) {
      if (b.active) {
        b.screenX = this.toScreen(b.worldX);
        b.update(dt);
      }
    }

    for (const s of this.springboards) {
      s.screenX = this.toScreen(s.worldX);
      s.update(dt);
    }
  }

  getAllPlatforms() {
    return this.groundPlatform ? [this.groundPlatform, ...this.platforms] : [...this.platforms];
  }

  draw(ctx, playerHasKey = false) {
    // 1. Ground platform
    if (this.groundPlatform) this.groundPlatform.draw(ctx);

    // 2. Water & Lava Hazards
    for (const w of this.waters) {
      w.draw(ctx);
    }
    for (const l of this.lavas) {
      l.draw(ctx);
    }

    // 3. Scenery, Gate, Wizards, Sea Monsters
    for (const sm of this.seaMonsters) sm.draw(ctx);
    const door = this.dungeonDoor || this.lockedGate;
    if (door) door.draw(ctx, playerHasKey);
    for (const tree of this.scenery) {
      tree.draw(ctx);
    }
    for (const w of this.wizards) {
      w.draw(ctx);
    }

    // 4. Landmarks
    if (this.startFlag) this.startFlag.draw(ctx);
    if (this.poohHome) this.poohHome.draw(ctx);

    // 5. Elevated Platforms
    for (const p of this.platforms) {
      if (p.active) p.draw(ctx);
    }

    // 6. Springboards
    for (const s of this.springboards) {
      if (s.active) s.draw(ctx);
    }

    // 7. Collectibles
    for (const c of this.collectibles) {
      if (c.active) c.draw(ctx);
    }

    // 8. Enemies & Bosses
    for (const b of this.bees) {
      if (b.active) b.draw(ctx);
    }
  }
}

