const canvas = document.getElementById("Canv")
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2, canvas.width*0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, CarType.PROTAGONIST, undefined, "blue");
const traffic = [
    new Car(road.getLaneCenter(2), -100, 30, 50, CarType.DUMMY, 2)
];

animate();

function animate(){
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
        // traffic[i].update();
        
    }
    car.update(road.borders, traffic);
    canvas.height = window.innerHeight;

    ctx.save();
    // translates the canvas origin point (0, 0) to the coordinates
    // moves the drawing position
    ctx.translate(0, -car.y+canvas.height*0.7);

    road.draw(ctx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx);
    }
    car.draw(ctx);

    ctx.restore();
    requestAnimationFrame(animate);
}
