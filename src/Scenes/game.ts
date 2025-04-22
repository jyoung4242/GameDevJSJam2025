import { UI, UIView } from "@peasy-lib/peasy-ui";
import { IsometricMap, Scene, SceneActivationContext, ScreenElement, vec } from "excalibur";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";
import { EnemyWaveManager } from "../Lib/EnemyWaveManager";
import { Signal } from "../Lib/Signals";
import { StatusBar } from "../UI/StatusBar";
import { Burndown } from "../UI/SwitchPlayerBurnDown";
import { day2Tilemap } from "../Tilemap/tileMapDay2";
import { getCenterOfTileMap } from "../Lib/Util";
import { EndOFWaveModal } from "../UI/EndOfWaveModal";
import { NewStatusBar } from "../UI/newStatusBar";
import { TouchSystem } from "../Lib/TouchSystem";
import { Resources, SFX_VOLUME } from "../resources";
import { BowWeaponActor } from "../Actors/nonCollidingWeapon";
import { Balance } from "../UI/Balance";

export class GameScene extends Scene {
  arena: IsometricMap | undefined;
  darkPlayer: DarkPlayer | undefined;
  lightPlayer: LightPlayer | undefined;
  statusBar: NewStatusBar | undefined;
  sceneTouchManger: TouchSystem | undefined;
  burnDown: Burndown | undefined;
  enemyWaveManager: EnemyWaveManager | undefined;
  pregressionSignal = new Signal("progressionUpdate");
  enemyDefeatedSignal = new Signal("enemyDefeated");
  UISignal = new Signal("stateUpdate");
  balanceUI: ScreenElement | undefined;

  hudData = {
    lightkills: 0,
    darkkills: 0,
    blessings: 0,
    souls: 0,
    axeKills: 0,
    bowkills: 0,
  };

  progressionStates = {
    health: 0,
    strength: 0,
    speed: 0,
  };
  gameState = {
    waveNumber: 0,
    enemiesRemaining: 0,
    darkEnemiesDefeated: 0,
    lightEnemiesDefeated: 0,
    darkExp: 0,
    lightExp: 0,
    gameDuration: 0,
  };
  stateSignal = new Signal("stateUpdate");
  pauseGameSignal = new Signal("pauseGame");
  endOfWaveModal: EndOFWaveModal | undefined;
  touchMap: Map<string, (data: any) => void> = new Map();
  scheduleGameOver: boolean = false;
  scheculedGameOverTik: number = 0;
  isEndOfWaveModalEnabled: boolean = true;

  constructor() {
    super();
  }

  onActivate(context: SceneActivationContext<unknown>): void {
    this.isEndOfWaveModalEnabled = true;
    this.scheduleGameOver = false;
    this.scheculedGameOverTik = 0;

    // Add Tilemap
    this.arena = day2Tilemap;
    this.add(this.arena);

    // Add DarkPlayer
    this.darkPlayer = new DarkPlayer();
    this.add(this.darkPlayer);
    this.darkPlayer.pos = getCenterOfTileMap(this.arena!);

    // Add LightPlayer
    this.lightPlayer = new LightPlayer();
    this.add(this.lightPlayer);

    // Link to players for gameplay, also set's LP position
    this.darkPlayer.registerPartner(this.lightPlayer);
    this.lightPlayer.registerPartner(this.darkPlayer);
    this.endOfWaveModal = new EndOFWaveModal(context.engine);

    // create and init Touch Manager
    //touch map

    this.touchMap.set("darkPlayer", this.darkPlayer.joystickCallback);
    this.touchMap.set("lightPlayer", this.lightPlayer.joystickCallback);
    this.touchMap.set("UImodal", (data: any) => {
      this.endOfWaveModal?.handleTouchControls(data);
    });
    this.sceneTouchManger = new TouchSystem(this);
    this.sceneTouchManger.initialize(this.touchMap);
    this.sceneTouchManger.activeTouchReceiver = "darkPlayer" as keyof typeof this.touchMap;

    // create Wave manager
    this.enemyWaveManager = new EnemyWaveManager(this, this.lightPlayer, this.darkPlayer, this.arena);
    this.enemyWaveManager?.init();

    // Setup UI
    const screenWidth = this.engine.screen.contentArea.width;
    const screenHeight = this.engine.screen.contentArea.height;
    this.statusBar = new NewStatusBar(vec(screenWidth, screenHeight));
    //this.statusBar = new StatusBar(vec(screenWidth, screenHeight));
    this.add(this.statusBar);
    this.stateSignal.listen(this.stateUpdate.bind(this));
    /* this.burnDown = new Burndown(vec(1, screenHeight - 12), 25, this);
    this.add(this.burnDown); */

    this.balanceUI = new Balance(this);
    this.add(this.balanceUI);

    this.enemyDefeatedSignal.listen((params: CustomEvent) => {
      const [event, affinity, weapon] = params.detail.params;
      console.log("enemyDefeatedSignal", affinity, weapon);
      if (affinity === "light") this.hudData.lightkills += 1;
      else this.hudData.darkkills += 1;

      if (weapon === "axe") this.hudData.axeKills += 1;
      else this.hudData.bowkills += 1;
    });

    this.UISignal.listen((params: CustomEvent) => {
      const [typeOfDrop] = params.detail.params;
      console.log("UISignal", typeOfDrop);

      if (typeOfDrop === "blessing") this.hudData.blessings += 1;
      else if (typeOfDrop === "soul") this.hudData.souls += 1;
    });

    this.pregressionSignal.listen((params: CustomEvent) => {
      const progressType = params.detail.params[0];
      console.log("progress type: ", progressType);

      switch (progressType) {
        case "constitution":
          this.progressionStates.health++;
          if (this.progressionStates.health > 2) this.progressionStates.health = 2;
          break;
        case "strength":
          this.progressionStates.strength++;
          if (this.progressionStates.strength > 2) this.progressionStates.strength = 2;
          break;
        case "speed":
          this.progressionStates.speed++;
          if (this.progressionStates.speed > 2) this.progressionStates.speed = 2;
          break;
      }
    });

    //start things off
    this.enemyWaveManager?.startWave();
    //this.enemyWaveManager?.endOfWave(true);
  }

  onDeactivate(context: SceneActivationContext): void {
    this.darkPlayer?.kill();
    this.lightPlayer?.kill();
    this.enemyWaveManager?.endWave();
  }

  onPreUpdate(engine: any, delta: number): void {
    if (this.scheduleGameOver) this.scheculedGameOverTik++;
    if (this.scheculedGameOverTik > 300) {
      this.engine.goToScene("gameOver");
    }

    this.enemyWaveManager?.update(delta);

    (this.balanceUI as Balance).updateBalance(this.getBalanceValue());

    if (!this.darkPlayer?.isAlive && !this.lightPlayer?.isAlive) {
      this.scheduleGameOver = true;
      this.isEndOfWaveModalEnabled = false;
      this.enemyWaveManager!.isWaveActive = false;
    }
  }

  stateUpdate(params: CustomEvent) {
    const [key, data] = params.detail.params;
    this.gameState[key as keyof typeof this.gameState] = data;
  }

  showEndOfWaveModal() {
    if (!this.isEndOfWaveModalEnabled) return;
    (this.darkPlayer as DarkPlayer).vel = vec(0, 0);
    (this.lightPlayer as LightPlayer).vel = vec(0, 0);

    console.log(
      "end of wave entity report: ",
      this.entities.filter(entity => entity instanceof BowWeaponActor)
    );

    (this.sceneTouchManger as TouchSystem).activeTouchReceiver = "UImodal" as keyof typeof this.touchMap;
    (this.sceneTouchManger as TouchSystem).modalShowing = true;
    setTimeout(
      () =>
        this.endOfWaveModal?.show(
          this,
          this.statusBar!.getUIState(),
          this.getPlayerData(),
          this.progressionStates,
          this.getBalanceValue()
        ),
      500
    );
  }

  getPlayerData() {
    return {
      darkNumberOfEnemiesDefeated: (this.darkPlayer as DarkPlayer).numenemies,
      lightNumberOfEnemiesDefeated: (this.lightPlayer as LightPlayer).numenemies,
    };
  }

  hideEndOfWaveModal() {
    this.endOfWaveModal?.hide(this);
    (this.sceneTouchManger as TouchSystem).modalShowing = false;

    this.enemyWaveManager?.startWave();
    // get active player
    const activePlayer = this.darkPlayer?.isPlayerActive ? (this.darkPlayer as DarkPlayer) : (this.lightPlayer as LightPlayer);
    if (activePlayer instanceof DarkPlayer) {
      (this.sceneTouchManger as TouchSystem).activeTouchReceiver = "darkPlayer" as keyof typeof this.touchMap;
    } else {
      (this.sceneTouchManger as TouchSystem).activeTouchReceiver = "lightPlayer" as keyof typeof this.touchMap;
    }
  }

  getBalanceValue() {
    let killsBalance = this.hudData.lightkills - this.hudData.darkkills;
    let blessingsBalance = this.hudData.blessings - this.hudData.souls;
    let axeBalance = this.hudData.bowkills - this.hudData.axeKills;
    console.log("balance kills:", killsBalance, "balance blessings:", blessingsBalance, "balance axe:", axeBalance);

    return killsBalance + blessingsBalance + axeBalance;
  }

  switchPlayerFocus() {
    let nextActivePlayer: DarkPlayer | LightPlayer | undefined = undefined;
    //console.trace("switchPlayerFocus");

    Resources.sfxPlayerSwitch.play(SFX_VOLUME);

    if (this.darkPlayer?.isPlayerActive && !this.lightPlayer?.isPlayerActive) {
      nextActivePlayer = this.lightPlayer;
    } else {
      nextActivePlayer = this.darkPlayer;
    }

    this.engine.timescale = 0.1;
    this.camera.clearAllStrategies();
    this.camera.zoomOverTime(0.8, 100).then(() => {
      this.camera.zoomOverTime(1.5, 100).then(() => {
        this.engine.timescale = 1;
        this.camera.strategy.lockToActor(nextActivePlayer!);
        this.lightPlayer!.switchLock = false;
        this.darkPlayer!.switchLock = false;
        if (nextActivePlayer instanceof DarkPlayer) {
          this.darkPlayer!.isPlayerActive = true;
          this.lightPlayer!.isPlayerActive = false;
          this.sceneTouchManger!.activeTouchReceiver = "darkPlayer" as keyof typeof this.touchMap;
        } else {
          this.darkPlayer!.isPlayerActive = false;
          this.lightPlayer!.isPlayerActive = true;
          this.sceneTouchManger!.activeTouchReceiver = "lightPlayer" as keyof typeof this.touchMap;
        }
      });
    });
    this.camera.move(nextActivePlayer!.pos, 200);
  }
}
