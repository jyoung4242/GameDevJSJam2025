import { Actor, Collider, CollisionContact, CollisionType, Color, Side, vec, Vector } from "excalibur";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Enemy } from "./Enemy";

const BULLET_SPEED = 300; // Speed of the bullet

export class LightBullet extends Actor {
  damage: number;
  constructor(startingpos: Vector, target: Enemy, damage: number) {
    super({
      radius: 2,
      color: Color.Yellow,
      pos: startingpos,
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Passive,
      collisionGroup: weaponCollisionGroup,
    });
    this.damage = damage;
    this.vel = target.pos.sub(this.pos).normalize().scale(BULLET_SPEED); // Set the velocity towards the target
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      const enemy = other.owner as Enemy;
      enemy.checkDrop();
      enemy.kill();
      this.kill(); // Kill the bullet if it collides with an enemy
    }
  }
}
