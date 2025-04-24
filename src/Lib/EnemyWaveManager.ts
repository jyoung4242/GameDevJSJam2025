import { IsometricMap, Random, Scene, vec } from "excalibur";
import { Enemy } from "../Actors/Enemy";
import { RentalPool } from "./RentalPool";
import { Signal } from "./Signals";
import { getEnemiesToSpawn, getNumberOfBatches } from "./Util";
import {
  SpawnPositionStrategy,
  RandomSpawnStrategy,
  CircleSpawnStrategy,
  EdgesSpawnStrategy,
  ClusterSpawnStrategy,
  //RandomOffscreenSpawnStrategy,
} from "./spawnStrategies";
import { LightPlayer } from "../Actors/LightPlayer";
import { DarkPlayer } from "../Actors/DarkPlayer";
import { GameScene } from "../Scenes/game";

let SPAWN_FREQUENCY = 10000; // Frequency in milliseconds
let START_OF_WAVE_TIME = 3;

const SpawnStrategy = {
  RANDOM: "RANDOM",
  CIRCLE: "CIRCLE",
  EDGES: "EDGES",
  CLUSTER: "CLUSTER",
} as const;

const spawnStrategyMap: Record<keyof typeof SpawnStrategy, SpawnPositionStrategy> = {
  RANDOM: new RandomSpawnStrategy(),
  CIRCLE: new CircleSpawnStrategy(),
  EDGES: new EdgesSpawnStrategy(),
  CLUSTER: new ClusterSpawnStrategy(),
};

export class EnemyWaveManager {
  enemyPool: RentalPool<any> | undefined;
  rng: Random;
  lightPlayer: LightPlayer;
  darkPlayer: DarkPlayer;
  spawnInterval: number = SPAWN_FREQUENCY; // Interval in milliseconds
  spawnEnabled: boolean = false; // Flag to control spawning
  scene: Scene;
  stateSignal: Signal = new Signal("stateUpdate");
  burnDown: Signal = new Signal("burnDown");
  gamePausedSignal: Signal = new Signal("pauseGame");
  map: IsometricMap | undefined; // Tilemap reference
  enemyCount: number = 0; // Count of enemies spawned
  waveNumber: number = 0; // Current wave number
  batchSize: number[] = []; // Number of enemies to spawn in each batch
  batchIndex: number = 0; // Index for the current batch
  spawnStrategy: keyof typeof SpawnStrategy = SpawnStrategy.EDGES; // Strategy for spawning enemies
  lastBatchSpawnedFlag: boolean = false;

  endOfWaveInterval: any;
  monitorSpawning: boolean = false;
  enemyKillCount: number = 0;
  enemyRemovedCount: number = 0;

  WaveTimer: any; // Timer for wave management
  isWaveActive: boolean = false; // Flag to check if a wave is active
  duration: number = 0; // Duration of the wave
  isStartDelayConsumed: boolean = false; // Flag to check if the start delay is consumed

  constructor(scene: Scene, lightPlayer: any, darkPlayer: any, tmap: IsometricMap) {
    this.rng = new Random(Date.now()); // Initialize with a seed for reproducibility
    this.lightPlayer = lightPlayer; // Replace with actual player instance
    this.darkPlayer = darkPlayer; // Replace with actual player instance
    this.scene = scene; // Store the scene reference
    this.map = tmap;
    this.WaveTimer = setInterval(this.waveTik, 1000); // Timer for wave management
    this.endOfWaveInterval = setInterval(this.endOfWave, 1000);
  }

  endOfWave = (override: boolean = false) => {
    //console.log("enemy kill count", this.enemyKillCount);
    //console.log("enemy removed count", this.enemyRemovedCount);
    //console.log("enemy count", this.enemyCount);
    if ((this.monitorSpawning && this.lastBatchSpawnedFlag && this.isWaveActive) || override) {
      //let ents = this.scene.entities;

      //let enemies = ents.filter(ent => ent instanceof Enemy);

      if (this.enemyKillCount + this.enemyRemovedCount >= this.enemyCount) {
        this.isWaveActive = false;
        this.monitorSpawning = false;
        //end wave
        this.endWave();
      }
    }
  };

  init() {
    this.enemyPool = new RentalPool(this.makeEnemy, this.cleanUpEnemy, 500);
    this.isWaveActive = false; // Set the wave active flag to true

    this.stateSignal.listen((params: CustomEvent) => {
      const [key, data] = params.detail.params;

      if (key === "enemyDefeated") {
        this.enemyKillCount += 1;
      } else if (key === "playerDamaged") {
        this.enemyRemovedCount += 1;
      }
    });
  }

  waveTik = () => {
    if (this.lastBatchSpawnedFlag) {
      return;
    }
    if (!this.isWaveActive) return; // Check if the wave is active
    this.duration += 1; // Increment the wave duration

    if (!this.isStartDelayConsumed && this.duration >= START_OF_WAVE_TIME) {
      this.isStartDelayConsumed = true; // Set the start delay consumed flag to true
      this.spawnEnemies();
    }

    if (this.isStartDelayConsumed) {
      this.stateSignal.send(["waveDuration", this.duration]); // Send the wave duration signal
      this.burnDown.send();
    }
  };

  startWave() {
    //console.log("starting wave");

    this.enemyKillCount = 0;
    this.enemyRemovedCount = 0;
    this.waveNumber += 1; // Increment the wave number
    this.isWaveActive = true; // Set the wave active flag to true
    this.spawnEnabled = true;
    this.duration = 0; // Reset the duration
    this.isStartDelayConsumed = false; // Reset the start delay consumed flag
    this.enemyCount = getEnemiesToSpawn(this.waveNumber); // Get the number of enemies to spawn
    this.batchSize = getNumberOfBatches(this.enemyCount); // Get the batch sizes for spawning
    this.lastBatchSpawnedFlag = false;
    this.batchIndex = 0;
    this.monitorSpawning = false;

    //console.log("start of wave: ", this.enemyCount, this.batchSize);

    //TODO -debug remove later
    //this.batchSize = [2]; //debug
    //this.enemyCount = 2;

    this.stateSignal.send(["batchsize", this.enemyCount]); // Send the wave duration signal
    this.spawnStrategy = this.rng.pickOne(Object.keys(spawnStrategyMap) as Array<keyof typeof SpawnStrategy>); // Randomly select a spawn strategy

    this.gamePausedSignal.send([false]);
  }
  endWave() {
    this.spawnEnabled = false;
    this.isWaveActive = false; // Set the wave active flag to false
    this.duration = 0; // Reset the duration
    this.isStartDelayConsumed = false; // Reset the start delay consumed flag

    (this.scene as GameScene).showEndOfWaveModal();
    this.gamePausedSignal.send([true]);
  }

  spawnEnemies() {
    //console.trace("spawning enemies");

    let enemyPositions = spawnStrategyMap[this.spawnStrategy].getSpawnPositions(
      this.batchSize[this.batchIndex],
      this.map as IsometricMap
    ); // Get spawn positions based on the strategy
    this.batchIndex += 1; // Increment the batch index
    //pick new strategy
    this.spawnStrategy = this.rng.pickOne(Object.keys(spawnStrategyMap) as Array<keyof typeof SpawnStrategy>); // Randomly select a spawn strategy

    for (let i = 0; i < enemyPositions.length; i++) {
      let nextTile = enemyPositions[i]; // Get the next tile for spawning
      if (nextTile === undefined) continue; // Skip if the tile is undefined
      //find the tile at nextTile coordinates

      let tile = this.map?.tiles.find(tile => tile.pos.x === nextTile.x && tile.pos.y === nextTile.y);
      if (!tile) continue; // Skip if the tile is not found
      let nextEnemy = this.enemyPool?.rent(true); // Rent an enemy from the pool

      nextEnemy.waveLevel = this.waveNumber;

      // For managing if one of the players are dead,
      // logic here is that that the opposite affinity
      // will only produce drops for the alive player
      if (!this.lightPlayer.isAlive) {
        nextEnemy.setAffinity("dark");
      } else if (!this.darkPlayer.isAlive) {
        nextEnemy.setAffinity("light");
      }

      nextEnemy.pos = tile.pos.clone(); // Set the position of the enemy

      this.scene.add(nextEnemy);
      this.monitorSpawning = true;
      //check if completed spawning
    }
    if (this.batchIndex == this.batchSize.length) {
      //console.log("setting last batch spawned flag");
      this.lastBatchSpawnedFlag = true;
    }
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
    if (this.spawnEnabled && this.isStartDelayConsumed && !this.lastBatchSpawnedFlag) {
      this.spawnInterval -= elapsed;
      if (this.spawnInterval <= 0) {
        this.spawnInterval = SPAWN_FREQUENCY; // Reset the spawn interval
        this.spawnEnemies();
      }
    }
  }
}

function isOnMap(map: IsometricMap, enemy: Enemy) {
  const mapWidth = map.columns * map.tileWidth;
  const mapHeight = map.rows * map.tileHeight;

  return enemy.pos.x >= 0 && enemy.pos.x <= mapWidth - enemy.width && enemy.pos.y >= 0 && enemy.pos.y - enemy.height <= mapHeight;
}

function getTile() {}
