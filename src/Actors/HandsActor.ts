import { Actor, Engine } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";

export class HandsActor extends Actor {
  ac: AnimationComponent<"attackLeft" | "attackRight" | "idleLeft" | "idleRight"> | undefined;
  directionfacing: "Left" | "Right" = "Right";
  state: "idle" | "attack" = "idle";
  animationSet: any;

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
    this.ac.set("idleRight");
  }

  set direction(dir: "Left" | "Right") {
    if (!this.ac) return;
    this.directionfacing = dir;
    const animationState: "idleLeft" | "idleRight" | "attackLeft" | "attackRight" = (this.state + this.directionfacing) as
      | "idleLeft"
      | "idleRight"
      | "attackLeft"
      | "attackRight";

    this.ac.set(animationState as "idleLeft" | "idleRight" | "attackLeft" | "attackRight");
  }

  set attackState(state: "idle" | "attack") {
    if (!this.ac) return;
    this.state = state;
    const animationState: "idleLeft" | "idleRight" | "attackLeft" | "attackRight" = (this.state + this.directionfacing) as
      | "idleLeft"
      | "idleRight"
      | "attackLeft"
      | "attackRight";
    this.ac.set(animationState as "idleLeft" | "idleRight" | "attackLeft" | "attackRight");
  }
}
