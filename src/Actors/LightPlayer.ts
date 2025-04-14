import { Actor, Color, Engine, IsometricMap, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { GameScene } from "../Scenes/game";
import { getCenterOfTileMap } from "../Tilemap/tilemapDay1";

export class LightPlayer extends Actor {
  isPlayerActive: boolean = false;
  jc: JoystickComponent = new JoystickComponent();
  partner: Actor | undefined;

  speed: number = 100;

  constructor() {
    super({
      radius: 10,
      color: Color.White,
      pos: vec(0, 0),
      anchor: Vector.Half,
      z: 1000,
    });
    this.addComponent(this.jc);
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

  onPreUpdate(engine: Engine, elapsed: number): void {
    if (!this.isPlayerActive && this.partner && this.partner.pos.distance(this.pos) > 25) {
      this.actions.follow(this.partner, 50);
    }
  }
}
