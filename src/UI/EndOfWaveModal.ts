import { BoundingBox, Color, Engine, Font, Label, Scene, ScreenElement, TextAlign, vec, Vector } from "excalibur";
import { NextWaveButton, StartModalButton } from "./startButton";

export class EndOFWaveModal extends ScreenElement {
  title: Label;
  engine: Engine;

  constructor(engine: Engine) {
    let contentArea = engine.screen.contentArea;
    let myWidth = contentArea.right - contentArea.left - 20;
    let myHeight = contentArea.bottom - contentArea.top - 20;
    let position = new Vector(10, 10);

    super({
      width: myWidth,
      height: myHeight,
      pos: position,
      color: Color.Black,
      z: 2000,
    });
    this.engine = engine;
    this.title = new Label({
      width: myWidth,
      height: myHeight / 4,
      pos: vec(0, 0),
      text: `Wave Complete`,
      font: new Font({
        family: "Arial",
        size: 36,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });

    this.title.pos = vec(myWidth / 2, myHeight / 4);
    this.addChild(this.title);
    this.addChild(new NextWaveButton(vec(myWidth / 2 - 192 / 2, myHeight * 0.55)));
  }

  show(scene: Scene) {
    scene.add(this);
  }

  hide(scene: Scene) {
    scene.remove(this);
  }

  onInitialize(engine: Engine): void {}
}
