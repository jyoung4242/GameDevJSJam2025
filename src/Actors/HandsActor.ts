import { Actor, Engine } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";

export class HandsActor extends Actor {
  ac:
    | AnimationComponent<
        | "idleNormalLeft"
        | "idleNormalRight"
        | "walkNormalLeft"
        | "walkNormalRight"
        | "idleAttackLeft"
        | "idleAttackRight"
        | "walkAttackLeft"
        | "walkAttackRight"
      >
    | undefined;
  _directionfacing: "Left" | "Right" = "Right";
  animationSet: any;
  _walkState: "idle" | "walk" = "idle";
  _attackState: "Attack" | "Normal" = "Normal";
  _oldStates:
    | "idleNormalLeft"
    | "idleNormalRight"
    | "walkNormalLeft"
    | "walkNormalRight"
    | "idleAttackLeft"
    | "idleAttackRight"
    | "walkAttackLeft"
    | "walkAttackRight" = "idleNormalRight";

  _currentStates:
    | "idleNormalLeft"
    | "idleNormalRight"
    | "walkNormalLeft"
    | "walkNormalRight"
    | "idleAttackLeft"
    | "idleAttackRight"
    | "walkAttackLeft"
    | "walkAttackRight" = "idleNormalRight";

  constructor(animationSet: any) {
    super({
      width: 19,
      height: 30,
      z: 1001,
    });
    this.animationSet = animationSet;
  }

  onInitialize(engine: Engine): void {
    this.ac = new AnimationComponent(this.animationSet);
    this.addComponent(this.ac);
    this.ac.set("idleNormalRight");
    this._oldStates = "idleNormalRight";
    this._currentStates = "idleNormalRight";
  }

  set direction(dir: "Left" | "Right") {
    if (!this.ac) return;

    this._directionfacing = dir;
    this._currentStates = (this._walkState + this._attackState + this._directionfacing) as
      | "idleNormalLeft"
      | "idleNormalRight"
      | "walkNormalLeft"
      | "walkNormalRight"
      | "idleAttackLeft"
      | "idleAttackRight"
      | "walkAttackLeft"
      | "walkAttackRight";
  }

  set attackState(state: "Normal" | "Attack") {
    if (!this.ac) return;
    this._attackState = state;
    this._currentStates = (this._walkState + this._attackState + this._directionfacing) as
      | "idleNormalLeft"
      | "idleNormalRight"
      | "walkNormalLeft"
      | "walkNormalRight"
      | "idleAttackLeft"
      | "idleAttackRight"
      | "walkAttackLeft"
      | "walkAttackRight";
  }

  set walkState(state: "idle" | "walk") {
    if (!this.ac) return;
    this._walkState = state;
    this._currentStates = (this._walkState + this._attackState + this._directionfacing) as
      | "idleNormalLeft"
      | "idleNormalRight"
      | "walkNormalLeft"
      | "walkNormalRight"
      | "idleAttackLeft"
      | "idleAttackRight"
      | "walkAttackLeft"
      | "walkAttackRight";
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.ac && this._oldStates !== this._currentStates) {
      this._oldStates = this._currentStates;
      //update ac
      this.ac.set(this._currentStates);
    }
  }
}
