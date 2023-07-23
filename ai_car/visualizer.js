class Visualizer{

    static draw_network(ctx, network){
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        Visualizer.draw_layer(ctx, network.layers[0], left, top, width, height);
    }

    static draw_layer(ctx, layer, left, top, width, height){
        const right = left + width;
        const bottom = top + height;

        const perceptron_radious = 19;
        const gap = width/(layer.inputs.length - 1);

        for (let i = 0; i < layer.inputs.length; i++) {
            const x = left + gap * i;

            ctx.beginPath();
            ctx.arc(x, bottom, perceptron_radious, 0, Math.PI*2);
            ctx.fillStyle = "white";
            ctx.fill();
        }

    }

}
