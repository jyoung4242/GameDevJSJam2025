import { Color, Font, Label, ScreenElement, TextAlign, Vector, Engine, Graphic, GraphicsGroup, vec } from "excalibur";
import { Signal } from "../Lib/Signals";
import { purpleGuySS, Resources, cancelPurpledudeSS } from "../resources";

export class NewStatusBar extends ScreenElement {
  totalEnemiesDefeated: number = 0;
  totalEnemiesRemaining: number = 0;
  totalEnemiesRemoved: number = 0;
  lightEnemiesDefeated: number = 0;
  darkEnemiesDefeated: number = 0;
  soulsCollected: number = 0;
  blessingsCollected: number = 0;
  updateSignal: Signal = new Signal("stateUpdate");
  enemiesInWave: number = 0;
  resetSignal: Signal = new Signal("waveReset");

  enemiesRemainingLabel: Label;
  lightKillsLabel: Label;
  darkKillsLabel: Label;
  soulsCollectedLabel: Label;
  blessingsCollectedLabel: Label;

  constructor(public dims: Vector) {
    super({
      name: "StatusBar",
      width: dims.x,
      height: 15,
      x: 0,
      y: 1,
      z: 999,
    });
    this.updateSignal.listen(this.UIUpdate.bind(this));
    //#region
    this.lightKillsLabel = new Label({
      anchor: Vector.Zero,
      text: `0`,
      font: new Font({
        size: 8,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 58,
      y: 1,
    });

    this.darkKillsLabel = new Label({
      anchor: Vector.Zero,
      text: `0`,
      font: new Font({
        size: 8,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 84,
      y: 1,
    });

    this.enemiesRemainingLabel = new Label({
      anchor: Vector.Zero,
      text: `0`,
      font: new Font({
        size: 8,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 110,
      y: 1,
    });

    this.soulsCollectedLabel = new Label({
      anchor: Vector.Zero,
      text: `0`,
      font: new Font({
        size: 8,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 36,
      y: 1,
    });

    this.blessingsCollectedLabel = new Label({
      anchor: Vector.Zero,
      text: `0`,
      font: new Font({
        size: 8,
        family: "Arial",
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
      x: dims.x - 12,
      y: 1,
    });

    //#endregion

    this.addChild(this.lightKillsLabel);
    this.addChild(this.darkKillsLabel);
    this.addChild(this.enemiesRemainingLabel);
    this.addChild(this.soulsCollectedLabel);
    this.addChild(this.blessingsCollectedLabel);

    class UIGraphic extends ScreenElement {
      constructor(pos: Vector, imageSource: Graphic, scale?: Vector) {
        super({ pos, width: 10, height: 10, z: 999 });
        this.graphics.use(imageSource);
        if (scale) this.scale = scale;
      }
    }

    this.addChild(new UIGraphic(new Vector(dims.x - 25, 0), Resources.blessing.toSprite()));
    this.addChild(new UIGraphic(new Vector(dims.x - 50, 0), Resources.soul.toSprite()));
    this.addChild(new UIGraphic(new Vector(dims.x - 125, 0), purpleGuySS.getSprite(0, 0), new Vector(0.4, 0.4)));
    this.addChild(new UIGraphic(new Vector(dims.x - 75, 0), cancelPurpledudeSS.getSprite(0, 0), new Vector(0.4, 0.4)));
    this.addChild(new UIGraphic(new Vector(dims.x - 100, 0), cancelPurpledudeSS.getSprite(1, 0), new Vector(0.4, 0.4)));

    this.resetSignal.listen(() => this.reset());
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    this.enemiesRemainingLabel.text = `${this.totalEnemiesRemaining}`;
    this.lightKillsLabel.text = `${this.lightEnemiesDefeated}`;
    this.darkKillsLabel.text = `${this.darkEnemiesDefeated}`;
    this.soulsCollectedLabel.text = `${this.soulsCollected}`;
    this.blessingsCollectedLabel.text = `${this.blessingsCollected}`;
  }

  UIUpdate(params: CustomEvent): void {
    const [key, data] = params.detail.params;
    console.log("UIUpdate", key, data);

    if (key === "enemyDefeated") {
      console.log("enemyDefeated", data);

      if (data === "light") this.lightEnemiesDefeated += 1;
      if (data === "dark") this.darkEnemiesDefeated += 1;

      this.totalEnemiesDefeated = this.lightEnemiesDefeated + this.darkEnemiesDefeated + this.totalEnemiesRemoved;
      this.totalEnemiesRemaining = this.enemiesInWave - this.totalEnemiesDefeated;
    } else if (key == "soul") {
      this.soulsCollected++;
    } else if (key == "blessing") {
      this.blessingsCollected++;
    } else if (key == "batchsize") {
      console.log("batchsize", data);

      this.enemiesInWave = data;
      this.totalEnemiesDefeated = 0;
      this.totalEnemiesRemoved = 0;
      this.lightEnemiesDefeated = 0;
      this.darkEnemiesDefeated = 0;
      this.totalEnemiesRemaining = this.enemiesInWave - this.totalEnemiesDefeated;
    } else if (key == "playerDamaged") {
      this.totalEnemiesRemoved++;
      this.totalEnemiesDefeated = this.lightEnemiesDefeated + this.darkEnemiesDefeated + this.totalEnemiesRemoved;
      this.totalEnemiesRemaining = this.enemiesInWave - this.totalEnemiesDefeated;
    }
  }

  reset() {
    this.lightEnemiesDefeated = 0;
    this.darkEnemiesDefeated = 0;
    this.soulsCollected = 0;
    this.blessingsCollected = 0;
    this.totalEnemiesDefeated = 0;
    this.totalEnemiesRemoved = 0;
  }

  getUIState() {
    return {
      lightEnemiesDefeated: this.lightEnemiesDefeated,
      darkEnemiesDefeated: this.darkEnemiesDefeated,
      soulsCollected: this.soulsCollected,
      blessingsCollected: this.blessingsCollected,
      totalEnemies: this.enemiesInWave,
      totalEnemiesRemoved: this.totalEnemiesRemoved,
    };
  }
}
