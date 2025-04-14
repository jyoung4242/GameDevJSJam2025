import { CollisionGroup } from "excalibur";

export const weaponCollisionGroup = new CollisionGroup("weapons", 0b100, 0b010);
export const EnemyCollisionGroup = new CollisionGroup("enemy", 0b010, 0b101);
export const playerCollisionGroup = new CollisionGroup("player", 0b0001, 0b010);
