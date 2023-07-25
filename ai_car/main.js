const canvas = document.getElementById("Canv")
canvas.width = 200;
const network_canvas = document.getElementById("networkCanv")
network_canvas.width = 300;

const car_ctx = canvas.getContext("2d");
const network_ctx = network_canvas.getContext("2d");

const road = new Road(canvas.width/2, canvas.width*0.9);

const N = 130;
const cars = generate_cars(N);

let best_car = cars[0];

if(localStorage.getItem("best_brain")){
    for (let i = 0; i < cars.length; i++) {
        cars[i].network = JSON.parse(localStorage.getItem("best_brain"));

        if(i!=0){
            NeuralNetwork.mutate(cars[i].network, 0.2);
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(0.5), -100, 30, 50, CarType.DUMMY, 2),
    new Car(road.getLaneCenter(1), -100, 30, 50, CarType.DUMMY, 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, CarType.DUMMY, 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, CarType.DUMMY, 2),

    new Car(road.getLaneCenter(0), -500, 30, 50, CarType.DUMMY, 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, CarType.DUMMY, 2),
    // new Car(road.getLaneCenter(0), -700, 30, 50, CarType.DUMMY, 2),
    // new Car(road.getLaneCenter(1), -700, 30, 50, CarType.DUMMY, 2)
];

animate();

function save(){
    localStorage.setItem("best_brain", JSON.stringify(best_car.network));
}

function discard(){
    localStorage.removeItem("best_brain");
}

function generate_cars(N){
    const cars = [];
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, CarType.PROTAGONIST, undefined, "brown"));
    for (let i = 1; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, CarType.PROTAGONIST, undefined, "blue"));
    }
    return cars;
}

function animate(time){
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
        // traffic[i].update();
    }
    
    for (let i = 0; i < N; i++) {
        cars[i].update(road.borders, traffic);
    }

    best_car = cars.find(car => car.y == Math.min(...cars.map(c => c.y)));

    canvas.height = window.innerHeight;
    network_canvas.height = window.innerHeight;

    car_ctx.save();
    // translates the canvas origin point (0, 0) to the coordinates
    // moves the drawing position
    // car_ctx.translate(0, -car.y+canvas.height*0.7);
    car_ctx.translate(0, -best_car.y+canvas.height*0.7);

    road.draw(car_ctx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(car_ctx);
    }

    car_ctx.globalAlpha = 0.2;
    for (let i = 0; i < N; i++) {
        cars[i].draw(car_ctx);
    }
    car_ctx.globalAlpha = 1;
    best_car.draw(car_ctx, true);
    // car.draw(car_ctx);

    car_ctx.restore();

    network_ctx.lineDashOffset = -time/50;

    Visualizer.draw_network(network_ctx, best_car.network);

    requestAnimationFrame(animate);
}
