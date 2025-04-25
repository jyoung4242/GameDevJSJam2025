import { Color, Engine, Font, Label, TextAlign, vec, Vector } from "excalibur";

export class Billboard extends Label {
  lightColor: Color = Color.fromHex("#797694");
  darkColor: Color = Color.fromHex("#3f61a8");
  floatingSpeed: number = 0.5;
  lifetime: number = 1500;

  constructor(type: "light" | "dark") {
    let startingPos: Vector;
    if (type === "light") {
      startingPos = vec(288, 0);
    } else {
      startingPos = vec(0, 0);
    }
    super({
      z: 9001,
      pos: startingPos,
      text: `+1`,
      font: new Font({
        family: "Arial",
        size: 10,
        color: type === "light" ? Color.fromHex("#797694") : Color.fromHex("#3f61a8"),
        textAlign: TextAlign.Center,
      }),
    });
    this.addTag("billboard");
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // i want this entity to float upward from starting position but move a bit random in x direction
    this.pos.y -= this.floatingSpeed;
    this.pos.x += Math.random() * 2 - 1;

    this.lifetime -= elapsed;
    if (this.lifetime <= 0) {
      this.kill();
    }
  }
}
