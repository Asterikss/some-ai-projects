class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 3;
        this.length = 100;
        this.rayspread = Math.PI/4;

        this.rays = [];
        this.rays_begin = [];

    }

    update2(){
        this.rays = [];
        this.rays_begin = [];
        // for (let i = 1; i < this.rayCount + 1; i++) {
        for (let i = 0; i < this.rayCount; i++) {
            // this.rays.push((this.rayspread/this.rayCount) * i);
            // this.rays.push(this.rayspread + (((this.rayspread * this.rayCount)/this.rayCount) * i);
            // console.log(this.rayspread)
            // console.log(this.rayspread * i)
            const rayAngle = this.rayspread - (this.rayspread * i);
            // this.rays.push(this.rayspread + (this.rayspread * i));

            // this.rays.push([
            // [{
            //     x: this.car.x - Math.sin(rayAngle) * this.length,
            //     y: this.car.y - Math.cos(rayAngle) * this.length
            // }],
            // [{
            //     x: this.car.x, y: this.car.y
            // }]
            // ]);

            // this.rays.push(
            // [{
            //     x: this.car.x - Math.sin(rayAngle) * this.length,
            //     y: this.car.y - Math.cos(rayAngle) * this.length
            // }],
            // );
            
            this.rays.push(
            {
                x: this.car.x - Math.sin(rayAngle) * this.length,
                y: this.car.y - Math.cos(rayAngle) * this.length
            }
            );

            this.rays_begin.push({
                x: this.car.x,
                y: this.car.y
            });


        }
        // console.table(this.rays);
        // console.table(this.rays_begin);
        // console.log(this.rays);
    }
    update(){
        this.rays
    }

    draw(ctx){
        for (let i = 0; i < this.rayCount; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            // ctx.moveTo(this.car.x, this.car.y);

            // console.log(this.car.x, this.car.y);

            ctx.moveTo(this.rays_begin[i].x, this.rays_begin[i].y);
            // console.log(this.rays_begin[i].x, this.rays_begin[i].y);
            ctx.lineTo(this.rays[i].x, this.rays[i].y);
            // ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
            // ctx.lineTo(this.rays[i][0].x, this.rays[i][0].y);
                // ctx.lineTo(this.rays[i].x, this.rays[i].y);
            // ctx.lineTo(this.car.x + 30, this.car.y + 30);
            ctx.stroke();
            
        }
    }

    draw2(ctx){
        for (let i = 0; i < this.rayCount; i++) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.stroke();
            
        }
    }
}
