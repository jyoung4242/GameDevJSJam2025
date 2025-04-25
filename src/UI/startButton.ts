import {
  Color,
  Engine,
  Font,
  Graphic,
  ImageSource,
  Label,
  NineSlice,
  ScreenElement,
  Sprite,
  TextAlign,
  vec,
  Vector,
  NineSliceConfig,
  NineSliceStretch,
} from "excalibur";
import { Resources } from "../resources";
import { GameScene } from "../Scenes/game";

export class StartModalButton extends ScreenElement {
  buttonText: Label;
  upGraphic: Sprite;
  downGraphic: Sprite;
  constructor(pos: Vector) {
    super({
      width: 192,
      height: 64,
      pos,
    });

    this.buttonText = new Label({
      text: "START",
      pos: vec(192 / 2, 16),
      font: new Font({
        width: 192,
        height: 64,
        family: "Arial",
        size: 36,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });
    this.addChild(this.buttonText);
    this.upGraphic = Resources.buttonUp.toSprite();
    this.downGraphic = Resources.buttonDown.toSprite();
  }

  onInitialize(engine: Engine) {
    this.graphics.use(this.upGraphic);

    this.on("pointerup", () => {
      this.graphics.use(this.upGraphic);
      window.location.reload();
      this.buttonText.pos = this.buttonText.pos.add(vec(0, -4));
    });

    this.on("pointerdown", () => {
      this.graphics.use(this.downGraphic);
      this.buttonText.pos = this.buttonText.pos.add(vec(0, 4));
    });
  }
}
