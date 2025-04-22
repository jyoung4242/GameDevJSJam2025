// main.ts
import "./style.css";

import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Color } from "excalibur";
import { model, template } from "./UI/UI";
import { GameScene } from "./Scenes/game";
import { loader } from "./resources";
import { IntroScene } from "./Scenes/Intro";
import { GameOver } from "./Scenes/gameOver";

await UI.create(document.body, model, template).attached;
let resizeTimeout: number | undefined;

window.addEventListener("resize", () => {
  console.log("resize");

  clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    const inIframe = window.self !== window.top;
    location.reload();
  }, 500);
});

function sizingReload() {}

const game = new Engine({
  resolution: { width: 640, height: 360 }, // the resolution of the game
  viewport: { width: 640, height: 360 }, // the viewport of the game
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FitScreenAndZoom, // the display mode
  pixelArt: true,
  backgroundColor: Color.fromHex("#26111f"),
  scenes: {
    intro: { scene: new IntroScene() },
    game: { scene: new GameScene() },
    gameOver: { scene: new GameOver() },
  },
  pixelRatio: 2, // the pixel ratio of the game
});

await game.start(loader);

game.goToScene("game");
