import { BoundingBox, Color, Engine, Font, Label, ScreenElement, TextAlign, vec, Vector } from "excalibur";
import { StartModalButton } from "./startButton";

export class StartModal extends ScreenElement {
  title: Label;
  constructor(contentArea: BoundingBox) {
    let myWidth = contentArea.right - contentArea.left - 20;
    let myHeight = contentArea.bottom - contentArea.top - 20;
    let position = new Vector(10, 10);

    super({
      width: myWidth,
      height: myHeight,
      pos: position,
      color: Color.fromHex("#005465"),
    });

    this.title = new Label({
      width: myWidth,
      height: myHeight / 4,
      pos: vec(0, 0),
      text: `Angels 'n Demons`,
      font: new Font({
        family: "Arial",
        size: 36,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });

    this.title.pos = vec(myWidth / 2, myHeight / 4);
    this.addChild(this.title);
    this.addChild(new StartModalButton(vec(myWidth / 2 - 192 / 2, myHeight * 0.55)));
  }

  onInitialize(engine: Engine): void {}
}
