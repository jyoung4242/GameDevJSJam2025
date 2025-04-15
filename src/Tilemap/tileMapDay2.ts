import { GraphicsGroup, IsometricMap, Random, Shape, vec, Vector } from "excalibur";
import { groundSS, overlaySS, Resources } from "../resources";
import { isEdgeTile } from "../Lib/Util";
import { PerlinGenerator } from "@excaliburjs/plugin-perlin";

const generator = new PerlinGenerator({
  seed: Date.now(), // random seed
  octaves: 3, // number of times noise is laid on itself
  frequency: 24, // number of times the pattern oscillates, higher is like zooming out
  amplitude: 0.91, // [0-1] amplitude determines the relative height of the peaks generated in the noise
  persistance: 0.95, // [0-1] he persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns, a low degree of persistance generates spiky patterns.
});

export const day2Tilemap = new IsometricMap({
  pos: vec(0, 0),
  tileWidth: 64,
  tileHeight: 32,
  columns: 25,
  rows: 25,
});

let tileIndex = 0;

let overLayArray = [
  overlaySS.getSprite(0, 0),
  overlaySS.getSprite(1, 0),
  overlaySS.getSprite(2, 0),
  overlaySS.getSprite(3, 0),
  overlaySS.getSprite(4, 0),
  overlaySS.getSprite(5, 0),
  overlaySS.getSprite(6, 0),
  overlaySS.getSprite(0, 1),
  overlaySS.getSprite(1, 1),
  overlaySS.getSprite(2, 1),
];

for (const tile of day2Tilemap.tiles) {
  if (!isEdgeTile(tileIndex, day2Tilemap.columns, day2Tilemap.rows)) {
    console.log("not edge tile", tileIndex);

    let groundCover = groundSS.getSprite(0, 0);
    //check noise field for random overlays
    const grid = generator.grid(day2Tilemap.columns, day2Tilemap.rows);
    const noiseValue = grid[tileIndex];
    let rng = new Random();

    if (noiseValue > 0.55) {
      const overlaySprite = rng.pickOne(overLayArray);
      let ospriteX = rng.integer(16, 32);
      let ospriteY = -32;
      console.log(ospriteX, ospriteY);

      let tileGraphicGroup = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundCover,
            offset: vec(0, -32),
          },
          {
            graphic: overlaySprite,
            offset: vec(ospriteX, ospriteY),
          },
        ],
      });
      console.log("adding normal tile graphic with overlay");
      tile.addGraphic(tileGraphicGroup);
    } else {
      console.log("adding normal tile graphic");
      let tileGraphicGroup = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundCover,
            offset: vec(0, -32),
          },
        ],
      });
      console.log("adding normal tile graphic with overlay");
      tile.addGraphic(tileGraphicGroup);
    }
  } else {
    console.log("edge tile", tile);

    if (tile.x == 0) {
      //left edge tile
      let edgeTileGG = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundSS.getSprite(0, 0),
            offset: vec(0, 16),
          },
          {
            graphic: Resources.tree.toSprite(),
            offset: vec(-6, -24),
          },
        ],
      });
      console.log("adding tree graphics");

      tile.addGraphic(edgeTileGG);
    } else if ((tile.y == 0 && tile.x != 0) || (tile.y == day2Tilemap.rows - 1 && tile.x != 0)) {
      console.log("top edge tile", tileIndex);
      //top edge tile
      const fence = Resources.fence.toSprite();
      let topEdgeGG = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundSS.getSprite(0, 0),
            offset: vec(0, -32),
          },
          {
            graphic: fence,
            offset: vec(0, -32),
          },
        ],
      });
      console.log("adding top edge graphic");

      tile.addGraphic(topEdgeGG);
    } else {
      console.log("right edge tile", tileIndex);
      //right edge tile

      let rightEdgeGG = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundSS.getSprite(0, 0),
            offset: vec(0, -32),
          },
        ],
      });
      console.log("adding top edge graphic");

      tile.addGraphic(rightEdgeGG);
    }

    tile.solid = true;
    tile.addCollider(Shape.Polygon([vec(0, 17), vec(32, 1), vec(63, 17), vec(32, 33)]));
  }
  tileIndex++;
}

export function getCenterOfTileMap(tilemap: IsometricMap): Vector {
  return vec(0, (tilemap.rows * tilemap.tileHeight) / 2);
}

day2Tilemap.updateColliders();
