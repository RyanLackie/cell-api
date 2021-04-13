// Required modules
const Wall = require('../Entities/Wall.js');
const Circle = require('../Entities/Circle.js');
const Food = require('../Entities/Food.js');

const Util = require('../Util/Util.js');

class GameState {
    constructor(bounds, walls, allies, enemies, food) {
        this.bounds = bounds;
        this.walls = walls;
        this.allies = allies;
        this.enemies = enemies;
        this.food = food;

        this.lastUpdate = Date.now();
        this.lastFoodSpawn = 0;
    }

    createNewGame() {
        this.bounds = {
            width: 1000, height: 500, wallThickness: 20
        };

        this.walls = [
            new Wall(0, 0, this.bounds.width, this.bounds.wallThickness),                                                   // Top
            new Wall(0, 0, this.bounds.wallThickness, this.bounds.height),                                                  // Left
            new Wall(0, this.bounds.height - this.bounds.wallThickness, this.bounds.width, this.bounds.wallThickness),      // Bottom
            new Wall(this.bounds.width - this.bounds.wallThickness, 0, this.bounds.wallThickness, this.bounds.height),      // Right
        ];

        let numOfAllies = 4;
        for (let i = 0; i < numOfAllies; i++) {
            const r = 20;
            let x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
            let y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

            if (i !== 0) {
                for (let j = 0; j < this.allies.length; j++) {
                    if (Util.distance(x, y, this.allies[j].x, this.allies[j].y) - (r + this.allies[j].radius) < 0) {
                        x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
                        y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

                        j = -1;
                    }
                }
            }

            this.allies.push( new Circle(x, y, r) );
        }

        let numOfEnemies = 4;
        for (let i = 0; i < numOfEnemies; i++) {
            const r = 20;
            let x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
            let y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

            if (i !== 0) {
                for (let j = 0; j < this.allies.length; j++) {
                    if (Util.distance(x, y, this.allies[j].x, this.allies[j].y) - (r + this.allies[j].radius) < 0) {
                        x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
                        y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

                        j = -1;
                    }
                }
            }

            this.enemies.push( new Circle(x, y, r) );
        }
    }

    tick() {
        let now = Date.now();
        let dt = now - this.lastUpdate;
        this.lastUpdate = now;

        this.allies.forEach(ally => {
            ally.update(dt, this.food, this.allies, this.enemies, this.walls, this.bounds);
        });
        this.enemies.forEach(enemy => {
            enemy.update(dt, this.food, this.enemies, this.allies, this.walls, this.bounds);
        });

        if (Date.now() > this.lastFoodSpawn + 5000) {
            this.spawnFood();
        }
    }

    spawnFood() {
        const foodRadius = 5;
        let x = Util.randomIntFromRange(this.bounds.wallThickness + foodRadius, this.bounds.width - this.bounds.wallThickness - foodRadius);
        let y = Util.randomIntFromRange(this.bounds.wallThickness + foodRadius, this.bounds.height - this.bounds.wallThickness - foodRadius);

        const allyConflict = this.allies.find(ally => {
            return Util.distance(x, y, ally.x, ally.y) - (foodRadius + ally.radius) < 0;
        });
        const enemyConflict = this.enemies.find(enemy => {
            return Util.distance(x, y, enemy.x, enemy.y) - (foodRadius + enemy.radius) < 0;
        });

        if (allyConflict || enemyConflict) {
            this.spawnFood();
        }

        this.lastFoodSpawn = Date.now();
        this.food.push( new Food(x, y, foodRadius) );
    }

}

module.exports = GameState;
