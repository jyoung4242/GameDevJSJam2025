import { Color, Engine, Font, Graphic, Label, ScreenElement, Sprite, TextAlign, vec, Vector } from "excalibur";
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
      engine.goToScene("game");
      this.buttonText.pos = this.buttonText.pos.add(vec(0, -4));
    });

    this.on("pointerdown", () => {
      this.graphics.use(this.downGraphic);
      this.buttonText.pos = this.buttonText.pos.add(vec(0, 4));
    });
  }
}

export class NextWaveButton extends ScreenElement {
  buttonText: Label;
  upGraphic: Sprite;
  downGraphic: Sprite;
  engine: Engine | undefined;
  constructor(pos: Vector) {
    super({
      width: 192,
      height: 64,
      pos,
      z: 2001,
      color: Color.Transparent,
    });

    this.buttonText = new Label({
      text: "Next Wave",
      pos: vec(192 / 2, 16),
      font: new Font({
        width: 192,
        height: 64,
        family: "Arial",
        size: 24,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });
    this.addChild(this.buttonText);
    this.upGraphic = Resources.buttonUp.toSprite();
    this.downGraphic = Resources.buttonDown.toSprite();
  }

  onInitialize(engine: Engine) {
    this.engine = engine;
  }

  onAdd(engine: Engine): void {
    this.graphics.use(this.upGraphic);
    window.addEventListener("pointerup", this.upClick);
    window.addEventListener("pointerdown", this.downClick);
  }

  downClick = (evt: PointerEvent) => {
    this.graphics.use(this.downGraphic);
    this.buttonText.pos = this.buttonText.pos.add(vec(0, 4));
  };

  upClick = (evt: PointerEvent) => {
    this.graphics.use(this.upGraphic);
    this.buttonText.pos = this.buttonText.pos.add(vec(0, -4));
    (this.engine!.currentScene as GameScene).hideEndOfWaveModal();
  };
}
