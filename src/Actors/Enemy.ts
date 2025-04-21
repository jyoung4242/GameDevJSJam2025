import {
  Actor,
  Animation,
  Circle,
  Collider,
  ColliderComponent,
  CollisionContact,
  CollisionType,
  Color,
  Engine,
  GraphicsGroup,
  Meet,
  Random,
  Side,
  vec,
  Vector,
} from "excalibur";
import { EnemyCollisionGroup } from "../Lib/colliderGroups";
import { DarkPlayer } from "./DarkPlayer";
import { LightPlayer } from "./LightPlayer";
import { BlessingDrop, SoulDrop } from "./drops";
import { GameScene } from "../Scenes/game";
import { Resources, SFX_VOLUME } from "../resources";
import { purpleGuyAnimation, purpleGuyArrowDeathAnimation, purpleGuySwordDeathAnimation } from "../Animations/purpleGuyAnimation";
import { Signal } from "../Lib/Signals";
import { actorFlashWhite } from "../Effects/createWhiteMaterial";

const enemyRNG = new Random(Date.now()); // Random number generator for enemy behavior

export class Enemy extends Actor {
  //properties that change with progression
  //constitution
  currentHP: number = 1;
  maxHP: number = 1;

  //strength
  attackPower: number = 1;

  //speed
  speed: number = 25;

  _waveLevel: number = 1;

  affinity: "dark" | "light" = "dark"; // Affinity of the enemy
  state: "default" | "death" = "default";
  lightTarget: LightPlayer | undefined;
  darkTarget: DarkPlayer | undefined;
  currentTarget: LightPlayer | DarkPlayer | undefined = undefined;
  graphic: GraphicsGroup;
  UISignal: Signal = new Signal("stateUpdate");
  progressionSignal: Signal = new Signal("progressionUpdate");
  swordDeathAnimation = purpleGuySwordDeathAnimation.clone();
  arrowDeathAnimation = purpleGuyArrowDeathAnimation.clone();
  startingGraphic: GraphicsGroup;
  startingAnimation: Animation;
  startingCollider: ColliderComponent;

  constructor(pos: Vector, lightPlayer: LightPlayer, darkPlayer: DarkPlayer) {
    super({
      radius: 7.5,
      pos,
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Active,
      collisionGroup: EnemyCollisionGroup,
    });
    const randomFirstFrame = Math.floor(Math.random() * 5); //0 - 4
    const animation = purpleGuyAnimation.clone();
    animation.goToFrame(randomFirstFrame);

    const enemyGraphicGroup = new GraphicsGroup({
      useAnchor: true,
      members: [
        {
          graphic: Resources.purpleShadow.toSprite(),
          offset: vec(0, 0),
        },
        {
          graphic: animation,
          offset: vec(0, 0),
        },
      ],
    });

    this.graphic = enemyGraphicGroup;

    // setup default states
    this.startingGraphic = enemyGraphicGroup.clone();
    this.startingAnimation = animation.clone();
    this.startingCollider = this.collider.clone();

    this.lightTarget = lightPlayer;
    this.darkTarget = darkPlayer;
    this.graphics.use(this.graphic);
    if (enemyRNG.bool()) {
      this.affinity = "light";
      this.graphic.tint = Color.fromHex("#888888").lighten(0.9);
    } else {
      this.graphic.tint = Color.fromHex("#888888").darken(0.1);
    }
  }

  set waveLevel(level: number) {
    if (this._waveLevel === level) return;
    this._waveLevel = level;
    this.maxHP = level;
    this.speed = this.speed + level;
    this.attackPower *= level * 0.1;
    //get current scale
    const currentScale = this.scale;
    //increase scale by 5%
    this.scale = currentScale.add(vec(0.05, 0.05));
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.state === "death") {
      return;
    }

    //this is if enemy damages player
    if (other.owner instanceof DarkPlayer || other.owner instanceof LightPlayer) {
      (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      this.scene?.remove(this); // Remove the enemy from the scene
      other.owner.currentHP -= 2; // Decrease the player's health by 1
      const engine = other.owner.scene?.engine;
      if (engine) {
        actorFlashWhite(engine, other.owner, 150);
        Resources.sfxPlayerHurt.play(SFX_VOLUME);
      }
      this.UISignal.send(["playerDamaged"]);
    }
  }

  onInitialize() {
    this.swordDeathAnimation.events.on("end", () => {
      //console.log("animation end event");
    });
    this.arrowDeathAnimation.events.on("end", () => {
      //console.log("animation end event");
    });
  }

  setAffinity(affinity: "dark" | "light") {
    this.affinity = affinity;
    if (affinity == "dark") {
      this.graphic.tint = Color.fromHex("#888888").darken(0.1);
    } else {
      this.graphic.tint = Color.fromHex("#888888").lighten(0.9);
    }
  }

  reset() {
    const currentGraphicsNames = this.graphics.getNames();
    currentGraphicsNames.forEach(grp => this.graphics.remove(grp));
    this.graphics.use(this.startingGraphic.clone());
    this.graphic.members[1] = this.startingAnimation.clone();
    this.swordDeathAnimation.reset();
    this.arrowDeathAnimation.reset();
    this.state = "default";
    this.collider = this.startingCollider.clone();

    if (enemyRNG.bool()) {
      this.affinity = "light";
      this.graphic.tint = Color.fromHex("#888888").lighten(0.9);
    } else {
      this.affinity = "dark";
      this.graphic.tint = Color.fromHex("#888888").darken(0.1);
    }
  }

  checkDrop() {
    let drop = enemyRNG.integer(0, 100); // Generate a random number between 0 and 100
    if (drop < 40) {
      //spawn drop
      if (!this.scene) return;
      if (this.affinity == "dark") {
        //spawn dark drop

        this.scene.add(new SoulDrop(this.pos));
      } else {
        //spawn light drop
        this.scene.add(new BlessingDrop(this.pos));
      }
    }
  }

  pain(deathBy: "sword" | "arrow") {
    this.actions.clearActions();
    this.state = "death";

    this.collider.clear();

    Resources.sfxEnemyKilled.play(SFX_VOLUME);
    const engine = this.scene?.engine;
    if (engine) {
      actorFlashWhite(engine, this, 300, () => {
        this.graphic.members[1] = deathBy === "sword" ? this.swordDeathAnimation : this.arrowDeathAnimation;
      });
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.state === "death") {
      if (this.swordDeathAnimation.done) {
        this.checkDrop();

        this.UISignal.send(["enemyDefeated", this.affinity]);
        this.actions.clearActions();
        this.scene?.remove(this); // Remove the enemy from the scene
        (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      }
      if (this.arrowDeathAnimation.done) {
        this.checkDrop();

        this.UISignal.send(["enemyDefeated", this.affinity]);
        this.actions.clearActions();
        this.scene?.remove(this); // Remove the enemy from the scene
        (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      }
      return;
    }

    this.graphics.use(this.graphic);

    //get actions
    const currentActions = this.actions.getQueue();
    const meetAction = currentActions.getActions().find(action => action instanceof Meet);
    let closestTarget;
    if (!meetAction) {
      if (this.lightTarget?.isAlive && this.darkTarget?.isAlive) {
        //find closest target
        closestTarget =
          this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;
      } else if (this.lightTarget?.isAlive) closestTarget = this.lightTarget;
      else if (this.darkTarget?.isAlive) closestTarget = this.darkTarget;
      if (!closestTarget) return;
      this.currentTarget = closestTarget;
      this.actions.meet(closestTarget, this.speed);
    } else {
      //already chasing player
      //get target, confirm they are still viable
      if (this.currentTarget?.isAlive) {
        return;
      }

      this.actions.clearActions();
      if (this.lightTarget?.isAlive) this.currentTarget = this.lightTarget;
      else if (this.darkTarget?.isAlive) this.currentTarget = this.darkTarget;
      this.actions.meet(this.currentTarget!, this.speed);
    }
  }
}
