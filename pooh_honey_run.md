# Pooh's Honey Run — Game Design Document & Technical Specification

## 1. Executive Summary & Game Vision
**Pooh's Honey Run** is a vibrant, retro-styled 2D pixel auto-runner web application. Players guide Winnie the Pooh through the Hundred Acre Wood, jumping between multi-tiered tree platforms, dodging buzzing bees and environmental hazards, and collecting sweet honey pots to achieve the highest score and reach the picnic celebration at the finish line.

Built with **HTML5 Canvas and Vanilla JavaScript**, the game requires **zero external build tools or heavy dependencies**, making it lightweight, performant at 60 FPS, and effortlessly deployable to **GitHub Pages** and **Vercel**.

---

## 2. Core Gameplay Mechanics & Controls

### 2.1 Movement & Auto-Runner Dynamics
* **Horizontal Motion:** Pooh runs continuously to the right at an initial base speed of 240 px/s. Speed scales up by 5% every 500 meters traveled.
* **Camera System:** Fixed horizontal offset camera where Pooh stays in the left-third (25%) of the canvas viewport while the world, platforms, and obstacles scroll past.

### 2.2 Variable Jump Physics & Multi-Tier Platforms
* **Variable Jump Height:** 
  * **Short Tap (< 150ms):** Executes a low hop ($v_y = -350\text{ px/s}$) to dodge ground bees and small obstacles.
  * **Long Press / Hold (150ms – 350ms):** Continuous upward boost up to max jump apex ($v_y = -520\text{ px/s}$) to reach Tier 2 and Tier 3 branch platforms.
* **Multi-Tiered Platforms (3 Floors):**
  * **Floor 1 (Meadow Ground):** $y = 80\%$ viewport height.
  * **Floor 2 (Low Canopy Branches):** $y = 55\%$ viewport height.
  * **Floor 3 (High Tree Boughs):** $y = 30\%$ viewport height.
* **Drop-Down Mechanic:** Pressing `Down Arrow` / `S` or swiping downward while running on elevated platforms (Floor 2 or 3) allows Pooh to drop down through the one-way branch to the platform below.

### 2.3 Health, Lives & Damage
* **Honey Hearts System:** Pooh starts with **3 Honey Hearts**.
* **Hazard Impact:** Colliding with a bee or hazard consumes 1 Honey Heart, causes a slight bump-back, and grants **1.5 seconds of invincibility** with a blinking sprite effect.
* **Game Over:** Depleting all 3 hearts ends the run, displaying the final score, distance traveled, and a quick restart button (`Spacebar` or screen tap).

### 2.4 Collectibles, Scoring & Power-Ups
| Item | Visual Description | Points / Effect |
| :--- | :--- | :--- |
| **Honey Pot (Huny Jar)** | Purple clay jar brimming with golden honey | +100 pts |
| **Golden Honeycomb** | Rare glowing hexagonal comb | +300 pts & Restores +1 Honey Heart |
| **Sweet Rush Frenzy** | Collected after 5 consecutive honey pots | 5 seconds of 1.5x speed, invincibility, rainbow trail |

---

## 3. Visual Assets & Sprite Rendering

### 3.1 Player Character Asset
* **Asset File:** `assets/pooh.png`
* **Base Native Resolution:** 32 × 32 px
* **Render Scaling:** 2.5x to 3x (rendered at 80×80 px or 96×96 px on canvas)
* **Collision Hitbox (AABB):** Inset by 4px on all sides (effective hitbox: 24×24 scaled) for forgiving gameplay.
* **Pixel Crispness:** `ctx.imageSmoothingEnabled = false` and CSS `image-rendering: pixelated`.

### 3.2 Visual Palette Reference
* **Pooh Fur Yellow:** `#FAB82C`
* **Pooh Shirt Red:** `#C82228`
* **Honey Pot Body:** `#8A52B5` / **Highlight:** `#BA85E0` / **Rim:** `#A0A0A0`
* **Golden Honey:** `#FFAE00`
* **Outlines / Detail:** `#000000`
* **Sky Blue:** `#70C5FF` / **Grass Green:** `#5BB948` / **Tree Bark:** `#8D5B3A`

### 3.3 Visual Layers & Parallax
1. **Background Layer 1 (0.1x speed):** Sky, sun, and slow-moving pixel clouds.
2. **Background Layer 2 (0.3x speed):** Distant rolling green hills and Hundred Acre Wood tree silhouettes.
3. **Midground Layer (0.6x speed):** Near oak tree trunks and hanging beehives.
4. **Gameplay Foreground (1.0x speed):** 3 platform floors, bees, honey pots, and Pooh.
5. **UI Layer (HUD - Static Overlay):** 3 Honey Heart icons (top-left), Score & Distance (top-right), Sweet Rush gauge (top-center).

---

## 4. Software Architecture & Technical Specifications

### 4.1 Project Directory Structure (Antigravity IDE Ready)

APP/
├── index.html          # Main HTML entry point, canvas setup, and UI overlay
├── style.css           # Retro fonts, pixel-perfect canvas scaling, HUD styles
├── js/
│   ├── game.js         # Main loop (requestAnimationFrame), state machine
│   ├── physics.js      # Jump velocity curve, gravity, delta-time calculation
│   ├── player.js       # Player class, assets/pooh.png renderer, input handler
│   ├── level.js        # Procedural platform generation, bee patrols, honey spawns
│   ├── audio.js        # Web Audio API synthesizer for instant sound effects
│   └── ui.js           # Scoreboard, hearts renderer, start/game over screens
└── assets/
└── pooh.png        # 32x32 exported pixel art sprite

### 4.2 Web Audio API Procedural Sound Engine
Zero external audio files required. All sound effects are synthesized dynamically:
* **Jump Sound:** Short ascending frequency chirp (triangle wave from 220Hz to 660Hz over 0.15s).
* **Honey Collection:** High-frequency chime (sine wave 587Hz -> 880Hz).
* **Bee Sting / Damage:** Low crunch burst (sawtooth wave 120Hz with rapid decay).
* **Power-Up / Sweet Rush:** Arpeggiated pentatonic fanfare.

### 4.3 Sprite Loader & Collision Detection
```javascript
// Player Rendering (js/player.js)
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.scale = 2.5;
    this.sprite = new Image();
    this.sprite.src = 'assets/pooh.png';
    this.isLoaded = false;
    this.sprite.onload = () => { this.isLoaded = true; };
  }

  draw(ctx) {
    if (!this.isLoaded) return;
    ctx.drawImage(
      this.sprite,
      Math.floor(this.x),
      Math.floor(this.y),
      this.width * this.scale,
      this.height * this.scale
    );
  }
}

// AABB Collision with Inset Hitbox (js/physics.js)
function checkCollision(rect1, rect2) {
  const inset = 6;
  return (
    rect1.x + inset < rect2.x + rect2.width - inset &&
    rect1.x + rect1.width - inset > rect2.x + inset &&
    rect1.y + inset < rect2.y + rect2.height - inset &&
    rect1.y + rect1.height - inset > rect2.y + inset
  );
}

5. Antigravity (AG) IDE Step-by-Step Build Plan
Milestone 1 — Viewport & Game Loop: Configure index.html with an 800×450 native canvas, responsive CSS container, crisp pixel styling, and standard 60 FPS update/render loops.

Milestone 2 — Player Asset & Physics: Load assets/pooh.png inside player.js. Implement tap-to-short-jump, hold-to-high-jump, and drop-down mechanics on the 3 floor tiers.

Milestone 3 — Level Spawner & Hazards: Generate continuous scrolling platforms, hovering sinusoidal bees, and floating honey pot items.

Milestone 4 — Health, HUD & Audio: Connect the 3 Honey Hearts life system, score counters, damage blinking, and Web Audio API synthesized sound effects.

Milestone 5 — Polish & Parallax: Add multi-layer background parallax scrolling, Sweet Rush particle effects, and touch controls for mobile play.

6. Deployment Guide (GitHub Pages & Vercel)
Option A: GitHub Pages
Initialize git repository in project root:

Bash
git init
git add .
git commit -m "feat: complete pooh honey run game"
Create a remote GitHub repository and push:

Bash
git remote add origin [https://github.com/](https://github.com/)<your-username>/pooh-honey-run.git
git branch -M main
git push -u origin main
In GitHub repo settings: Navigate to Settings > Pages > Select main branch and /root > Click Save.

Option B: Vercel Deployment
Log in to vercel.com and click Add New Project.

Select your pooh-honey-run repository.

Keep default settings (Framework: Other, Root: ./) and click Deploy.