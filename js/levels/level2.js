/**
 * level2.js — Level 2: Tiger's Mountain (Medium)
 * Modular level template for Level 2.
 */

function buildLevel2(level, canvasW, canvasH, groundY) {
  level.mapWidth = 6800;

  // 1. Solid Ground Platform
  level.groundPlatform = new Platform(-100, 0, canvasH, level.mapWidth + 500);
  level.groundPlatform.y = groundY;
  level.groundPlatform.worldX = -100;
  level.groundPlatform.active = true;

  // 2. Start Flag
  level.startFlag = new StartFlag(50, groundY);

  const platF2 = canvasH * 0.55 - 18;
  const platF3 = canvasH * 0.30 - 18;

  // Mountain Slopes & Platforms
  level.platforms.push(
    new Platform(500,  1, canvasH, 220),
    new Platform(850,  2, canvasH, 260),
    new Platform(1250, 1, canvasH, 240),
    new Platform(1650, 2, canvasH, 280),
    new Platform(2100, 1, canvasH, 300),
    new Platform(2550, 2, canvasH, 320),
    new Platform(3000, 1, canvasH, 260),
    new Platform(3400, 2, canvasH, 280),
    new Platform(3850, 1, canvasH, 300),
    new Platform(4300, 2, canvasH, 320)
  );

  level.springboards.push(
    new Springboard(1150, canvasH),
    new Springboard(2400, canvasH),
    new Springboard(3700, canvasH)
  );

  level.collectibles.push(
    new HoneyPot(580, platF2),
    new HoneyPot(920, platF3),
    new HoneyPot(1320, platF2),
    new HeartItem(1720, platF3),
    new HoneyPot(2180, platF2),
    new HoneyPot(2620, platF3),
    new MushroomItem(3480, platF3),
    new HoneyPot(3920, platF2),
    new HoneyPot(4380, platF3)
  );

  level.bees.push(
    new Tiger(800, groundY, 700, 300),
    new Tiger(1600, groundY, 1500, 320),
    new Bee(2150, platF2 - 50, 25, 1.8),
    new Tiger(2950, groundY, 2800, 350),
    new Bee(3450, platF3 - 50, 25, 2.0),
    new Tiger(3800, platF2, 3750, 300)
  );

  // Mountain Summit & Boss
  level.boss = new BossBee(5300, groundY);
  level.bees.push(level.boss);

  level.scenery.push(
    new DecorativeTree(5800, groundY, 110, 150),
    new DecorativeTree(6050, groundY - 60, 110, 150),
    new DecorativeTree(6300, groundY - 120, 110, 150)
  );

  level.platforms.push(
    new Platform(5950, 1, canvasH, 180, groundY - 60),
    new Platform(6150, 1, canvasH, 180, groundY - 120),
    new Platform(6350, 1, canvasH, 320, groundY - 180)
  );

  level.poohHome = new PoohHome(6400, groundY - 180);
}
