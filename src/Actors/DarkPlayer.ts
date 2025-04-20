import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
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
  swordGuyHandsArmedWalkLeft,
  swordGuyHandsArmedWalkRight,
  swordGuyHandsNormalIdleLeft,
  swordGuyHandsNormalIdleRight,
  swordGuyHandsNormalWalkLeft,
  swordGuyHandsNormalWalkRight,
  swordSlashAnimationLeft,
  swordSlashAnimationRight,
} from "../Animations/swordPlayerAnimations";
import { HandsActor } from "./HandsActor";
import { WeaponActor } from "./WeaponActor";
import { LightPlayer } from "./LightPlayer";
import {bodyShadowSS, Resources, SFX_VOLUME} from "../resources";

export class DarkPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
  isPlayerActive: boolean = true;
  partner: LightPlayer | undefined;
  isWalking: boolean = false;

  oldXVelocity: number = 0;

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
    idleNormalLeft: swordGuyHandsNormalIdleLeft,
    idleNormalRight: swordGuyHandsNormalIdleRight,
    walkNormalLeft: swordGuyHandsNormalWalkLeft,
    walkNormalRight: swordGuyHandsNormalWalkRight,
    idleAttackLeft: swordGuyHandsArmedIdleLeft,
    idleAttackRight: swordGuyHandsArmedIdleRight,
    walkAttackLeft: swordGuyHandsArmedWalkLeft,
    walkAttackRight: swordGuyHandsArmedWalkRight,
  });

  HealthBar: HealthBar | undefined;
  speed: number = 80;
  exp: number = 0;
  fireIntervalHandler: any;
  fireInterval: number = 1000; // Time between shots in milliseconds
  fireDamage: number = 3;
  isJoystickActive: boolean = true;
  isKeyboardActive: boolean = false;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  gamePausedSignal: Signal = new Signal("pauseGame");
  oldDirectionFacing: "Left" | "Right" = "Right";
  isWaveActive: boolean = false;

  constructor() {
    super({
      width: 19,
      height: 30,
      //color: Color.Black,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1001,
      collisionType: CollisionType.Active,
      collisionGroup: playerCollisionGroup,
    });
    //this.addComponent(this.jc);
    this.addComponent(this.ac);
    this.ac.set("idleRight");
    this.HealthBar = new HealthBar(new Vector(32, 16), new Vector(-16, -32), 20);
    this.addChild(this.HealthBar);
    this.fireIntervalHandler = setInterval(this.fire.bind(this), this.fireInterval);

    this.handChild.walkState = "idle";
    this.handChild.attackState = "Normal";
    this.handChild.direction = "Right";

    this.addChild(this.handChild);

    const shadow = new Actor({
      width: 48,
      height: 48,
    });
    shadow.graphics.use(bodyShadowSS.sprites[0]);
    this.addChild(shadow);

    this.gamePausedSignal.listen((params: CustomEvent) => {
      console.log("darkplayer getting game paused");
      this.isWaveActive = !params.detail.params[0];
    });
  }

  onInitialize(engine: Engine): void {
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
      Resources.sfxGeneralPickup.play(SFX_VOLUME);
    }
  }

  registerPartner(partner: LightPlayer) {
    this.partner = partner;
  }

  get direction() {
    return this.directionFacing;
  }

  disableTouch() {
    this.removeComponent(this.jc, true);
  }

  enableTouch() {
    this.addComponent(this.jc, true);
  }

  joystickCallback = (data: any) => {
    if (!this.isPlayerActive || !this.isJoystickActive) return;
    if (data.state === "active") {
      if (data.direction.x < 0) this.directionFacing = "Left";
      else this.directionFacing = "Right";

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
  };

  fire() {
    if (!this.isWaveActive) return;
    this.addChild(
      new WeaponActor(
        { attackLeft: swordSlashAnimationLeft, attackRight: swordSlashAnimationRight },
        this.directionFacing,
        this.releaseWeapon
      )
    );
    this.handChild.attackState = "Attack";
    this.handChild.direction = this.directionFacing;
  }

  releaseWeapon = () => {
    this.handChild.attackState = "Normal";
  };

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (!this.isWaveActive) return;
    const currentActions = this.actions.getQueue();
    const followAction = currentActions.getActions().find(action => action instanceof Follow);

    if (!this.isPlayerActive && this.partner && this.partner.pos.distance(this.pos) > 25 && !followAction) {
      this.actions.follow(this.partner, 50);
    } else if (this.isPlayerActive && followAction) {
      this.actions.clearActions();
    }

    if (!this.isPlayerActive) {
      let dirtyFlag = false;
      if (this.partner!.isWalking && this.isWalking === false) {
        this.isWalking = true;
        dirtyFlag = true;
      } else if (!this.partner!.isWalking && this.isWalking === true) {
        this.isWalking = false;
        dirtyFlag = true;
      }

      if (this.partner!.directionFacing != this.directionFacing) {
        this.directionFacing = this.partner!.directionFacing;
        this.handChild.direction = this.directionFacing;
        dirtyFlag = true;
      }

      if (dirtyFlag) {
        if (this.isWalking) {
          this.ac.set(`walk${this.directionFacing}`);
        } else {
          this.ac.set(`idle${this.directionFacing}`);
        }
      }
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
      } else if (keys.includes("ArrowRight")) {
        this.vel.x = this.speed;
      }

      if (keys.includes("ArrowUp")) {
        this.vel.y = -this.speed;
      } else if (keys.includes("ArrowDown")) {
        this.vel.y = this.speed;
      }

      if (!keys.includes("ArrowLeft") && !keys.includes("ArrowRight")) {
        this.vel.x = 0;
      }
      if (!keys.includes("ArrowUp") && !keys.includes("ArrowDown")) {
        this.vel.y = 0;
      }

      if (this.vel.x != 0 || this.vel.y != 0) {
        if (this.isWalking === false) {
          // if idle, and starting to walk
          if (this.vel.x > 0) this.directionFacing = "Right";
          else if (this.vel.x < 0) this.directionFacing = "Left";
          this.handChild.direction = this.directionFacing;
          this.oldXVelocity = this.vel.x;
          this.isWalking = true;
          this.ac.set(`walk${this.directionFacing}`);
        } else {
          // if walking already

          //if the x direction changes while walking
          if (this.oldXVelocity < 0 && this.vel.x > 0) {
            this.directionFacing = "Right";
            this.handChild.direction = this.directionFacing;
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
          } else if (this.oldXVelocity > 0 && this.vel.x < 0) {
            this.directionFacing = "Left";
            this.handChild.direction = this.directionFacing;
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
          }
        }
      } else {
        if (this.isWalking === true) {
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
      Resources.sfxDeath.play(SFX_VOLUME);
      this.kill();
    }
  }
}
