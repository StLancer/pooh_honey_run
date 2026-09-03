/**
 * level1.js — Level 1: Hundred Acre Wood (Easy)
 * Fully modular and independent definition for Level 1.
 */

function buildLevel1(level, canvasW, canvasH, groundY) {
  level.mapWidth = 7200;

  // 1. Solid Ground Platform
  level.groundPlatform = new Platform(-100, 0, canvasH, level.mapWidth + 500);
  level.groundPlatform.y = groundY;
  level.groundPlatform.worldX = -100;
  level.groundPlatform.active = true;

  // 2. Start Flag
  level.startFlag = new StartFlag(50, groundY);

  // ═════════════════════════════════════════════════════════════
  // ZONE 1: The Meadow & Branch Canopy (x: 0 – 1,800)
  // ═════════════════════════════════════════════════════════════
  const platF2 = canvasH * 0.55 - 18;

  level.platforms.push(
    new Platform(600,  1, canvasH, 240),
    new Platform(1000, 1, canvasH, 260),
    new Platform(1400, 1, canvasH, 260)
  );

  level.collectibles.push(
    new HoneyPot(680, platF2),
    new HoneyPot(880, groundY),
    new HoneyPot(1100, platF2),
    new HoneyPot(1320, groundY),
    new HeartItem(1480, platF2)
  );

  level.bees.push(
    new Bee(920, groundY - 70, 25, 1.6),
    new Bee(1360, groundY - 60, 20, 1.8)
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 2: Tiger Thicket & Floor 3 Secret Canopy (x: 1,800 – 3,600)
  // ═════════════════════════════════════════════════════════════
  level.springboards.push(new Springboard(1750, canvasH));

  level.platforms.push(
    new Platform(1900, 1, canvasH, 280),
    new Platform(2300, 1, canvasH, 280),
    new Platform(2650, 2, canvasH, 360), // SECRET FLOOR 3!
    new Platform(3100, 1, canvasH, 280),
    new Platform(3450, 1, canvasH, 260)
  );

  level.springboards.push(new Springboard(2500, canvasH * 0.55 + 12));

  level.collectibles.push(
    new HoneyPot(1980, platF2),
    new HoneyPot(2180, groundY),
    new HoneyPot(2380, platF2),
    new HoneyPot(2720, canvasH * 0.30 - 18),
    new HoneyPot(2950, canvasH * 0.30 - 18),
    new HoneyPot(3180, platF2),
    new HoneyPot(3380, groundY)
  );

  level.bees.push(
    new Tiger(1950, platF2, 1900, 280),
    new Tiger(2350, groundY, 2200, 300),
    new Tiger(3150, platF2, 3100, 280)
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 3: River Hazard & High Jump Gap (x: 3,600 – 4,850)
  // ═════════════════════════════════════════════════════════════
  level.water = new WaterHazard(4150, 710, groundY, canvasH);
  level.springboards.push(new Springboard(3750, canvasH));

  level.platforms.push(
    new Platform(3900, 2, canvasH, 300),
    new Platform(4150, 1, canvasH, 280),
    new Platform(4560, 1, canvasH, 300)
  );

  level.collectibles.push(
    new HeartItem(4050, canvasH * 0.30 - 18),
    new MushroomItem(4495, platF2 - 65), // Floating in gap
    new HoneyPot(3950, canvasH * 0.30 - 18),
    new HoneyPot(4250, platF2),
    new HoneyPot(4750, platF2)
  );

  level.bees.push(
    new Fireball(4380, 70),
    new Fireball(4640, 100),
    new Bee(4720, platF2 - 60, 25, 2.0)
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 4: Boss 1 Arena (x: 4,850 – 5,800)
  // ═════════════════════════════════════════════════════════════
  level.boss = new BossBee(5500, groundY);
  level.bees.push(level.boss);

  // ═════════════════════════════════════════════════════════════
  // ZONE 5: Victory Hill & Pooh's Home (x: 5,800 – 7,200)
  // ═════════════════════════════════════════════════════════════
  level.scenery.push(
    new DecorativeTree(5950, groundY, 110, 150),
    new DecorativeTree(6160, groundY, 110, 150),
    new DecorativeTree(6380, groundY - 60, 110, 150),
    new DecorativeTree(6560, groundY - 120, 110, 150),
    new DecorativeTree(6880, groundY - 180, 110, 150)
  );

  level.platforms.push(
    new Platform(6200, 1, canvasH, 180, groundY - 60),
    new Platform(6400, 1, canvasH, 180, groundY - 120),
    new Platform(6600, 1, canvasH, 320, groundY - 180)
  );

  level.poohHome = new PoohHome(6650, groundY - 180);
}
