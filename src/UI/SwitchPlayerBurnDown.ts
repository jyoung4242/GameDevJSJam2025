import { Color, Rectangle, ScreenElement, Vector } from "excalibur";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";

export class Burndown extends ScreenElement {
  burnDownSignal: Signal = new Signal("burnDown");
  currentVal: number;
  maxVal: number;
  percent: number;
  child: ScreenElement;
  scene: GameScene;
  constructor(public dims: Vector, public position: Vector, maxVal: number, scene: GameScene) {
    const innerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Green });
    const outerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Red });

    super({ name: "burnDownBar", width: dims.x, height: dims.y, pos: position, z: 1001, opacity: 0.7 });
    this.graphics.use(outerRect);
    this.percent = maxVal;
    this.scene = scene;
    this.currentVal = maxVal;
    this.maxVal = maxVal;

    this.child = new ScreenElement({ name: "innerHealthBar", width: dims.x, height: dims.y, pos: new Vector(0, 0), z: 1 });
    this.child.graphics.use(innerRect);
    this.addChild(this.child);
    this.burnDownSignal.listen(() => {
      this.currentVal--;
      this.percent = (this.currentVal / this.maxVal) * 100;

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
        this.currentVal = this.maxVal;
        this.percent = 100;
        this.child.scale.x = this.percent / 100;
        this.child.scale.y = 1;
      }
    });
  }
}
