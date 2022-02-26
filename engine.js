'use strict';

class Map {
    constructor(config) {
        this.selector = config.selector;
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
    }

    getContext() {
        const canvas = document.body.querySelector(this.selector);
        canvas.width = this.width; canvas.height = this.height;
        return canvas.getContext('2d');
    }
}

class Food {
    constructor(config) {
        this.width = config.width;
        this.height = config.height;
        this.color = config.color;
        this.x = config.x || 0;
        this.y = config.y || 0;
    }
}

class Snake {
    constructor(config) {
        this.parts = config.parts;
        this.width = config.width;
        this.height = config.height;
        this.headColor = config.headColor;
        this.bodyColor = config.bodyColor;
        this.body = [];
    }

    formBody(center, alpha) {
        let indent = alpha;
        for(let iteration = 0; iteration <= this.parts; ++iteration) {
            const part = {
                x : center - indent, y : center
            }; indent += alpha;
            this.body.push(part);
        }
    }

    updateHead(ox, oy) {
        const head = {
            x : this.body[0].x + ox, y : this.body[0].y + oy
        };
        this.body.unshift(head);
    }
}

class Joystick {
    constructor(config, speed, alpha = 10, beta = 0) {
        this.direction = config.direction;
        this.leftButton = config.leftSelector;
        this.rightButton = config.rightSelector;
        this.upButton = config.upSelector;
        this.downButton = config.downSelector;
        this.ox = this.alpha = alpha;
        this.oy = this.beta = beta;
        this.speed = speed - 10;
        this.delay = false;
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
            document.body.querySelector(selector).addEventListener('click', event => {
                if(this.delay) { return event.preventDefault(); }
                this.delay = true;
                this[directions[iteration]]();
                setTimeout(() => { this.delay = false; }, this.speed);
            });
        });
    }
}

export default class {
    constructor(config) {
        this.fps = config.game.fps;
        this.speed = config.game.speed;
        this.reward = config.game.reward;
        this.scoreSelector = config.game.scoreSelector;
        this.map = new Map(config.map);
        this.food = new Food(config.food);
        this.snake = new Snake(config.snake);
        this.alpha = (this.snake.width + this.snake.height) / 2;
        this.snake.formBody(this.map.width / 2, this.alpha);
        this.joystick = new Joystick(config.joystick, this.speed, this.alpha, 0);
        this.context = this.map.getContext();
        this.foodCoordinate();
        this.joystick.bind();
        this.updateFrame();
        this.run = false;
    }

    randomFoodCoordinate(minimum, maximum) {
        return Math.round((Math.random() * (maximum - minimum) + minimum) / this.alpha) * this.alpha;
    }

    foodCoordinate() {
        this.food.x = this.randomFoodCoordinate(0, this.map.width - this.food.width);
        this.food.y = this.randomFoodCoordinate(0, this.map.height - this.food.height);
    }

    addPoints() {
        document.body.querySelector(this.scoreSelector).innerText = parseInt(
            document.body.querySelector(this.scoreSelector).innerText
        ) + this.reward;
    }

    drawMap() {
        this.context.fillStyle = this.map.color;
        this.context.fillRect(0, 0, this.map.width, this.map.height);
    }

    drawFood() {
        this.context.fillStyle = this.food.color;
        this.context.fillRect(this.food.x, this.food.y, this.food.width, this.food.height);
    }

    drawSnake() {
        this.snake.body.forEach((part, iteration) => {
            this.context.fillStyle = iteration ? this.snake.bodyColor: this.snake.headColor;
            this.context.fillRect(part.x, part.y, this.snake.width, this.snake.height);
        });
    }

    updateFrame() {
        this.drawMap(); this.drawFood(); this.drawSnake();
    }

    startUpdateFrameCycle() {
        const interval = setInterval(() => {
            this.run ? this.updateFrame() : clearInterval(interval);
        }, this.fps);
    }

    validate() {
        if(this.snake.body[0].x !== this.food.x || this.snake.body[0].y !== this.food.y) {
            this.snake.body.pop();
        } else {
            this.addPoints(); this.foodCoordinate();
        }
        this.snake.body.forEach(part => {
            if(part.x === this.food.x && part.y === this.food.y) {
                this.foodCoordinate();
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
        if(!this.run) { this.run = true;
            this.startUpdateFrameCycle();
        }
        this.validate() && setTimeout(() => {
            this.snake.updateHead(this.joystick.ox, this.joystick.oy);
            this.start(stop);
        }, this.speed) || (stop ? stop() : alert('Game over!'));
    }
}
