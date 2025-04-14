import { Color, Vector, Actor, vec, Engine, toRadians, Collider, CollisionContact, Side, CollisionType } from "excalibur";
import { Enemy } from "./Enemy";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Signal } from "../Lib/Signals";

let angularVelocity = 0.15; // Adjust this value to control the rotation speed

export class DarkWeapon extends Actor {
  angle: number = 0; // Angle in radians
  radius: number = 20; // Radius of the circular path
  angVel: number = angularVelocity; // Angular velocity in radians per second
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI

  constructor(pos: Vector) {
    super({
      width: 12,
      height: 3,
      color: Color.LightGray,
      pos: vec(0, 0).add(vec(20, 0)),
      rotation: toRadians(0), // Initial rotation angle
      collisionType: CollisionType.Passive,
      collisionGroup: weaponCollisionGroup,
    });
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      // Handle collision with enemy
      let enemy = other.owner as Enemy;
      this.UISignal.send(["enemyDefeated", enemy.affinity]);
      enemy.checkDrop();
      enemy.kill();
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // Increase angle counterclockwise (positive angle in Excalibur)
    // debugger;
    this.angle += this.angVel;

    // Stop after one revolution
    if (this.angle >= Math.PI * 2) {
      this.angle = Math.PI * 2;

      this.kill();
    }

    // Calculate new position in a circular path
    const x = this.radius * Math.cos(this.angle);
    const y = this.radius * Math.sin(this.angle);

    this.pos.setTo(x, y);

    // Rotate weapon to match angle (optional)
    this.rotation = this.angle;
  }
}
