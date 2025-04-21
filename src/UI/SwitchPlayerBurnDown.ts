import { Color, Engine, Graphic, GraphicsGroup, ImageSource, Rectangle, ScreenElement, vec, Vector } from "excalibur";
import { Signal } from "../Lib/Signals";
import { GameScene } from "../Scenes/game";
import { Resources } from "../resources";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";

export class Burndown extends ScreenElement {
  burnDownSignal: Signal = new Signal("burnDown");
  currentVal: number;
  maxVal: number;
  percent: number;
  child: ScreenElement;
  scene: GameScene;
  isActive = true;
  constructor(public position: Vector, maxVal: number, scene: GameScene) {
    let dims = vec(Resources.timebar.width, Resources.timebar.height);
    const innerRect = new Rectangle({ width: dims.x - 2, height: dims.y / 2, color: Color.Green });
    super({ name: "burnDownBar", pos: position, z: 1001, opacity: 0.7 });
    this.graphics.use(Resources.timebar.toSprite());
    this.percent = maxVal;
    this.scene = scene;
    this.currentVal = maxVal;
    this.maxVal = maxVal;

    this.child = new InnerBar();
    this.child.graphics.use(innerRect);
    this.addChild(this.child);
    this.burnDownSignal.listen(() => {
      if (!this.isActive) return;
      this.currentVal--;
      this.percent = (this.currentVal / this.maxVal) * 100;

      if (this.percent < 0) {
        this.percent = 0;
      }
      if (this.percent > 100) {
        this.percent = 100;
      }

      (this.child as InnerBar).percent = this.percent;

      if (this.percent <= 0) {
        (this.scene as GameScene).switchPlayerFocus();
        this.currentVal = this.maxVal;
        this.percent = 100;
      }
    });
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    //check players status .isAlive
    let players = this.scene?.entities.filter(e => e instanceof DarkPlayer || e instanceof LightPlayer);
    if (players && players?.length < 2) {
      // this means we need to 'disable' the bar
      this.isActive = false;
      this.graphics.isVisible = false;
    }
  }
}

class InnerBar extends ScreenElement {
  whitetik: ImageSource;
  bluetik: ImageSource;
  redtik: ImageSource;
  private _percent: number = 100;
  numtiks: number = 124;
  graphicsGroup: GraphicsGroup;
  constructor() {
    super({
      pos: vec(2, 2),
      z: 1001,
    });
    this.whitetik = Resources.whitetik;
    this.bluetik = Resources.bluetik;
    this.redtik = Resources.redtik;

    let localMembers: Array<{ graphic: Graphic; offset: Vector }> | null = new Array(this.numtiks).fill({
      graphic: this.bluetik.toSprite(),
      offset: vec(0, 0),
    });

    this.graphicsGroup = new GraphicsGroup({
      useAnchor: true,
      members: localMembers,
    });
    this.setOffsets();
    this.graphics.use(this.graphicsGroup);
  }

  set percent(per: number) {
    this._percent = per;
  }

  setOffsets() {
    for (let i = 0; i < this.graphicsGroup.members.length; i++) {
      //@ts-ignore
      this.graphicsGroup.members[i].offset = vec(i, 0);
    }
  }

  onPreUpdate(engine: Engine, elapsed: number): void {
    const currentNumTiks = Math.floor((this.numtiks * this._percent) / 100);
    const lowlimit = Math.floor(this.numtiks / 4);

    let useTik;
    if (currentNumTiks <= lowlimit) useTik = this.redtik.toSprite();
    else useTik = this.bluetik.toSprite();

    //loop through graphics groups and set members graphics appropriately

    this.graphicsGroup = new GraphicsGroup({
      useAnchor: true,
      members: [],
    });

    for (let i = 0; i < currentNumTiks; i++) {
      if (i < currentNumTiks - 1) {
        this.graphicsGroup.members.push({
          graphic: useTik,
          offset: vec(i, 0),
        });
      } else {
        this.graphicsGroup.members.push({
          graphic: this.whitetik.toSprite(),
          offset: vec(i, 0),
        });
      }
    }

    this.setOffsets();
    this.graphics.use(this.graphicsGroup);
  }
}
