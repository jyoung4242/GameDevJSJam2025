import { Actor, CollisionType, Engine, Scene, vec } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";
import { weaponCollisionGroup } from "../Lib/colliderGroups";

export class BowWeaponActor extends Actor {
  ac: AnimationComponent<"attackLeft" | "attackRight"> | undefined;
  directionfacing: "Left" | "Right" = "Right";
  state: "idle" | "attack" = "attack";
  animationSet: any;
  resetCallback: (() => void) | undefined = undefined;

  constructor(animationSet: any, direction: "Left" | "Right", resetCallback: () => void) {
    super({
      z: 1001,
      collisionType: CollisionType.Passive,
      collisionGroup: weaponCollisionGroup,
    });
    this.resetCallback = resetCallback;
    this.directionfacing = direction;

    this.pos = vec(0, 0);
    this.animationSet = animationSet;
    this.animationSet["attackLeft"].events.on("end", () => {
      console.log("killing weapon left");
      this.kill();
      if (this.resetCallback) this.resetCallback();
    });
    this.animationSet["attackRight"].events.on("end", () => {
      console.log("killing weapon right");
      this.kill();
      if (this.resetCallback) this.resetCallback();
    });
  }

  onInitialize(engine: Engine): void {
    this.ac = new AnimationComponent(this.animationSet);
    this.addComponent(this.ac);
    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac!.set(animationState as "attackLeft" | "attackRight");
  }

  onPreKill(scene: Scene): void {
    this.animationSet["attackLeft"].events.off("end");
    this.animationSet["attackRight"].events.off("end");
  }

  get animationframe() {
    return this.ac?.currentFrame;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {}
}
