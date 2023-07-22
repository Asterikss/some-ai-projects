class Level{
    construcotr(input_count, output_count){
        this.inputs = new Array(input_count);
        this.outputs = new Array(output_count);
        this.biases = new Array(output_count);

        this.weights = [];
        for (let i = 0; i < input_count; i++) {
            this.weights[i] = new Array(output_count);
            
        }
    }

}
