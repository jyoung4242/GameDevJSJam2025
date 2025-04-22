import {
  BoundingBox,
  Color,
  Engine,
  Font,
  Graphic,
  GraphicsGroup,
  Label,
  NineSlice,
  NineSliceConfig,
  NineSliceStretch,
  Scene,
  ScreenElement,
  Sprite,
  PointerEvent,
  Subscription,
  TextAlign,
  vec,
  Vector,
} from "excalibur";
import { NextWaveButton, StartModalButton } from "./startButton";
import { scaleAnimation } from "../Animations/scale";
import { bowSS, cancelPurpledudeSS, purpleGuySS, Resources, scaleSS, swordSS } from "../resources";
import { GameScene } from "../Scenes/game";
import { Signal } from "../Lib/Signals";
import { c } from "vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P";

type ProgressionType = "constitution" | "strength" | "speed";

export class EndOFWaveModal extends ScreenElement {
  engine: Engine;
  scaleAnimation: ScreenElement;
  resetSignal: Signal = new Signal("waveReset");

  lightEnemiesScore: Label;
  darkEnemiesScore: Label;
  blessingsScore: Label;
  soulsScore: Label;
  swordPlayerScore: Label;
  bowPlayerScore: Label;
  totalEnemies: Label;
  totalEnemiesRemoved: Label;
  balanceEnemyTypesDefeated: Label;
  balancePickups: Label;
  balancePlayerKills: Label;
  balanceEnemyDefeatRate: Label;
  myWidth: number;

  heartButton: ProgressionButtons | undefined;
  flexButton: ProgressionButtons | undefined;
  clockButton: ProgressionButtons | undefined;

  uiData: {
    lightEnemiesDefeated: number;
    darkEnemiesDefeated: number;
    blessingsCollected: number;
    soulsCollected: number;
    totalEnemies: number;
    totalEnemiesRemoved: number;
    swordPlayerScore: number;
    bowPlayerScore: number;
  };

  constructor(engine: Engine) {
    let contentArea = engine.screen.contentArea;
    let myWidth = contentArea.right - contentArea.left - 20;
    let myHeight = contentArea.bottom - contentArea.top - 20;
    let position = new Vector(10, 10);

    super({
      width: myWidth,
      height: myHeight,
      pos: position,
      color: Color.fromHex("#444444"),
      z: 9000,
    });
    this.myWidth = myWidth;
    this.uiData = {
      lightEnemiesDefeated: 0,
      darkEnemiesDefeated: 0,
      blessingsCollected: 0,
      soulsCollected: 0,
      totalEnemies: 0,
      totalEnemiesRemoved: 0,
      swordPlayerScore: 0,
      bowPlayerScore: 0,
    };
    this.engine = engine;

    //#region children_defs
    class Scale extends ScreenElement {
      constructor() {
        super({ pos: vec(myWidth / 2 - 24, 15), x: myWidth / 2, width: 48, height: 48, z: 2002 });
        this.graphics.use(scaleAnimation);
      }
    }
    this.scaleAnimation = new Scale();
    this.addChild(this.scaleAnimation);

    const lightEnemiesScore = new Label({
      pos: vec(24, 45),
      text: "0",
      font: new Font({
        family: "Arial",
        size: 24,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });

    this.darkEnemiesScore = LabelFactory.create(vec(80, 47), "0");
    this.lightEnemiesScore = LabelFactory.create(vec(150, 47), "0");
    this.blessingsScore = LabelFactory.create(vec(80, 88), "0");
    this.soulsScore = LabelFactory.create(vec(150, 88), "0");
    this.swordPlayerScore = LabelFactory.create(vec(80, 125), "0");
    this.bowPlayerScore = LabelFactory.create(vec(150, 125), "0");
    this.totalEnemies = LabelFactory.create(vec(80, 165), "0");
    this.totalEnemiesRemoved = LabelFactory.create(vec(150, 165), "0");
    this.balanceEnemyTypesDefeated = LabelFactory.create(vec(225, 47), "0");
    this.balancePickups = LabelFactory.create(vec(225, 88), "0");
    this.balancePlayerKills = LabelFactory.create(vec(225, 125), "0");
    this.balanceEnemyDefeatRate = LabelFactory.create(vec(231, 165), "0");

    this.addChild(this.lightEnemiesScore);
    this.addChild(this.darkEnemiesScore);
    this.addChild(this.blessingsScore);
    this.addChild(this.soulsScore);
    this.addChild(this.swordPlayerScore);
    this.addChild(this.bowPlayerScore);
    this.addChild(this.totalEnemies);
    this.addChild(this.totalEnemiesRemoved);
    this.addChild(this.balanceEnemyTypesDefeated);
    this.addChild(this.balancePickups);
    this.addChild(this.balancePlayerKills);
    this.addChild(this.balanceEnemyDefeatRate);

    this.addChild(ScreenElementFactory.create(vec(110, 45), cancelPurpledudeSS.getSprite(1, 0), vec(0.75, 0.75)));
    this.addChild(ScreenElementFactory.create(vec(40, 45), cancelPurpledudeSS.getSprite(0, 0), vec(0.75, 0.75)));
    this.addChild(ScreenElementFactory.create(vec(44, 90), Resources.blessing.toSprite(), vec(1.4, 1.4)));
    this.addChild(ScreenElementFactory.create(vec(115, 90), Resources.soul.toSprite(), vec(1.4, 1.4)));
    this.addChild(ScreenElementFactory.create(vec(21, 105), swordSS.getSprite(0, 0), vec(1.0, 1.0)));
    this.addChild(ScreenElementFactory.create(vec(105, 119), bowSS.getSprite(0, 0), vec(1.0, 1.0)));
    this.addChild(ScreenElementFactory.create(vec(38, 165), purpleGuySS.getSprite(0, 0), vec(0.75, 0.75)));
    this.addChild(ScreenElementFactory.create(vec(108, 160), Resources.swordPlayerIconDamaged.toSprite(), vec(0.6, 0.6)));
    this.addChild(ScreenElementFactory.create(vec(180, 45), scaleSS.getSprite(0, 0), vec(0.6, 0.6)));
    this.addChild(ScreenElementFactory.create(vec(180, 85), scaleSS.getSprite(0, 0), vec(0.6, 0.6)));
    this.addChild(ScreenElementFactory.create(vec(180, 125), scaleSS.getSprite(0, 0), vec(0.6, 0.6)));
    this.addChild(ScreenElementFactory.create(vec(180, 165), scaleSS.getSprite(0, 0), vec(0.6, 0.6)));

    this.addChild(ScreenElementFactory.create(vec(myWidth / 2 - 144, 250), Resources.spectrum.toSprite(), vec(1.0, 1.0)));
    this.addChild(ScreenElementFactory.create(vec(myWidth / 2 - 5, 240), Resources.cursor.toSprite(), vec(1.5, 1.5)));

    //#endregion
  }

  show(scene: Scene, data: any, getPlayerData: any, progressionstates: any) {
    // (progressionstates.health >= 2) (this.heartButton as ProgressionButtons).updateEnable(false);
    if (progressionstates.strength >= 2) (this.flexButton as ProgressionButtons).updateEnable(false);
    if (progressionstates.speed >= 2) (this.clockButton as ProgressionButtons).updateEnable(false);

    this.uiData.lightEnemiesDefeated = data.lightEnemiesDefeated;
    this.uiData.darkEnemiesDefeated = data.darkEnemiesDefeated;
    this.uiData.blessingsCollected = data.blessingsCollected;
    this.uiData.soulsCollected = data.soulsCollected;

    this.uiData.totalEnemies = data.totalEnemies;
    this.uiData.totalEnemiesRemoved = data.totalEnemiesRemoved;
    this.uiData.bowPlayerScore = getPlayerData.lightNumberOfEnemiesDefeated;
    this.uiData.swordPlayerScore = getPlayerData.darkNumberOfEnemiesDefeated;

    //update all text labels
    this.lightEnemiesScore.text = `${this.uiData.lightEnemiesDefeated}`;
    this.darkEnemiesScore.text = `${this.uiData.darkEnemiesDefeated}`;
    this.blessingsScore.text = `${this.uiData.blessingsCollected}`;
    this.soulsScore.text = `${this.uiData.soulsCollected}`;
    this.swordPlayerScore.text = `${this.uiData.swordPlayerScore}`;
    this.bowPlayerScore.text = `${this.uiData.bowPlayerScore}`;
    this.totalEnemies.text = `${this.uiData.totalEnemies}`;
    this.totalEnemiesRemoved.text = `${this.uiData.totalEnemiesRemoved}`;

    let balanceEnemyTypesDefeated = Math.abs(this.uiData.darkEnemiesDefeated - this.uiData.lightEnemiesDefeated);
    this.balanceEnemyTypesDefeated.text = `${balanceEnemyTypesDefeated}`;

    let balancePickups = Math.abs(this.uiData.blessingsCollected - this.uiData.soulsCollected);
    this.balancePickups.text = `${balancePickups}`;

    let balancePlayerKills = Math.abs(this.uiData.bowPlayerScore - this.uiData.swordPlayerScore);
    this.balancePlayerKills.text = `${balancePlayerKills}`;

    // this calculation needs to be a percentage

    //test for zero
    if (this.uiData.totalEnemies == 0) {
      this.balanceEnemyDefeatRate.text = `0%`;
    } else {
      let balanceEnemyDefeatRate = ((1.0 - this.uiData.totalEnemiesRemoved / this.uiData.totalEnemies) * 100).toFixed(0);
      let numDigits = balanceEnemyDefeatRate.length;

      this.balanceEnemyDefeatRate.text = `${balanceEnemyDefeatRate}%`;
    }

    scene.add(this);

    this.resetSignal.send([]);
  }

  hide(scene: Scene) {
    scene.remove(this);
  }

  onAdd(engine: Engine): void {
    this.clockButton = new ProgressionButtons(Resources.clock.toSprite(), vec(this.myWidth - 75, 155), "speed", () => {
      console.log("clock");
    });
    this.addChild(this.clockButton);

    this.heartButton = new ProgressionButtons(Resources.heart.toSprite(), vec(this.myWidth - 75, 45), "constitution", () => {
      console.log("heart");
    });
    this.addChild(this.heartButton);

    this.flexButton = new ProgressionButtons(Resources.flex.toSprite(), vec(this.myWidth - 75, 100), "strength", () => {
      console.log("flex");
    });
    this.addChild(this.flexButton);
  }

  handleTouchControls(data: any) {
    const mouseScreenPos = data.rawEvent.coordinates.screenPos;
    //console.log("mouseScreenPos", mouseScreenPos, data.rawEvent.type);

    if (data.rawEvent.type == "up") {
      //check mouseScreenPos against the 3 buttons
      //console.log(this.heartButton?.contains(mouseScreenPos.x, mouseScreenPos.y) as unknown as boolean);

      if (this.heartButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.heartButton.onUp();
      } else if (this.flexButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.flexButton.onUp();
      } else if (this.clockButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.clockButton.onUp();
      }
    } else if (data.rawEvent.type == "down") {
      //check mouseScreenPos against the 3 buttons
      if (this.heartButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.heartButton.onDown();
      } else if (this.flexButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.flexButton.onDown();
      } else if (this.clockButton?.contains(mouseScreenPos.x, mouseScreenPos.y)) {
        this.clockButton.onDown();
      }
    }
  }

  onInitialize(engine: Engine): void {}
}

class ScreenElementFactory extends ScreenElement {
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

class LabelFactory extends Label {
  constructor(pos: Vector, text: string) {
    super({
      pos,
      text,
      font: new Font({
        family: "Arial",
        size: 20,
        color: Color.White,
        textAlign: TextAlign.Center,
      }),
    });
  }

  static create(pos: Vector, text: string) {
    return new LabelFactory(pos, text);
  }
}

class ProgressionButtons extends ScreenElement {
  upGraphic: NineSlice;
  downGraphic: NineSlice;
  icon: Graphic;

  type: ProgressionType;

  enabled: boolean = true;

  upGraphicGroup: GraphicsGroup;
  downGraphicGroup: GraphicsGroup;
  subUp: Subscription | undefined;
  subDown: Subscription | undefined;
  progressionSignal: Signal = new Signal("progressionUpdate");

  constructor(icon: Sprite, position: Vector, type: ProgressionType, public callback: () => void) {
    super({ width: 80, height: 48, pos: position, z: 2002, anchor: Vector.Half, color: Color.fromHex("#2bb2ea") });
    this.type = type;
    this.pointer.useGraphicsBounds = false;
    this.pointer.useColliderShape = true;
    this.icon = icon;
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

    this.upGraphicGroup = new GraphicsGroup({
      useAnchor: true,
      members: [this.upGraphic, { graphic: icon, offset: vec(22, 8) }],
    });
    this.graphics.use(this.upGraphicGroup);
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
    this.downGraphicGroup = new GraphicsGroup({
      useAnchor: true,
      members: [this.downGraphic, { graphic: icon, offset: vec(22, 8) }],
    });
  }

  updateEnable(state: boolean) {
    this.enabled = state;
    if (this.enabled == false) {
      const currentGraphics = this.graphics.current;
      //@ts-ignore
      if (currentGraphics) currentGraphics.tint = Color.Gray;
    }
  }

  onInitialize = (engine: Engine): void => {};

  onDown(): void {
    if (!this.enabled) return;
    this.graphics.use(this.downGraphicGroup);
  }

  onUp(): void {
    if (!this.enabled) return;
    (this.scene as GameScene).hideEndOfWaveModal();
    this.graphics.use(this.upGraphicGroup);
    this.progressionSignal.send([this.type]);
  }

  onAdd(engine: Engine): void {}

  onRemove(engine: Engine): void {}
}
