import { Actor, Collider, CollisionContact, CollisionType, Engine, Side, vec } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Enemy } from "./Enemy";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";
import {Resources, SFX_VOLUME} from "../resources";
import { DarkPlayer } from "./DarkPlayer";

export class WeaponActor extends Actor {
  ac: AnimationComponent<"attackLeft" | "attackRight"> | undefined;
  directionfacing: "Left" | "Right" = "Right";
  state: "idle" | "attack" = "attack";
  animationSet: any;
  resetCallback: (() => void) | undefined = undefined;
  leftVector = vec(-25, 0);
  rightVector = vec(25, 0);
  UISignal: Signal = new Signal("stateUpdate");
  waveResetSignal: Signal = new Signal("waveReset");
  isColliding: boolean = false;
  others: Enemy[] = [];
  numenemies: number = 0;

  constructor(animationSet: any, direction: "Left" | "Right", resetCallback: () => void) {
    super({
      width: 42,
      height: 30,
      z: 1001,
      collisionType: CollisionType.Passive,
      collisionGroup: weaponCollisionGroup,
    });
    this.resetCallback = resetCallback;
    this.directionfacing = direction;
    if (this.directionfacing == "Left") this.pos = this.leftVector;
    else this.pos = this.rightVector;
    this.pos = this.rightVector;
    this.animationSet = animationSet;
    this.animationSet["attackLeft"].events.on("end", () => {
      if (this.resetCallback) this.resetCallback();
      this.kill();
    });
    this.animationSet["attackRight"].events.on("end", () => {
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
    Resources.sfxSwordSwing.play(SFX_VOLUME);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      this.isColliding = true;
      this.others.push(other.owner);
    }
  }

  onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof Enemy) {
      //remove from this.others
      let otherIndex = this.others.findIndex(e => e == other.owner);
      if (otherIndex != -1) this.others.splice(otherIndex, 1);

      if (this.others.length == 0) {
        this.isColliding = false;
      }
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.isColliding && this.ac?.currentFrame == 2) {
      this.others.forEach((enemy: Enemy) => {
        if (enemy.state == "death") return;
        (this.parent as DarkPlayer).numenemies++;
        enemy.pain("sword");
      });
    }
  }
}
