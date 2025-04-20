import { Actor, CollisionType, Color, EasingFunctions, Graphic, GraphicsGroup, vec, Vector } from "excalibur";
import { dropsCollisionGroup } from "../Lib/colliderGroups";
import { pickupSS, Resources } from "../resources";

export class BlessingDrop extends Actor {
  bouncingchild: Actor;
  constructor(pos: Vector) {
    super({
      radius: 8,
      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });

    this.bouncingchild = new BouncingChild(pickupSS.getSprite(1, 0));
    this.addChild(this.bouncingchild);
    this.graphics.use(Resources.pickupshadow.toSprite());
  }
}

export class SoulDrop extends Actor {
  bouncingchild: Actor;
  constructor(pos: Vector) {
    super({
      radius: 8,
      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });

    this.bouncingchild = new BouncingChild(pickupSS.getSprite(0, 0));
    this.addChild(this.bouncingchild);
    this.graphics.use(Resources.pickupshadow.toSprite());
  }
}

class BouncingChild extends Actor {
  constructor(graphic: Graphic) {
    super({
      radius: 3,
      pos: vec(0, -20),
      z: 1001,
    });
    this.graphics.use(graphic);
    this.actions.repeatForever(ctx => {
      ctx
        .moveBy({
          offset: vec(0, 10),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        })
        .moveBy({
          offset: vec(0, -10),
          duration: 1500,
          easing: EasingFunctions.EaseInOutCubic,
        });
    });
  }
}
