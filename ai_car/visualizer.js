class Visualizer{

    static draw_network(ctx, network){
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        Visualizer.draw_layer(ctx, network.layers[0], left, top, width, height);
    }

    // won't be pretty for 1 perceptron layers
    static draw_layer(ctx, layer, left, top, width, height){
        const right = left + width;
        const bottom = top + height;

        // const {inputs, outputs} = layer;

        const perceptron_radious = 19;
        const gap_bottom = width/(layer.inputs.length - 1);
        const gap_top = width/(layer.outputs.length - 1);

        for (let i = 0; i < layer.inputs.length; i++) {
            for (let j = 0; j < layer.outputs.length; j++) {
                ctx.beginPath();
                ctx.lineWidth = 2;

                ctx.strokeStyle = get_rgba_weight(layer.weights[i][j]);

                ctx.moveTo(left + (gap_bottom * i), bottom);
                ctx.lineTo(left + (gap_top * j), top);
                ctx.stroke()
            }
        }

        for (let i = 0; i < layer.inputs.length; i++) {
            const x = left + gap_bottom * i;

            ctx.beginPath();
            ctx.arc(x, bottom, perceptron_radious, 0, Math.PI*2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, bottom, perceptron_radious * 0.6, 0, Math.PI*2);
            ctx.fillStyle = get_rgba_weight(layer.inputs[i]);
            ctx.fill();
        }

        for (let i = 0; i < layer.outputs.length; i++) {
            const x = left + gap_top * i;
            ctx.beginPath();
            ctx.arc(x, top, perceptron_radious, 0, Math.PI*2);
            ctx.fillStyle = "black";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, top, perceptron_radious * 0.6, 0, Math.PI*2);
            ctx.fillStyle = get_rgba_weight(layer.outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, perceptron_radious * 0.8, 0, Math.PI*2);
            ctx.strokeStyle = get_rgba_weight(layer.biases[i]);
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }


            
    }

}
