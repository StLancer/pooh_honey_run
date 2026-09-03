/**
 * level3.js — Level 3: Hard Mode (Restructured without Springboards)
 */

function buildLevel3(level, canvasW, canvasH, groundY) {
  level.mapWidth = 13700; // balanced distance to boss arena and Pooh's home

  // 1. Continuous Solid Ground Base
  level.groundPlatform = new Platform(-100, 0, canvasH, level.mapWidth + 500);
  level.groundPlatform.y = groundY;
  level.groundPlatform.worldX = -100;
  level.groundPlatform.active = true;

  // 2. Start Flag
  level.startFlag = new StartFlag(50, groundY);

  const platF2 = canvasH * 0.55 - 18;
  const platF3 = canvasH * 0.30 - 18;

  // ═════════════════════════════════════════════════════════════
  // ZONE 1: The Flooded Forest (x: 0 – 3,500)
  // Floor 1 is completely flooded. Must use Floor 2 & 3.
  // ═════════════════════════════════════════════════════════════
  // Continuous river from x:350 to x:3500
  level.waters.push(new WaterHazard(350, 3150, groundY, canvasH, null, '⚠️ DANGEROUS RIVER ⚠️'));
  
  // Sea Monsters in the river (Decoration only)
  level.seaMonsters.push(
    new SeaMonster(1000, groundY),
    new SeaMonster(2200, groundY)
  );

  // Floor 2 & 3 alternating platforms
  level.platforms.push(
    new Platform(350, 1, canvasH, 950),     // Long F2 (ends at 1300)
    new Platform(1000, 2, canvasH, 600),    // Short F3 stepping stone (1000 to 1600)
    new Platform(1400, 1, canvasH, 400),    // Short F2 (ends at 1800)
    new Platform(1600, 2, canvasH, 900),    // Long F3 (ends at 2500)
    new Platform(2300, 1, canvasH, 500),    // F2 stepping stone to drop down safely
    new Platform(2600, 1, canvasH, 900)     // Long F2 (ends at 3500)
  );

  level.collectibles.push(
    new HoneyPot(800, platF2),
    new HoneyPot(1800, platF3),
    new HeartItem(2900, platF2)
  );

  // Increased tiger density on upper platforms to compensate for river
  level.bees.push(
    new Bee(600, platF2 - 60, 30, 3.8),
    new Bee(1000, platF2 - 60, 40, 4.2),
    new Tiger(1100, platF3, 1050, 500), // New tiger on F3
    new Tiger(1500, platF2, 1400, 400), // New tiger on F2
    new Bee(1700, platF3 - 50, 35, 4.0),
    new Tiger(2100, platF3, 1700, 700), // New tiger on F3
    new Bee(2200, platF3 - 50, 45, 4.5),
    new Tiger(2700, platF2, 2600, 800),
    new Tiger(3100, platF2, 2800, 600)  // New tiger on F2
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 2: The Lava Trenches & The Key (x: 3,500 – 7,000)
  // Floor 1 is guarded by fast Tigers. Floor 3 has fragmented lava traps.
  // ═════════════════════════════════════════════════════════════
  // Fragmented Lava blocks above Floor 2 (Shortened horizontal length: single compact blocks)
  level.lavas.push(
    new LavaHazard(3900, 70, platF3, canvasH, 50, ''),
    new LavaHazard(4500, 70, platF3, canvasH, 50, ''),
    new LavaHazard(5300, 70, platF3, canvasH, 50, ''),
    // Challenge: 2 compact short blocks of lava on Floor 3 flanking the Key platform
    new LavaHazard(5990, 45, platF3, canvasH, 40, '⚠️ LAVA'),
    new LavaHazard(6245, 45, platF3, canvasH, 40, '⚠️ LAVA')
  );

  level.platforms.push(
    new Platform(3800, 1, canvasH, 400),
    new Platform(4400, 1, canvasH, 600),
    new Platform(5200, 1, canvasH, 500),
    new Platform(5850, 1, canvasH, 650), // Floor 2 walkway under Key challenge
    new Platform(6050, 2, canvasH, 180), // Floor 3 platform comfortably accessible between 2 short lava blocks
    new Platform(6500, 1, canvasH, 500)
  );

  // THE KEY — Positioned on Floor 3 between 2 short lava blocks (jump in to get and jump out)
  level.collectibles.push(
    new KeyItem(6125, platF3),
    new HoneyPot(4500, platF2),
    new HoneyPot(5300, groundY),
    new HeartItem(6600, groundY)
  );

  // Heavy ground tiger density
  level.bees.push(
    new Tiger(3850, groundY, 3600, 600),
    new Tiger(4200, groundY, 4000, 500),
    new Tiger(4800, groundY, 4500, 600),
    new Tiger(5250, groundY, 5200, 500),
    new Bee(4700, platF2 - 60, 30, 4.2),
    new Tiger(6550, groundY, 6500, 500)
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 3: The Dark Labyrinth (x: 7,000 – 10,600)
  // Fog Zone. Floor 2 has fragmented Lava. Gate & Easter Egg on Floor 1.
  // ═════════════════════════════════════════════════════════════
  level.fogZones.push(new FogZone(7000, 3600));

  // Fragmented Lava on Floor 2 path (Shortened single compact blocks)
  level.lavas.push(
    new LavaHazard(7300, 70, platF2, canvasH, 40, ''),
    new LavaHazard(7800, 70, platF2, canvasH, 40, ''),
    new LavaHazard(8500, 70, platF2, canvasH, 40, '')
  );

  // Floor 1 Gaps (River)
  level.waters.push(
    new WaterHazard(7600, 600, groundY, canvasH, null, ''),
    new WaterHazard(8600, 600, groundY, canvasH, null, '')
  );

  level.platforms.push(
    // Floor 3 safe bypass path
    new Platform(7000, 1, canvasH, 400),  // F2 stepping stone to reach F3
    new Platform(7200, 2, canvasH, 800),
    new Platform(8300, 2, canvasH, 800),
    new Platform(9400, 2, canvasH, 1100), // Floor 3 bypass overhead ending at 10500
    new Platform(9300, 1, canvasH, 780)   // F2 roof from x:9300 to x:10080
  );

  // Secret Dungeon Chamber (Floor 1 under Floor 2 roof)
  // 1. Dungeon Door blocking player on the right-hand side of the wizard
  // Extends from lower horizontal line of Floor 2 to upper horizontal line of Floor 1 (Wider door: 115px)
  level.dungeonDoor = new DungeonDoor(9965, groundY, platF2 + 18, 115);
  level.lockedGate = level.dungeonDoor;

  // 2. Ancient Wizard inside chamber (to the left of the door)
  level.wizards.push(new Wizard(9750, groundY));

  // 3. Golden Easter Egg behind the wizard (to the left hand side of the wizard)
  level.easterEgg = new EasterEggItem(9480, groundY);
  level.collectibles.push(level.easterEgg);

  level.collectibles.push(
    new HoneyPot(7600, platF3),
    new HoneyPot(8700, platF3),
    new HeartItem(10250, platF3),
    new HoneyPot(10650, groundY),
    new HoneyPot(11150, groundY)
  );

  level.scenery.push(
    new DecorativeTree(10800, groundY, 100, 140),
    new DecorativeTree(11300, groundY, 100, 140)
  );

  level.bees.push(
    new Bee(7600, platF3 - 50, 40, 4.0),
    new Bee(8700, platF3 - 50, 40, 4.0),
    new Bee(10000, platF3 - 50, 45, 4.5),
    new Tiger(10250, groundY, 10120, 300), // Guarding the dungeon door entrance outside
    new Bee(10950, groundY - 120, 40, 4.0)
  );

  // ═════════════════════════════════════════════════════════════
  // ZONE 4: Joker Boss Arena (x: 11,600 – 12,650)
  // Empty field for 1v1 battle, positioned at satisfying walking distance
  // ═════════════════════════════════════════════════════════════
  level.jokerBoss = new JokerBoss(12400, groundY);
  level.bees.push(level.jokerBoss);

  // ═════════════════════════════════════════════════════════════
  // ZONE 5: Goal Summit & Pooh's Home (x: 12,650 – 13,700)
  // Moderate distance after defeating the boss
  // ═════════════════════════════════════════════════════════════
  level.scenery.push(
    new DecorativeTree(12750, groundY, 110, 150),
    new DecorativeTree(12950, groundY - 60, 110, 150),
    new DecorativeTree(13200, groundY - 120, 110, 150)
  );

  level.platforms.push(
    new Platform(12950, 0, canvasH, 200, groundY - 60),
    new Platform(13200, 0, canvasH, 300, groundY - 120)
  );

  level.poohHome = new PoohHome(13350, groundY - 120);
}

