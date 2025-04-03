// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";
import myImageResource from './Assets/myImage.png' // replace this

export const Resources = {
   myImage: new ImageSource(myImageResource),
};

export const loader = new Loader();

for (let res of Object.values(Resources)) {
   loader.addResource(res);
}
