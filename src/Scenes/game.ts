import { UI, UIView } from "@peasy-lib/peasy-ui";
import { IsometricMap, Scene, SceneActivationContext, vec } from "excalibur";
import { model } from "../UI/UI";
import { day1Tilemap, getCenterOfTileMap } from "../Tilemap/tilemapDay1";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";
import { EnemyWaveManager } from "../Lib/EnemyWaveManager";
import { Signal } from "../Lib/Signals";
import { StatusBar } from "../UI/StatusBar";
import { Burndown } from "../UI/SwitchPlayerBurnDown";

export class GameScene extends Scene {
  gameUI: UIView | undefined;
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

  constructor() {
    super();
  }

  onActivate(context: SceneActivationContext<unknown>): void {
    this.gameUI = UI.create(model.App, new GameUI(), GameUI.template);
    this.gameUI.model.register(this);
    this.arena = day1Tilemap;
    this.add(this.arena);
    this.darkPlayer = new DarkPlayer();
    this.add(this.darkPlayer);
    this.darkPlayer.pos = getCenterOfTileMap(this.arena!);
    this.lightPlayer = new LightPlayer();
    this.add(this.lightPlayer);
    this.darkPlayer.registerPartner(this.lightPlayer);
    this.lightPlayer.registerPartner(this.darkPlayer);
    this.enemyWaveManager = new EnemyWaveManager(this, this.lightPlayer, this.darkPlayer, this.arena);
    this.enemyWaveManager?.init();
    const screenWidth = this.engine.screen.viewport.width;
    const screenHeight = this.engine.screen.viewport.height;
    this.statusBar = new StatusBar(vec(screenWidth, screenHeight));
    this.add(this.statusBar);
    this.stateSignal.listen(this.stateUpdate.bind(this));

    this.burnDown = new Burndown(vec(screenWidth - 25, 20), vec(0, screenHeight - 20), 60, this);
    this.add(this.burnDown);
  }

  onDeactivate(context: SceneActivationContext): void {
    this.gameUI?.destroy();
    this.gameUI = undefined;
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

class GameUI {
  startbutton = () => {
    this.owner?.enemyWaveManager?.startWave();
  };
  stopbutton = () => {
    this.owner?.enemyWaveManager?.endWave();
  };
  switchButton = () => {
    this.owner?.switchPlayerFocus();
  };

  register = (owner: GameScene) => {
    this.owner = owner;
  };

  owner: GameScene | undefined;

  static template = `
    <style> 
        #gameUI{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        }

        #gameUI button{
          pointer-events: all;
        }
    </style> 
    <div id='gameUI'> 
         <button style="margin-left: 10px; margin-top: 20px" \${click@=>startbutton}>Start</button>
        <button style="margin-left: 10px; margin-top: 20px" \${click@=>stopbutton}>Stop</button>
        <button style="margin-left: 10px; margin-top: 20px" \${click@=>switchButton}>Switch</button>
    </div>`;
}
