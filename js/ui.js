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
  function drawMeadow(ctx, canvasW, canvasH, worldX) {
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
    const sunX = ((canvasW + 300 - sunOff) % (canvasW + 600) + canvasW + 600) % (canvasW + 600) - 150;
    const sunY = P * 2;
    fillPixelPattern(ctx, sunX - 40, sunY, SUN_PATTERN, SUN_COLORS, P);

    // Sun rays
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
      const hx = ((h.x - hillOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 300;
      const topY = groundTop - h.h * P;
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
      const crownY = baseY - (t.trunkH + t.crownH) * P;
      fillPixelPattern(ctx, tx - TREE_CROWN[0].length*P/2, crownY, TREE_CROWN, TREE_CROWN_COLORS, P);
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
      fillPixelPattern(ctx, tx - NEAR_CROWN[0].length*P/2, crownY, NEAR_CROWN, NEAR_CROWN_COLORS, P);

      for (let ty = 0; ty < t.trunkH; ty++) {
        for (let tw = 0; tw < 3; tw++) {
          const col = (tw === 0 || ty % 3 === 0) ? '#8D5B3A' : (tw === 1 ? '#7A4F30' : '#6B4228');
          ctx.fillStyle = col;
          ctx.fillRect(tx - P + tw*P, baseY - (ty+1)*P, P, P);
        }
      }

      const hiveX = tx - HIVE_PATTERN[0].length*P/2 + P*t.hiveOff;
      const hiveY = baseY - t.trunkH*P + P*2;
      fillPixelPattern(ctx, hiveX, hiveY, HIVE_PATTERN, HIVE_COLORS, P);
      ctx.fillStyle = '#6B4228';
      ctx.fillRect(hiveX + HIVE_PATTERN[0].length*P/2 - P/2, hiveY - P*2, P, P*2);
    }
  }

  // ── Level 3: Fiery Skies & Inferno Forest Theme ─────────────
  function drawInferno(ctx, canvasW, canvasH, worldX) {
    // 1. Deep fiery apocalyptic sky bands
    const infernoSky = [
      { y: 0,    h: P*4,   col: '#120517' }, // Midnight ash
      { y: P*4,  h: P*4,   col: '#26081B' }, // Deep scorched violet
      { y: P*8,  h: P*6,   col: '#4A0E18' }, // Crimson shadow
      { y: P*14, h: P*8,   col: '#7A1C12' }, // Volcanic blaze
      { y: P*22, h: P*999, col: '#B33C12' }, // Glowing molten horizon
    ];
    for (const b of infernoSky) {
      ctx.fillStyle = b.col;
      ctx.fillRect(0, b.y, canvasW, b.h);
    }

    // 2. Volcanic ground bedrock
    const groundTop = Math.floor(canvasH * 0.80);
    const volcanicBands = [
      { off: 0,     h: P,   col: '#2C1810' }, // Charred basalt
      { off: P,     h: P,   col: '#3E1D13' },
      { off: P*2,   h: P,   col: '#22110D' },
      { off: P*3,   h: P,   col: '#180B08' },
      { off: P*4,   h: 999, col: '#100705' },
    ];
    for (const d of volcanicBands) {
      ctx.fillStyle = d.col;
      ctx.fillRect(0, groundTop + d.off, canvasW, d.h);
    }
    // Smoldering ember veins across ground surface
    const ashOff = -(worldX % (P * 3));
    for (let gx = ashOff - P; gx < canvasW + P; gx += P) {
      ctx.fillStyle = (Math.floor((gx + worldX)/P) % 4 === 0) ? '#FF3D00' : '#4E2114';
      ctx.fillRect(gx, groundTop, P, P);
    }

    // 3. Eclipsed Blood Moon / Fiery Celestial Body (0.05x)
    const moonOff = worldX * 0.05;
    const moonX = ((canvasW + 300 - moonOff) % (canvasW + 600) + canvasW + 600) % (canvasW + 600) - 150;
    const moonY = P * 2;

    // Blood Moon Corona Flares
    ctx.fillStyle = '#FF1744';
    const flareOffsets = [[-P*6,-P*2],[P*6,-P*2],[-P*6,P*6],[P*6,P*6],
                          [-P*2,-P*6],[P*2,-P*6],[-P*3,P*6],[P*3,P*6]];
    for (const [rx,ry] of flareOffsets) {
      ctx.fillRect(moonX - 40 + 4*P + rx, moonY + 4*P + ry, P, P);
    }
    // Deep red/obsidian core
    fillPixelPattern(ctx, moonX - 40, moonY, SUN_PATTERN, ['#D50000', '#3E0808', '#140303'], P);

    // 4. Volcanic Smog & Smoke Clouds (0.1x)
    const SMOKE_COLORS = ['#3E2723', '#241414'];
    const cloudOff = worldX * 0.1;
    for (const c of CLOUDS) {
      const cx = ((c.x - cloudOff) % (canvasW + 400) + canvasW + 400) % (canvasW + 400) - 150;
      const pattern = c.big ? CLOUD_A : CLOUD_B;
      fillPixelPattern(ctx, cx, c.y + 12, pattern, SMOKE_COLORS, P);
    }

    // 5. Jagged Volcanic Peaks (0.3x)
    const hillOff = worldX * 0.3;
    for (const h of HILLS) {
      const hx = ((h.x - hillOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 300;
      for (let col = 0; col < h.w; col++) {
        const dist = Math.abs(col - h.w/2) / (h.w/2);
        const barH = Math.max(1, Math.round(h.h * (1.25 - dist * 0.9))) * P;
        ctx.fillStyle = col % 2 === 0 ? '#3A141A' : '#270C12';
        ctx.fillRect(hx + col * P, groundTop - barH, P, barH);
      }
    }

    // 6. Charred Pine Silhouettes (0.3x)
    const CHARRED_CROWN = ['#230A0E', '#170608'];
    const CHARRED_TRUNK = ['#1C0B08', '#100504'];
    const treeOff = worldX * 0.3;
    for (const t of FAR_TREES) {
      const tx = ((t.x - treeOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 150;
      const baseY = groundTop;
      const crownY = baseY - (t.trunkH + t.crownH) * P;
      fillPixelPattern(ctx, tx - TREE_CROWN[0].length*P/2, crownY, TREE_CROWN, CHARRED_CROWN, P);
      for (let ty = 0; ty < t.trunkH; ty++) {
        ctx.fillStyle = ty % 2 === 0 ? CHARRED_TRUNK[0] : CHARRED_TRUNK[1];
        ctx.fillRect(tx - P, baseY - (ty+1)*P, P*2, P);
      }
    }

    // 7. Near Scorched Trunks (0.6x) — No cheerful beehives in inferno
    const nearOff = worldX * 0.6;
    for (const t of NEAR_TRUNKS) {
      const tx = ((t.x - nearOff) % (canvasW + 500) + canvasW + 500) % (canvasW + 500) - 150;
      const baseY = groundTop;
      const crownY = baseY - (t.trunkH + NEAR_CROWN.length) * P;
      fillPixelPattern(ctx, tx - NEAR_CROWN[0].length*P/2, crownY, NEAR_CROWN, ['#1C080B', '#290E12'], P);

      for (let ty = 0; ty < t.trunkH; ty++) {
        for (let tw = 0; tw < 3; tw++) {
          const col = (tw === 1) ? '#2E120A' : '#1B0905';
          ctx.fillStyle = col;
          ctx.fillRect(tx - P + tw*P, baseY - (ty+1)*P, P, P);
        }
      }
    }
  }

  function draw(ctx, canvasW, canvasH, worldX, levelId = 1) {
    if (levelId === 3) {
      drawInferno(ctx, canvasW, canvasH, worldX);
    } else {
      drawMeadow(ctx, canvasW, canvasH, worldX);
    }
  }

  return { draw };
})();


// ── HUD Renderer (Using heart.png and Mushroom Indicator) ──────
const HUD = (() => {

  const HUD_HEART_IMG = (() => {
    const img = new Image();
    img.src = 'assets/heart.png';
    return img;
  })();

  const HUD_MUSHROOM_IMG = (() => {
    const img = new Image();
    img.src = 'assets/mushroom.png';
    return img;
  })();

  function drawHearts(ctx, hearts, maxHearts) {
    const x0 = 18, y0 = 16, size = 32, spacing = 38;
    for (let i = 0; i < maxHearts; i++) {
      const hx = x0 + i * spacing;
      const filled = i < hearts;
      ctx.save();
      if (filled) {
        if (HUD_HEART_IMG.complete && HUD_HEART_IMG.naturalWidth > 0) {
          ctx.drawImage(HUD_HEART_IMG, hx, y0, size, size);
        } else {
          ctx.fillStyle = '#E8203A';
          ctx.beginPath(); ctx.arc(hx + size/2, y0 + size/2, size/2.2, 0, Math.PI*2); ctx.fill();
        }
      } else {
        // Empty heart slot (dark silhouette with outline)
        ctx.globalAlpha = 0.3;
        if (HUD_HEART_IMG.complete && HUD_HEART_IMG.naturalWidth > 0) {
          ctx.drawImage(HUD_HEART_IMG, hx, y0, size, size);
        } else {
          ctx.fillStyle = '#333344';
          ctx.beginPath(); ctx.arc(hx + size/2, y0 + size/2, size/2.2, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function drawMushroomStatus(ctx, hasMushroom) {
    if (!hasMushroom) return;
    const mx = 145, my = 14, size = 34;
    ctx.save();
    // Glowing pulse
    const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.fillRect(mx - 4, my - 2, 175, size + 4);
    ctx.strokeRect(mx - 4, my - 2, 175, size + 4);

    if (HUD_MUSHROOM_IMG.complete && HUD_MUSHROOM_IMG.naturalWidth > 0) {
      ctx.drawImage(HUD_MUSHROOM_IMG, mx, my, size, size);
    }

    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = `hsl(${45 + pulse * 15}, 100%, ${55 + pulse * 25}%)`;
    ctx.fillText('[R] MEGA READY', mx + size + 6, my + 20);
    ctx.restore();
  }

  function drawScore(ctx, score, canvasW) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 6;

    // Score (big)
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFE566';
    ctx.fillText(`${score}`, canvasW - 16, 26);

    // "PTS" label
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFC200';
    ctx.fillText('PTS', canvasW - 16, 42);

    ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawSweetRushGauge(ctx, streak, maxStreak, sweetRush, sweetRushTimer, canvasW) {
    const gx = canvasW / 2 - 70;
    const gy = 10;
    const gw = 140;
    const gh = 18;

    ctx.save();
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFD580';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.fillText('SWEET RUSH', canvasW / 2, gy + gh + 13);

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(gx - 2, gy - 2, gw + 4, gh + 4);

    if (sweetRush) {
      const frac = sweetRushTimer / 7.0;
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

    ctx.strokeStyle = '#FFAE00';
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, gw, gh);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i < maxStreak; i++) {
      const nx = gx + (gw / maxStreak) * i;
      ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy + gh); ctx.stroke();
    }

    ctx.textAlign = 'left';
    ctx.restore();
  }

  return { drawHearts, drawMushroomStatus, drawScore, drawSweetRushGauge };
})();
