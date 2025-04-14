import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
import { Enemy } from "./Enemy";
import { LightBullet } from "./lightBullet";
import { BlessingDrop } from "./drops";

export class LightPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
  exp: number = 0;
  isPlayerActive: boolean = false;
  jc: JoystickComponent = new JoystickComponent();
  partner: Actor | undefined;
  HealthBar: HealthBar | undefined;
  fireIntervalHandler: any;

  speed: number = 100;
  fireInterval: number = 6000; // Time between shots in milliseconds
  fireRange: number = 100; // Range of the bullet
  fireDamage: number = 1; // Damage dealt by the bullet

  constructor() {
    super({
      radius: 10,
      color: Color.White,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1000,
      collisionType: CollisionType.Passive,
      collisionGroup: playerCollisionGroup,
    });
    this.addComponent(this.jc);
    this.HealthBar = new HealthBar(new Vector(20, 2), new Vector(-10, -15), 20);
    this.addChild(this.HealthBar);

    this.fireIntervalHandler = setInterval(this.fire.bind(this), this.fireInterval);
  }

  onInitialize(engine: Engine): void {
    this.jc.init(
      {
        updateInterval: 50, // Update frequency in ms
        deadZone: 15, // Minimum movement before "active" state
      },
      data => {
        if (!this.isPlayerActive) return;
        if (data.state === "active") {
          // Handle active joystick

          // Move your character or object
          this.vel.x = data.direction.x * this.speed;
          this.vel.y = data.direction.y * this.speed;
        } else {
          // Handle idle joystick

          // Stop your character or object
          this.vel.x = 0;
          this.vel.y = 0;
        }
      }
    );
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    if (other.owner instanceof BlessingDrop) {
      other.owner.kill(); // Remove the blessing drop from the scene
      this.exp += 1; // Increase the player's experience
    }
  }

  registerPartner(partner: Actor) {
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
      let bullet = new LightBullet(this.pos, closestEnemy, this.fireDamage);
      this.scene?.add(bullet);
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    const currentActions = this.actions.getQueue();
    const followAction = currentActions.getActions().find(action => action instanceof Follow);

    if (!this.isPlayerActive && this.partner && this.partner.pos.distance(this.pos) > 25 && !followAction) {
      this.actions.follow(this.partner, 50);
    } else if (this.isPlayerActive && followAction) {
      this.actions.clearActions();
    }
    this.HealthBar?.setPercent((this.currentHP / this.maxHP) * 100);

    if (this.currentHP <= 0) {
      this.kill();
    }
  }
}
