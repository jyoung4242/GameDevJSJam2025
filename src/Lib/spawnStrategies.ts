/*
 * Spawn Strategies
 */

import { IsometricMap, Random, Vector } from "excalibur";
import { isEdgeTile } from "./Util";

export interface SpawnPositionStrategy {
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[];
}

// Example: Random
export class RandomSpawnStrategy implements SpawnPositionStrategy {
  rng: Random = new Random(Date.now()); // Initialize with a seed for reproducibility
  getSpawnPositions(count: number, map: IsometricMap): { x: number; y: number }[] {
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
  getSpawnPositions(count: number): { x: number; y: number }[] {
    const centerX = 400,
      centerY = 300,
      radius = 200;
    return Array.from({ length: count }, (_, i) => {
      const angle = (2 * Math.PI * i) / count;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
  }
}

export class EdgesSpawnStrategy implements SpawnPositionStrategy {
  getSpawnPositions(count: number): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    const edges = [
      { x: 0, y: 0 }, // Top-left corner
      { x: 800, y: 0 }, // Top-right corner
      { x: 0, y: 600 }, // Bottom-left corner
      { x: 800, y: 600 }, // Bottom-right corner
    ];
    for (let i = 0; i < count; i++) {
      positions.push(edges[Math.floor(Math.random() * edges.length)]);
    }
    return positions;
  }
}

export class ClusterSpawnStrategy implements SpawnPositionStrategy {
  getSpawnPositions(count: number): { x: number; y: number }[] {
    const clusterX = 400,
      clusterY = 300,
      clusterSize = 50;
    return Array.from({ length: count }, () => ({
      x: clusterX + Math.random() * clusterSize - clusterSize / 2,
      y: clusterY + Math.random() * clusterSize - clusterSize / 2,
    }));
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
