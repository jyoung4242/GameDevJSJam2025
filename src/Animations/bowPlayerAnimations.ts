import { Animation, AnimationStrategy } from "excalibur";
import { bowPlayerBodySS, bowPlayerHandsArmedSS, bowPlayerHandsNormalSS, bowSS } from "../resources";

const WALK_FRAME_SPEED = 75;
const IDLE_FRAME_SPEED = 150;
const BOW_DRAW_1 = 750;
const BOW_DRAW_2 = 100;
const BOW_DRAW_3 = 100;
const BOW_DRAW_4 = 700;

// Idle animations for Sword Guy
export const bowGuyBodyIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerBodySS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: bowPlayerBodySS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const bowGuyBodyIdleLeft = bowGuyBodyIdleRight.clone();
bowGuyBodyIdleLeft.flipHorizontal = true;

// Walk Animations for bow Guy

export const bowGuyBodyWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerBodySS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerBodySS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerBodySS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerBodySS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerBodySS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const bowGuyBodyWalkLeft = bowGuyBodyWalkRight.clone();
bowGuyBodyWalkLeft.flipHorizontal = true;

// Hand Animations
export const bowGuyHandsNormalIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerHandsNormalSS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsNormalSS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const bowGuyHandsNormalIdleLeft = bowGuyHandsNormalIdleRight.clone();
bowGuyHandsNormalIdleLeft.flipHorizontal = true;

export const bowGuyHandsNormalWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerHandsNormalSS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsNormalSS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsNormalSS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsNormalSS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsNormalSS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const bowGuyHandsNormalWalkLeft = bowGuyHandsNormalWalkRight.clone();
bowGuyHandsNormalWalkLeft.flipHorizontal = true;

// Armed - Idle
export const bowGuyHandsArmedIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerHandsArmedSS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsArmedSS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const bowGuyHandsArmedIdleLeft = bowGuyHandsArmedIdleRight.clone();
bowGuyHandsArmedIdleLeft.flipHorizontal = true;

// Armed - Walk

export const bowGuyHandsArmedWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: bowPlayerHandsArmedSS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsArmedSS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsArmedSS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsArmedSS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: bowPlayerHandsArmedSS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const bowGuyHandsArmedWalkLeft = bowGuyHandsArmedWalkRight.clone();
bowGuyHandsArmedWalkLeft.flipHorizontal = true;

//bow draw

export const bowDrawAnimationRight = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: bowSS.getSprite(0, 0),
      duration: BOW_DRAW_1,
    },
    {
      graphic: bowSS.getSprite(1, 0),
      duration: BOW_DRAW_2,
    },
    {
      graphic: bowSS.getSprite(2, 0),
      duration: BOW_DRAW_3,
    },
    {
      graphic: bowSS.getSprite(3, 0),
      duration: BOW_DRAW_4,
    },
  ],
});

export const bowDrawAnimationLeft = bowDrawAnimationRight.clone();
bowDrawAnimationLeft.flipHorizontal = true;
