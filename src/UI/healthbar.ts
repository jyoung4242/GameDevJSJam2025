import { Color, Rectangle, ScreenElement, Vector } from "excalibur";
import { Resources, lifeBarSSL1, lifeBarSSL2, lifeBarSSL3 } from "../resources";

export class HealthBar extends ScreenElement {
  percent: number;
  level: number = 1;
  oldLevel: number = 1;
  level1Pos = new Vector(-16, -27);
  level2Pos = new Vector(-24, -27);
  level3Pos = new Vector(-28.5, -27);

  constructor(public position: Vector, public maxVal: number) {
    super({
      name: "outerHealthBar",
      z: 1,
    });
    this.pos = this.level1Pos;
    this.graphics.use(lifeBarSSL1.getSprite(0, 26));
    this.percent = 100;
  }

  setLevel(level: number) {
    this.level = level;

    if (level === 1) this.pos = this.level1Pos;
    else if (level === 2) this.pos = this.level2Pos;
    else if (level === 3) this.pos = this.level3Pos;
  }

  getLevel() {
    return this.level;
  }

  setPercent(percent: number): void {
    //sanitize data
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    this.percent = percent;
    if (this.level === 1) {
      let spriteY = Math.floor((percent / 100) * 26);
      if (percent == 100) spriteY = 26;
      this.graphics.use(lifeBarSSL1.getSprite(0, spriteY));
    } else if (this.level === 2) {
      let spriteY = Math.floor((percent / 100) * 42);
      if (percent == 100) spriteY = 42;
      this.graphics.use(lifeBarSSL2.getSprite(0, spriteY));
    } else if (this.level === 3) {
      let spriteY = Math.floor((percent / 100) * 50);
      if (percent == 100) spriteY = 50;
      this.graphics.use(lifeBarSSL3.getSprite(0, spriteY));
    }
  }
}
