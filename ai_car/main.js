const canvas = document.getElementById("Canv")
canvas.width = 200;
const network_canvas = document.getElementById("networkCanv")
network_canvas.width = 300;

const car_ctx = canvas.getContext("2d");
const network_ctx = network_canvas.getContext("2d");

const road = new Road(canvas.width/2, canvas.width*0.9);
// const car = new Car(road.getLaneCenter(1), 100, 30, 50, CarType.PROTAGONIST, undefined, "blue");
const car = new Car(road.getLaneCenter(1), 100, 30, 50, CarType.HUMAN, undefined, "blue");
const traffic = [
    new Car(road.getLaneCenter(2), -100, 30, 50, CarType.DUMMY, 2)
];

animate();

// Visualizer.draw_network(network_ctx, car.network);
function animate(){
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
        // traffic[i].update();
        
    }
    car.update(road.borders, traffic);
    canvas.height = window.innerHeight;
    network_canvas.height = window.innerHeight;
    // network_canvas.height = 300;

    car_ctx.save();
    // translates the canvas origin point (0, 0) to the coordinates
    // moves the drawing position
    car_ctx.translate(0, -car.y+canvas.height*0.7);

    road.draw(car_ctx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(car_ctx);
    }
    car.draw(car_ctx);

    car_ctx.restore();

    Visualizer.draw_network(network_ctx, car.network);

    requestAnimationFrame(animate);
}
