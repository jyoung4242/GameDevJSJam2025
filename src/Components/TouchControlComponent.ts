import { Component, PointerEvent, Entity, Vector, Engine, vec } from "excalibur";

type JoystickState = "active" | "idle";

interface JoystickData {
  direction: { x: number; y: number };
  distance: number;
  state: JoystickState;
  rawEvent?: PointerEvent;
}

interface JoystickConfig {
  updateInterval?: number;
  moveTolerance?: number;
  deadZone?: number;
  // Maximum distance the joystick can move from center
  maxDistance?: number;
  // Whether to automatically recenter the joystick when direction changes significantly
  autoRecenter?: boolean;
  // Angle threshold in degrees to trigger recentering when direction changes
  recenterThreshold?: number;
}

export class JoystickComponent extends Component {
  private config: Required<JoystickConfig> = {
    updateInterval: 100,
    moveTolerance: 5,
    deadZone: 10,
    maxDistance: 100,
    autoRecenter: true,
    recenterThreshold: 90,
  };

  private upHandler: any;
  private downHandler: any;
  private moveHandler: any;
  private cancelHandler: any;

  private gestureStartPos = Vector.Zero;
  private currentPos = Vector.Zero;
  private moveDelta = Vector.Zero;
  private lastDirection = { x: 0, y: 0 };

  private isActive = false;
  private isDown = false;
  private lastEvent: PointerEvent | null = null;
  private updateInterval: number | null = null;
  private lastState: JoystickState = "idle";

  private onJoystickChange: ((data: JoystickData) => void) | null = null;

  onAdd(owner: Entity): void {
    this.owner = owner;
  }

  init(config: JoystickConfig = {}, onJoystickChange?: (data: JoystickData) => void) {
    this.config = { ...this.config, ...config };

    if (onJoystickChange) {
      this.onJoystickChange = onJoystickChange;
    }

    if (!this.owner) return;
    const primary = this.owner.scene?.engine.input.pointers.primary;
    if (!primary) return;

    this.downHandler = primary.on("down", e => this.onDown(e));
    this.moveHandler = primary.on("move", e => this.onMove(e));
    this.upHandler = primary.on("up", e => this.onUp(e));

    // Initial idle state notification
    this.notifyJoystickChange("idle");
  }

  onRemove(owner: Entity): void {
    /* const primary = owner.scene?.engine.input.pointers.primary;
    if (!primary) return;
    primary.off("down", this.downHandler);
    primary.off("up", this.upHandler);
    primary.off("move", this.moveHandler);
 */

    console.log("closing tc");

    this.upHandler?.close();
    this.downHandler?.close();
    this.moveHandler?.close();
    this.clearUpdateInterval();
  }

  private onDown(evt: PointerEvent) {
    console.log("tc pointerdown");

    this.gestureStartPos = evt.worldPos.clone();
    this.currentPos = evt.worldPos.clone();
    this.moveDelta = Vector.Zero;
    this.lastDirection = { x: 0, y: 0 };

    this.isActive = true;
    this.isDown = true;
    this.lastEvent = evt;

    // Start the update interval for joystick data
    this.clearUpdateInterval();
    this.updateInterval = window.setInterval(() => {
      this.processJoystickState();
    }, this.config.updateInterval);
  }

  onMove(evt: PointerEvent) {
    if (!this.isDown) return;

    this.currentPos = evt.worldPos.clone();
    this.moveDelta = this.currentPos.sub(this.gestureStartPos);
    this.lastEvent = evt;

    // Handle auto-recentering if enabled
    if (this.config.autoRecenter && this.lastState === "active") {
      const distance = this.moveDelta.magnitude;

      if (distance >= this.config.deadZone) {
        const newDirection = {
          x: this.moveDelta.x / distance,
          y: this.moveDelta.y / distance,
        };

        // Calculate angle between last direction and new direction
        // We only need to do this if we had a prior direction
        if (Math.abs(this.lastDirection.x) > 0.01 || Math.abs(this.lastDirection.y) > 0.01) {
          const dotProduct = this.lastDirection.x * newDirection.x + this.lastDirection.y * newDirection.y;
          const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) * (180 / Math.PI);

          // If angle exceeds threshold, recenter the joystick
          if (angle > this.config.recenterThreshold) {
            // Calculate a new center that's in the direction of movement
            // This creates a "floating" effect for the joystick
            const offsetDistance = Math.min(distance, this.config.maxDistance / 2);
            const offset = new Vector(newDirection.x * offsetDistance, newDirection.y * offsetDistance);

            // Recenter the joystick with offset
            this.gestureStartPos = this.currentPos.sub(offset);
            this.moveDelta = offset;
            this.lastDirection = newDirection;
          }
        }
      }
    }
  }

  onUp(evt: PointerEvent) {
    console.log("tc pointerup");
    if (!this.isDown) return;

    this.isDown = false;
    this.isActive = false;
    this.moveDelta = Vector.Zero;
    this.lastDirection = { x: 0, y: 0 };
    this.lastEvent = null;

    this.clearUpdateInterval();

    // Notify idle state when joystick is released
    this.notifyJoystickChange("idle");
  }

  private clearUpdateInterval() {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private processJoystickState() {
    if (!this.isDown || !this.isActive) return;

    const distance = this.moveDelta.magnitude;

    // Determine state based on movement
    let state: JoystickState = "idle";

    if (distance >= this.config.deadZone) {
      state = "active";
    }

    // Normalize distance to maxDistance
    const normalizedDistance = Math.min(distance, this.config.maxDistance);

    // Calculate direction vector
    let direction = { x: 0, y: 0 };
    if (distance > 0) {
      direction = {
        x: this.moveDelta.x / distance,
        y: this.moveDelta.y / distance,
      };
      this.lastDirection = direction;
    }

    // Only trigger change if the state actually changes or if active
    if (state !== this.lastState || state === "active") {
      this.notifyJoystickChange(state, direction, normalizedDistance);
    }

    this.lastState = state;
  }

  private notifyJoystickChange(state: JoystickState, direction = { x: 0, y: 0 }, distance = 0) {
    if (this.onJoystickChange) {
      this.onJoystickChange({
        direction,
        distance,
        state,
        rawEvent: this.lastEvent || undefined,
      });
    }
  }

  // For manual polling of joystick state if needed
  getJoystickState(): JoystickData {
    const distance = this.moveDelta.magnitude;
    const state: JoystickState = this.isDown && distance >= this.config.deadZone ? "active" : "idle";

    let direction = { x: 0, y: 0 };
    if (distance > 0) {
      direction = {
        x: this.moveDelta.x / distance,
        y: this.moveDelta.y / distance,
      };
    }

    return {
      direction,
      distance: Math.min(distance, this.config.maxDistance),
      state,
      rawEvent: this.lastEvent || undefined,
    };
  }

  // Optional: Add a visual representation of the joystick
  drawJoystick(ctx: CanvasRenderingContext2D) {
    if (!this.isDown) return;

    const centerX = this.gestureStartPos.x;
    const centerY = this.gestureStartPos.y;
    const knobX = this.currentPos.x;
    const knobY = this.currentPos.y;

    // Draw base circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.config.maxDistance, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw direction line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(knobX, knobY);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw knob
    ctx.beginPath();
    ctx.arc(knobX, knobY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fill();
  }

  update(engine: Engine, elapsed: number): void {
    // This method is called every frame if needed
    // You could move the joystick processing here instead of using intervals
    // for more responsive behavior
  }
}
