import { Engine, Scene, ScreenElement, vec } from "excalibur";
import { Resources } from "../resources";

export class Balance extends ScreenElement {
  cursor: ScreenElement | undefined;
  balance: number = 0;
  startingPosX = 0;

  constructor(scene: Scene) {
    super();
    this.z = 2005;
    this.cursor = new Cursor();
    this.addChild(this.cursor);
    this.startingPosX = this.cursor.pos.x;
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.spectrum.toSprite());
    const screen = engine.currentScene.engine.screen.contentArea;
    this.pos = vec(screen.width / 2 - 144, screen.height - 15);
  }

  updateBalance(newBalance: number) {
    this.balance = newBalance;
    if (this.balance < -71) this.balance = -71;
    else if (this.balance > 71) this.balance = 71;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    let currentCursorPos = this.cursor!.pos.x;
    /* console.log("balance", this.balance);
    console.log("currentCursorPos", currentCursorPos); */

    this.cursor!.pos = vec(this.startingPosX + this.balance * 2, -10);
  }
}

export class Cursor extends ScreenElement {
  constructor() {
    super();
    this.pos = vec(144 - 5, -10);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.cursor.toSprite());
  }
}
