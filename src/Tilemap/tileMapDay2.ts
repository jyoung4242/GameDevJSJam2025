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

let tileIndex = 0;
for (const tile of day2Tilemap.tiles) {
  if (!isEdgeTile(tileIndex, day2Tilemap.columns, day2Tilemap.rows)) {
    let groundCover = groundSS.getSprite(0, 0);
    //check noise field for random overlays
    const grid = generator.grid(day2Tilemap.columns, day2Tilemap.rows);
    const noiseValue = grid[tileIndex];
    let rng = new Random();

    if (noiseValue > 0.55) {
      const overlaySprite = rng.pickOne(overLayArray);
      let ospriteX = rng.integer(16, 32);
      let ospriteY = -32;

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

      tile.addGraphic(tileGraphicGroup);
    } else {
      let tileGraphicGroup = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundCover,
            offset: vec(0, -32),
          },
        ],
      });

      tile.addGraphic(tileGraphicGroup);
    }
  } else {
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

      tile.addGraphic(edgeTileGG);
    } else if ((tile.y == 0 && tile.x != 0) || (tile.y == day2Tilemap.rows - 1 && tile.x != 0)) {
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

      tile.addGraphic(topEdgeGG);
    } else {
      let rightEdgeGG = new GraphicsGroup({
        useAnchor: true,
        members: [
          {
            graphic: groundSS.getSprite(0, 0),
            offset: vec(0, -32),
          },
        ],
      });

      tile.addGraphic(rightEdgeGG);
    }

    tile.solid = true;
    tile.addCollider(Shape.Polygon([vec(0, 17), vec(32, 1), vec(63, 17), vec(32, 33)]));
  }
  tileIndex++;
}

day2Tilemap.updateColliders();
