import { IsometricMap, Shape, vec, Vector } from "excalibur";
import { tilesetD1SS } from "../resources";

export const day1Tilemap = new IsometricMap({
  pos: vec(0, 0),
  tileWidth: 34,
  tileHeight: 17,
  columns: 25,
  rows: 25,
});

let tileIndex = 0;
for (const tile of day1Tilemap.tiles) {
  if (!isEdgeTile(tileIndex, day1Tilemap.columns, day1Tilemap.rows)) {
    tile.addGraphic(tilesetD1SS.getSprite(0, 0));
  } else {
    tile.solid = true;
    tile.addCollider(Shape.Polygon([vec(0, 9 + 17), vec(34 / 2, 9 - 17 / 2 + 17), vec(34, 9 + 17), vec(34 / 2, 9 + 17 / 2 + 17)]));
  }
  tileIndex++;
}

export function getCenterOfTileMap(tilemap: IsometricMap): Vector {
  return vec(0, (tilemap.rows * tilemap.tileHeight) / 2);
}

function isEdgeTile(index: number, width: number, height: number): boolean {
  const x = index % width;
  const y = Math.floor(index / width);
  return x === 0 || x === width - 1 || y === 0 || y === height - 1;
}
