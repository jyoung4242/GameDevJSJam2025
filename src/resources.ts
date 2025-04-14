// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";
import tilesetDay1 from "./Assets/baseTilesDay1.png";

export const Resources = {
  tsetD1: new ImageSource(tilesetDay1),
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

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
