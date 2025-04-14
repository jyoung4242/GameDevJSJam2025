import { Actor, Color, Engine, vec, Vector } from "excalibur";

const ENEMY_SPEED = 25; // Speed of the enemy

export class Enemy extends Actor {
  lightTarget: Actor | undefined;
  darkTarget: Actor | undefined;
  constructor(pos: Vector, lightPlayer: Actor, darkPlayer: Actor) {
    super({
      radius: 7.5,
      color: Color.Red,
      pos,
      anchor: Vector.Half,
      z: 1000,
    });
    this.lightTarget = lightPlayer;
    this.darkTarget = darkPlayer;
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
