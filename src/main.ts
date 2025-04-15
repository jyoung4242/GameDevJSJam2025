// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode } from "excalibur";
import { model, template } from "./UI/UI";
import { GameScene } from "./Scenes/game";
import { loader } from "./resources";
import { IntroScene } from "./Scenes/Intro";

await UI.create(document.body, model, template).attached;

const game = new Engine({
  resolution: { width: 640, height: 360 }, // the resolution of the game
  viewport: { width: 640, height: 360 }, // the viewport of the game
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FitScreenAndZoom, // the display mode
  pixelArt: true,
  scenes: {
    intro: { scene: new IntroScene() },
    game: { scene: new GameScene() },
  },
  pixelRatio: 2, // the pixel ratio of the game
});

await game.start(loader);

game.goToScene("intro");
