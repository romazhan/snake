'use strict';

class Map {
    constructor() {
        this.id = 'map';
        this.width = this.height = 240;
        this.backgroundColour = '#fafafa';
    }

    getContext() {
        const canvas = document.getElementById(this.id);
        canvas.width = this.width; canvas.height = this.height;
        return canvas.getContext('2d');
    }
}

class Snake {
    constructor(center) {
        this.body = [];
        this.parts = 4;
        this.width = this.height = 10;
        this.alpha = (this.width + this.height) / 2;
        this.headColour = '#459045';
        this.bodyColour = '#43c643';
        this.formBody(center);
    }

    formBody(center) {
        let indent = this.alpha;
        for(let iteration = 0; iteration <= this.parts; ++iteration) {
            const part = { x : center - indent, y : center };
            this.body.push(part);
            indent += this.alpha;
        }
    }

    updateHead(ox, oy) {
        const head = { x : this.body[0].x + ox, y : this.body[0].y + oy };
        this.body.unshift(head);
    }
}

class Food {
    constructor(mapWidth, mapHeight, alpha = 10) {
        this.mapWidth = mapWidth; this.mapHeight = mapHeight;
        this.width = this.height = 10;
        this.colour = '#da4444';
        this.x = this.y = 0;
        this.alpha = alpha;
        this.coordinate();
    }

    randomCoordinate(minimum, maximum) {
        return Math.round((Math.random() * (maximum - minimum) + minimum) / this.alpha) * this.alpha;
    }

    coordinate() {
        this.x = this.randomCoordinate(0, this.mapWidth - this.width);
        this.y = this.randomCoordinate(0, this.mapHeight - this.height);
    }
}

class Joystick {
    constructor(alpha = 10, beta = 0) {
        this.leftButton = '#left'; this.rightButton = '#right';
        this.upButton = '#up'; this.downButton = '#down';
        this.ox = this.alpha = alpha;
        this.oy = this.beta = beta;
        this.direction = 'right';
    }

    left() {
        if(this.direction === 'right') { return false; }
        this.ox = -this.alpha; this.oy = this.beta;
        this.direction = 'left';
    }

    right() {
        if(this.direction === 'left') { return false; }
        this.ox = this.alpha; this.oy = this.beta;
        this.direction = 'right';
    }

    up() {
        if(this.direction === 'down') { return false; }
        this.ox = this.beta; this.oy = -this.alpha;
        this.direction = 'up';
    }

    down() {
        if(this.direction === 'up') { return false; }
        this.ox = this.beta; this.oy = this.alpha;
        this.direction = 'down';
    }

    bind() {
        const directions = ['left', 'right', 'up', 'down'];
        [this.leftButton, this.rightButton, this.upButton, this.downButton].forEach((selector, iteration) => {
            document.body.querySelector(selector).addEventListener('click', () => {
                this[directions[iteration]]();
            });
        });
    }
}

export default class {
    constructor() {
        this.fps = 0;
        this.speed = 85;
        this.reward = 100;
        this.map = new Map();
        this.snake = new Snake(this.map.width / 2);
        this.food = new Food(this.map.width, this.map.height, this.snake.alpha);
        this.joystick = new Joystick(this.snake.alpha, 0);
        this.context = this.map.getContext();
        this.alpha = this.snake.alpha;
        this.scoreSelector = '#score';
        this.joystick.bind();
        this.updateFrame();
        this.run = false;
    }

    addPoints() {
        document.body.querySelector(this.scoreSelector).innerText = parseInt(
            document.body.querySelector(this.scoreSelector).innerText
        ) + this.reward;
    }

    drawMap() {
        this.context.fillStyle = this.map.backgroundColour;
        this.context.fillRect(0, 0, this.map.width, this.map.height);
    }

    drawSnake() {
        this.snake.body.forEach((part, iteration) => {
            this.context.fillStyle = iteration ? this.snake.bodyColour: this.snake.headColour;
            this.context.fillRect(part.x, part.y, this.snake.width, this.snake.height);
        });
    }

    drawFood() {
        this.context.fillStyle = this.food.colour;
        this.context.fillRect(this.food.x, this.food.y, this.food.width, this.food.height);
    }

    updateFrame() {
        this.drawMap(); this.drawSnake(); this.drawFood();
    }

    startUpdateFrameCycle() {
        let interval = setInterval(() => {
            this.run ? this.updateFrame() : clearInterval(interval);
        }, this.fps);
    }

    validate() {
        if(this.snake.body[0].x !== this.food.x || this.snake.body[0].y !== this.food.y) {
            this.snake.body.pop();
        } else {
            this.addPoints(); this.food.coordinate();
        }
        this.snake.body.forEach(part => {
            if(part.x === this.food.x && part.y === this.food.y) {
                this.food.coordinate();
            }
        });
        for(let iteration = 4; iteration < this.snake.body.length; ++iteration) {
            if(this.snake.body[iteration].x === this.snake.body[0].x && this.snake.body[iteration].y === this.snake.body[0].y) {
                this.run = false;
            }
        }
        [this.snake.body[0].x < 0, this.snake.body[0].x > this.map.width - this.alpha,
            this.snake.body[0].y < 0, this.snake.body[0].y > this.map.height - this.alpha
        ].forEach(condition => {
            if(condition) { this.run = false; }
        });
        return this.run;
    }

    start(stop = undefined) {
        if(this.run === false) {
            this.run = true;
            this.startUpdateFrameCycle();
        }
        this.validate() && setTimeout(() => {
            this.snake.updateHead(this.joystick.ox, this.joystick.oy);
            this.start(stop);
        }, this.speed) || (stop ? stop() : alert('Game over!'));
    }
}
