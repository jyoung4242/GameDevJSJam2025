import {
  Actor,
  Animation,
  Collider,
  ColliderComponent,
  CollisionContact,
  CollisionType,
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
import {
  purpleGuyDarkAnimation,
  purpleGuyLightAnimation,
  purpleGuyLightSwordDeathAnimation,
  purpleGuyLightArrowDeathAnimation,
  purpleGuyDarkSwordDeathAnimation,
  purpleGuyDarkArrowDeathAnimation,
  purpleGuyLightSpawnAnimation,
  purpleGuyDarkSpawnAnimation,
} from "../Animations/purpleGuyAnimation";
import { Signal } from "../Lib/Signals";
import { actorFlashWhite } from "../Effects/createWhiteMaterial";
import {SoundStagger} from "../Lib/SoundStagger";

const enemyRNG = new Random(Date.now()); // Random number generator for enemy behavior

const enemySwordDeathSoundStagger = new SoundStagger({
  volume: SFX_VOLUME,
});

export class Enemy extends Actor {
  name = "Enemy";
  CurrentGraphicsGroup: GraphicsGroup;

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
  state: "default" | "death" | "spawning" = "spawning";
  lightTarget: LightPlayer | undefined;
  darkTarget: DarkPlayer | undefined;
  currentTarget: LightPlayer | DarkPlayer | undefined = undefined;

  UISignal: Signal = new Signal("stateUpdate");
  progressionSignal: Signal = new Signal("progressionUpdate");

  lightDeathSwordAnimation = purpleGuyLightSwordDeathAnimation.clone();
  lightDeathArrowAnimation = purpleGuyLightArrowDeathAnimation.clone();
  darkDeathSwordAnimation = purpleGuyDarkSwordDeathAnimation.clone();
  darkDeathArrowAnimation = purpleGuyDarkArrowDeathAnimation.clone();
  spawnLightAnimation = purpleGuyLightSpawnAnimation.clone();
  spawnDarkAnimation = purpleGuyDarkSpawnAnimation.clone();
  defaultLightanimation = purpleGuyLightAnimation.clone();
  defaultDarkAnimation = purpleGuyDarkAnimation.clone();
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

    this.CurrentGraphicsGroup = new GraphicsGroup({
      useAnchor: true,
      members: [
        {
          graphic: Resources.purpleShadow.toSprite(),
          offset: vec(0, 0),
        },
        {
          graphic: purpleGuyDarkSpawnAnimation,
          offset: vec(0, 0),
        },
      ],
    });

    this.startingCollider = this.collider.clone();
    this.graphics.use(this.CurrentGraphicsGroup);
    this.lightTarget = lightPlayer;
    this.darkTarget = darkPlayer;
  }

  set waveLevel(level: number) {
    if (this._waveLevel === level) return;
    this._waveLevel = level;
    this.maxHP = level;
    this.speed = this.speed + level * 2;
    this.attackPower += level / 2;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.state === "death") {
      return;
    }

    //this is if enemy damages player
    if (other.owner instanceof DarkPlayer || other.owner instanceof LightPlayer) {
      (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      this.scene?.remove(this); // Remove the enemy from the scene
      other.owner.currentHP -= this.attackPower; // Decrease the player's health by 1
      const engine = other.owner.scene?.engine;
      if (engine) {
        actorFlashWhite(engine, other.owner, 150);
        Resources.sfxPlayerHurt.play(SFX_VOLUME);
      }
      this.UISignal.send(["playerDamaged"]);
    }
  }

  changeAnimation(animation: Animation) {
    this.CurrentGraphicsGroup.members[1] = animation;
  }

  reset() {
    this.darkDeathSwordAnimation.reset();
    this.darkDeathArrowAnimation.reset();
    this.lightDeathArrowAnimation.reset();
    this.lightDeathSwordAnimation.reset();
    this.spawnDarkAnimation.reset();
    this.spawnLightAnimation.reset();

    this.state = "spawning";
    this.collider = this.startingCollider.clone();

    if (enemyRNG.bool()) {
      this.affinity = "light";
      this.changeAnimation(this.spawnLightAnimation);
    } else {
      this.affinity = "dark";
      this.changeAnimation(this.spawnDarkAnimation);
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
    this.body.collisionType = CollisionType.Passive;

    if (deathBy === "sword") {
      enemySwordDeathSoundStagger.play(Resources.sfxEnemyKilled);
    } else {
      Resources.sfxEnemyKilled.play(SFX_VOLUME);
    }

    const engine = this.scene?.engine;
    if (engine) {
      actorFlashWhite(engine, this, 300, () => {
        if (this.affinity == "dark" && deathBy == "sword") this.changeAnimation(this.darkDeathSwordAnimation);
        else if (this.affinity == "dark" && deathBy == "arrow") this.changeAnimation(this.darkDeathArrowAnimation);
        else if (this.affinity == "light" && deathBy == "sword") this.changeAnimation(this.lightDeathSwordAnimation);
        else if (this.affinity == "light" && deathBy == "arrow") this.changeAnimation(this.lightDeathArrowAnimation);
      });
    }
  }

  get enemeystate() {
    return this.state;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // Spawning Animation State
    if (this.state === "spawning") {
      if (this.isOffScreen == true) {
        this.body.collisionType = CollisionType.Active;
        if (this.affinity == "dark") this.changeAnimation(this.defaultDarkAnimation);
        else if (this.affinity == "light") this.changeAnimation(this.defaultLightanimation);
        this.state = "default";
        return;
      }

      if (this.spawnDarkAnimation.done || this.spawnLightAnimation.done) {
        this.state = "default";
        this.body.collisionType = CollisionType.Active;
        if (this.affinity == "dark") this.changeAnimation(this.defaultDarkAnimation);
        else if (this.affinity == "light") this.changeAnimation(this.defaultLightanimation);
      }
      return;
    }

    // Death Animation State
    if (this.state === "death") {
      if (
        (this.affinity == "dark" && this.darkDeathSwordAnimation.done) ||
        (this.affinity == "light" && this.lightDeathSwordAnimation.done)
      ) {
        this.checkDrop();
        this.UISignal.send(["enemyDefeated", this.affinity]);
        this.actions.clearActions();
        this.scene?.remove(this); // Remove the enemy from the scene
        (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      }
      if (
        (this.affinity == "dark" && this.darkDeathArrowAnimation.done) ||
        (this.affinity == "light" && this.lightDeathArrowAnimation.done)
      ) {
        this.checkDrop();
        this.UISignal.send(["enemyDefeated", this.affinity]);
        this.actions.clearActions();
        this.scene?.remove(this); // Remove the enemy from the scene
        (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      }
      return;
    }

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