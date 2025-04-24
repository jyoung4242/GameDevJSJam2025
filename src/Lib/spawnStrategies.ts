/*
 * Spawn Strategies
 */

import { IsometricMap, Random, Vector } from "excalibur";
import { getInnerRingIndexes, isEdgeTile, isInnerEdgeTile } from "./Util";

export interface SpawnPositionStrategy {
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[];
}

// Example: Random
export class RandomSpawnStrategy implements SpawnPositionStrategy {
  rng: Random = new Random(Date.now()); // Initialize with a seed for reproducibility
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[] {
    //console.log("random");
    let positions: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      let tilePos = this.getRandomTile(map);
      positions.push({ x: tilePos.x, y: tilePos.y });
    }

    return positions;
  }

  getRandomTile(map: IsometricMap): Vector {
    let numTiles = map.columns * map.rows;
    let tileIndex = this.rng.integer(0, numTiles - 1);

    while (isEdgeTile(tileIndex, map.columns, map.rows)) {
      tileIndex = this.rng.integer(0, numTiles - 1);
    }

    //get tile position
    const tilePos = map.tiles[tileIndex].pos.clone();
    return tilePos;
  }
}

// Example: Circle
export class CircleSpawnStrategy implements SpawnPositionStrategy {
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[] {
    //console.log("circle");
    let mapWidth = map.columns;
    let mapHeight = map.rows;

    const centerX = Math.ceil(mapWidth / 2),
      centerY = Math.ceil(mapHeight / 2),
      radius = mapWidth / 2 - 2; // Adjust radius as needed

    let positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = Math.floor(centerX + Math.cos(angle) * radius);
      const y = Math.floor(centerY + Math.sin(angle) * radius);
      //get tile Index from x/y
      const tileIndex = y * mapWidth + x;
      const tilePos = map.tiles[tileIndex].pos.clone();
      positions.push({ x: tilePos.x, y: tilePos.y });
    }

    return positions;
  }
}

export class EdgesSpawnStrategy implements SpawnPositionStrategy {
  rng: Random = new Random(Date.now()); // Initialize with a seed for reproducibility
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[] {
    //console.log("edges");
    const positions: { x: number; y: number }[] = [];

    //const edges = map.tiles.filter((tile, index) => isInnerEdgeTile(index, map.columns, map.rows));

    let edgeIndexes = getInnerRingIndexes(map.columns, map.rows);
    const edges = map.tiles.filter((tile, index) => edgeIndexes.includes(index));

    //console.log("edges", edges);

    for (let i = 0; i < count; i++) {
      const tile = this.rng.pickOne(edges); // Pick a random edge tile
      if (tile) {
        positions.push({ x: tile.pos.x, y: tile.pos.y });
      }
    }
    return positions;
  }
}

export class ClusterSpawnStrategy implements SpawnPositionStrategy {
  rng: Random = new Random();

  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[] {
    //console.log("cluster");

    const positions: { x: number; y: number }[] = [];
    const quadCoords = {
      tl: { x: Math.floor(map.columns / 4), y: Math.floor(map.rows / 4) },
      tr: { x: Math.floor(map.columns / 4) * 3, y: Math.floor(map.rows / 4) },
      bl: { x: Math.floor(map.columns / 4), y: Math.floor(map.rows / 4) * 3 },
      br: { x: Math.floor(map.columns / 4) * 3, y: Math.floor(map.rows / 4) * 3 },
    };

    const quadrants: Array<"tl" | "tr" | "bl" | "br"> = ["tl", "tr", "bl", "br"];
    const selectedQuadrant: "tl" | "tr" | "bl" | "br" = this.rng.pickOne(quadrants);
    const clusterCenter = quadCoords[selectedQuadrant];

    const clusterX = clusterCenter.x,
      clusterY = clusterCenter.y,
      clusterSize = Math.floor(Math.sqrt(map.tiles.length) / 4);

    for (let i = 0; i < count; i++) {
      let rngX = this.rng.integer(-clusterSize / 2, clusterSize / 2);
      let rngY = this.rng.integer(-clusterSize / 2, clusterSize / 2);
      let tileX = clusterX + rngX;
      let tileY = clusterY + rngY;
      const tileIndex = tileY * map.columns + tileX;

      const tile = map.tiles[tileIndex];

      if (!tile) continue;
      positions.push({ x: tile.pos.x, y: tile.pos.y });
    }

    return positions;
  }
}

export class RandomOffscreenSpawnStrategy implements SpawnPositionStrategy {
  getSpawnPositions(count: number): { x: number; y: number }[] {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 800 + 800, // Offscreen to the right
      y: Math.random() * 600,
    }));
  }
}
