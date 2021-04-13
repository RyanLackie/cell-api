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

        var numOfAllies = 4;
        for (var i = 0; i < numOfAllies; i++) {
            const r = 20;
            var x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
            var y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

            if (i != 0) {
                for (var j = 0; j < this.allies.length; j++) {
                    if (Util.distance(x, y, this.allies[j].x, this.allies[j].y) - (r + this.allies[j].radius) < 0) {
                        x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
                        y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

                        j = -1;
                    }
                }
            }

            this.allies.push( new Circle(x, y, r) );
        }

        var numOfEnemies = 4;
        for (var i = 0; i < numOfEnemies; i++) {
            const r = 20;
            var x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
            var y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

            if (i != 0) {
                for (var j = 0; j < this.allies.length; j++) {
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
        var now = Date.now();
        var dt = now - this.lastUpdate;
        this.lastUpdate = now;

        for (var i = 0; i < this.allies.length; i++) {
            this.allies[i].update(dt, this.food, this.allies, this.enemies, this.walls, this.bounds);
        }
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].update(dt, this.food, this.enemies, this.allies, this.walls, this.bounds);
        }

        this.spawnFood();
    }

    spawnFood() {
        if (Date.now() > this.lastFoodSpawn + 5000) {
            this.lastFoodSpawn = Date.now();

            const r = 5;
            var x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
            var y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

            for (var i = 0; i < Math.max(this.allies.length, this.enemies.length); i++) {
                if (i < this.allies.length) {
                    if (Util.distance(x, y, this.allies[i].x, this.allies[i].y) - (r + this.allies[i].radius) < 0) {
                        x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
                        y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

                        i = -1;
                        continue;
                    }
                }
                if (i < this.enemies.length) {
                    if (i < this.enemies.length && Util.distance(x, y, this.enemies[i].x, this.enemies[i].y) - (r + this.enemies[i].radius) < 0) {
                        x = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.width - this.bounds.wallThickness - r);
                        y = Util.randomIntFromRange(this.bounds.wallThickness + r, this.bounds.height - this.bounds.wallThickness - r);

                        i = -1;
                        continue;
                    }
                }
            }

            this.food.push( new Food(x, y, r) );
        }
    }

}

module.exports = GameState;
