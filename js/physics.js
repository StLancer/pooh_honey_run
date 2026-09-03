/**
 * physics.js — Jump physics, gravity, AABB collision, movement constants
 */

const Physics = (() => {
  const GRAVITY = 900;   // px/s²
  const JUMP_VY = -373;  // px/s — short tap reaches ~77px (clears bee 53px, CAN'T reach Floor 2 at ~173px)
  // full hold (350ms) reaches exactly ~173px (Floor 2 on 1100×620 canvas)
  const HOLD_GRAVITY_MULT = 0.18;  // 20% gravity while holding jump
  const HOLD_MAX_MS = 350;   // ms max hold
  const SPRING_VY = -770;  // px/s springboard (launches straight to Floor 3)
  const MAX_FALL_SPD = 900;   // px/s terminal velocity

  // Horizontal movement — deliberately slower/heavier for platformer feel
  const MOVE_SPEED = 180;  // px/s max walk speed
  const ACCELERATION = 700;  // px/s² acceleration
  const FRICTION = 900;  // px/s² deceleration when no key held

  function applyGravity(vy, dt, mult = 1.0) {
    return Math.min(vy + GRAVITY * mult * dt, MAX_FALL_SPD);
  }

  function aabb(a, b, inset = 0) {
    return (
      a.x + inset < b.x + b.width - inset &&
      a.x + a.width - inset > b.x + inset &&
      a.y + inset < b.y + b.height - inset &&
      a.y + a.height - inset > b.y + inset
    );
  }

  function platformCollision(entity, plat, prevBottom) {
    const eLeft = entity.x + 6;
    const eRight = entity.x + entity.width - 6;
    const eBottom = entity.y + entity.height;
    const pTop = plat.y;

    return (
      eRight > plat.x &&
      eLeft < plat.x + plat.width &&
      prevBottom <= pTop + 14 &&
      eBottom >= pTop &&
      entity.vy >= 0
    );
  }

  return {
    GRAVITY, JUMP_VY, HOLD_GRAVITY_MULT, HOLD_MAX_MS, SPRING_VY, MAX_FALL_SPD,
    MOVE_SPEED, ACCELERATION, FRICTION,
    applyGravity, aabb, platformCollision
  };
})();
