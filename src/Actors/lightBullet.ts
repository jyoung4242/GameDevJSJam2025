import { Actor, Collider, CollisionContact, CollisionType, Color, RotationType, Side, vec, Vector } from "excalibur";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Enemy } from "./Enemy";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";
import { Resources } from "../resources";

const BULLET_SPEED = 300; // Speed of the bullet

export class LightBullet extends Actor {
  damage: number;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  constructor(startingpos: Vector, target: Enemy, damage: number) {
    super({
      width: 16,
      height: 4,
      rotation: 0,
      //color: Color.Yellow,
      pos: startingpos,
      anchor: Vector.Half,
      z: 1001,
      collisionType: CollisionType.Passive,
      collisionGroup: weaponCollisionGroup,
    });
    this.damage = damage;
    this.vel = target.pos.sub(this.pos).normalize().scale(BULLET_SPEED); // Set the velocity towards the target
    this.rotation = this.vel.toAngle();
    this.graphics.use(Resources.arrow.toSprite());
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      const enemy = other.owner as Enemy;
      this.UISignal.send(["enemyDefeated", enemy.affinity]);
      enemy.checkDrop();
      (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(enemy); // Return the enemy to the pool
      this.scene?.remove(enemy); // Remove the enemy from the scene
      this.kill(); // Kill the bullet if it collides with an enemy
    }
  }
}
