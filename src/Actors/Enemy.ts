import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, Engine, Random, Side, vec, Vector } from "excalibur";
import { EnemyCollisionGroup } from "../Lib/colliderGroups";
import { DarkPlayer } from "./DarkPlayer";
import { LightPlayer } from "./LightPlayer";
import { BlessingDrop, SoulDrop } from "./drops";

const ENEMY_SPEED = 25; // Speed of the enemy

const enemyRNG = new Random(Date.now()); // Random number generator for enemy behavior

const darkBorder = new Circle({
  radius: 7.5,
  color: Color.Red,
  strokeColor: Color.fromHex("#000000"),
  lineWidth: 2,
}); // Dark border circle

const lightBorder = new Circle({
  radius: 7.5,
  color: Color.Red,
  strokeColor: Color.fromHex("#FFFFFF"),
  lineWidth: 2,
}); // Light border circle

export class Enemy extends Actor {
  affinity: "dark" | "light" = "dark"; // Affinity of the enemy
  lightTarget: LightPlayer | undefined;
  darkTarget: DarkPlayer | undefined;
  constructor(pos: Vector, lightPlayer: LightPlayer, darkPlayer: DarkPlayer) {
    super({
      radius: 7.5,
      pos,
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Active,
      collisionGroup: EnemyCollisionGroup,
    });
    this.lightTarget = lightPlayer;
    this.darkTarget = darkPlayer;

    if (enemyRNG.bool()) {
      this.affinity = "light";
      this.graphics.add(lightBorder); // Set affinity to light
    } else {
      this.graphics.add(darkBorder);
    }
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof DarkPlayer || other.owner instanceof LightPlayer) {
      this.kill();
      other.owner.currentHP -= 2; // Decrease the player's health by 1
    }
  }

  onInitialize() {}

  reset() {}

  checkDrop() {
    let drop = enemyRNG.integer(0, 100); // Generate a random number between 0 and 100
    if (drop < 40) {
      //spawn drop
      if (!this.scene) return;
      if (this.affinity == "dark") {
        //spawn dark drop

        this.scene.add(new SoulDrop(this.pos));
      } else {
        //spawn light drop
        this.scene.add(new BlessingDrop(this.pos));
      }
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.lightTarget && this.darkTarget) {
      let closestTarget =
        this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;

      this.actions.meet(closestTarget, ENEMY_SPEED); // Move towards the closest target
    }
  }
}
