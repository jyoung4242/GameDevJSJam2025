import { Actor, Color, Engine, IsometricMap, vec, Vector } from "excalibur";
import { JoystickComponent } from "../Components/TouchControlComponent";
import { GameScene } from "../Scenes/game";
import { getCenterOfTileMap } from "../Tilemap/tilemapDay1";

export class DarkPlayer extends Actor {
  jc: JoystickComponent = new JoystickComponent();

  speed: number = 100;

  constructor() {
    super({
      radius: 10,
      color: Color.Black,
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

    if (!this.scene) return;
    this.scene.camera.strategy.lockToActor(this);
    this.scene.camera.zoom = 1.5;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {}
}
