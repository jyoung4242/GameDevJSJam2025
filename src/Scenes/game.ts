import { UI, UIView } from "@peasy-lib/peasy-ui";
import { Actor, Engine, IsometricMap, Scene, SceneActivationContext, vec } from "excalibur";
import { model } from "../UI/UI";
import { day1Tilemap, getCenterOfTileMap } from "../Tilemap/tilemapDay1";
import { DarkPlayer } from "../Actors/DarkPlayer";

export class GameScene extends Scene {
  gameUI: UIView | undefined;
  arena: IsometricMap | undefined;
  darkPlayer: Actor | undefined;
  lightPlayer: Actor | undefined;

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
