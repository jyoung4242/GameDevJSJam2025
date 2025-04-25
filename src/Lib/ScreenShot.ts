import { Engine } from "excalibur";

export class GameScreenShot {
  static getScreenShot(engine: Engine) {
    engine.screenshot().then(image => GameScreenShot.copyImageToClipboard(image));
  }

  static async copyImageToClipboard(image: HTMLImageElement) {
    // Create a canvas and draw the image on it
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");

    ctx.drawImage(image, 0, 0);

    // Convert canvas to Blob
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

    if (!blob) throw new Error("Failed to convert image to Blob");

    // Use Clipboard API to write image
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

    console.log("Image copied to clipboard!");
  }
}
