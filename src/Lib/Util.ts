export function isEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x === 0 || x === width - 1 || y === 0 || y === height - 1;
}
