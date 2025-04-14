import { Actor, CollisionType, Color, Vector } from "excalibur";
import { dropsCollisionGroup } from "../Lib/colliderGroups";

export class BlessingDrop extends Actor {
  constructor(pos: Vector) {
    super({
      radius: 3,
      color: Color.fromHex("#EEEEEE"),
      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });
  }
}

export class SoulDrop extends Actor {
  constructor(pos: Vector) {
    super({
      radius: 3,
      color: Color.fromHex("#050505"),
      pos,
      collisionType: CollisionType.Passive,
      collisionGroup: dropsCollisionGroup,
      z: 1000,
    });
  }
}
