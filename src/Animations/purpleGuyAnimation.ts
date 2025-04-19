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
    {
      graphic: purpleGuySS.getSprite(4, 0),
      duration: 100,
    },
  ],
});

export const purpleGuySwordDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuySS.getSprite(0, 1),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(1, 1),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(2, 1),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(3, 1),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(4, 1),
      duration: 100,
    },
  ],
});

export const purpleGuyArrowDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuySS.getSprite(0, 2),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(1, 2),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(2, 2),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(3, 2),
      duration: 100,
    },
    {
      graphic: purpleGuySS.getSprite(4, 2),
      duration: 100,
    },
  ],
});
