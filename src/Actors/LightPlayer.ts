import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Color,
  Engine,
  Follow,
  Side,
  Timer,
  toDegrees,
  toRadians,
  vec,
  Vector,
} from "excalibur";
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
import { bodyShadowSS, Resources, SFX_VOLUME } from "../resources";

export class LightPlayer extends Actor {
  name = "LightPlayer";
  //properties that change with progression
  //constitution
  currentHP: number = 15;
  maxHP: number = 15;
  regenRate: number = 1000;

  //strength
  attackPower: number = 1;
  pickupDistance: number = 50;

  //speed
  speed: number = 100;
  fireInterval: number = 3000; // Time between shots in milliseconds

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
  gamePausedSignal: Signal = new Signal("pauseGame");
  progressionSignal: Signal = new Signal("progressionUpdate");
  waveResetSignal: Signal = new Signal("waveReset");
  balanceUISignal: Signal = new Signal("balanceUpdate");
  numenemies: number = 0;
  numEnemiesWhileActive: number = 0;
  directionFacing: "Left" | "Right" = "Right";
  isWalking: boolean = false;
  oldXVelocity: number = 0;
  oldDirectionFacing: "Left" | "Right" = "Right";
  weaponChild: BowWeaponActor | undefined;
  closestEnemy: Enemy | undefined;
  timer: Timer | undefined = undefined;
  switchLock: boolean = false;

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

  fireRange: number = 100; // Range of the bullet
  fireDamage: number = 1; // Damage dealt by the bullet
  isFiring: boolean = false;
  isWaveActive: boolean = false;
  isAlive: boolean = true;
  constructor() {
    super({
      radius: 10,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Active,
      collisionGroup: playerCollisionGroup,
    });

    this.addComponent(this.ac);
    this.ac.set("idleRight");

    this.HealthBar = new HealthBar(new Vector(-16, -27), 20);
    this.addChild(this.HealthBar);

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

    //active playertik
    class ActivePlayerTik extends Actor {
      owner: LightPlayer;
      wasActive: boolean = true;
      constructor(owner: LightPlayer) {
        super({ pos: vec(0, -32), z: 1002, scale: vec(0.8, 0.8) });
        this.owner = owner;
        this.graphics.use(Resources.activePlayerTik.toSprite());
      }
      onPreUpdate(engine: Engine, elapsed: number): void {
        if (this.owner.isPlayerActive === true) {
          if (!this.wasActive) {
            this.graphics.use(Resources.activePlayerTik.toSprite());
            this.wasActive = true;
          }
        } else {
          if (this.wasActive) {
            this.wasActive = false;
            this.graphics.hide();
          }
        }
      }
    }

    this.addChild(new ActivePlayerTik(this));
    this.waveResetSignal.listen((params: CustomEvent) => (this.numenemies = 0));
    this.gamePausedSignal.listen((params: CustomEvent) => {
      //console.log("game paused", params.detail.params[0]);

      this.isWaveActive = !params.detail.params[0];
    });
    this.progressionSignal.listen((params: CustomEvent) => {
      //console.log("lightplayer getting progression", params.detail.params);

      const progression = params.detail.params[0];
      switch (progression) {
        case "constitution":
          this.maxHP += 10;
          if (this.maxHP > 35) this.maxHP = 35;
          this.currentHP = this.maxHP;
          //this.regenRate = Math.floor(this.regenRate * 0.95);
          this.regenRate = Math.floor(this.regenRate * 0.95);
          //console.log("new health stats light: ", this.maxHP, this.currentHP, this.regenRate);

          break;
        case "speed":
          this.fireInterval = Math.floor(this.fireInterval * 0.75);
          this.timer?.cancel();
          this.timer = new Timer({
            fcn: () => this.fire(),
            repeats: true,
            interval: this.fireInterval,
          });
          this.scene!.add(this.timer);
          this.timer.start();
          this.speed += 25;
          //console.log("new speed stats light: ", this.fireInterval, this.speed);

          break;
        case "strength":
          this.attackPower += 1;
          this.pickupDistance = Math.floor(this.pickupDistance * 1.05);
          // console.log("new strength stats light: ", this.fireDamage, this.pickupDistance);

          break;
      }
    });
  }

  onInitialize(engine: Engine): void {
    this.kc.init();
    //add firing Timer
    this.timer = new Timer({
      fcn: () => this.fire(),
      repeats: true,
      interval: this.fireInterval,
    });
    engine.currentScene.add(this.timer);
    this.timer.start();
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof BlessingDrop) {
      other.owner.kill(); // Remove the blessing drop from the scene
      this.UISignal.send(["blessing"]);
      this.exp += 1; // Increase the player's experience
      Resources.sfxGeneralPickup.play(SFX_VOLUME);
      this.balanceUISignal.send(["balanceUpdate", "light"]);
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
    if (!this.isWaveActive) return;
    //get enemies
    let enemies = this.scene?.entities.filter(entity => {
      //if (entity instanceof Enemy) console.log("entity", (entity as Enemy).enemeystate, entity);

      return entity instanceof Enemy && entity.enemeystate == "default";
    });

    //console.log("enemies", enemies);

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

  disableTouch() {
    this.removeComponent(this.jc);
  }

  enableTouch() {
    this.addComponent(this.jc);
  }

  joystickCallback = (data: any) => {
    if (!this.isPlayerActive || !this.isJoystickActive) return;

    if (data.state === "hold") {
      this.switchLock = true;
      (this.scene as GameScene).switchPlayerFocus();
    }

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

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (!this.isWaveActive) return;

    if (this.isFiring && this.closestEnemy && this.weaponChild) {
      //check animation frame
      let currentFrame = this.weaponChild.animationframe;
      if (currentFrame == 1) {
        // basic bullet
        let zeroAngle = this.closestEnemy.pos.sub(this.pos).toAngle();
        let SndAngle = toRadians(7.5);
        let TrdAngle = toRadians(15);
        /* console.log("attack power: ", this.attackPower);
        console.log("zero angle: ", toDegrees(zeroAngle), zeroAngle);
        console.log("closest enemy vector:", this.closestEnemy.pos.x, this.closestEnemy.pos.y); */

        let bullet = new LightBullet(this.pos, this.closestEnemy.pos, this.fireDamage, this, true);
        /* console.log("adding 1st bullet"); */
        this.scene?.add(bullet);

        // level 2 bullets
        if (this.attackPower >= 2) {
          let anglePositive = zeroAngle + SndAngle;
          let angleNegative = zeroAngle - SndAngle;
          /*  console.log("angle positive: ", toDegrees(anglePositive), anglePositive);
          console.log("angle negative: ", toDegrees(angleNegative), angleNegative); */

          let newPositiveVector = this.pos.add(vec(Math.cos(anglePositive), Math.sin(anglePositive)));
          let newNegativeVector = this.pos.add(vec(Math.cos(angleNegative), Math.sin(angleNegative)));

          /* console.log("newPositiveVector: ", newPositiveVector);
          console.log("newNegativeVector: ", newNegativeVector); */

          let arrow2 = new LightBullet(this.pos, newPositiveVector, this.fireDamage, this, false);
          //console.log("adding 2nd bullet");
          let arrow3 = new LightBullet(this.pos, newNegativeVector, this.fireDamage, this, false);
          //console.log("adding 3rdnd bullet");
          this.scene?.add(arrow2);
          this.scene?.add(arrow3);
        }

        //level 3 bullets
        if (this.attackPower >= 3) {
          let anglePositive = zeroAngle + TrdAngle;
          let angleNegative = zeroAngle - TrdAngle;
          /*  console.log("angle positive: ", toDegrees(anglePositive), anglePositive);
          console.log("angle negative: ", toDegrees(angleNegative), angleNegative); */

          let newPositiveVector = this.pos.add(vec(Math.cos(anglePositive), Math.sin(anglePositive)));
          let newNegativeVector = this.pos.add(vec(Math.cos(angleNegative), Math.sin(angleNegative)));

          /* console.log("newPositiveVector: ", newPositiveVector);
          console.log("newNegativeVector: ", newNegativeVector); */

          let arrow2 = new LightBullet(this.pos, newPositiveVector, this.fireDamage, this, false);
          //console.log("adding 2nd bullet");
          let arrow3 = new LightBullet(this.pos, newNegativeVector, this.fireDamage, this, false);
          //console.log("adding 3rdnd bullet");
          this.scene?.add(arrow2);
          this.scene?.add(arrow3);
        }

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
      //console.log(keys);

      if (keys.includes("ArrowLeft") || keys.includes("KeyA")) {
        this.vel.x = -this.speed;
      } else if (keys.includes("ArrowRight") || keys.includes("KeyD")) {
        this.vel.x = this.speed;
      }

      if (keys.includes("ArrowUp") || keys.includes("KeyW")) {
        this.vel.y = -this.speed;
      } else if (keys.includes("ArrowDown") || keys.includes("KeyS")) {
        this.vel.y = this.speed;
      }

      if (keys.includes("Space") && !this.switchLock && this.isPlayerActive) {
        this.switchLock = true;
        (this.scene as GameScene).switchPlayerFocus();
      }

      if (!keys.includes("ArrowLeft") && !keys.includes("KeyA") && !keys.includes("ArrowRight") && !keys.includes("KeyD")) {
        this.vel.x = 0;
      }
      if (!keys.includes("ArrowUp") && !keys.includes("KeyW") && !keys.includes("ArrowDown") && !keys.includes("KeyS")) {
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
          if (this.oldXVelocity <= 0 && this.vel.x > 0) {
            this.directionFacing = "Right";
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
            this.handChild.direction = this.directionFacing;
          } else if (this.oldXVelocity >= 0 && this.vel.x < 0) {
            this.directionFacing = "Left";
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
            this.handChild.direction = this.directionFacing;
          }
        }
      } else {
        if (this.isWalking === true) {
          // console.log("setting idle animatino");
          this.isWalking = false;
          this.ac.set(`idle${this.directionFacing}`);
        }
      }
    }

    // Pickup Detection Logic

    const listOfBlessings = this.scene?.entities.filter(entity => entity instanceof BlessingDrop);
    if (listOfBlessings) {
      for (let i = 0; i < listOfBlessings.length; i++) {
        if (this.pos.distance(listOfBlessings[i].pos) < this.pickupDistance) {
          let blessing = listOfBlessings[i] as BlessingDrop;
          blessing.comeToActor(this);
        }
      }
    }

    if (this.currentHP <= 0) {
      this.timer?.cancel();
      if (this.isPlayerActive && this.partner?.isAlive) {
        (this.scene as GameScene).switchPlayerFocus(); // Switch focus to the partner
      }
      if (this.fireIntervalHandler) {
        clearInterval(this.fireIntervalHandler); // Clear the fire interval handler
      }
      Resources.sfxDeath.play(SFX_VOLUME);
      this.isAlive = false;
      this.kill();
    }
  }
}
