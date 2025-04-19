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
  upGraphic: Graphic;
  downGraphic: Graphic;
  engine: Engine | undefined;
  constructor(pos: Vector) {
    super({
      width: 80,
      height: 48,
      pos,
      z: 2001,
      color: Color.Transparent,
    });

    //#region children_defs
    class buttonImage extends ScreenElement {
      constructor() {
        super({ width: 24, height: 24, pos: vec(80 / 2, 22), z: 2002, anchor: vec(0.5, 0.5) });

        this.graphics.use(Resources.goLabel.toSprite());
        this.scale = vec(1.25, 1.25);
        this.actions.repeatForever(ctx =>
          ctx.scaleTo({ scale: vec(0.8, 0.8), duration: 500 }).scaleTo({ scale: vec(1.25, 1.25), duration: 500 })
        );
      }
    }
    this.addChild(new buttonImage());

    const bgraphicConfigUp: NineSliceConfig = {
      width: 80,
      height: 48,
      source: Resources.buttonUp,
      sourceConfig: {
        width: 192,
        height: 64,
        leftMargin: 3,
        rightMargin: 3,
        topMargin: 2,
        bottomMargin: 4,
      },
      destinationConfig: {
        drawCenter: true,
        horizontalStretch: NineSliceStretch.Stretch,
        verticalStretch: NineSliceStretch.Stretch,
      },
    };
    this.upGraphic = new NineSlice(bgraphicConfigUp);
    this.graphics.use(this.upGraphic);

    const bgraphicConfigDown: NineSliceConfig = {
      width: 80,
      height: 48,
      source: Resources.buttonDown,
      sourceConfig: {
        width: 192,
        height: 64,
        leftMargin: 3,
        rightMargin: 3,
        topMargin: 2,
        bottomMargin: 2,
      },
      destinationConfig: {
        drawCenter: true,
        horizontalStretch: NineSliceStretch.Stretch,
        verticalStretch: NineSliceStretch.Stretch,
      },
    };
    this.downGraphic = new NineSlice(bgraphicConfigDown);

    //#endregion children_defs
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
  };

  upClick = (evt: PointerEvent) => {
    this.graphics.use(this.upGraphic);

    (this.engine!.currentScene as GameScene).hideEndOfWaveModal();
  };
}
