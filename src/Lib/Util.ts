import { IsometricMap, Vector, vec } from "excalibur";

export function isEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x === 0 || x === width - 1 || y === 0 || y === height - 1;
}

export function isInnerEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x === 1 || x === width - 2 || y === 1 || y === height - 2;
}

export function getEnemiesToSpawn(level: number): number {
  // Basic formula: base amount + (scaling factor * level)
  const baseEnemies = 55;
  const scalingFactor = 25;

  return Math.floor(baseEnemies + level * scalingFactor);
}

export function getNumberOfBatches(numEnemies: number): number[] {
  const batchCount = Math.max(3, Math.floor(numEnemies / 15)); // Adjust this scale as needed
  let weights = Array.from({ length: batchCount }, (_, i) => i + 1); // e.g. [1, 2, 3, 4, ...]
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Scale weights to match total enemies
  let batches = weights.map(w => Math.floor((w / totalWeight) * numEnemies));

  // Fix rounding errors to make sure total matches exactly
  let currentTotal = batches.reduce((sum, n) => sum + n, 0);
  let diff = numEnemies - currentTotal;

  // Add/subtract the difference from the last batch (or spread it)
  while (diff !== 0) {
    for (let i = batches.length - 1; i >= 0 && diff !== 0; i--) {
      batches[i] += diff > 0 ? 1 : -1;
      diff += diff > 0 ? -1 : 1;
    }
  }

  return batches;
}

export function getCenterOfTileMap(tilemap: IsometricMap): Vector {
  return vec(0, (tilemap.rows * tilemap.tileHeight) / 2);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `Time: ${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
