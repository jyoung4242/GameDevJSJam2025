import { Loader, ImageSource } from "excalibur";
import loadingScreenLogo from "../Assets/LoadingScreen/logo.png";
import loadingScreenExcalibur from "../Assets/LoadingScreen/excalibur.png";

export class CustomLoader extends Loader {
  logoImage = new ImageSource(loadingScreenLogo);
  excaliburImage = new ImageSource(loadingScreenExcalibur);
  pxScale = 4;

  initLoadingScreen() {
    this.logoImage.load();
    this.excaliburImage.load();
  }

  onDraw(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    //console.log("width", width, "height", height);

    const canvasHeight = this.engine.canvasHeight / this.engine.pixelRatio;
    const canvasWidth = this.engine.canvasWidth / this.engine.pixelRatio;

    ctx.fillStyle = "#0f0b0e";
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    if (this.logoImage.isLoaded()) {
      const logoWidth = 96 * this.pxScale;
      const logoHeight = 112 * this.pxScale;

      ctx.drawImage(this.logoImage.image, canvasWidth / 2 - logoWidth / 2, canvasHeight / 2 - logoHeight / 2, logoWidth, logoHeight);
    }

    if (this.excaliburImage.isLoaded()) {
      const imgWidth = 57 * this.pxScale;
      const imgHeight = 11 * this.pxScale;
      /* TODO - this should go to "bottom right" of the screen, but the canvas edge is not necessarily in view */
      const offsetTop = 150 * this.pxScale;
      ctx.drawImage(
        this.excaliburImage.image,
        canvasWidth / 2 - imgWidth / 2,
        canvasHeight / 2 - imgHeight + offsetTop / 2,
        imgWidth,
        imgHeight
      );
    }
  }
}
