import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Side, vec, Vector } from "excalibur";
import { EnemyCollisionGroup } from "../Lib/colliderGroups";
import { DarkPlayer } from "./DarkPlayer";
import { LightPlayer } from "./LightPlayer";

const ENEMY_SPEED = 25; // Speed of the enemy

export class Enemy extends Actor {
  lightTarget: LightPlayer | undefined;
  darkTarget: DarkPlayer | undefined;
  constructor(pos: Vector, lightPlayer: LightPlayer, darkPlayer: DarkPlayer) {
    super({
      radius: 7.5,
      color: Color.Red,
      pos,
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Passive,
      collisionGroup: EnemyCollisionGroup,
    });
    this.lightTarget = lightPlayer;
    this.darkTarget = darkPlayer;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof DarkPlayer || other.owner instanceof LightPlayer) {
      this.kill();
      other.owner.currentHP -= 2; // Decrease the player's health by 1
    }
  }

  onInitialize() {}

  reset() {}

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.lightTarget && this.darkTarget) {
      let closestTarget =
        this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;

      this.actions.meet(closestTarget, ENEMY_SPEED); // Move towards the closest target
    }
  }
}
