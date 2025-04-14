import { UI, UIView } from "@peasy-lib/peasy-ui";
import { IsometricMap, Scene, SceneActivationContext } from "excalibur";
import { model } from "../UI/UI";
import { day1Tilemap, getCenterOfTileMap } from "../Tilemap/tilemapDay1";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";
import { EnemyWaveManager } from "../Lib/EnemyWaveManager";

export class GameScene extends Scene {
  gameUI: UIView | undefined;
  arena: IsometricMap | undefined;
  darkPlayer: DarkPlayer | undefined;
  lightPlayer: LightPlayer | undefined;
  enemyWaveManager: EnemyWaveManager | undefined;

  constructor() {
    super();
  }

  onActivate(context: SceneActivationContext<unknown>): void {
    this.gameUI = UI.create(model.App, new GameUI(), GameUI.template);
    console.log("GameUI created", this.gameUI);
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
    this.enemyWaveManager = new EnemyWaveManager(this, this.lightPlayer, this.darkPlayer);
    this.enemyWaveManager?.init();
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
}

class GameUI {
  startbutton = () => {
    this.owner?.enemyWaveManager?.startWave();
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
        <button style="margin: 10px" \${click@=>startbutton}>Start</button>
    </div>`;
}
