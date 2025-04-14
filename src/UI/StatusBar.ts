import { Color, Font, Label, ScreenElement, TextAlign, Vector, Text, Engine, Actor, CoordPlane } from "excalibur";
import { Signal } from "../Lib/Signals";

export class StatusBar extends ScreenElement {
  time: number = 0;
  whites: number = 0;
  blacks: number = 0;

  timeLabel: Label;
  whiteKills: Label;
  blackKills: Label;
  updateSignal: Signal = new Signal("stateUpdate");

  constructor(public dims: Vector) {
    super({
      name: "StatusBar",
      width: dims.x,
      height: 15,
      x: 0,
      y: 0,
      color: Color.Black,
      opacity: 0.5,
      z: 999,
    });

    this.timeLabel = new Label({
      text: formatDuration(this.time),
      font: new Font({
        size: 12,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: this.pos.x + this.width / 2,
      y: 0,
    });
    this.addChild(this.timeLabel);

    this.whiteKills = new Label({
      anchor: Vector.Zero,
      text: `Light Eliminations: ${this.whites}`,
      font: new Font({
        size: 12,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: this.pos.x + 65,
      y: 0,
    });
    this.addChild(this.whiteKills);

    this.blackKills = new Label({
      anchor: Vector.Zero,
      text: `Dark Eliminations: ${this.blacks}`,
      font: new Font({
        size: 12,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 100,
      y: 0,
    });
    this.addChild(this.blackKills);

    let textWidth = this.timeLabel.getTextWidth();
    this.timeLabel.pos.x = this.width / 2 - textWidth / 2;
  }
  onInitialize(engine: Engine): void {
    this.updateSignal.listen(this.UIUpdate.bind(this));
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    let textWidth = this.timeLabel.getTextWidth();
    this.timeLabel.pos.x = this.width / 2 - textWidth / 2;

    //update white kills
    this.whiteKills.text = `Light Eliminations: ${this.whites}`;

    //update black kills
    this.blackKills.text = `Dark Eliminations: ${this.blacks}`;
  }

  UIUpdate(params: CustomEvent): void {
    const [key, data] = params.detail.params;
    if (key === "waveDuration") {
      this.time = data;
      this.timeLabel.text = formatDuration(this.time);
    } else if (key === "enemyDefeated") {
      if (data === "light") this.whites += 1;
      if (data === "dark") this.blacks += 1;
    }
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `Time: ${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
