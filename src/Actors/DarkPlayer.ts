import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, Timer, vec, Vector } from "excalibur";
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
import { bodyShadowSS, Resources, SFX_VOLUME } from "../resources";

export class DarkPlayer extends Actor {
  name = "DarkPlayer";
  //properties that change with progression
  //constitution
  currentHP: number = 1;
  maxHP: number = 25;
  regenRate: number = 1000;

  //strength
  attackPower: number = 1;
  pickupDistance: number = 50;

  //speed
  speed: number = 80;
  fireInterval: number = 1000; // Time between shots in milliseconds

  isPlayerActive: boolean = true;
  partner: LightPlayer | undefined;
  isWalking: boolean = false;

  oldXVelocity: number = 0;

  timer: Timer | undefined = undefined;

  switchLock: boolean = false;

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

  exp: number = 0;
  fireIntervalHandler: any;
  weaponchild: WeaponActor | undefined;
  weaponchild2: WeaponActor | undefined;
  fireDamage: number = 3;
  isJoystickActive: boolean = true;
  isKeyboardActive: boolean = false;
  UISignal: Signal = new Signal("stateUpdate"); // Signal to update UI
  gamePausedSignal: Signal = new Signal("pauseGame");
  progressionSignal: Signal = new Signal("progressionUpdate");
  oldDirectionFacing: "Left" | "Right" = "Right";
  isWaveActive: boolean = false;
  waveResetSignal: Signal = new Signal("waveReset");
  numenemies: number = 0;
  numEnemiesWhileActive: number = 0;

  isAlive: boolean = true;

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
    //this.fireIntervalHandler = setInterval(this.fire.bind(this), this.fireInterval);

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
      owner: DarkPlayer;
      wasActive: boolean = false;
      constructor(owner: DarkPlayer) {
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
      //console.log("darkplayer getting game paused");
      this.isWaveActive = !params.detail.params[0];
    });
    this.progressionSignal.listen((params: CustomEvent) => {
      //console.log("darkplayer getting progression", params.detail.params);

      const progression = params.detail.params[0];
      switch (progression) {
        case "constitution":
          this.maxHP += 10;
          if (this.maxHP > 50) this.maxHP = 50;
          this.currentHP = this.maxHP;
          //this.regenRate = Math.floor(this.regenRate * 0.95);
          //console.log("new health stats dark: ", this.maxHP, this.currentHP, this.regenRate);

          break;
        case "speed":
          this.fireInterval = Math.floor(this.fireInterval * 0.75);
          this.speed += 25;
          this.timer?.cancel();
          this.timer = new Timer({ fcn: () => this.fire(), repeats: true, interval: this.fireInterval });
          this.scene?.add(this.timer);
          this.timer.start();
          //console.log("new speed stats dark: ", this.fireInterval, this.speed);

          break;
        case "strength":
          this.attackPower++;
          this.pickupDistance = Math.floor(this.pickupDistance * 1.05);
          //console.log("new strength stats dark: ", this.fireDamage, this.pickupDistance);

          break;
      }
    });
  }

  onInitialize(engine: Engine): void {
    this.kc.init();

    if (!this.scene) return;
    this.scene.camera.strategy.lockToActor(this);
    this.scene.camera.zoom = 1.5;

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

  fire() {
    if (!this.isWaveActive) return;

    this.weaponchild = new WeaponActor(
      { attackLeft: swordSlashAnimationLeft, attackRight: swordSlashAnimationRight },
      this.directionFacing,
      this.isPlayerActive,
      this.releaseWeapon,
      this.scene as GameScene
    );

    this.addChild(this.weaponchild);
    this.handChild.attackState = "Attack";
    this.handChild.direction = this.directionFacing;

    if (this.attackPower >= 2) {
      let ScndDirection: "Left" | "Right" = this.directionFacing == "Left" ? "Right" : "Left";
      this.weaponchild2 = new WeaponActor(
        { attackLeft: swordSlashAnimationLeft, attackRight: swordSlashAnimationRight },
        ScndDirection,
        this.isPlayerActive,
        this.releaseWeapon,
        this.scene as GameScene
      );

      this.addChild(this.weaponchild2);
    }

    if (this.attackPower > 2) {
      //change colliders and graphics of both weapons.

      this.weaponchild.makeBig();
      this.weaponchild2!.makeBig();
    }
  }

  releaseWeapon = () => {
    this.handChild.attackState = "Normal";
  };

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (!this.isWaveActive) return;
    const currentActions = this.actions.getQueue();
    const followAction = currentActions.getActions().find(action => action instanceof Follow);

    //Companion Follow Logic
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

    //HealthBar Logic
    this.HealthBar?.setPercent((this.currentHP / this.maxHP) * 100);

    //Keyboard Control Logic
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
          if (this.oldXVelocity <= 0 && this.vel.x > 0) {
            this.directionFacing = "Right";
            this.handChild.direction = this.directionFacing;
            this.oldXVelocity = this.vel.x;
            this.ac.set(`walk${this.directionFacing}`);
          } else if (this.oldXVelocity >= 0 && this.vel.x < 0) {
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

    // Pickup Detection Logic

    const listOfSouls = this.scene?.entities.filter(entity => entity instanceof SoulDrop);
    if (listOfSouls) {
      for (let i = 0; i < listOfSouls.length; i++) {
        if (this.pos.distance(listOfSouls[i].pos) < this.pickupDistance) {
          let soul = listOfSouls[i] as SoulDrop;
          soul.comeToActor(this);
        }
      }
    }

    // Player Death Logic
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
