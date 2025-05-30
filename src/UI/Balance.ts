import { Engine, Scene, ScreenElement, vec, Vector } from "excalibur";
import { Resources } from "../resources";
import { Billboard } from "./BillBoard";
import { Signal } from "../Lib/Signals";
import { BalanceWarning } from "./BalanceWarning";

export class Balance extends ScreenElement {
  cursor: ScreenElement | undefined;
  balance: number = 0;
  startingPosX = 0;
  balanceUISignal: Signal = new Signal("balanceUpdate");
  warning: ScreenElement | undefined;
  initialFlag = true;

  constructor(scene: Scene) {
    super();
    this.z = 2005;
    this.cursor = new Cursor();
    this.addChild(this.cursor);
    this.startingPosX = this.cursor.pos.x;
    this.balanceUISignal.listen((params: CustomEvent) => {
      const [key, data] = params.detail.params;
      if (data == "light") this.generateBillboard("light");
      else if (data == "dark") this.generateBillboard("dark");
    });

    this.warning = new BalanceWarning();
    this.addChild(this.warning);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.spectrum.toSprite());
    const screen = engine.currentScene.engine.screen.contentArea;
    this.pos = vec(screen.width / 2 - 144, screen.height - 34);
    setTimeout(() => this.clearInitialFlag(), 2000);
  }

  clearInitialFlag() {
    this.warning!.actions.fade(0.0, 1000)
      .toPromise()
      .then(() => {
        this.warning!.actions.clearActions();
        this.warning!.graphics.opacity = 1;
        this.initialFlag = false;
      });
  }

  generateBillboard(type: "light" | "dark", delay: number = 0) {
    if (delay > 0) setTimeout(() => this.addChild(new Billboard(type)), delay);
    else this.addChild(new Billboard(type));
  }

  updateBalance(newBalance: number) {
    this.balance = newBalance;
    if (this.balance < -24) this.balance = -24;
    else if (this.balance > 24) this.balance = 24;
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    let currentCursorPos = this.cursor!.pos.x;

    this.cursor!.pos = vec(this.startingPosX + this.balance * 6, 8);
    if (!this.initialFlag) {
      if (Math.abs(this.balance) > 12) {
        //show warning
        (this.warning! as BalanceWarning).show();
      } else (this.warning! as BalanceWarning).hide();
    }
  }

  getWorldPosition(): Vector {
    return this.globalPos;
  }
}

export class Cursor extends ScreenElement {
  constructor() {
    super();
    this.pos = vec(144 - 5, 8);
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.cursor.toSprite());
  }
}
