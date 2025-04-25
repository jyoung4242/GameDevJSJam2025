import { Color, Engine, Font, Label, ScreenElement, TextAlign, vec, Vector } from "excalibur";

export class Billboard extends ScreenElement {
  lightColor: Color = Color.fromHex("#797694");
  darkColor: Color = Color.fromHex("#3f61a8");
  floatingSpeed: number = 1;
  title: Label;
  lifetime: number = 2000;

  constructor(startingPos: Vector, type: "light" | "dark") {
    super({
      name: "billboard",
      width: 8,
      height: 8,
      pos: startingPos,
      z: 9000,
    });

    this.title = new Label({
      pos: vec(0, 0),
      text: `+1`,
      font: new Font({
        family: "Arial",
        size: 8,
        color: type === "light" ? this.lightColor : this.darkColor,
        textAlign: TextAlign.Center,
      }),
    });
    this.addChild(this.title);
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    // i want this entity to float upward from starting position but move a bit random in x direction
    this.pos.y -= elapsed * this.floatingSpeed;
    this.pos.x += Math.random() * 2 - 1;

    this.lifetime -= elapsed;
    if (this.lifetime <= 0) {
      console.log("billboard expired");

      this.kill();
    }
  }
}
