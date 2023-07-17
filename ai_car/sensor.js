class Sensor{
    constructor(car){
        this.car = car;
        this.rayCount = 3;
        this.length = 100;
        this.rayspread = Math.PI/4;

        this.rays = [];

    }

    update(){
        this.rays = [];
        for (let i = 1; i < this.rayCount + 1; i++) {
            // this.rays.push((this.rayspread/this.rayCount) * i);
            // this.rays.push(this.rayspread + (((this.rayspread * this.rayCount)/this.rayCount) * i);
            // console.log(this.rayspread)
            // console.log(this.rayspread * i)
            this.rays.push(this.rayspread + (this.rayspread * i));
            
        }
        console.table(this.rays);
        // console.log(this.rays);
    }

    draw(ctx){
        for (let i = 0; i < this.rayCount; i++) {
            ctx.begin();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
            ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
            ctx.stroke();
            
        }
    }
}
