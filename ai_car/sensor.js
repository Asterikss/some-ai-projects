class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 5;
        this.length = 100;
        this.rayspread = Math.PI/4;

        this.rays = [];
        // this.rays_begin = [];

    }

    #castRays(){
        this.rays = [];

        for (let i = 0; i < this.rayCount; i++) {
            // rayCount is reduced by one, because we want the total number of gaps in beetween the boarder rays
            // to be rayspread minus one. e.g. with rayspread = 3: | | | - two gaps. Also check if rayCount == 1
            const rayAngle = this.rayspread
                + ((-this.rayspread  - this.rayspread) / (this.rayCount==1?2:(this.rayCount - 1)))
                * (this.rayCount==1?1:i)
                + this.car.angle;

            this.rays.push({
                x: this.car.x - Math.sin(rayAngle) * this.length,
                y: this.car.y - Math.cos(rayAngle) * this.length
            });

        }
    }

    update(roadBorders){
        this.#castRays();
    }


    draw(ctx){
        for (let i = 0; i < this.rayCount; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            // ctx.moveTo(this.rays_begin[i].x, this.rays_begin[i].y);
            ctx.moveTo(this.car.x, this.car.y);
            ctx.lineTo(this.rays[i].x, this.rays[i].y);
            ctx.stroke();
            
        }
    }
}
