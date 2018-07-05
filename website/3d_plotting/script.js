var socket = io.connect('http://localhost:3000');

var x = [];
var y = [];
var z = [];
var c = [];
var numSamples = 0;
console.log(document)
var graph = document.getElementById("graph")
console.log(graph)
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

socket.on('plot-update', (d) => {
    if (d != null) {
        const readings = d.data.split(',');
        x.push(readings[0]);
        y.push(readings[1]);
        z.push(readings[2])
        c.push(Math.floor(Math.random() * 256))
        numSamples += 1;

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
        console.log(numSamples)
    }

});