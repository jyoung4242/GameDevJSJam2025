import { Animation, AnimationStrategy } from "excalibur";
import { swordPlayerBodySS, swordPlayerHandsArmedSS, swordPlayerHandsNormalSS, swordSS } from "../resources";

const WALK_FRAME_SPEED = 75;
const IDLE_FRAME_SPEED = 150;
const SWORD_SLASH_1 = 100;
const SWORD_SLASH_2 = 100;
const SWORD_SLASH_3 = 200;
const SWORD_SLASH_4 = 400;

// Idle animations for Sword Guy
export const swordGuyBodyIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerBodySS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: swordPlayerBodySS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const swordGuyBodyIdleLeft = swordGuyBodyIdleRight.clone();
swordGuyBodyIdleLeft.flipHorizontal = true;

// Walk Animations for Sword Guy

export const swordGuyBodyWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerBodySS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerBodySS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerBodySS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerBodySS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerBodySS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const swordGuyBodyWalkLeft = swordGuyBodyWalkRight.clone();
swordGuyBodyWalkLeft.flipHorizontal = true;

// Hand Animations
export const swordGuyHandsNormalIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerHandsNormalSS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsNormalSS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const swordGuyHandsNormalIdleLeft = swordGuyHandsNormalIdleRight.clone();
swordGuyHandsNormalIdleLeft.flipHorizontal = true;

export const swordGuyHandsNormalWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerHandsNormalSS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsNormalSS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsNormalSS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsNormalSS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsNormalSS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const swordGuyHandsNormalWalkLeft = swordGuyHandsNormalWalkRight.clone();
swordGuyHandsNormalWalkLeft.flipHorizontal = true;

// Armed - Idle
export const swordGuyHandsArmedIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerHandsArmedSS.getSprite(0, 0),
      duration: IDLE_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsArmedSS.getSprite(1, 0),
      duration: IDLE_FRAME_SPEED,
    },
  ],
});

export const swordGuyHandsArmedIdleLeft = swordGuyHandsArmedIdleRight.clone();
swordGuyHandsArmedIdleLeft.flipHorizontal = true;

// Armed - Walk

export const swordGuyHandsArmedWalkRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: swordPlayerHandsArmedSS.getSprite(2, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsArmedSS.getSprite(3, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsArmedSS.getSprite(4, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsArmedSS.getSprite(5, 0),
      duration: WALK_FRAME_SPEED,
    },
    {
      graphic: swordPlayerHandsArmedSS.getSprite(6, 0),
      duration: WALK_FRAME_SPEED,
    },
  ],
});

export const swordGuyHandsArmedWalkLeft = swordGuyHandsArmedWalkRight.clone();
swordGuyHandsArmedWalkLeft.flipHorizontal = true;

//sword slash

export const swordSlashAnimationRight = new Animation({
  strategy: AnimationStrategy.End,
  frames: [
    {
      graphic: swordSS.getSprite(0, 0),
      duration: SWORD_SLASH_1,
    },
    {
      graphic: swordSS.getSprite(1, 0),
      duration: SWORD_SLASH_2,
    },
    {
      graphic: swordSS.getSprite(2, 0),
      duration: SWORD_SLASH_3,
    },
    {
      graphic: swordSS.getSprite(3, 0),
      duration: SWORD_SLASH_4,
    },
  ],
});

export const swordSlashAnimationLeft = swordSlashAnimationRight.clone();
swordSlashAnimationLeft.flipHorizontal = true;
swordSlashAnimationRight;
