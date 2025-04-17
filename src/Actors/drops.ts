import { Actor, CollisionType, Color, EasingFunctions, vec, Vector } from "excalibur";
import { dropsCollisionGroup } from "../Lib/colliderGroups";
import { Resources } from "../resources";

export class BlessingDrop extends Actor {
  constructor(pos: Vector) {
    super({
      radius: 3,

      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });
    this.graphics.use(Resources.blessing.toSprite());
    this.actions.repeatForever(ctx => {
      ctx
        .moveBy({
          offset: vec(0, 15),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        })
        .moveBy({
          offset: vec(0, -15),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        });
    });
  }
}

export class SoulDrop extends Actor {
  constructor(pos: Vector) {
    super({
      radius: 3,
      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });

    this.graphics.use(Resources.soul.toSprite());
    this.actions.repeatForever(ctx => {
      ctx
        .moveBy({
          offset: vec(0, 15),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        })
        .moveBy({
          offset: vec(0, -15),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        });
    });
  }
}
