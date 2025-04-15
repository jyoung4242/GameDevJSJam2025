import { Animation, AnimationStrategy } from "excalibur";
import { purpleGuySS } from "../resources";

export const purpleGuyAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: purpleGuySS.getSprite(0, 0),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(1, 0),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(2, 0),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(3, 0),
      duration: 100,
    },
  ],
});
