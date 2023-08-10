class Car{
    constructor(x, y, width, height, car_type, max_speed=3, default_color="red"){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxspeed = max_speed;
        this.friction = 0.05;
        this.angle = 0;

        this.damaged = false;
        this.default_color = default_color;

        this.use_network = car_type=="protagonist";

        if(car_type == "protagonist" || car_type == "human"){
            this.sensor = new Sensor(this);
            this.network = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls(car_type);

        this.img = new Image();
        this.img.src = "car.png";

        this.mask = document.createElement("canvas");

        this.mask.width = width;
        this.mask.height = height;

        const mask_ctx = this.mask.getContext("2d");
        this.img.onload=()=>{
            mask_ctx.fillStyle = default_color;
            mask_ctx.rect(0, 0, this.width, this.height);
            mask_ctx.fill();

            mask_ctx.globalCompositeOperation = "destination-atop";
            mask_ctx.drawImage(this.img, 0, 0, this.width, this.height);
        }



    }

    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#create_polygon();
            this.damaged = this.#assess_damage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.sensor_readings.map(reading => reading==null?0:1-reading.offset);
            const outputs = NeuralNetwork.feed_forward(offsets, this.network);

            if(this.use_network){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assess_damage(roadBorders, traffic){
        const result = roadBorders.some(boarder => {
            if(poly_intersecting(this.polygon, boarder)){
                return true;
            }
        });
        
        if(!result){
            return traffic.some(traffic_obj => {
                if(poly_intersecting(this.polygon, traffic_obj.polygon)){
                    return true;
                }
            });
        }

        return result;
    }

    #create_polygon(){
        const points = [];
        const half_radious = Math.hypot(this.width, this.height) / 2;

        const sin_alfa = this.width / (half_radious * 2);
        const angle_rad = Math.asin(sin_alfa);
        // const alpha = Math.atan2(this.width, this.height);
    
        // top right
        points.push({
            x: this.x - Math.sin(this.angle - angle_rad) * half_radious,
            y: this.y - Math.cos(this.angle - angle_rad) * half_radious
        })
        // top left
        points.push({
            x: this.x - Math.sin(this.angle + angle_rad) * half_radious,
            y: this.y - Math.cos(this.angle + angle_rad) * half_radious
        })
        // bottom left
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - angle_rad) * half_radious,
            y: this.y - Math.cos(Math.PI + this.angle - angle_rad) * half_radious
        })
        // bottom right
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + angle_rad) * half_radious,
            y: this.y - Math.cos(Math.PI + this.angle + angle_rad) * half_radious
        })

        return points;


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
            this.speed = -this.maxspeed/2;
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

    draw(ctx, draw_sensor=false){
        /* Drawing cars using just polygons
        if(this.damaged){
            ctx.fillStyle = "orange";
        }else{
            ctx.fillStyle = this.default_color;

        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
            
        }
        ctx.fill();
        */
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        if(!this.damaged){
            ctx.drawImage(this.mask, -this.width/2, -this.height/2, this.width, this.height);
            ctx.globalCompositeOperation = "multiply";
        }

        ctx.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);

        ctx.restore();


        if(this.sensor && draw_sensor){
            this.sensor.draw(ctx);
        }

    }
}
