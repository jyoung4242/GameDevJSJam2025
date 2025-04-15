// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";
import tilesetDay1 from "./Assets/baseTilesDay1.png";
import groundDay2 from "./Assets/ground-sheet-64x48px.png";
import overlay from "./Assets/ground-overlays-16px.png";
import fence from "./Assets/fence-tile-32px.png";
import tree from "./Assets/tree-80x.png";
import purpleGuy from "./Assets/purple-guy-body-sheet-32px.png";
import purpleShadow from "./Assets/purple-guy-shadow-32px.png";
import lifebar from "./Assets/lifebar-32x16px.png";
import buttonUp from "./Assets/button_rectangle_depth_gradient.png";
import buttonDown from "./Assets/button_rectangle_gradient.png";

export const Resources = {
  tsetD1: new ImageSource(tilesetDay1),
  ground: new ImageSource(groundDay2),
  overlay: new ImageSource(overlay),
  fence: new ImageSource(fence),
  tree: new ImageSource(tree),
  purpleGuy: new ImageSource(purpleGuy),
  purpleShadow: new ImageSource(purpleShadow),
  lifebar: new ImageSource(lifebar),
  buttonUp: new ImageSource(buttonUp),
  buttonDown: new ImageSource(buttonDown),
};

export const tilesetD1SS = SpriteSheet.fromImageSource({
  image: Resources.tsetD1,
  grid: {
    rows: 2,
    columns: 2,
    spriteWidth: 34,
    spriteHeight: 17,
  },
});

export const groundSS = SpriteSheet.fromImageSource({
  image: Resources.ground,
  grid: {
    rows: 10,
    columns: 5,
    spriteWidth: 64,
    spriteHeight: 32,
  },
});

export const overlaySS = SpriteSheet.fromImageSource({
  image: Resources.overlay,
  grid: {
    rows: 10,
    columns: 10,
    spriteHeight: 16,
    spriteWidth: 16,
  },
});

export const purpleGuySS = SpriteSheet.fromImageSource({
  image: Resources.purpleGuy,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32,
  },
});

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
