import { Scene, PointerEvent, Vector, vec } from "excalibur";
import { Signal } from "./Signals";
type JoystickState = "active" | "idle";
export class TouchSystem {
  scene: Scene;
  private _isModalShowing: boolean = false;
  private _gestureStartPos = Vector.Zero;
  private _currentPos = Vector.Zero;
  private _moveDelta = Vector.Zero;
  private _lastDirection = { x: 0, y: 0 };
  private _isActive = false;
  private _isDown = false;
  private _lastEvent: PointerEvent | null = null;
  private _updateInterval: number | null = null;
  private _lastState: JoystickState = "idle";
  private _controlMap: Map<string, (data: any) => void> = new Map();
  private _activeTouchReceiver: keyof typeof this._controlMap | null = null;
  private _holdTimeout: number | null = null;
  private _holdTriggered: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  initialize(callbackConfig: Map<string, (data: any) => void>) {
    const engine = this.scene.engine;
    this._controlMap = callbackConfig;
    engine.input.pointers.primary.on("down", e => this.onDown(e));
    engine.input.pointers.primary.on("up", e => this.onUp(e));
    engine.input.pointers.primary.on("move", e => this.onMove(e));
  }

  set activeTouchReceiver(receiver: keyof typeof this._controlMap) {
    this._activeTouchReceiver = receiver;
  }

  get activeTouchReceiver(): keyof typeof this._controlMap | null {
    return this._activeTouchReceiver;
  }

  set modalShowing(showing: boolean) {
    this._isModalShowing = showing;
  }

  get modalShowing() {
    return this._isModalShowing;
  }

  register() {}

  onDown(e: PointerEvent) {
    if (this._isModalShowing) {
      this._lastEvent = e;
      this.notifyJoystickChange("active", vec(0, 0));
      this._isDown = true;
    } else {
      this._gestureStartPos = e.worldPos.clone();
      this._currentPos = e.worldPos.clone();
      this._moveDelta = Vector.Zero;
      this._lastDirection = { x: 0, y: 0 };

      this._isActive = true;
      this._isDown = true;
      this._lastEvent = e;

      this._holdTriggered = false;

      // Start hold timer
      this.clearHoldTimeout();
      this._holdTimeout = window.setTimeout(() => {
        this._holdTriggered = true;
        this.notifyHold();
      }, 500); // 500ms hold threshold

      // Start the update interval for joystick data
      this.clearUpdateInterval();
      this._updateInterval = window.setInterval(() => {
        this.processJoystickState();
      }, 50);
    }
  }

  onUp(e: PointerEvent) {
    if (!this._isDown) return;

    this._isDown = false;
    this._isActive = false;
    this._moveDelta = Vector.Zero;
    this._lastDirection = { x: 0, y: 0 };
    this._lastEvent = e;
    this.clearUpdateInterval();
    this.clearHoldTimeout();
    // Notify idle state when joystick is released
    this.notifyJoystickChange("idle");
  }

  private clearHoldTimeout() {
    if (this._holdTimeout) {
      window.clearTimeout(this._holdTimeout);
      this._holdTimeout = null;
    }
  }

  onMove(evt: PointerEvent) {
    if (!this._isDown) return;

    this._currentPos = evt.worldPos.clone();
    this._moveDelta = this._currentPos.sub(this._gestureStartPos);
    this._lastEvent = evt;

    if (!this._holdTriggered && this._moveDelta.magnitude > 10) {
      // Cancel hold if the user moves significantly
      this.clearHoldTimeout();
    }

    if (this._lastState === "active") {
      const distance = this._moveDelta.magnitude;

      if (distance >= 15) {
        const newDirection = {
          x: this._moveDelta.x / distance,
          y: this._moveDelta.y / distance,
        };

        // Calculate angle between last direction and new direction
        // We only need to do this if we had a prior direction
        if (Math.abs(this._lastDirection.x) > 0.01 || Math.abs(this._lastDirection.y) > 0.01) {
          const dotProduct = this._lastDirection.x * newDirection.x + this._lastDirection.y * newDirection.y;
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);

          // If angle exceeds threshold, recenter the joystick
          if (angle > 90) {
            // Calculate a new center that's in the direction of movement
            // This creates a "floating" effect for the joystick
            const offsetDistance = Math.min(distance, 50);
            const offset = new Vector(newDirection.x * offsetDistance, newDirection.y * offsetDistance);

            // Recenter the joystick with offset
            this._gestureStartPos = this._currentPos.sub(offset);
            this._moveDelta = offset;
            this._lastDirection = newDirection;
          }
        }
      }
    }
  }

  clearUpdateInterval() {
    if (this._updateInterval) {
      window.clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }
  private processJoystickState() {
    if (!this._isDown || !this._isActive) return;

    const distance = this._moveDelta.magnitude;

    // Determine state based on movement
    let state: JoystickState = "idle";

    if (distance >= 15) {
      state = "active";
    }

    // Normalize distance to maxDistance
    const normalizedDistance = Math.min(distance, 15);

    // Calculate direction vector
    let direction = { x: 0, y: 0 };
    if (distance > 0) {
      direction = {
        x: this._moveDelta.x / distance,
        y: this._moveDelta.y / distance,
      };
      this._lastDirection = direction;
    }

    // Only trigger change if the state actually changes or if active
    if (state !== this._lastState || state === "active") {
      this.notifyJoystickChange(state, direction, normalizedDistance);
    }

    this._lastState = state;
  }

  private notifyHold() {
    if (!this._activeTouchReceiver) return;
    //@ts-ignore
    const callback = this._controlMap.get(this._activeTouchReceiver);
    if (!callback) return;

    (callback as Function)({
      type: "hold",
      state: "hold",
      rawEvent: this._lastEvent || undefined,
    });
  }

  private notifyJoystickChange = (state: JoystickState, direction = { x: 0, y: 0 }, distance = 0) => {
    //get proper callback
    if (!this._activeTouchReceiver) return;
    //@ts-ignore
    let callback = this._controlMap.get(this._activeTouchReceiver);

    if (!callback) return;

    (callback as Function)({
      direction,
      distance,
      state,
      rawEvent: this._lastEvent || undefined,
    });
  };
}
