class Road{
    constructor(x, width, laneCount=3){
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width/2;
        this.right = x + width/2;

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        const topLeft = {x:this.left, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const topRight = {x:this.right, y:this.top};
        const bottomRight = {x:this.right, y:this.bottom};
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],

        ];

    }

    getLaneCenter(laneIndex){
        return this.left + 
            (this.width/this.laneCount)/2 *
            ((Math.min(laneIndex, this.laneCount - 1) * 2) + 1);
    }

    draw(ctx){
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";


        for (let i = 1; i < this.laneCount; i++) {
            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(this.left + ((this.width/this.laneCount) * i), this.top);
            ctx.lineTo(this.left + ((this.width/this.laneCount) * i), this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(element => {
            ctx.beginPath();
            ctx.moveTo(element[0].x, element[0].y);
            ctx.lineTo(element[1].x, element[1].y);
            ctx.stroke();
        });

    }
}
