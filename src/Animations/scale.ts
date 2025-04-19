import { Animation, AnimationStrategy } from "excalibur";
import { scaleSS } from "../resources";

const SCALE_ANIMATION_SPEED = 150;

export const scaleAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: scaleSS.getSprite(0, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(1, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(2, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(3, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(4, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(5, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(6, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
    {
      graphic: scaleSS.getSprite(7, 0),
      duration: SCALE_ANIMATION_SPEED,
    },
  ],
});
