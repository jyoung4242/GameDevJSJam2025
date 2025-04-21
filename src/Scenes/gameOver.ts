import { Color, Font, Label, Scene, SceneActivationContext, ScreenElement, TextAlign, vec, Vector } from "excalibur";
import { StartModalButton } from "../UI/startButton";

export class GameOver extends Scene {
  title: Label | undefined;
  button: ScreenElement | undefined;

  onActivate(context: SceneActivationContext<unknown>): void {
    const screen = context.engine.screen.contentArea;
    this.title = LabelFactory.create(vec(screen.width / 2, screen.height / 2 - 100), "Game Over");
    this.button = new StartModalButton(vec(screen.width / 2 - 192 / 2, screen.height / 2));
    this.add(this.title);
    this.add(this.button);
  }
}

class LabelFactory extends Label {
  constructor(pos: Vector, text: string) {
    super({
      pos,
      text,
      font: new Font({
        family: "Arial",
        size: 42,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      z: 2000,
    });
  }
  static create(pos: Vector, text: string) {
    return new LabelFactory(pos, text);
  }
}

class SEFactory extends ScreenElement {
  constructor(pos: Vector) {
    pos = vec(pos.x - 96, pos.y - 32);
    super({ pos, z: 2000, width: 192, height: 64, color: Color.White });
  }
  static create(pos: Vector) {
    return new SEFactory(pos);
  }
}
