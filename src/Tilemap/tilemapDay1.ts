import { IsometricMap, vec, Vector } from "excalibur";
import { tilesetD1SS } from "../resources";

export const day1Tilemap = new IsometricMap({
  pos: vec(0, 0),
  tileWidth: 34,
  tileHeight: 17,
  columns: 10,
  rows: 10,
});

let tileIndex = 0;
for (const tile of day1Tilemap.tiles) {
  const tileId = tileIndex % 4;

  if (tileId === 0) {
    tile.addGraphic(tilesetD1SS.getSprite(0, 0)!);
  } else if (tileId === 1) {
    tile.addGraphic(tilesetD1SS.getSprite(1, 0)!);
  } else if (tileId === 2) {
    tile.addGraphic(tilesetD1SS.getSprite(0, 1)!);
  } else if (tileId === 3) {
    tile.addGraphic(tilesetD1SS.getSprite(1, 1)!);
  }

  tileIndex++;
}

export function getCenterOfTileMap(tilemap: IsometricMap): Vector {
  return vec(0, (tilemap.rows * tilemap.tileHeight) / 2);
}
