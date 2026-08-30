/**
 * physics.js — Jump physics, gravity, AABB collision
 *
 * ── GAME MEASUREMENT SYSTEM ─────────────────────────────────
 * 1 Game Unit (GU) = 8 canvas pixels
 *
 * Sprites (canvas: 800×450):
 *   Pooh        10 GU × 10 GU = 80 × 80 px
 *   Bee          8 GU ×  7 GU = 64 × 56 px  (≈70% of Pooh height)
 *   Honey Pot    5.5 × 6.75 GU = 44 × 54 px
 *
 * Floor Y positions (player TOP of sprite):
 *   Floor 1 (Ground):  y = 450×0.80 − 80 = 280 px  (bottom = 360)
 *   Floor 2 (Canopy):  y = 450×0.55 − 80 = 168 px  (bottom ≈ 248)
 *   Floor 3 (Boughs):  y = 450×0.30 − 80 =  55 px
 *   Rise needed (1→2):  ≈ 130 px
 *   Rise needed (2→3):  ≈ 113 px
 *
 * Jump physics (GRAVITY = 900 px/s²):
 *   Short hop  (tap, no hold):  vy = −350, max h ≈ 68 px  → clears Bee (56 px) ✓
 *   Long hold  (≥250ms hold):   reduced gravity (25%) active → max h ≈ 130 px → reaches Floor 2 ✓
 *   Springboard (step-on):       vy = −490, max h ≈ 133 px → reaches Floor 2 guaranteed ✓
 * ─────────────────────────────────────────────────────────────
 *
 * Jump model: "Short press = short hop; Hold = float higher"
 *   - On press: vy = JUMP_VY immediately (−350)
 *   - While holding (vy < 0 and held < HOLD_MAX_MS): gravity is reduced to 25%
 *     so Pooh floats upward much further — reaching Floor 2 on a full hold.
 *   - On release: full gravity resumes immediately.
 */

const Physics = (() => {
  const GRAVITY          = 900;   // px/s²  (normal falling speed)
  const JUMP_VY          = -380;  // px/s   initial upward velocity on any jump press (higher base)
  const HOLD_GRAVITY_MULT = 0.20; // gravity multiplier while hold button is pressed
  const HOLD_MAX_MS      = 350;   // ms — max hold duration for reduced gravity boost (longer float)
  const SPRING_VY        = -550;  // px/s   springboard launch (guarantees reaching floor 2/3)
  const MAX_FALL_SPD     = 900;   // px/s   terminal velocity

  /**
   * Apply gravity with optional multiplier (for hold-jump boost).
   * @param {number} vy     - current vertical velocity
   * @param {number} dt     - delta time in seconds
   * @param {number} mult   - gravity multiplier (1.0 = full, 0.25 = float)
   */
  function applyGravity(vy, dt, mult = 1.0) {
    return Math.min(vy + GRAVITY * mult * dt, MAX_FALL_SPD);
  }

  /**
   * AABB collision check with optional inset.
   */
  function aabb(a, b, inset = 0) {
    return (
      a.x + inset           < b.x + b.width  - inset &&
      a.x + a.width - inset > b.x            + inset &&
      a.y + inset           < b.y + b.height - inset &&
      a.y + a.height - inset > b.y           + inset
    );
  }

  /**
   * One-way platform: only resolves when falling onto top.
   */
  function platformCollision(entity, plat, prevBottom) {
    const eLeft   = entity.x + 6;
    const eRight  = entity.x + entity.width - 6;
    const eBottom = entity.y + entity.height;
    const pTop    = plat.y;

    return (
      eRight > plat.x &&
      eLeft  < plat.x + plat.width &&
      prevBottom <= pTop + 4 &&
      eBottom    >= pTop &&
      entity.vy  >= 0
    );
  }

  return {
    GRAVITY, JUMP_VY, HOLD_GRAVITY_MULT, HOLD_MAX_MS, SPRING_VY, MAX_FALL_SPD,
    applyGravity, aabb, platformCollision
  };
})();
