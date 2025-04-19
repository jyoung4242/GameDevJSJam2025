import {
  Actor,
  Circle,
  Collider,
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
import { Resources } from "../resources";
import {
  purpleGuyAnimation,
  purpleGuyArrowDeathAnimation,
  purpleGuySwordDeathAnimation
} from "../Animations/purpleGuyAnimation";
import { Signal } from "../Lib/Signals";
import {actorFlashWhite} from "../Effects/createWhiteMaterial";

const ENEMY_SPEED = 25; // Speed of the enemy
const enemyRNG = new Random(Date.now()); // Random number generator for enemy behavior

const darkBorder = new Circle({
  radius: 7.5,
  color: Color.Red,
  strokeColor: Color.fromHex("#000000"),
  lineWidth: 2,
}); // Dark border circle

const lightBorder = new Circle({
  radius: 7.5,
  color: Color.Red,
  strokeColor: Color.fromHex("#FFFFFF"),
  lineWidth: 2,
}); // Light border circle

export class Enemy extends Actor {
  affinity: "dark" | "light" = "dark"; // Affinity of the enemy
  state: "default" | "death" = "default";
  lightTarget: LightPlayer | undefined;
  darkTarget: DarkPlayer | undefined;
  currentTarget: LightPlayer | DarkPlayer | undefined = undefined;
  graphic: GraphicsGroup;
  UISignal: Signal = new Signal("stateUpdate");
  swordDeathAnimation = purpleGuySwordDeathAnimation.clone();
  arrowDeathAnimation = purpleGuyArrowDeathAnimation.clone();

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

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.state === "death") {
      return;
    }
    if (other.owner instanceof DarkPlayer || other.owner instanceof LightPlayer) {
      (this.scene as GameScene).enemyWaveManager?.enemyPool?.return(this); // Return the enemy to the pool
      this.scene?.remove(this); // Remove the enemy from the scene
      other.owner.currentHP -= 2; // Decrease the player's health by 1
      const engine = other.owner.scene?.engine;
      if (engine) {
        actorFlashWhite(engine, other.owner, 150);
      }
      this.UISignal.send(["playerDamaged"]);
    }
  }

  onInitialize() {
    this.swordDeathAnimation.events.on("end", () => {
      this.kill();
    });
    this.arrowDeathAnimation.events.on("end", () => {
      this.kill();
    })

  }

  reset() {
    let currentGraphics = this.graphics.getNames();
    currentGraphics.forEach(grp => this.graphics.remove(grp));

    if (enemyRNG.bool()) {
      this.affinity = "light";
      this.graphics.add(lightBorder); // Set affinity to light
    } else {
      this.affinity = "dark";
      this.graphics.add(darkBorder);
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
    const engine = this.scene?.engine;
    if (engine) {
      actorFlashWhite(engine, this, 300, () => {
        //this.graphics.use(deathBy === "sword" ? this.swordDeathAnimation : this.arrowDeathAnimation);
        this.graphic.members[1] = deathBy === "sword" ? this.swordDeathAnimation : this.arrowDeathAnimation
      });
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.state === "death") {
      return;
    }
    this.graphics.use(this.graphic);
    //get actions
    const currentActions = this.actions.getQueue();
    const meetAction = currentActions.getActions().find(action => action instanceof Meet);
    let closestTarget;
    if (!meetAction) {
      if (this.lightTarget && this.darkTarget) {
        //find closest target
        closestTarget =
          this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;
      } else if (this.lightTarget) closestTarget = this.lightTarget;
      else if (this.darkTarget) closestTarget = this.darkTarget;
      if (!closestTarget) return;
      this.currentTarget = closestTarget;
      this.actions.meet(closestTarget, ENEMY_SPEED);
    } else {
      //already chasing player
      //get target, confirm they are still viable
      let ents = this.scene?.entities;
      let indexOfTarget = ents?.find(ent => ent == this.currentTarget);
      if (!indexOfTarget) {
        //find another target
        if (this.lightTarget && this.darkTarget) {
          closestTarget =
            this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;
        } else if (this.lightTarget) {
          closestTarget = this.lightTarget;
        } else {
          closestTarget = this.darkTarget;
        }
        this.currentTarget = closestTarget;
        this.actions.clearActions();
        this.actions.meet(closestTarget!, ENEMY_SPEED);
      }
    }

    if (this.lightTarget && this.darkTarget) {
      let closestTarget =
        this.lightTarget.pos.distance(this.pos) < this.darkTarget.pos.distance(this.pos) ? this.lightTarget : this.darkTarget;

      this.actions.meet(closestTarget, ENEMY_SPEED); // Move towards the closest target
    }
  }
}
