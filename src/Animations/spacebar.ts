import { Animation, AnimationStrategy } from "excalibur";
import { spaceBarSS } from "../resources";

export const SpaceBarAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: spaceBarSS.getSprite(0, 0),
      duration: 250,
    },
    {
      graphic: spaceBarSS.getSprite(1, 0),
      duration: 250,
    },
  ],
});
