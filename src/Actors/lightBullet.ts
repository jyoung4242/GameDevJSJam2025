import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, RotationType, Side, vec, Vector } from "excalibur";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Enemy } from "./Enemy";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";
import { Resources, SFX_VOLUME } from "../resources";
import { LightPlayer } from "./LightPlayer";

const BULLET_SPEED = 300; // Speed of the bullet

export class LightBullet extends Actor {
  damage: number;
  owner: LightPlayer;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  enemyDefeatedSignal: Signal = new Signal("enemyDefeated");
  constructor(startingpos: Vector, enemyVector: Vector, damage: number, player: LightPlayer, public playSFX: boolean) {
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
    this.owner = player;
    this.damage = damage;
    this.vel = enemyVector.sub(this.pos).normalize().scale(BULLET_SPEED); // Set the velocity towards the target
    this.rotation = this.vel.toAngle();
    this.graphics.use(Resources.arrow.toSprite());
  }

  onInitialize(engine: Engine) {
    this.events.on("exitviewport", () => {
      this.kill();
    });
    if (this.playSFX) Resources.sfxShootArrow.play(SFX_VOLUME);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      const enemy = other.owner as Enemy;
      if (enemy.state == "death") return;
      enemy.pain("arrow");
      (this.owner as LightPlayer).numenemies++;
      if ((this.owner as LightPlayer).isPlayerActive) (this.owner as LightPlayer).numEnemiesWhileActive++;
      this.enemyDefeatedSignal.send(["enemyDefeatedSignal", enemy.affinity, "bow"]);
    }
  }
}
