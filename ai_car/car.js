class Car{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = 3;
        this.friction = 0.05;
        this.angle = 0;

        this.sensor = new Sensor(this);
        this.controls = new Controls();


        this.sensor.update();
    }

    update(){
        this.#move();
        // this.sensor.update();
    }

    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration
        }

        if(this.speed > this.maxspeed){
            this.speed = this.maxspeed;
        }
        if(this.speed < -this.maxspeed/2){
            this.speed = - this.maxspeed/2;
        }

        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }


        if(this.speed != 0){
            // const flip = this.speed > 0?1:-1;
            if(this.controls.left){
                // this.angle += 0.03*flip;
                this.angle += 0.03;
            }
            if(this.controls.right){
                // this.angle -= 0.03*flip;
                this.angle -= 0.03;
            }
        }

        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    draw(ctx){
        ctx.save();
        // translates the canvas origin point (0, 0) to the coordinates
        // moves the drawing position
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);

        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        );
        ctx.fill();

        this.sensor.draw(ctx);
    }
}
