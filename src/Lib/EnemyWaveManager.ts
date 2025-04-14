import { Random, Scene, vec } from "excalibur";
import { Enemy } from "../Actors/Enemy";
import { RentalPool } from "./RentalPool";

const SPAWN_FREQUENCY = 2000; // Frequency in milliseconds

export class EnemyWaveManager {
  enemyPool: RentalPool<any> | undefined;
  rng: Random;
  lightPlayer: any; // Replace with actual type
  darkPlayer: any; // Replace with actual type
  spawnInterval: number = SPAWN_FREQUENCY; // Interval in milliseconds
  spawnEnabled: boolean = false; // Flag to control spawning
  scene: Scene;

  constructor(scene: Scene, lightPlayer: any, darkPlayer: any) {
    this.rng = new Random(Date.now()); // Initialize with a seed for reproducibility
    this.lightPlayer = lightPlayer; // Replace with actual player instance
    this.darkPlayer = darkPlayer; // Replace with actual player instance
    this.scene = scene; // Store the scene reference
  }

  init() {
    this.enemyPool = new RentalPool(this.makeEnemy, this.cleanUpEnemy, 500);
  }

  startWave() {
    this.spawnEnabled = true;
  }
  endWave() {
    this.spawnEnabled = false;
  }
  spawnEnemies() {
    console.log("Spawning enemies...");

    let nextEnemy = this.enemyPool?.rent(true); // Rent an enemy from the pool
    this.scene.add(nextEnemy);
  }

  makeEnemy = () => {
    // Create a new enemy instance here

    return new Enemy(vec(this.rng.integer(-100, 100), this.rng.integer(-100, 100)), this.lightPlayer, this.darkPlayer); // Replace with actual enemy creation logic
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
