# Pooh's Honey Run — Game Design Document & Technical Specification
**Version:** 5.0 (Completed Level 3 Inferno, Dedicated Inferno Background, Non-Lethal Hot Lava, Dangerous River, Dungeon Chamber Quest & Character Roster)  
**Target Environment:** HTML5 Canvas ($1100\times 620\text{ px}$), Vanilla JavaScript (ES6+), Web Audio API, Zero Dependencies  
**Deployment Target:** GitHub Pages & Vercel  

---

## 1. Executive Summary & Core Concept

**Pooh's Honey Run** is a retro 2D pixel platformer built with modular, component-based vanilla web technologies. Players select from a roster of heroes in a dedicated store, navigate an interactive level selector, inspect dynamic level briefings, and play through handcrafted stages featuring multi-tiered platforming, hazards, quest items, secret Easter Eggs, and multi-stage boss battles.

### Key Technical Pillars:
* **Zero Runtime Dependencies:** Pure HTML5 Canvas, Vanilla CSS3, and ES6+ JavaScript.
* **Procedural Sound Engine:** Pure Web Audio API synthesizes chiptune melodies (C-major meadow & D-minor inferno), sound effects (jumps, stomps, sirens, damage, doors, fanfare), and dynamic volume with fog audio cutoff.
* **Deterministic Physics:** 60 FPS physics engine with variable-height jumping, one-way platform drop-throughs, acceleration, friction, and knockback recoil.
* **State Persistence:** Local storage tracks high scores, accumulated coins, unlocked character roster, and current hero selection.

---

## 2. Controls & How to Play

### 2.1 Desktop Keyboard Controls
| Action | Primary Key | Secondary Key | Notes |
| :--- | :--- | :--- | :--- |
| **Move Left / Right** | `A` / `D` | `◄` / `►` (Arrow Keys) | Accelerates up to $180\text{ px/s}$ ($1.5\times$ during Sweet Rush) |
| **Jump** | `W` / `Space` | `▲` (Up Arrow) | Hold up to $350\text{ ms}$ for high jump (reaches Floor 2) |
| **Drop Down** | `S` | `▼` (Down Arrow) | Drops down through elevated Floor 2/3 platforms |
| **Release Mega Mode** | `R` | — | Activates Mega Mode when Mega Mushroom is in inventory |
| **Open Dungeon Door** | `K` | Mouse Click | Unlocks Ancient Door when holding the Secret Key |
| **Claim Easter Egg** | `P` (Hold 2.0s) | — | Hold `P` for 2 seconds near the egg after Wizard dialogue |
| **Pause / Resume** | `P` / `Space` | Click Pause Button | Opens pause menu with BGM volume slider |

### 2.2 Mobile & Touch Controls
* **Tap Upper Screen:** Jump (or activate Mega Mushroom if held).
* **Tap / Hold Left Side:** Move left.
* **Tap / Hold Right Side:** Move right.
* **Tap Bottom Center:** Drop down through platforms.
* **Tap On-Screen Doors:** Opens doors if Secret Key is held.

---

## 3. Character Roster & Dedicated Store

Heroes are unlocked in the store using coins earned from collecting honey pots, giant honey rewards, and secret Easter Eggs.

| Character Name | Asset Filename | Unlock Cost | Display Dimensions | Special Role & Description |
| :--- | :--- | :--- | :--- | :--- |
| **Pooh** | `assets/pooh.png` | **Free (Default)** | $64\times 64\text{ px}$ Store / $56\times 56\text{ px}$ Menu | The classic honey-loving bear and balanced hero. |
| **Goku** | `assets/Goku.png` | **Free** | $64\times 64\text{ px}$ Store / $56\times 56\text{ px}$ Menu | Super Saiyan martial artist ready for battle. |
| **Powerpuff Girls** | `assets/Powerpuff Girls.png` | **Free** | $64\times 64\text{ px}$ Store / $56\times 56\text{ px}$ Menu | The heroic trio from Townsville. |
| **Capybara** | `assets/capybara.png` | 1,000 💰 | $64\times 64\text{ px}$ Store / $56\times 56\text{ px}$ Menu | Zen master of the wood, chill under pressure. |
| **Batman** | `assets/batman.png` | 5,000 💰 | $64\times 64\text{ px}$ Store / $56\times 56\text{ px}$ Menu | The Dark Knight of Gotham platforming. |

---

## 4. Enemies, Hazards & Collectibles

### 4.1 Enemies & Bosses
| Entity | Asset Filename | Size ($W\times H$) | Movement & Attack Pattern | Elimination Method |
| :--- | :--- | :--- | :--- | :--- |
| **Bee** | `assets/bee.png` | $53\times 53\text{ px}$ | Sinusoidal vertical patrol ($v_y = \pm 20-45\text{ px}$, speed $1.6 - 4.5$). | 1 Head Stomp or Mega Mode smash. |
| **Tiger** | `assets/tiger.png` | $66\times 66\text{ px}$ | Horizontal platform patrol ($v_x = 50\text{ px/s}$), flips at platform edges. | 1 Head Stomp or Mega Mode smash. |
| **Fireball** | `assets/fireball.png` | $100\times 100\text{ px}$ | Vertical falling hazard ($v_y = 60-100\text{ px/s}$). | Dodge (destructible in Mega Mode). |
| **BossBee (Boss 1)** | `assets/boss1.png` | $372\times 372\text{ px}$ | Massive static boss, purple aura, 3 HP, siren warning. | 3 Mega Mode body impacts. Drops Giant Honey. |
| **JokerBoss (Boss 3)**| `assets/joker.png` | $110\times 110\text{ px}$ | Final boss, red aura, 3 HP, fires Red Balloons every 1.8s. | 3 Head Stomps. |
| **Red Balloon** | `assets/RedBalloon.png` | $66\times 66\text{ px}$ | Projectile fired by Joker ($v_x = -320\text{ px/s}$). | 1 Head Stomp or dodge. |
| **Sea Monster** | `assets/SeaMonster.png` | $165\times 165\text{ px}$ | Partially submerged decorative river dweller ($y\text{-bob}$). | Environmental decoration. |

### 4.2 Environmental Hazards
| Hazard | Dimensions / Visuals | Gameplay Mechanics | Level Presence |
| :--- | :--- | :--- | :--- |
| **Dangerous River** | Blue gradient with animated foam waves | **Instant Game Over** on contact. Ground is completely removed. | Level 1 ($x=4,150$), Level 3 ($x=350-3,500$) |
| **Hot Lava** | Molten red/yellow bubbling magma fissure | **Non-Lethal:** Deducts 1 Heart, triggers upward recoil bounce ($v_y = -340$) & 3.0s invincibility. | Level 3 (Floor 2 & 3) |
| **Crumbling Platform** | Leafy bark platform with shake animation | Shakes upon landing and drops after $0.8\text{ seconds}$. | Level 3 (Zone 4) |
| **Pitch-Black Fog** | Radial spotlight mask ($185\text{ px}$) | Heavy visibility reduction; background music cuts off until exit. | Level 3 ($x=7,000-10,600$) |

### 4.3 Collectibles & Quest Items
| Item | Asset Filename | Dimensions | Value / Effect |
| :--- | :--- | :--- | :--- |
| **Honey Pot** | `assets/honey.png` | $60\times 60\text{ px}$ | $+10\text{ PTS}$ & $+10\text{ Coins}$. 5 streak triggers **Sweet Rush** (7s golden invincibility & $1.5\times$ speed). |
| **Giant Honey Pot** | `assets/honey.png` | $180\times 180\text{ px}$ | $+100\text{ PTS}$ & $+100\text{ Coins}$. Boss 1 defeat reward. |
| **Heart** | `assets/heart.png` | $48\times 48\text{ px}$ | $+1\text{ Heart}$ (Max 3). Restores health. |
| **Mega Mushroom** | `assets/mushroom.png` | $52\times 52\text{ px}$ | Power-up stored in inventory. Press `R` for Mega Mode (3.86x scale, smash platforms/bosses). |
| **Secret Key** | `assets/key.png` | $44\times 44\text{ px}$ | Quest item. Unlocks the Ancient Dungeon Door in Level 3. |
| **Golden Easter Egg**| `assets/EasterEgg.png` | $38\times 42\text{ px}$ | Hidden behind Wizard in Level 3. Hold `P` for 2.0s to claim $+10,000\text{ PTS}$ and $+1,000\text{ Coins}$! |

---

## 5. Component-Based Architecture

The codebase cleanly separates mathematical physics, audio synthesis, entity structures, UI rendering, level geometry, and game state logic:

```
c:/Users/cjiaz/OneDrive/Documents/Antigravity/APP/
├── index.html            # Screen containers, HUD modals, script load hierarchy
├── style.css             # Pixel styles, modal overlays, responsive canvas wrap
├── pooh_honey_run.md     # Master Game Design Document & AI Technical Specification
├── README.md             # Public-facing GitHub repository documentation
├── assets/               # 27 sprite assets (Pooh, Goku, Bosses, Wizard, etc.)
└── js/
    ├── physics.js        # Pure physical math (GRAVITY, JUMP_VY, AABB, platform collision)
    ├── audio.js          # Web Audio synthesizer, SFX, 2-channel chiptune BGM scheduler
    ├── player.js         # Player entity, movement, animations, hearts & inventory
    ├── ui.js             # Parallax background (Meadow & Inferno) + HUD renderer
    ├── game.js           # Main state machine, game loop, camera, collisions, fog & dialogue
    ├── level.js          # Universal entity classes & dynamic Level loader
    └── levels/
        ├── level_data.js # Master metadata registry (LEVEL_CONFIGS) for levels 1, 2, and 3
        ├── level1.js     # Level 1 geometry (7,200 px), Boss 1 layout
        ├── level2.js     # Level 2 geometry (6,800 px, Tiger's Mountain preview)
        └── level3.js     # Level 3 geometry (13,700 px, Inferno, Dangerous River, Key, Wizard, Joker)
```

---

## 6. Level Specifications

### 6.1 Level 1: Hundred Acre Wood (🟢 Difficulty: Easy, Unlocked)
* **Map Length:** $7,200\text{ px}$
* **Theme:** Sunny Meadow, Secret Canopy, River Crossing & Boss 1
* **Objective:** Collect points, cross the river, defeat Boss 1 using Mega Mode, and reach Pooh's Home safely!
* **Zones:**
  1. **Meadow Walk ($x = 0 - 1,800$):** Intro walk, spaced single honey pots, patrol bees.
  2. **Tiger Thicket & Floor 3 ($x = 1,800 - 3,600$):** Springboards to secret Floor 3 high canopy.
  3. **River Hazard & High Jump ($x = 3,600 - 4,850$):** Deep river on Floor 1 ($x = 4,150 - 4,860$), floating Mega Mushroom ($x = 4,495$), falling fireballs.
  4. **Boss 1 Arena ($x = 4,850 - 5,800$):** Boss Time siren, static Boss 1 (3 HP) defeated via Mega Mode.
  5. **Victory Hill ($x = 5,800 - 7,200$):** Giant Honey Pot reward, stepped grassy hill to Pooh's Home ($220\times 220\text{ px}$).

### 6.2 Level 2: Tiger's Mountain (🟡 Difficulty: Medium, 🔒 Locked)
* **Map Length:** $6,800\text{ px}$
* **Theme:** Vertical Mountain Cliffs, Pouncing Tigers & High Timber Bridge
* **Status:** Under construction in Level Select. Template geometry established in `level2.js`.

### 6.3 Level 3: Fiery Skies & Forest Inferno (🔴 Difficulty: Hard, Unlocked)
* **Map Length:** $13,700\text{ px}$
* **Atmosphere & Theme:** Dedicated Inferno background with midnight ash/crimson sky, Blood Moon corona, dark volcanic mountain peaks, charred trees, and smoldering ember bedrock.
* **Mission Objective:** Traverse the flooded forest, find the Key on Floor 3, navigate the dark fog, unlock the Dungeon Door, talk to the Wizard, claim the Easter Egg, and defeat Joker!
* **Zones:**
  1. **Zone 1: The Flooded Forest ($x = 0 - 3,500\text{ px}$):**
     * Floor 1 is completely flooded by `⚠️ DANGEROUS RIVER ⚠️` ($x = 350 - 3,500\text{ px}$, instant death).
     * Sea Monsters swim submerged. Players must navigate alternating Floor 2 & 3 platforms.
     * High density of fast Bees and canopy Tigers.
  2. **Zone 2: Lava Trenches & The Key ($x = 3,500 - 7,000\text{ px}$):**
     * Ground Floor 1 patrolled by fast Tigers.
     * Compact Hot Lava fissure blocks on Floor 3 (deducts 1 Heart, upward recoil bounce).
     * **The Secret Key ($x = 6,125\text{ px}$):** Located on Floor 3 between two lava blocks.
  3. **Zone 3: The Dark Labyrinth & Ancient Chamber ($x = 7,000 - 10,600\text{ px}$):**
     * Early Warning Banner at $x = 6,300\text{ px}$.
     * Pitch-black fog of war ($x = 7,000 - 10,600\text{ px}$) with radial spotlight and atmospheric BGM cutoff.
     * **Dungeon Door ($x = 9,965\text{ px}$):** Solid barrier requiring Secret Key. Unlocked via `[K]`.
     * **Ancient Wizard ($x = 9,750\text{ px}$):** Glowing NPC with voice laughter; touching triggers dialogue.
     * **Golden Easter Egg ($x = 9,480\text{ px}$):** Revealed behind Wizard. Hold `[P]` for 2.0s to claim $+10,000\text{ PTS}$ & $+1,000\text{ Coins}$.
  4. **Zone 4: Joker Final Boss Arena ($x = 11,600 - 12,650\text{ px}$):**
     * Thunderstorm lightning and "JOKER TIME!" arcade siren.
     * Joker (3 HP) fires fast Red Balloons ($v_x = -320\text{ px/s}$).
     * Stomp balloons to pop; stomp Joker's head 3 times to defeat!
  5. **Zone 5: Goal Summit & Pooh's Home ($x = 12,650 - 13,700\text{ px}$):**
     * Stepped hill and trees leading to Pooh's Home at $x = 13,350\text{ px}$ for Stage Clear!

---

## 7. Future Development Roadmap

### 7.1 Incoming Level Design
1. **Level 2: Tiger's Mountain (Release):**
   * Complete vertical climbing ropes, vines, and rock wall ledges.
   * Rockfall hazards (falling boulders rolling down slopes).
   * Alpha Tiger Boss with dynamic leaping arcs across mountain peaks.
2. **Level 4: Heffalump & Woozle Dreamscape:**
   * Psychedelic dream forest with swirling rainbow nebula background.
   * Inverted gravity zones (walk on ceiling branches).
   * Floating honey bubbles that act as bouncy stepping stones.
3. **Level 5: Pooh's Stormy Night (Weather Engine):**
   * Heavy dynamic rain and dynamic water level that slowly rises, forcing vertical progression.
   * Wind gusts pushing the player horizontally in mid-air.

### 7.2 Future Features & Play Styles
* **Time Attack Mode:** On-screen speedrun timer with bronze/silver/gold target times.
* **Character Ability Differentiation:**
  * Goku: Instant ki-dash double jump.
  * Batman: Grappling hook to latch onto upper floor ceilings.
  * Powerpuff Girls: Glide/float jump mechanics.
  * Capybara: Passive damage reduction (50% knockback recovery).
* **Level Editor / Custom Sandbox:** In-browser visual editor to place platforms, bees, honey pots, and export level JSON.
* **Local 2-Player Co-op / Versus Race:** Split-screen or shared-screen multiplayer race to Pooh's Home.
* **Audio Soundtrack Player:** Menu Jukebox to listen to C-major, D-minor, and victory synthesizers.