/**
 * level_data.js — Metadata Registry for All Game Levels
 * Modular, independent configuration for Level 1, Level 2, and Level 3.
 */

const LEVEL_CONFIGS = {
  1: {
    id: 1,
    name: "Hundred Acre Wood",
    icon: "🌲",
    difficulty: "EASY",
    difficultyBadge: "🟢 EASY",
    theme: "Sunny Meadow, Secret Canopy, River Crossing & Boss 1",
    mission: "🎯 Collect 100 points, cross the river, defeat Boss 1 & get home safely!",
    tip: "Floor 1 near the Boss has water! Jump up to Floor 2 to cross safely.",
    color: "#4CAF50",
    shadowColor: "#1B5E20",
    unlocked: true,
    mapWidth: 7200,
    hasMegaMode: true,
    bossType: 'bee_boss'
  },
  2: {
    id: 2,
    name: "Tiger's Mountain",
    icon: "🐯",
    difficulty: "MEDIUM",
    difficultyBadge: "🟡 MEDIUM",
    theme: "Vertical Cliffs, Pouncing Tigers & High Timber Bridge",
    mission: "🎯 Scale the high mountain cliffs and defeat the Alpha Tiger!",
    tip: "Timing is everything: wait for tigers to turn around before jumping.",
    color: "#FF9800",
    shadowColor: "#E65100",
    unlocked: false,
    mapWidth: 6800,
    hasMegaMode: true,
    bossType: 'tiger_boss'
  },
  3: {
    id: 3,
    name: "Fiery Skies & Forest Inferno",
    icon: "🔥",
    difficulty: "HARD",
    difficultyBadge: "🔴 HARD",
    theme: "Mid-Map Dark Fog, Secret Key, Dungeon Chamber Easter Egg, Dangerous River & Joker Boss",
    mission: "🎯 Traverse the inferno forest, find the Key, unlock the Ancient Chamber Easter Egg, and defeat Joker!",
    tip: "Use Sweet Rush to jump in fog! Find the secret Key on Floor 3 to unlock the Dungeon Door, and stomp Joker's head 3 times.",
    color: "#F44336",
    shadowColor: "#B71C1C",
    unlocked: true,
    mapWidth: 13700,
    hasMegaMode: false,
    bossType: 'joker_boss'
  }
};
