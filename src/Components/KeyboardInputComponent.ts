import { Component, Entity } from "excalibur";

export class KeyBoardControlComponent extends Component {
  private _heldKeys: string[] = [];

  constructor() {
    super();
  }

  onAdd(owner: Entity): void {
    this.owner = owner;
  }

  init() {
    window.addEventListener("keydown", event => {
      if (!this._heldKeys.includes(event.key)) {
        this._heldKeys.push(event.key);
      }
    });

    window.addEventListener("keyup", event => {
      const index = this._heldKeys.indexOf(event.key);
      if (index > -1) {
        this._heldKeys.splice(index, 1);
      }
    });
  }

  get keys() {
    return this._heldKeys;
  }

  onRemove(previousOwner: Entity): void {
    window.removeEventListener("keydown", this.init);
    window.removeEventListener("keyup", this.init);
  }

  update(engine: any, delta: number): void {}
}
