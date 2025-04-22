import { Component, Entity, Keys } from "excalibur";

export class KeyBoardControlComponent extends Component {
  private _heldKeys: string[] = [];
  private _keyEnable: boolean = false;

  constructor() {
    super();
  }

  onAdd(owner: Entity): void {
    this.owner = owner;
  }

  init() {
    window.addEventListener("keydown", event => {
      if (!this._heldKeys.includes(event.code)) {
        if (!this.keyEnable) return;

        this._heldKeys.push(event.code);
        // this._heldKeys.push(event.key);
      }
    });

    window.addEventListener("keyup", event => {
      if (!this.keyEnable) this.keyEnable = true;
      const index = this._heldKeys.indexOf(event.code);
      if (index > -1) {
        this._heldKeys.splice(index, 1);
      }
    });
  }

  get keys() {
    return this._heldKeys;
  }

  set keyEnable(value: boolean) {
    this._keyEnable = value;
  }

  get keyEnable() {
    return this._keyEnable;
  }

  onRemove(previousOwner: Entity): void {
    window.removeEventListener("keydown", this.init);
    window.removeEventListener("keyup", this.init);
  }

  update(engine: any, delta: number): void {}
}
