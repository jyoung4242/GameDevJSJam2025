import { Actor, Collider, CollisionContact, CollisionType, Color, Engine, Follow, Side, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { playerCollisionGroup } from "../Lib/colliderGroups";
import { HealthBar } from "../UI/healthbar";
import { DarkWeapon } from "./darkWeapon";

export class DarkPlayer extends Actor {
  currentHP: number = 20;
  maxHP: number = 20;
  isPlayerActive: boolean = true;
  partner: Actor | undefined;
  jc: JoystickComponent = new JoystickComponent();
  HealthBar: HealthBar | undefined;
  speed: number = 100;

  fireIntervalHandler: any;
  fireInterval: number = 2000; // Time between shots in milliseconds
  fireDamage: number = 3;

  constructor() {
    super({
      radius: 10,
      color: Color.Black,
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
          this.vel.x = data.direction.x * this.speed;
          this.vel.y = data.direction.y * this.speed;
        } else {
          this.vel.x = 0;
          this.vel.y = 0;
        }
      }
    );

    if (!this.scene) return;
    this.scene.camera.strategy.lockToActor(this);
    this.scene.camera.zoom = 1.5;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    console.log(`Collision started between ${self.owner} and ${other.owner} on side ${side}`);
  }

  registerPartner(partner: Actor) {
    this.partner = partner;
  }

  fire() {
    let newWeapon = new DarkWeapon(this.pos);
    this.addChild(newWeapon);
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
