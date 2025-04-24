import { IsometricMap, Vector, vec } from "excalibur";

export function isEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x === 0 || x === width - 1 || y === 0 || y === height - 1;
}

export function isInnerEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x == 2 && x <= width - 3 && y == 2 && y <= height - 3;
}

export function getInnerRingIndexes(width: number, height: number): number[] {
  const indexes: number[] = [];

  if (width <= 2 || height <= 2) {
    return indexes; // no inner ring possible
  }

  // top edge (inner)
  for (let x = 1; x < width - 1; x++) {
    indexes.push(1 * width + x);
  }

  // side edges (inner), excluding corners already added
  for (let y = 2; y < height - 2 + 1; y++) {
    indexes.push(y * width + 1); // left inner column
    indexes.push(y * width + (width - 2)); // right inner column
  }

  // bottom edge (inner)
  for (let x = 1; x < width - 1; x++) {
    indexes.push((height - 2) * width + x);
  }

  return indexes;
}

export function getEnemiesToSpawn(level: number): number {
  // Basic formula: base amount + (scaling factor * level)
  const baseEnemies = 75;
  const scalingFactor = 25;
  const randomBonus = Math.floor(Math.random() * 25) + 1; // Random bonus between 1 and 10

  return Math.floor(baseEnemies + level * scalingFactor + randomBonus);
}

export function getNumberOfBatches(numEnemies: number): number[] {
  const batchCount = Math.floor(Math.random() * 6) + 5; // 4 to 8
  const fixedCount = 4; // Number of early batches to fix
  const fixedPercentage = 0.35; // Portion of enemies reserved for fixed batches

  const fixedEnemies = Math.floor(numEnemies * fixedPercentage);
  const variableEnemies = numEnemies - fixedEnemies;

  // Split fixed enemies evenly (or customize if you want)
  const fixedBatches = Array.from({ length: fixedCount }, () => Math.floor(fixedEnemies / fixedCount));

  // Fix rounding diff from above
  let fixedTotal = fixedBatches.reduce((sum, n) => sum + n, 0);
  let fixedDiff = fixedEnemies - fixedTotal;
  let fixIndex = 0;
  while (fixedDiff !== 0) {
    fixedBatches[fixIndex % fixedCount] += fixedDiff > 0 ? 1 : -1;
    fixedDiff += fixedDiff > 0 ? -1 : 1;
    fixIndex++;
  }

  //console.log("fixedBatches", fixedBatches);

  // Create weights for remaining batches
  const variableCount = batchCount - fixedCount;
  const baseWeight = 1.5;
  const weightGrowth = 1.5;
  const weights = Array.from({ length: variableCount }, (_, i) => baseWeight + i * weightGrowth);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let variableBatches = weights.map(w => Math.floor((w / totalWeight) * variableEnemies));

  // Fix rounding error
  let variableTotal = variableBatches.reduce((sum, n) => sum + n, 0);
  let variableDiff = variableEnemies - variableTotal;
  let varIndex = 0;
  while (variableDiff !== 0) {
    variableBatches[varIndex % variableCount] += variableDiff > 0 ? 1 : -1;
    variableDiff += variableDiff > 0 ? -1 : 1;
    varIndex++;
  }

  //console.log("variableBatches", variableBatches);

  const final = [...fixedBatches, ...variableBatches];
  return final;
}

export function getCenterOfTileMap(tilemap: IsometricMap): Vector {
  return vec(0, (tilemap.rows * tilemap.tileHeight) / 2);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `Time: ${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function saveHighScore(score: number) {
  localStorage.setItem("Axe&ArrowHighscore", score.toString());
}

export function getHighScore() {
  return localStorage.getItem("Axe&ArrowHighscore");
}
