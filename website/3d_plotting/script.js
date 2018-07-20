var socket = io.connect('http://10.20.0.128:3000');

//where we hold the xyz data
var x = [];
var y = [];
var z = [];
var c = [];

//keep a track of the number of samples so that we can restart and cleanup when we reach a threshhold to minimize render lag
var numSamples = 0;

var graph = document.getElementById("graph")
console.log(graph)

//create the initial graph
Plotly.plot(graph, [{
    type: 'scatter3d',
    mode: 'lines',
    x: x,
    y: y,
    z: z,
    opacity: 0.7,
    line: {
        width: 10,
        color: c,
        colorscale: 'Viridis'
    }
}]);

//when we get plot-update data then 
socket.on('plot-update', (d) => {
    if (d != null) {
        const readings = d.data.split(',');
        x.push(readings[0]);
        y.push(readings[1]);
        z.push(readings[2])
        c.push(Math.floor(Math.random() * 256))
        numSamples += 1;

        //update graph with new data
        Plotly.react(graph, [{
            type: 'scatter3d',
            mode: 'lines',
            autosize: false,
            width: 800,
            height: 800,
            x: x,
            y: y,
            z: z,
            opacity: 0.7,
            line: {
                width: 5,
                color: c,
                colorscale: 'Viridis'
            }
        }]);

        //if we reach 500 samples then restart the graph so we dont have such large datasets trying to be rendered
        //btw we shouldnt be writing that much data anyway because the robot poses's will be repeated
        if (numSamples >= 500) {
            Plotly.purge('graph')
            Plotly.plot('graph', [{
                type: 'scatter3d',
                mode: 'lines',
                autosize: false,
                width: 800,
                height: 800,
                x: x,
                y: y,
                z: z,
                opacity: 0.7,
                line: {
                    width: 10,
                    color: c,
                    colorscale: 'Viridis'
                }
            }]);

            x = [];
            y = [];
            z = [];
            c = [];

            x.length = 0;
            y.length = 0;
            z.length = 0;
            c.length = 0;

            numSamples = 0;
        }
        
    }

});