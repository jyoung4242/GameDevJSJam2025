import { Actor, Engine, vec } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";

export class WeaponActor extends Actor {
  ac: AnimationComponent<"attackLeft" | "attackRight"> | undefined;
  directionfacing: "Left" | "Right" = "Right";
  state: "idle" | "attack" = "attack";
  animationSet: any;
  resetCallback: (() => void) | undefined = undefined;
  leftVector = vec(-25, 0);
  rightVector = vec(25, 0);

  constructor(animationSet: any, direction: "Left" | "Right", resetCallback: () => void) {
    super({
      width: 19,
      height: 30,
      z: 1001,
    });
    this.resetCallback = resetCallback;
    this.directionfacing = direction;
    if (this.directionfacing == "Left") this.pos = this.leftVector;
    else this.pos = this.rightVector;
    this.pos = this.rightVector;
    this.animationSet = animationSet;
    this.animationSet["attackLeft"].events.on("end", () => {
      console.log("end of animation", this.parent);
      //this.ac?.reset();
      if (this.resetCallback) this.resetCallback();
      this.kill();
    });
    this.animationSet["attackRight"].events.on("end", () => {
      console.log("end of animation", this.parent);
      //this.ac?.reset();
      if (this.resetCallback) this.resetCallback();
      this.kill();
    });
  }

  onInitialize(engine: Engine): void {
    if (this.directionfacing == "Left") this.pos = this.leftVector;
    else this.pos = this.rightVector;
    this.ac = new AnimationComponent(this.animationSet);
    this.addComponent(this.ac);
    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac!.set(animationState as "attackLeft" | "attackRight");
  }

  /* setResetCallback(cb: () => void) {
    this.resetCallback = cb;
  } */

  /* onAdd(engine: Engine): void {
    console.log("adding child");

    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac!.set(animationState as "attackLeft" | "attackRight");
  } */

  /* set direction(dir: "Left" | "Right") {
    if (!this.ac) return;
    this.directionfacing = dir;
    /* if (this.directionfacing == "Left") this.pos = this.leftVector;
    else this.pos = this.rightVector; 

    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac.set(animationState as "attackLeft" | "attackRight");
  }

  set attackState(state: "idle" | "attack") {
    if (!this.ac) return;
    this.state = state;
    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac.set(animationState as "attackLeft" | "attackRight");
  } */
}
