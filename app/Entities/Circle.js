// Required modules
const Util = require('../Util/Util.js');

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        const velX = Math.random() - 0.5;
        const velY = Math.random() - (1 - Math.abs(velX));
        this.velocity = {
            x: velX,
            y: velY
        };

        this.targetX = null;
        this.targetY = null;

        this.lastTarget = null;
        this.lastTargetTime = 0;
        this.blacklist = [];
    }

    update(dt, food, allies, enemies, walls, bounds) {
        var collision = false;
        if (this.circleCollision(allies)) {
            collision = true;
        }
        if (this.wallCollision(walls, bounds)) {
            collision = true;
        }
        if (this.boundaryEdgeCollision(bounds)) {
            collision = true;
        }

        // If no collisions take place (circle, wall, edge)
        if (!collision) {

            // Find target and threats
            let targetAndThreats = this.findTargetAndThreats(food);
            const enemyTargetAndThreats = this.findTargetAndThreats(enemies);
            if (enemyTargetAndThreats.target !== null || enemyTargetAndThreats.threats.length !== 0) {
                targetAndThreats = enemyTargetAndThreats;
            }

            // Manipulate velocity for target and threats
            this.velocityInRegardsToEnvironment(targetAndThreats.target, targetAndThreats.threats);
        }

        // Move by the calculated velocity amounts
        this.moveByVelocity(dt);
    };

    findTargetAndThreats(food) {
        let target = null;
        let targetDistance = this.radius*4;

        const threats = [];

        // Remove after
        this.targetX = null;
        this.targetY = null;

        // Unlist previusly unreachable targets
        /*
        const timeOfDisinterest = 4000;
        for (var j = 0; j < this.blacklist.length; j++) {
            if (Date.now() > this.blacklist[j].time + timeOfDisinterest) {
                this.blacklist.splice(j, 1);
                j--;
            }
        }
        */

        // Find targets and threats
        for (var i = 0; i < food.length; i++) {
            /*
            // Pass over blacklisted targets
            var blacklisted = false;
            for (var j = 0; j < this.blacklist.length; j++) {
                if (this.blacklist[j].target === food[i]) {
                    blacklisted = true;
                    break;
                }
            }
            if (blacklisted)
                continue;
            */

            var distance = Util.distance(this.x, this.y, food[i].x, food[i].y);

            var foodIsInVision = distance < this.radius * 3 + food[i].radius;
            var foodIsEdible = this.radius > food[i].radius;
            var foodIsEaten = distance < this.radius - food[i].radius * 0.25;   // Cover 3/4 of diamiter

            if (foodIsInVision) {
                if (foodIsEdible) {
                    if (foodIsEaten) {
                        if (this.radius + food[i].radius/4 < 70) {  // Radius limit
                            this.radius += food[i].radius/4;
                        }
                        else {
                            this.radius = 70;
                        }
                        food.splice(i, 1);

                    // Target is the closest
                    } else if (distance < targetDistance) {
                        target = food[i];
                        targetDistance = distance;
                    }

                } else if (!foodIsEdible) {
                    threats.push(food[i]);
                }
            }
        }
        /*
        // Add unreachable target to blacklist
        const timeOfInterest = 7000;
        if (target !== null) {
            if (this.lastTarget === target) {
                if (Date.now() > this.lastTargetTime + timeOfInterest) {
                    this.blacklist.push({
                        target: target,
                        time: Date.now()
                    });
                }
            }
            else {
                this.lastTarget = target;
                this.lastTargetTime = Date.now();
            }
        }
        */
        return { target: target, threats: threats };
    }

    velocityInRegardsToEnvironment(target, threats) {
        let targetVelX = this.velocity.x;
        let targetVelY = this.velocity.y;

        // Set target velocity to move away from threats
        if (threats.length > 0) {
            let avoidAverageX = 0;
            let avoidAverageY = 0;

            for (let i = 0; i < threats.length; i++) {
                avoidAverageX += threats[i].x;
                avoidAverageY += threats[i].y;
            }

            let xDifference = this.x - avoidAverageX;
            let yDifference = this.y - avoidAverageY;
            let xyDifference = Math.abs(xDifference) + Math.abs(yDifference);
            targetVelX = xDifference / xyDifference;
            targetVelY = yDifference / xyDifference;

        // Set target velocity to move towards target
        } else if (target !== null && threats.length === 0) {
            let xDifference = target.x - this.x;
            let yDifference = target.y - this.y;
            let xyDifference = Math.abs(xDifference) + Math.abs(yDifference);
            targetVelX = xDifference / xyDifference;
            targetVelY = yDifference / xyDifference;

            // Remove after
            this.targetX = target.x;
            this.targetY = target.y;
        }

        // Set speed up or slow down to a speed of 1
        else if ((target === null || threats.length === 0) && Math.abs(this.velocity.x) + Math.abs(this.velocity.y) !== 1) {
            let extraSpeed = (Math.abs(this.velocity.x) + Math.abs(this.velocity.y)) - 1;

            if (targetVelX > 0) {
                targetVelX -= extraSpeed / 2;
            } else if (targetVelX < 0) {
                targetVelX += extraSpeed / 2;
            }

            if (targetVelY > 0) {
                targetVelY -= extraSpeed / 2;
            } else if (targetVelY < 0) {
                targetVelY += extraSpeed / 2;
            }
        }

        let rateOfChange = 0.1/this.radius;

        // Move current velocity towards target velocty in relation to momentum
        if (Math.abs(this.velocity.x - targetVelX) <= rateOfChange) {
            this.velocity.x = targetVelX;
        } else if (this.velocity.x < targetVelX) {
            this.velocity.x += rateOfChange;
        } else if (this.velocity.x > targetVelX) {
            this.velocity.x -= rateOfChange;
        }

        if (Math.abs(this.velocity.y - targetVelY) <= rateOfChange) {
            this.velocity.Y = targetVelY;
        } else if (this.velocity.y < targetVelY) {
            this.velocity.y += rateOfChange;
        } else if (this.velocity.y > targetVelY) {
            this.velocity.y -= rateOfChange;
        }
    }

    circleCollision(allies) {
        let collision = false;

        allies.forEach(ally => {
            if (this === ally) {
                return;
            }

            if (Util.distance(this.x, this.y, ally.x, ally.y) - (this.radius + ally.radius) < 0) {
                collision = true;
                Util.resolveCollision(this, ally);
            }
        });

        return collision;
    }

    wallCollision(walls, bounds) {
        let collision = false;

        /*
        for (let i = 0; i < walls.length; i++) {
            let deltaX = this.x - Math.max(walls[i].x, Math.min(this.x, walls[i].x + walls[i].width));
            let deltaY = this.y - Math.max(walls[i].y, Math.min(this.y, walls[i].y + walls[i].height));
            if ((deltaX * deltaX + deltaY * deltaY) < (this.radius * this.radius))
                Util.resolveStaticCollision(this, walls[i]);
        }
        */
        if (this.x - this.radius <= bounds.wallThickness) {
            this.velocity.x = Math.abs(this.velocity.x);
            collision = true;
        } else if (this.x + this.radius >= bounds.width - bounds.wallThickness) {
            this.velocity.x = -Math.abs(this.velocity.x);
            collision = true;
        }

        if (this.y - this.radius <= bounds.wallThickness) {
            this.velocity.y = Math.abs(this.velocity.y);
            collision = true;
        } else if (this.y + this.radius >= bounds.height - bounds.wallThickness) {
            this.velocity.y = -Math.abs(this.velocity.y);
            collision = true;
        }

        return collision;
    }

    boundaryEdgeCollision(bounds) {
        let collision = false;

        if (this.x - this.radius <= 0) {
            this.velocity.x = Math.abs(this.velocity.x);
            collision = true;
        } else if (this.x + this.radius >= bounds.width) {
            this.velocity.x = -Math.abs(this.velocity.x);
            collision = true;
        }

        if (this.y - this.radius <= bounds.wallThickness) {
            this.velocity.y = Math.abs(this.velocity.y);
            collision = true;
        } else if (this.y + this.radius >= bounds.height) {
            this.velocity.y = -Math.abs(this.velocity.y);
            collision = true;
        }

        return collision;
    }

    moveByVelocity(dt) {
        let deltaTime = 1;
        if (dt !== 0) {
            deltaTime = dt;
        }
        // Add a movment speed limiter
        let speedLimiter = 7 / (this.radius*5);
        this.x += this.velocity.x * speedLimiter * deltaTime;
        this.y += this.velocity.y * speedLimiter *  deltaTime;
    }
}

module.exports = Circle;
