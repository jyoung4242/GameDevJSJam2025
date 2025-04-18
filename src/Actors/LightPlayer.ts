import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
import { Enemy } from "./Enemy";
import { LightBullet } from "./lightBullet";
import { BlessingDrop } from "./drops";
import { KeyBoardControlComponent } from "../Components/KeyboardInputComponent";
import { GameScene } from "../Scenes/game";
import { Signal } from "../Lib/Signals";
import { DarkPlayer } from "./DarkPlayer";

import { AnimationComponent } from "../Components/AnimationComponent";
import { HandsActor } from "./HandsActor";
import { BowWeaponActor } from "./nonCollidingWeapon";
import {
  bowGuyBodyIdleLeft,
  bowDrawAnimationLeft,
  bowDrawAnimationRight,
  bowGuyBodyIdleRight,
  bowGuyBodyWalkLeft,
  bowGuyBodyWalkRight,
  bowGuyHandsArmedIdleRight,
  bowGuyHandsArmedWalkRight,
  bowGuyHandsNormalIdleRight,
  bowGuyHandsNormalWalkRight,
  bowGuyHandsNormalWalkLeft,
  bowGuyHandsArmedWalkLeft,
  bowGuyHandsNormalIdleLeft,
  bowGuyHandsArmedIdleLeft,
} from "../Animations/bowPlayerAnimations";

export class LightPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
  exp: number = 0;
  isPlayerActive: boolean = false;
  jc: JoystickComponent = new JoystickComponent();
  kc: KeyBoardControlComponent = new KeyBoardControlComponent();
  ac: AnimationComponent<"idleLeft" | "idleRight" | "walkLeft" | "walkRight"> = new AnimationComponent({
    idleLeft: bowGuyBodyIdleLeft,
    idleRight: bowGuyBodyIdleRight,
    walkLeft: bowGuyBodyWalkLeft,
    walkRight: bowGuyBodyWalkRight,
  });
  partner: DarkPlayer | undefined;
  HealthBar: HealthBar | undefined;
  fireIntervalHandler: any;
  isJoystickActive: boolean = true;
  isKeyboardActive: boolean = false;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  directionFacing: "Left" | "Right" = "Right";
  isWalking: boolean = false;
  oldXVelocity: number = 0;
  oldDirectionFacing: "Left" | "Right" = "Right";
  weaponChild: BowWeaponActor | undefined;
  closestEnemy: Enemy | undefined;

  handChild: HandsActor = new HandsActor({
    idleNormalLeft: bowGuyHandsNormalIdleLeft,
    idleNormalRight: bowGuyHandsNormalIdleRight,
    walkNormalLeft: bowGuyHandsNormalWalkLeft,
    walkNormalRight: bowGuyHandsNormalWalkRight,
    idleAttackLeft: bowGuyHandsArmedIdleLeft,
    idleAttackRight: bowGuyHandsArmedIdleRight,
    walkAttackLeft: bowGuyHandsArmedWalkLeft,
    walkAttackRight: bowGuyHandsArmedWalkRight,
  });

  speed: number = 100;
  fireInterval: number = 6000; // Time between shots in milliseconds
  fireRange: number = 100; // Range of the bullet
  fireDamage: number = 1; // Damage dealt by the bullet
  isFiring: boolean = false;

  constructor() {
    super({
      radius: 10,
      color: Color.White,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Active,
      collisionGroup: playerCollisionGroup,
    });
    this.addComponent(this.jc);
    this.addComponent(this.ac);
    this.ac.set("idleRight");

    this.HealthBar = new HealthBar(new Vector(32, 16), new Vector(-16, -32), 20);
    this.addChild(this.HealthBar);

    this.handChild.walkState = "idle";
    this.handChild.attackState = "Normal";
    this.handChild.direction = "Right";
    this.addChild(this.handChild);

    this.fireIntervalHandler = setInterval(this.fire.bind(this), this.fireInterval);
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
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof BlessingDrop) {
      other.owner.kill(); // Remove the blessing drop from the scene
      this.UISignal.send(["blessing"]);
      this.exp += 1; // Increase the player's experience
    }
  }

  get direction() {
    return this.directionFacing;
  }

  registerPartner(partner: DarkPlayer) {
    this.partner = partner;
    this.pos = partner.pos.clone().add(vec(0, -50)); // Position the light player above the dark player
  }

  fire() {
    //get enemies
    let enemies = this.scene?.entities.filter(entity => entity instanceof Enemy);

    let closestEnemy: Enemy | undefined = undefined;
    let closestDistance = Infinity;

    for (const en of enemies!) {
      let enemy = en as Enemy;
      let distance = this.pos.distance(enemy.pos);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      this.closestEnemy = closestEnemy;
      this.weaponChild = new BowWeaponActor(
        { attackLeft: bowDrawAnimationLeft, attackRight: bowDrawAnimationRight },
        this.directionFacing,
        this.releaseWeapon
      );
      this.addChild(this.weaponChild);
      this.isFiring = true;
      this.handChild.attackState = "Attack";
    }
  }

  releaseWeapon = () => {
    this.handChild.attackState = "Normal";
  };

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.isFiring && this.closestEnemy && this.weaponChild) {
      //check animation frame
      let currentFrame = this.weaponChild.animationframe;
      if (currentFrame == 1) {
        let bullet = new LightBullet(this.pos, this.closestEnemy, this.fireDamage);
        this.scene?.add(bullet);
        this.closestEnemy = undefined;
        this.isFiring = false;
      }
    }

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
        // if idle, and starting to walk
        if (this.isWalking === false) {
          if (this.vel.x > 0) this.directionFacing = "Right";
          else this.directionFacing = "Left";
          this.handChild.direction = this.directionFacing;
          this.oldXVelocity = this.vel.x;
          this.isWalking = true;
          this.ac.set(`walk${this.directionFacing}`);
        } else {
          if (this.oldXVelocity < 0 && this.vel.x > 0) {
            this.directionFacing = "Right";
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
            this.handChild.direction = this.directionFacing;
          } else if (this.oldXVelocity > 0 && this.vel.x < 0) {
            this.directionFacing = "Left";
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
            this.handChild.direction = this.directionFacing;
          }
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
