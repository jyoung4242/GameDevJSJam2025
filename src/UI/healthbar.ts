import { Color, Rectangle, ScreenElement, Vector } from "excalibur";
import { Resources } from "../resources";

const greenHighlight = Color.fromHex("#99e550");
const greenLowLight = Color.fromHex("#6cd705");
const yellowHighlight = Color.fromHex("#ffe105");
const yellowLowLight = Color.fromHex("#f5c100");
const redHighlight = Color.fromHex("#ff2b05");
const redLowLight = Color.fromHex("#d41c00");

export class HealthBar extends ScreenElement {
  percent: number;
  child1: ScreenElement;
  child2: ScreenElement;

  constructor(public dims: Vector, public position: Vector, public maxVal: number) {
    const topBar = new Rectangle({ width: 26, height: 1, color: greenHighlight });
    const bottomBar = new Rectangle({ width: 26, height: 1, color: greenLowLight });
    super({
      name: "outerHealthBar",
      width: dims.x,
      height: dims.y,
      pos: position,
      z: 1,
    });

    this.graphics.use(Resources.lifebar.toSprite());
    this.percent = 100;

    this.child1 = new ScreenElement({ name: "innerHealthBar", width: 10, height: dims.y, pos: new Vector(3, 7), z: 1 });
    this.child2 = new ScreenElement({ name: "innerHealthBar2", width: 10, height: dims.y, pos: new Vector(3, 8), z: 1 });

    this.child1.graphics.use(topBar);
    this.child2.graphics.use(bottomBar);
    this.addChild(this.child1);
    this.addChild(this.child2);
  }

  setPercent(percent: number): void {
    this.percent = percent;
    if (this.percent < 0) {
      this.percent = 0;
    }
    if (this.percent > 100) {
      this.percent = 100;
    }

    if (this.percent > 40) {
      this.child1.graphics.use(new Rectangle({ width: 26, height: 1, color: greenHighlight }));
      this.child2.graphics.use(new Rectangle({ width: 26, height: 1, color: greenLowLight }));
    }
    if (this.percent <= 40) {
      this.child1.graphics.use(new Rectangle({ width: 26, height: 1, color: yellowHighlight }));
      this.child2.graphics.use(new Rectangle({ width: 26, height: 1, color: yellowLowLight }));
    }
    if (this.percent <= 15) {
      this.child1.graphics.use(new Rectangle({ width: 26, height: 1, color: redHighlight }));
      this.child2.graphics.use(new Rectangle({ width: 26, height: 1, color: redLowLight }));
    }

    this.child1.scale.x = this.percent / 100;
    this.child1.scale.y = 1;
    this.child2.scale.x = this.percent / 100;
    this.child2.scale.y = 1;
  }
}
