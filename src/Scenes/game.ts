import { UI, UIView } from "@peasy-lib/peasy-ui";
import { IsometricMap, Scene, SceneActivationContext } from "excalibur";
import { model } from "../UI/UI";
import { day1Tilemap, getCenterOfTileMap } from "../Tilemap/tilemapDay1";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { LightPlayer } from "../Actors/LightPlayer";

export class GameScene extends Scene {
  gameUI: UIView | undefined;
  arena: IsometricMap | undefined;
  darkPlayer: DarkPlayer | undefined;
  lightPlayer: LightPlayer | undefined;

  constructor() {
    super();
    this.gameUI = UI.create(model.App, new GameUI(), GameUI.template);
  }

  onActivate(context: SceneActivationContext<unknown>): void {
    this.arena = day1Tilemap;
    this.add(this.arena);
    this.darkPlayer = new DarkPlayer();
    this.add(this.darkPlayer);
    this.darkPlayer.pos = getCenterOfTileMap(this.arena!);
    this.lightPlayer = new LightPlayer();
    this.add(this.lightPlayer);

    this.darkPlayer.registerPartner(this.lightPlayer);
    this.lightPlayer.registerPartner(this.darkPlayer);
  }
}

class GameUI {
  static template = `
    <style> 
        #gameUI{
        width: 100%;
        height: 100%;
        }
    </style> 
    <div id='gameUI'> 
        
    </div>`;
}
