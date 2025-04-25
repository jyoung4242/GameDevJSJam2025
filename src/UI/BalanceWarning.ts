import { Engine, Graphic, ScreenElement, vec, Vector } from "excalibur";
import { SpaceBarAnimation } from "../Animations/spacebar";
import { Resources } from "../resources";

export class BalanceWarning extends ScreenElement {
  rightButton = ScreenElementFactory.create(vec(50, -5), SpaceBarAnimation.clone());
  message = ScreenElementFactory.create(vec(-15, -2), Resources.keepBalance.toSprite());

  constructor() {
    super({ pos: vec(130, 0) });

    this.addChild(this.message);
    this.addChild(this.rightButton);
  }

  show() {
    this.message.show();
    this.rightButton.show();
  }

  hide() {
    this.message.hide();
    this.rightButton.hide();
  }
}

export class SceneLevelWarning extends BalanceWarning {
  constructor() {
    super();
  }

  onInitialize(engine: Engine): void {
    this.pos = engine.screen.contentArea.center.sub(vec(18, 28));
    this.z = 1001;
  }

  onAdd(engine: Engine): void {
    setTimeout(() => {
      this.actions
        .fade(0.0, 1000)
        .toPromise()
        .then(() => {
          this.graphics.opacity = 1;
          this.actions.clearActions();
          this.hide();
        });
    }, 2000);
  }
}

class ScreenElementFactory extends ScreenElement {
  savedGraphics: Graphic;
  constructor(pos: Vector, graphic: Graphic, scale?: Vector) {
    super({
      pos,
    });
    this.savedGraphics = graphic.clone();
    if (scale) this.scale = scale;
    this.graphics.use(graphic);
  }

  show() {
    this.graphics.use(this.savedGraphics);
  }
  hide() {
    this.graphics.hide();
  }

  static create(pos: Vector, graphic: Graphic, scale?: Vector) {
    return new ScreenElementFactory(pos, graphic, scale);
  }
}
