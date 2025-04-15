import { UI, UIView } from "@peasy-lib/peasy-ui";
import { IsometricMap, Scene, SceneActivationContext, vec } from "excalibur";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";
import { EnemyWaveManager } from "../Lib/EnemyWaveManager";
import { Signal } from "../Lib/Signals";
import { StatusBar } from "../UI/StatusBar";
import { Burndown } from "../UI/SwitchPlayerBurnDown";
import { day2Tilemap } from "../Tilemap/tileMapDay2";
import { getCenterOfTileMap } from "../Lib/Util";
import { EndOFWaveModal } from "../UI/EndOfWaveModal";

export class GameScene extends Scene {
  arena: IsometricMap | undefined;
  darkPlayer: DarkPlayer | undefined;
  lightPlayer: LightPlayer | undefined;
  statusBar: StatusBar | undefined;
  burnDown: Burndown | undefined;
  enemyWaveManager: EnemyWaveManager | undefined;
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

  constructor() {
    super();
  }

  onActivate(context: SceneActivationContext<unknown>): void {
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

    // create Wave manager
    this.enemyWaveManager = new EnemyWaveManager(this, this.lightPlayer, this.darkPlayer, this.arena);
    this.enemyWaveManager?.init();

    // Setup UI
    const screenWidth = this.engine.screen.contentArea.width;
    const screenHeight = this.engine.screen.contentArea.height;
    this.statusBar = new StatusBar(vec(screenWidth, screenHeight));
    this.add(this.statusBar);
    this.stateSignal.listen(this.stateUpdate.bind(this));
    this.burnDown = new Burndown(vec(screenWidth, 10), vec(0, screenHeight - 12), 60, this);
    this.add(this.burnDown);

    this.endOfWaveModal = new EndOFWaveModal(context.engine);
    //this doesn't get added until needed

    //start things off
    this.enemyWaveManager?.startWave();
  }

  onDeactivate(context: SceneActivationContext): void {
    this.darkPlayer?.kill();
    this.lightPlayer?.kill();
    this.enemyWaveManager?.endWave();
  }

  onPreUpdate(engine: any, delta: number): void {
    this.enemyWaveManager?.update(delta);
  }

  stateUpdate(params: CustomEvent) {
    const [key, data] = params.detail.params;
    this.gameState[key as keyof typeof this.gameState] = data;
  }

  showEndOfWaveModal() {
    //this.pauseGameSignal.send([true]);
    //this.engine.timescale = 0;
    this.endOfWaveModal?.show(this);
  }

  hideEndOfWaveModal() {
    //this.pauseGameSignal.send([false]);
    //this.engine.timescale = 1.0;
    this.endOfWaveModal?.hide(this);
    this.enemyWaveManager?.startWave();
  }

  switchPlayerFocus() {
    if (this.darkPlayer?.isPlayerActive && !this.lightPlayer?.isPlayerActive) {
      this.darkPlayer!.isPlayerActive = false;
      this.lightPlayer!.isPlayerActive = true;
      this.camera.strategy.lockToActor(this.lightPlayer!);
    } else {
      this.darkPlayer!.isPlayerActive = true;
      this.lightPlayer!.isPlayerActive = false;
      this.camera.strategy.lockToActor(this.darkPlayer!);
    }
  }
}
