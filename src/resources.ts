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
import playerShadow from './Assets/character-shadow.png';
import swordPlayerBody from "./Assets/SwordCharacter_body.png";
import swordPlayerHands from "./Assets/SwordCharacter_arms-normal.png";
import swordPlayerHandArmed from "./Assets/SwordCharacterarms-weapon.png";
import sword from "./Assets/sword-sheet.png";
import bowPlayerBody from "./Assets/ArrowCharacter_body.png";
import bowPlayerHands from "./Assets/ArrowCharacter_arms-normal.png";
import bowPlayerHandsArmed from "./Assets/ArrowCharacter_arms-weapon.png";
import bow from "./Assets/bow-sheet.png";
import arrow from "./Assets/arrow.png";
import blessing from "./Assets/blessingOrb.png";
import soul from "./Assets/soulsOrb.png";
import cancel from "./Assets/cancelPurpledude-Sheet.png";

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
  playerShadow: new ImageSource(playerShadow),
  swordPlayerBody: new ImageSource(swordPlayerBody),
  swordPlayerHands: new ImageSource(swordPlayerHands),
  swordPlayerHandArmed: new ImageSource(swordPlayerHandArmed),
  sword: new ImageSource(sword),
  arrowPlayerBody: new ImageSource(bowPlayerBody),
  arrowPlayerHands: new ImageSource(bowPlayerHands),
  arrowPlayerHandsArmed: new ImageSource(bowPlayerHandsArmed),
  bow: new ImageSource(bow),
  arrow: new ImageSource(arrow),
  blessing: new ImageSource(blessing),
  soul: new ImageSource(soul),
  cancel: new ImageSource(cancel),
};

export const cancelPurpledudeSS = SpriteSheet.fromImageSource({
  image: Resources.cancel,
  grid: {
    rows: 1,
    columns: 2,
    spriteHeight: 32,
    spriteWidth: 32,
  },
});

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

export const bodyShadowSS = SpriteSheet.fromImageSource({
  image: Resources.playerShadow,
  grid: {
    rows: 1,
    columns: 1,
    spriteHeight: 48,
    spriteWidth: 48,
  }
})

export const swordPlayerBodySS = SpriteSheet.fromImageSource({
  image: Resources.swordPlayerBody,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const swordPlayerHandsNormalSS = SpriteSheet.fromImageSource({
  image: Resources.swordPlayerHands,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const swordPlayerHandsArmedSS = SpriteSheet.fromImageSource({
  image: Resources.swordPlayerHandArmed,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const swordSS = SpriteSheet.fromImageSource({
  image: Resources.sword,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 80,
    spriteWidth: 80,
  },
});

export const bowPlayerBodySS = SpriteSheet.fromImageSource({
  image: Resources.arrowPlayerBody,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const bowPlayerHandsNormalSS = SpriteSheet.fromImageSource({
  image: Resources.arrowPlayerHands,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const bowPlayerHandsArmedSS = SpriteSheet.fromImageSource({
  image: Resources.arrowPlayerHandsArmed,
  grid: {
    rows: 1,
    columns: 7,
    spriteHeight: 48,
    spriteWidth: 48,
  },
});

export const bowSS = SpriteSheet.fromImageSource({
  image: Resources.bow,
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
