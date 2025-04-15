import { Scene, SceneActivationContext, ScreenElement } from "excalibur";
import { StartModal } from "../UI/StartModal";

export class IntroScene extends Scene {
  starintModal: ScreenElement | undefined;
  constructor() {
    super();
  }

  onActivate(context: SceneActivationContext<unknown>): void {
    this.starintModal = new StartModal(context.engine.screen.contentArea);
    this.add(this.starintModal);
  }

  onDeactivate(context: SceneActivationContext): void {}
}
