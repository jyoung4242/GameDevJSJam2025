import { Color, Font, Graphic, Label, Scene, SceneActivationContext, ScreenElement, TextAlign, vec, Vector } from "excalibur";
import { StartModalButton } from "../UI/startButton";
import { getHighScore } from "../Lib/Util";
import { Resources } from "../resources";

export class GameOver extends Scene {
  title: Label | undefined;
  button: ScreenElement | undefined;
  highscoreLabel: Label | undefined;
  highScore: string = "0";
  overallScore: number = 0;
  overallScoreLabel: Label | undefined;

  onActivate(context: SceneActivationContext<{ score: number }>): void {
    const screen = context.engine.screen.contentArea;
    this.title = LabelFactory.create(vec(screen.width / 2, screen.height / 2 - 100), "Game Over", 42);

    this.button = new StartModalButton(vec(screen.width / 2 - 192 / 2, screen.height / 2));
    this.add(this.title);
    this.add(this.button);

    this.overallScore = (context.data as { score: number }).score;
    this.highScore = getHighScore() ?? "0";
    this.highscoreLabel = LabelFactory.create(vec(screen.width / 2, screen.height / 2 + 100), `${this.highScore}`, 20);
    this.overallScoreLabel = LabelFactory.create(vec(screen.width / 2, screen.height / 2 + 75), `${this.overallScore}`, 20);

    this.add(this.highscoreLabel);
    this.add(this.overallScoreLabel);
    this.add(SEFactory.create(vec(screen.width / 2 + 50, screen.height / 2 + 110), Resources.silvermedal.toSprite()));
    this.add(SEFactory.create(vec(screen.width / 2 + 50, screen.height / 2 + 135), Resources.goldstar.toSprite()));
  }
}

class LabelFactory extends Label {
  constructor(pos: Vector, text: string, fontsize: number = 20) {
    super({
      pos,
      text,
      font: new Font({
        family: "Arial",
        size: fontsize,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      z: 2000,
    });
  }
  static create(pos: Vector, text: string, fontsize: number = 20) {
    return new LabelFactory(pos, text, fontsize);
  }
}

class SEFactory extends ScreenElement {
  constructor(pos: Vector, graphic: Graphic, scale: Vector = vec(1, 1)) {
    pos = vec(pos.x - 96, pos.y - 32);
    super({ pos, z: 2000, scale });
    this.graphics.use(graphic);
  }
  static create(pos: Vector, graphic: Graphic, scale: Vector = vec(1, 1)) {
    return new SEFactory(pos, graphic, scale);
  }
}

class ScreenElementFactory extends ScreenElement {
  name = "ScreenElementFactory";
  constructor(pos: Vector, graphic: Graphic, scale?: Vector) {
    super({
      pos,
    });
    if (scale) this.scale = scale;
    this.graphics.use(graphic);
  }

  static create(pos: Vector, graphic: Graphic, scale?: Vector) {
    return new ScreenElementFactory(pos, graphic, scale);
  }
}
