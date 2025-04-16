import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
import { DarkWeapon } from "./darkWeapon";
import { SoulDrop } from "./drops";
import { KeyBoardControlComponent } from "../Components/KeyboardInputComponent";
import { GameScene } from "../Scenes/game";
import { Signal } from "../Lib/Signals";
import { AnimationComponent } from "../Components/AnimationComponent";
import {
  swordGuyBodyIdleLeft,
  swordGuyBodyIdleRight,
  swordGuyBodyWalkLeft,
  swordGuyBodyWalkRight,
  swordGuyHandsArmedIdleLeft,
  swordGuyHandsArmedIdleRight,
  swordGuyHandsNormalIdleLeft,
  swordGuyHandsNormalIdleRight,
  swordSlashAnimationLeft,
  swordSlashAnimationRight,
} from "../Animations/swordPlayerAnimations";
import { HandsActor } from "./HandsActor";
import { WeaponActor } from "./WeaponActor";
import { LightPlayer } from "./LightPlayer";

export class DarkPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
  isPlayerActive: boolean = true;
  partner: LightPlayer | undefined;
  isWalking: boolean = false;

  jc: JoystickComponent = new JoystickComponent();
  kc: KeyBoardControlComponent = new KeyBoardControlComponent();
  ac: AnimationComponent<"idleLeft" | "idleRight" | "walkLeft" | "walkRight"> = new AnimationComponent({
    idleLeft: swordGuyBodyIdleLeft,
    idleRight: swordGuyBodyIdleRight,
    walkLeft: swordGuyBodyWalkLeft,
    walkRight: swordGuyBodyWalkRight,
  });
  directionFacing: "Left" | "Right" = "Right";

  handChild: HandsActor = new HandsActor({
    idleLeft: swordGuyHandsNormalIdleLeft,
    idleRight: swordGuyHandsNormalIdleRight,
    attackLeft: swordGuyHandsArmedIdleLeft,
    attackRight: swordGuyHandsArmedIdleRight,
  });

  /*   weaponChild: WeaponActor = new WeaponActor({
    attackLeft: swordSlashAnimationLeft,
    attackRight: swordSlashAnimationRight,
  }); */

  HealthBar: HealthBar | undefined;
  speed: number = 80;
  exp: number = 0;
  fireIntervalHandler: any;
  fireInterval: number = 2000; // Time between shots in milliseconds
  fireDamage: number = 3;
  isJoystickActive: boolean = true;
  isKeyboardActive: boolean = false;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  gamePausedSignal: Signal = new Signal("pauseGame");

  constructor() {
    super({
      width: 19,
      height: 30,
      //color: Color.Black,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Active,
      collisionGroup: playerCollisionGroup,
    });
    this.addComponent(this.jc);
    this.addComponent(this.ac);
    this.ac.set("idleRight");
    this.HealthBar = new HealthBar(new Vector(20, 2), new Vector(-10, -15), 20);
    this.addChild(this.HealthBar);
    this.fireIntervalHandler = setInterval(this.fire.bind(this), this.fireInterval);

    this.handChild.state = "idle";
    this.handChild.direction = "Right";
    this.addChild(this.handChild);

    //Add this actor when attacking
    //this.weaponChild.direction = "Right";
    //this.weaponChild.setResetCallback(this.releaseWeapon);
  }

  onInitialize(engine: Engine): void {
    this.jc.init(
      {
        updateInterval: 50, // Update frequency in ms
        deadZone: 15, // Minimum movement before "active" state
      },
      data => {
        if (!this.isPlayerActive || !this.isJoystickActive) return;
        if (data.state === "active") {
          if (data.direction.x < 0) this.directionFacing = "Left";
          else this.directionFacing = "Right";
          //this.weaponChild.direction = this.directionFacing;

          this.vel.x = data.direction.x * this.speed;
          this.vel.y = data.direction.y * this.speed;
          if (this.isWalking === false) {
            this.isWalking = true;
            this.ac.set(`walk${this.directionFacing}`);
          }
        } else {
          this.vel.x = 0;
          this.vel.y = 0;
          if (this.isWalking === true) {
            this.isWalking = false;
            this.ac.set(`idle${this.directionFacing}`);
          }
        }
      }
    );
    this.kc.init();

    if (!this.scene) return;
    this.scene.camera.strategy.lockToActor(this);
    this.scene.camera.zoom = 1.5;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof SoulDrop) {
      this.exp += 1; // Increase the player's experience
      this.UISignal.send(["soul"]);
      other.owner.kill();
    }
  }

  registerPartner(partner: LightPlayer) {
    this.partner = partner;
  }

  get direction() {
    return this.directionFacing;
  }

  fire() {
    //this.weaponChild.attackState = "attack";
    //this.weaponChild.direction = this.directionFacing;

    this.addChild(
      new WeaponActor(
        { attackLeft: swordSlashAnimationLeft, attackRight: swordSlashAnimationRight },
        this.directionFacing,
        this.releaseWeapon
      )
    );

    this.handChild.attackState = "attack";
    this.handChild.directionfacing = this.directionFacing;

    //let newWeapon = new DarkWeapon(this.pos);
    //this.addChild(newWeapon);
  }

  releaseWeapon = () => {
    //console.log("reset callback", this.weaponChild);
    //this.removeChild(this.weaponChild);
    this.handChild.attackState = "idle";
  };

  onPreUpdate(engine: Engine, elapsed: number): void {
    const currentActions = this.actions.getQueue();
    const followAction = currentActions.getActions().find(action => action instanceof Follow);

    if (!this.isPlayerActive && this.partner && this.partner.pos.distance(this.pos) > 25 && !followAction) {
      this.actions.follow(this.partner, 50);
    } else if (this.isPlayerActive && followAction) {
      this.actions.clearActions();
    }

    if (!this.isPlayerActive && followAction) {
      this.directionFacing = this.partner!.direction;
      if (this.vel.x != 0 || this.vel.y != 0) this.isWalking = true;
      else this.isWalking = false;
    }

    this.HealthBar?.setPercent((this.currentHP / this.maxHP) * 100);

    if (this.kc.keyEnable) {
      this.isKeyboardActive = true;
      this.isJoystickActive = false;
    }

    if (this.isPlayerActive && this.isKeyboardActive) {
      let keys = this.kc.keys;

      if (keys.includes("ArrowLeft")) {
        this.vel.x = -this.speed;
        this.directionFacing = "Left";
      } else if (keys.includes("ArrowRight")) {
        this.vel.x = this.speed;
        this.directionFacing = "Right";
      }
      //this.weaponChild.direction = this.directionFacing;

      if (keys.includes("ArrowUp")) {
        this.vel.y = -this.speed;
      } else if (keys.includes("ArrowDown")) {
        this.vel.y = this.speed;
      }

      //if (this.vel.x != 0 || this.vel.y != 0) this.ac.set(`walk${this.directionFacing}`);

      if (!keys.includes("ArrowLeft") && !keys.includes("ArrowRight")) {
        this.vel.x = 0;
      }
      if (!keys.includes("ArrowUp") && !keys.includes("ArrowDown")) {
        this.vel.y = 0;
      }
      if (this.vel.x !== 0 || this.vel.y !== 0) {
        if (this.isWalking === false) {
          console.log("setting walk animatino");
          this.isWalking = true;
          this.ac.set(`walk${this.directionFacing}`);
        }
      } else {
        if (this.isWalking === true) {
          console.log("setting idle animatino");
          this.isWalking = false;
          this.ac.set(`idle${this.directionFacing}`);
        }
      }
    }

    if (this.currentHP <= 0) {
      if (this.isPlayerActive) {
        (this.scene as GameScene).switchPlayerFocus(); // Switch focus to the partner
      }
      if (this.fireIntervalHandler) {
        clearInterval(this.fireIntervalHandler); // Clear the fire interval handler
      }
      this.kill();
    }
  }
}
