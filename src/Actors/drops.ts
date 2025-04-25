import { Actor, CollisionType, Color, EasingFunctions, Engine, Graphic, GraphicsGroup, ParallelActions, vec, Vector } from "excalibur";
import { dropsCollisionGroup } from "../Lib/colliderGroups";
import { pickupSS, Resources } from "../resources";
import { LightPlayer } from "./LightPlayer";
import { DarkPlayer } from "./DarkPlayer";

export class BlessingDrop extends Actor {
  bouncingchild: Actor;
  lightPlayerInstance: LightPlayer | null = null;
  lifetime: number = 10000;

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
    setInterval(() => this.lifeTik(), 1000);
  }

  lifeTik() {
    this.lifetime -= 1000;
    if (this.lifetime <= 4000) {
      this.actions.fade(0.1, 4000);
    }
    if (this.lifetime <= 0) {
      this.kill();
    }
  }

  comeToActor(playertoMeet: LightPlayer) {
    this.actions.clearActions();
    this.actions.meet(playertoMeet, 150);
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    this.bouncingchild.graphics.isVisible = this.graphics.isVisible;
  }
}

export class SoulDrop extends Actor {
  bouncingchild: Actor;
  lifetime: number = 10000;
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
    setInterval(() => this.lifeTik(), 1000);
  }

  lifeTik() {
    this.lifetime -= 1000;
    if (this.lifetime <= 4000) {
      this.actions.blink(400, 400);
    }
    if (this.lifetime <= 0) {
      this.kill();
    }
  }

  comeToActor(playertoMeet: DarkPlayer) {
    this.actions.clearActions();
    this.actions.meet(playertoMeet, 150);
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    this.bouncingchild.graphics.isVisible = this.graphics.isVisible;
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
