import { Animation, AnimationStrategy } from "excalibur";
import { purpleGuySS, purpleGuyDarkSS, purpleGuyLightSS } from "../resources";

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

export const purpleGuyDarkAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: purpleGuyDarkSS.getSprite(0, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(1, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(2, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(3, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(4, 0),
      duration: 100,
    },
  ],
});

export const purpleGuyDarkSwordDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuyDarkSS.getSprite(0, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(1, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(2, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(3, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(4, 1),
      duration: 100,
    },
  ],
});

export const purpleGuyDarkArrowDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuyDarkSS.getSprite(0, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(1, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(2, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(3, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyDarkSS.getSprite(4, 2),
      duration: 100,
    },
  ],
});

export const purpleGuyLightAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: purpleGuyLightSS.getSprite(0, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(1, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(2, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(3, 0),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(4, 0),
      duration: 100,
    },
  ],
});

export const purpleGuyLightSwordDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuyLightSS.getSprite(0, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(1, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(2, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(3, 1),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(4, 1),
      duration: 100,
    },
  ],
});

export const purpleGuyLightArrowDeathAnimation = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: purpleGuyLightSS.getSprite(0, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(1, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(2, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(3, 2),
      duration: 100,
    },
    {
      graphic: purpleGuyLightSS.getSprite(4, 2),
      duration: 100,
    },
  ],
});
