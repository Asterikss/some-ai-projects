class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.length = 100;
        this.rayspread = Math.PI/4;

        this.ray_endings = [];
        this.sensor_readings = [];  // for each ray

    }

    update(roadBorders){
        this.#castRays();

        this.sensor_readings = [];

        this.ray_endings.forEach(element => {
            this.sensor_readings.push(
                this.#getSensorReadings(element, roadBorders)
            );
        });
    }

    #getSensorReadings(ray_ending, roadBorders){
        let touches = [];

        roadBorders.forEach(boarder => {
            const touch = get_intersection(
                {x:this.car.x, y:this.car.y},
                ray_ending,
                boarder[0],
                boarder[1]
            );

            if(touch){
                touches.push(touch);
            }

        });

        if(touches.length == 0){
            return null;
        }else{
            const offsets=touches.map((item) => {
                item.offset
            });
            const min_offset = Math.min(...offsets);

            return touches.find((touch) => {
                touch.offset == min_offset
            });
        }

    }

    #castRays(){
        this.ray_endings = [];

        for (let i = 0; i < this.rayCount; i++) {
            // rayCount is reduced by one, because we want the total number of gaps in beetween the boarder rays
            // to be rayspread minus one. e.g. with rayspread = 3: | | | - two gaps. Also check if rayCount == 1
            const rayAngle = this.rayspread
                + ((-this.rayspread  - this.rayspread) / (this.rayCount==1?2:(this.rayCount - 1)))
                * (this.rayCount==1?1:i)
                + this.car.angle;

            this.ray_endings.push({
                x: this.car.x - Math.sin(rayAngle) * this.length,
                y: this.car.y - Math.cos(rayAngle) * this.length
            });

        }
    }


    draw(ctx){
        for (let i = 0; i < this.rayCount; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.car.x, this.car.y);
            ctx.lineTo(this.ray_endings[i].x, this.ray_endings[i].y);
            ctx.stroke();
            
        }
    }
}
