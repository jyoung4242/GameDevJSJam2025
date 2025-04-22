import { Actor, Collider, CollisionContact, CollisionType, Engine, Scene, Side, vec, Vector } from "excalibur";
import { AnimationComponent } from "../Components/AnimationComponent";
import { weaponCollisionGroup } from "../Lib/colliderGroups";
import { Enemy } from "./Enemy";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";
import { Resources, SFX_VOLUME } from "../resources";
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
  enemyDefeatedSignal: Signal = new Signal("enemyDefeated");
  waveResetSignal: Signal = new Signal("waveReset");
  isColliding: boolean = false;
  others: Enemy[] = [];
  numenemies: number = 0;
  isPlayerActive: boolean;

  constructor(animationSet: any, direction: "Left" | "Right", isPlayerActive: boolean, resetCallback: () => void) {
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
    this.isPlayerActive = isPlayerActive;
  }

  onPreKill(scene: Scene): void {
    this.animationSet["attackLeft"].events.off("end");
    this.animationSet["attackRight"].events.off("end");
  }

  makeBig() {
    this.scale = vec(1.5, 1.5);
  }

  onInitialize(engine: Engine): void {
    if (this.directionfacing == "Left") this.pos = new Vector(this.leftVector.x + 4, this.leftVector.y + 2);
    else this.pos = new Vector(this.rightVector.x - 4, this.rightVector.y + 2);
    this.ac = new AnimationComponent(this.animationSet);
    this.addComponent(this.ac);
    const animationState: "attackLeft" | "attackRight" = (this.state + this.directionfacing) as "attackLeft" | "attackRight";
    this.ac!.set(animationState as "attackLeft" | "attackRight");
    const reducedInactivePlayerVolume = SFX_VOLUME - 0.25;
    Resources.sfxSwordSwing.play(this.isPlayerActive ? SFX_VOLUME : reducedInactivePlayerVolume);
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
        this.enemyDefeatedSignal.send(["enemyDefeated", enemy.affinity, "axe"]);
        (this.parent as DarkPlayer).numenemies++;
        enemy.pain("sword");
      });
    }
  }
}
