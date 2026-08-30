/**
 * ui.js — Pixel-art parallax background + bigger HUD (hearts, score, Sweet Rush gauge)
 */

// ── Pixel art helper ──────────────────────────────────────────
const P = 8; // background pixel block size

function fillPixelPattern(ctx, x, y, pattern, colors, ps = P) {
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const v = pattern[row][col];
      if (v > 0) {
        ctx.fillStyle = Array.isArray(colors) ? (colors[v-1] || colors[0]) : colors;
        ctx.fillRect(
          Math.floor(x) + col * ps,
          Math.floor(y) + row * ps,
          ps, ps
        );
      }
    }
  }
}

// ── Pixel art shapes ──────────────────────────────────────────
const CLOUD_A = [
  [0,0,1,1,1,0,0,0,0,0],
  [0,1,2,2,2,1,1,0,0,0],
  [1,2,2,2,2,2,2,1,0,0],
  [1,2,2,2,2,2,2,2,1,0],
  [0,1,1,2,2,2,1,1,0,0],
  [0,0,1,1,1,1,1,0,0,0],
];
const CLOUD_B = [
  [0,0,0,1,1,1,0,0],
  [0,1,1,2,2,2,1,0],
  [1,2,2,2,2,2,2,1],
  [0,1,1,2,2,1,1,0],
  [0,0,1,1,1,1,0,0],
];
const CLOUD_COLORS = ['#C8E8FF','#FFFFFF'];

const SUN_PATTERN = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,1,2,2,3,3,2,2,1,0],
  [1,2,2,3,3,3,3,2,2,1],
  [1,2,3,3,3,3,3,3,2,1],
  [1,2,3,3,3,3,3,3,2,1],
  [1,2,2,3,3,3,3,2,2,1],
  [0,1,2,2,3,3,2,2,1,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
];
const SUN_COLORS = ['#FFD700','#FFF176','#FFFDE0'];

// Pixel-art tree (silhouette)
const TREE_CROWN = [
  [0,0,1,1,1,0,0],
  [0,1,2,2,2,1,0],
  [1,2,2,2,2,2,1],
  [1,2,2,2,2,2,1],
  [0,1,2,2,2,1,0],
  [0,0,1,1,1,0,0],
];
const TREE_CROWN_COLORS = ['#2D6A1F','#3D8A28'];
const TREE_TRUNK_COLORS = ['#5C3317','#3D2210'];

// Near tree (bigger, midground)
const NEAR_CROWN = [
  [0,0,0,1,1,1,1,0,0,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,1,2,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,0,0,1,1,1,1,0,0,0],
];
const NEAR_CROWN_COLORS = ['#1E5216','#2D7022'];

// Pixel beehive
const HIVE_PATTERN = [
  [0,1,1,1,0],
  [1,2,2,2,1],
  [1,2,2,2,1],
  [1,2,2,2,1],
  [0,1,1,1,0],
];
const HIVE_COLORS = ['#C8860A','#D4A017'];

// ── Procedural cloud / tree placement (seeded) ───────────────
function _seededRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 4294967296; };
}

const rngClouds = _seededRng(42);
const rngTrees1 = _seededRng(77);
const rngTrees2 = _seededRng(13);
const rngHills  = _seededRng(99);

const CLOUDS = Array.from({length: 10}, () => ({
  x:       rngClouds() * 1800,
  y:       20 + rngClouds() * 90,
  big:     rngClouds() > 0.4,
}));
const FAR_TREES = Array.from({length: 14}, () => ({
  x:       rngTrees1() * 2600,
  crownH:  4 + Math.floor(rngTrees1() * 3),
  trunkH:  5 + Math.floor(rngTrees1() * 4),
}));
const NEAR_TRUNKS = Array.from({length: 8}, () => ({
  x:       rngTrees2() * 1800,
  trunkH:  10 + Math.floor(rngTrees2() * 8),
  hiveOff: 2 + Math.floor(rngTrees2() * 3),
}));
const HILLS = Array.from({length: 7}, () => ({
  x:       rngHills() * 2400,
  w:       16 + Math.floor(rngHills() * 12),
  h:       4  + Math.floor(rngHills() * 5),
}));

// ── Parallax Background ───────────────────────────────────────
const Background = (() => {
  function draw(ctx, canvasW, canvasH, worldX) {

    // ── Sky: stepped pixel color bands ──────────────────────
    const skyBands = [
      { y:   0, h:  P*4,  col: '#4DAAEE' },
      { y: P*4, h:  P*4,  col: '#60B8F5' },
      { y: P*8, h:  P*6,  col: '#75C5FA' },
      { y: P*14, h: P*8,  col: '#90D4FC' },
      { y: P*22, h: P*999, col: '#A8DFFF' },
    ];
    for (const b of skyBands) {
      ctx.fillStyle = b.col;
      ctx.fillRect(0, b.y, canvasW, b.h);
    }

    // ── Ground pixel bands ───────────────────────────────────
    const groundTop = Math.floor(canvasH * 0.80);
    const dirtBands = [
      { off: 0, h: P,   col: '#5BB948' },
      { off: P, h: P,   col: '#4A9E38' },
      { off: P*2, h: P, col: '#8D5B3A' },
      { off: P*3, h: P, col: '#7A4F30' },
      { off: P*4, h: 999, col: '#6B4228' },
    ];
    for (const d of dirtBands) {
      ctx.fillStyle = d.col;
      ctx.fillRect(0, groundTop + d.off, canvasW, d.h);
    }
    // Grass pixel blocks on top
    const grassOff = -(worldX % (P * 3));
    for (let gx = grassOff - P; gx < canvasW + P; gx += P) {
      ctx.fillStyle = (Math.floor((gx + worldX)/P) % 3 === 0) ? '#4A9E38' : '#5BB948';
      ctx.fillRect(gx, groundTop, P, P);
    }

    // ── Layer 1: Sun (0.05x) ─────────────────────────────────
    const sunOff = worldX * 0.05;
    // Safely wrap off-screen to avoid any flashing/teleporting mid-screen
    const sunX = ((canvasW + 300 - sunOff) % (canvasW + 600) + canvasW + 600) % (canvasW + 600) - 150;
    const sunY = P * 2;
    fillPixelPattern(ctx, sunX - 40, sunY, SUN_PATTERN, SUN_COLORS, P);

    // Sun rays (pixel lines extending outward)
    ctx.fillStyle = '#FFD700';
    const rayOffsets = [[-P*6,-P*2],[P*6,-P*2],[-P*6,P*6],[P*6,P*6],
                         [-P*2,-P*6],[P*2,-P*6],[-P*3,P*6],[P*3,P*6]];
    for (const [rx,ry] of rayOffsets) {
      ctx.fillRect(sunX - 40 + 4*P + rx, sunY + 4*P + ry, P, P);
    }

    // ── Layer 1: Clouds (0.1x) ──────────────────────────────
    const cloudOff = worldX * 0.1;
    for (const c of CLOUDS) {
      const cx = ((c.x - cloudOff) % (canvasW + 400) + canvasW + 400) % (canvasW + 400) - 150;
      const pattern = c.big ? CLOUD_A : CLOUD_B;
      fillPixelPattern(ctx, cx, c.y, pattern, CLOUD_COLORS, P);
    }

    // ── Layer 2: Far hills (0.3x) ────────────────────────────
    const hillOff = worldX * 0.3;
    for (const h of HILLS) {
      // Safely wrap off-screen left and right so no flashing occurs
      const hx = ((h.x - hillOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 300;
      const topY = groundTop - h.h * P;
      // Draw pixel hill as staircase
      for (let col = 0; col < h.w; col++) {
        const dist = Math.abs(col - h.w/2) / (h.w/2);
        const barH = Math.max(1, Math.round(h.h * (1 - dist * dist))) * P;
        ctx.fillStyle = col % 2 === 0 ? '#7DC55A' : '#6BB548';
        ctx.fillRect(hx + col * P, groundTop - barH, P, barH);
      }
    }

    // ── Layer 2: Far tree silhouettes (0.3x) ─────────────────
    const treeOff = worldX * 0.3;
    for (const t of FAR_TREES) {
      const tx = ((t.x - treeOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 150;
      const baseY = groundTop;
      // Crown (pixel art)
      const crownY = baseY - (t.trunkH + t.crownH) * P;
      fillPixelPattern(ctx, tx - TREE_CROWN[0].length*P/2, crownY, TREE_CROWN, TREE_CROWN_COLORS, P);
      // Trunk (pixel columns)
      for (let ty = 0; ty < t.trunkH; ty++) {
        ctx.fillStyle = ty % 2 === 0 ? TREE_TRUNK_COLORS[0] : TREE_TRUNK_COLORS[1];
        ctx.fillRect(tx - P, baseY - (ty+1)*P, P*2, P);
      }
    }

    // ── Layer 3: Near oak trunks + beehives (0.6x) ──────────
    const nearOff = worldX * 0.6;
    for (const t of NEAR_TRUNKS) {
      const tx = ((t.x - nearOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 150;
      const baseY = groundTop;
      const crownY = baseY - (t.trunkH + NEAR_CROWN.length) * P;

      // Crown
      fillPixelPattern(ctx, tx - NEAR_CROWN[0].length*P/2, crownY, NEAR_CROWN, NEAR_CROWN_COLORS, P);

      // Trunk pixel columns (3 wide)
      for (let ty = 0; ty < t.trunkH; ty++) {
        for (let tw = 0; tw < 3; tw++) {
          const col = (tw === 0 || ty % 3 === 0) ? '#8D5B3A' : (tw === 1 ? '#7A4F30' : '#6B4228');
          ctx.fillStyle = col;
          ctx.fillRect(tx - P + tw*P, baseY - (ty+1)*P, P, P);
        }
      }

      // Hanging beehive (pixel art)
      const hiveX = tx - HIVE_PATTERN[0].length*P/2 + P*t.hiveOff;
      const hiveY = baseY - t.trunkH*P + P*2;
      fillPixelPattern(ctx, hiveX, hiveY, HIVE_PATTERN, HIVE_COLORS, P);
      // String
      ctx.fillStyle = '#6B4228';
      ctx.fillRect(hiveX + HIVE_PATTERN[0].length*P/2 - P/2, hiveY - P*2, P, P*2);
    }
  }

  return { draw };
})();


// ── HUD Renderer (Bigger) ──────────────────────────────────────
const HUD = (() => {

  function drawHearts(ctx, hearts, maxHearts) {
    const x0 = 16, y0 = 18, spacing = 38;
    for (let i = 0; i < maxHearts; i++) {
      drawHeart(ctx, x0 + i * spacing, y0, 16, i < hearts);
    }
  }

  function drawHeart(ctx, cx, cy, r, filled) {
    ctx.save();
    
    // Heart path (narrower shape)
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.3);
    ctx.bezierCurveTo(cx - r*0.8, cy - r*0.5, cx - r*1.2, cy + r*0.4, cx, cy + r*1.2);
    ctx.bezierCurveTo(cx + r*1.2, cy + r*0.4, cx + r*0.8, cy - r*0.5, cx, cy + r*0.3);
    ctx.closePath();

    if (filled) {
      // Base red
      ctx.fillStyle = '#E8203A';
      ctx.fill();
      // Highlight red
      ctx.fillStyle = '#FF4466';
      ctx.beginPath();
      ctx.moveTo(cx - r*0.3, cy - r*0.2);
      ctx.bezierCurveTo(cx - r*0.6, cy - r*0.5, cx - r*0.9, cy + r*0.1, cx - r*0.2, cy + r*0.5);
      ctx.closePath();
      ctx.fill();
      // White glare
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.beginPath();
      ctx.ellipse(cx - r*0.3, cy - r*0.1, r*0.28, r*0.2, -0.5, 0, Math.PI*2);
      ctx.fill();
    } else {
      // Empty heart (dark gray fill)
      ctx.fillStyle = '#333344';
      ctx.fill();
    }

    // Black stroke for both
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  }

  function drawScore(ctx, score, distance, canvasW) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;

    // Score (big)
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFE566';
    ctx.fillText(`${score}`, canvasW - 16, 24);

    // "PTS" label
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFC200';
    ctx.fillText('PTS', canvasW - 16, 38);

    // Distance
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#A8E8FF';
    ctx.fillText(`${Math.floor(distance)} m`, canvasW - 16, 54);

    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawSweetRushGauge(ctx, streak, maxStreak, sweetRush, sweetRushTimer, canvasW) {
    const gx = canvasW / 2 - 70;
    const gy = 10;
    const gw = 140;
    const gh = 18;

    // Label (above gauge)
    ctx.save();
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFD580';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.fillText('SWEET RUSH', canvasW / 2, gy + gh + 13);

    // BG
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);

    if (sweetRush) {
      const frac = sweetRushTimer / 5.0;
      const hue  = (performance.now() / 8) % 360;
      ctx.fillStyle = `hsl(${hue},100%,55%)`;
      ctx.fillRect(gx, gy, gw * frac, gh);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(gx, gy, gw * frac, gh / 3);
    } else {
      const frac = Math.min(streak / maxStreak, 1);
      ctx.fillStyle = frac >= 1 ? '#FFAE00' : '#BA85E0';
      ctx.fillRect(gx, gy, gw * frac, gh);
      if (frac >= 1) {
        const flash = (Math.sin(performance.now() / 70) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.45})`;
        ctx.fillRect(gx, gy, gw, gh);
      }
    }

    // Pixel border
    ctx.strokeStyle = '#FFAE00';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, gw, gh);
    // Notch marks
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i < maxStreak; i++) {
      const nx = gx + (gw / maxStreak) * i;
      ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy + gh); ctx.stroke();
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawSpeedBadge(ctx, speedMult) {
    if (speedMult <= 1.0) return;
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = '#FF9900';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
    ctx.fillText(`×${speedMult.toFixed(1)}`, 16, 60);
    ctx.restore();
  }

  return { drawHearts, drawScore, drawSweetRushGauge, drawSpeedBadge };
})();
