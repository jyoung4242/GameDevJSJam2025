import { IsometricMap, Random, Scene, vec } from "excalibur";
import { Enemy } from "../Actors/Enemy";
import { RentalPool } from "./RentalPool";
import { Signal } from "./Signals";
import { isEdgeTile } from "./Util";
const SPAWN_FREQUENCY = 2000; // Frequency in milliseconds

export class EnemyWaveManager {
  enemyPool: RentalPool<any> | undefined;
  rng: Random;
  lightPlayer: any; // Replace with actual type
  darkPlayer: any; // Replace with actual type
  spawnInterval: number = SPAWN_FREQUENCY; // Interval in milliseconds
  spawnEnabled: boolean = false; // Flag to control spawning
  scene: Scene;
  stateSignal: Signal = new Signal("stateUpdate");
  burnDown: Signal = new Signal("burnDown");
  map: IsometricMap | undefined; // Tilemap reference

  WaveTimer: any; // Timer for wave management
  isWaveActive: boolean = false; // Flag to check if a wave is active
  duration: number = 0; // Duration of the wave

  constructor(scene: Scene, lightPlayer: any, darkPlayer: any, tmap: IsometricMap) {
    this.rng = new Random(Date.now()); // Initialize with a seed for reproducibility
    this.lightPlayer = lightPlayer; // Replace with actual player instance
    this.darkPlayer = darkPlayer; // Replace with actual player instance
    this.scene = scene; // Store the scene reference
    this.map = tmap;
    this.WaveTimer = setInterval(this.waveTik, 1000); // Timer for wave management
  }

  init() {
    this.enemyPool = new RentalPool(this.makeEnemy, this.cleanUpEnemy, 500);
    this.isWaveActive = true; // Set the wave active flag to true
  }

  waveTik = () => {
    if (!this.isWaveActive) return; // Check if the wave is active
    this.duration += 1; // Increment the wave duration

    this.stateSignal.send(["waveDuration", this.duration]); // Send the wave duration signal
    this.burnDown.send();
  };

  startWave() {
    this.spawnEnabled = true;
  }
  endWave() {
    this.spawnEnabled = false;
  }
  spawnEnemies() {
    let tIndex = this.rng.integer(0, 624); // Random position for the enemy
    let nextTile = this.map!.tiles[tIndex]; // Get the tile at the random position
    while (isEdgeTile(tIndex, this.map?.columns!, this.map?.rows!)) {
      tIndex = this.rng.integer(0, 624); // Random position for the enemy
      nextTile = this.map!.tiles[tIndex];
    }

    let nextEnemy = this.enemyPool?.rent(true); // Rent an enemy from the pool
    nextEnemy.pos = nextTile.pos; // Set the position of the enemy
    this.scene.add(nextEnemy);
  }

  makeEnemy = () => {
    return new Enemy(vec(0, 0), this.lightPlayer, this.darkPlayer); // Replace with actual enemy creation logic
  };

  cleanUpEnemy(incoming: Enemy) {
    // Reset the enemy's state here
    incoming.reset(); // Replace with actual enemy cleanup logic
    return incoming;
  }

  update(elapsed: number) {
    if (this.spawnEnabled) {
      this.spawnInterval -= elapsed;
      if (this.spawnInterval <= 0) {
        this.spawnInterval = SPAWN_FREQUENCY; // Reset the spawn interval
        this.spawnEnemies();
      }
    }
  }
}
