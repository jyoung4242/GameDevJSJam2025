import { Color, Rectangle, ScreenElement, Vector } from "excalibur";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";

export class Burndown extends ScreenElement {
  burnDownSignal: Signal = new Signal("burnDown");
  percent: number;
  child: ScreenElement;
  scene: GameScene;
  constructor(public dims: Vector, public position: Vector, public maxVal: number, scene: GameScene) {
    const innerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Green });
    const outerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Red });

    super({ name: "outerHealthBar", width: dims.x, height: dims.y, pos: position, z: 1001 });
    this.graphics.use(outerRect);
    this.percent = 100;
    this.scene = scene;

    this.child = new ScreenElement({ name: "innerHealthBar", width: dims.x, height: dims.y, pos: new Vector(0, 0), z: 1 });
    this.child.graphics.use(innerRect);
    this.addChild(this.child);
    this.burnDownSignal.listen(() => {
      this.percent--;
      if (this.percent < 0) {
        this.percent = 0;
      }
      if (this.percent > 100) {
        this.percent = 100;
      }

      this.child.scale.x = this.percent / 100;
      this.child.scale.y = 1;
      if (this.percent <= 0) {
        (this.scene as GameScene).switchPlayerFocus();
        this.percent = 100;
      }
    });
  }

  setPercent(percent: number): void {
    this.percent = percent;
    if (this.percent < 0) {
      this.percent = 0;
    }
    if (this.percent > 100) {
      this.percent = 100;
    }

    this.child.scale.x = this.percent / 100;
    this.child.scale.y = 1;
  }
}
