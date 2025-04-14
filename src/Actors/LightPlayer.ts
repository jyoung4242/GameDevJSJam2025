import { Actor, CollisionType, Color, Engine, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
import { Enemy } from "./Enemy";
import { LightBullet } from "./lightBullet";

export class LightPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
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
          console.log(`Joystick active: direction (${data.direction.x}, ${data.direction.y}), distance: ${data.distance}`);
          // Move your character or object
          this.vel.x = data.direction.x * 100;
          this.vel.y = data.direction.y * 100;
        } else {
          // Handle idle joystick
          console.log("Joystick idle");
          // Stop your character or object
          this.vel.x = 0;
          this.vel.y = 0;
        }
      }
    );
  }

  registerPartner(partner: Actor) {
    this.partner = partner;
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
    if (!this.isPlayerActive && this.partner && this.partner.pos.distance(this.pos) > 25) {
      this.actions.follow(this.partner, 50);
    }
    this.HealthBar?.setPercent((this.currentHP / this.maxHP) * 100);

    if (this.currentHP <= 0) {
      this.kill();
    }
  }
}
