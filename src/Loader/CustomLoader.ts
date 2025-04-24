import { Loader, ImageSource, Vector } from "excalibur";
import loadingScreenLogo from "../Assets/LoadingScreen/logo.png";
import loadingScreenExcalibur from "../Assets/LoadingScreen/excalibur.png";
import { getHighScore } from "../Lib/Util";

export class CustomLoader extends Loader {
  logoImage = new ImageSource(loadingScreenLogo);
  excaliburImage = new ImageSource(loadingScreenExcalibur);
  pxScale = 3;
  highScore = "0";

  constructor() {
    super();
  }

  initLoadingScreen() {
    this.logoImage.load();
    this.excaliburImage.load();
    this.highScore = getHighScore() ?? "0";
  }

  onDraw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;

    const canvasHeight = this.engine.canvasHeight / this.engine.pixelRatio;
    const canvasWidth = this.engine.canvasWidth / this.engine.pixelRatio;

    ctx.fillStyle = "#0f0b0e";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    if (this.logoImage.isLoaded()) {
      const logoWidth = 96 * this.pxScale;
      const logoHeight = 112 * this.pxScale;

      ctx.drawImage(this.logoImage.image, canvasWidth / 2 - logoWidth / 2, 50, logoWidth, logoHeight);
    }

    if (this.excaliburImage.isLoaded()) {
      const imgWidth = 57 * this.pxScale;
      const imgHeight = 11 * this.pxScale;
      const offsetTop = 150 * this.pxScale;
      ctx.drawImage(this.excaliburImage.image, canvasWidth / 2 - imgWidth / 2, canvasHeight - imgHeight - 20, imgWidth, imgHeight);
    }

    if (this.highScore) {
      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`High Score: ${this.highScore}`, 100, 100);
    }
  }
}
