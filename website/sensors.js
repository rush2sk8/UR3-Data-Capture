//create real time graphss
function init() {
    initHost('fx');
    initHost('fy');
    initHost('fz');
    initHost('tx');
    initHost('ty');
    initHost('tz');
    initHost('all');
    initSockets();
    console.log('init')
}

var seriesOptions = [
    { strokeStyle: 'rgb(255, 0,  0)', fillStyle: 'rgba(255, 0, 0,  0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(0, 255,  0)', fillStyle: 'rgba(0, 255, 0,  0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(0, 0,  255)', fillStyle: 'rgba(0, 0, 255,  0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(255, 255,0)', fillStyle: 'rgba(255, 255, 0, 0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(255, 0,255)', fillStyle: 'rgba(255, 0, 255, 0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(0, 255,255)', fillStyle: 'rgba(0, 255, 255, 0.3)', lineWidth: 3 }
];

function initSockets() {
    var socket = io.connect('http://localhost:3000');
    var label_nodes = []

    socket.on('robot-update', (d) => {
        if (d != null) {
            var readings = d.data.split(',');

            document.getElementById('x').innerHTML = "X: " + readings[0]
            document.getElementById('y').innerHTML = "Y: " + readings[1]
            document.getElementById('z').innerHTML = "Z: " + readings[2]
            document.getElementById('rx').innerHTML = "RX: " + readings[3]
            document.getElementById('ry').innerHTML = "RY: " + readings[4]
            document.getElementById('rz').innerHTML = "RZ: " + readings[5]

            if (readings.length > 6) {

                const extra = document.getElementById('extra')

                var x = document.getElementsByClassName('extra_data');

                for (var i = x.length - 1; i >= 0; i--) {
                    x[i].innerHTML = x[i].id + ": " + readings[i + 6].replace(/\+/g, "");
                }
            }
        }
    });

    //when someone emits a message to update the additional data section
    socket.on('add_labels', (d) => {

        //make sure its actual useable data
        if (d.data != null && d.data != "") {

            //clear the div
            const box = document.getElementById('extra')
            while (box.lastChild) {
                box.removeChild(box.lastChild);
            }

            //construct the new html for the page
            const data = d.data.split(',')
            var htmlData = "";
            for (var i = 0; i < data.length; i++) {
                const split = data[i].split(':')
                htmlData += "<h4 id=\"" + split[0] + "\" class=\"extra_data\">" + split[0] + ": <h4>" + "\n";
            }

            //set the html
            document.getElementById('extra').innerHTML = htmlData;
        }

    });

    //refreshes the page
    socket.on('refresh', (d) => {
        console.log('reload')
        location.reload(true)
    });
}

function initHost(hostId) {

    // Initialize an empty TimeSeries for each sensor value.
    var sensor = new TimeSeries()
    var fx = new TimeSeries();
    var fy = new TimeSeries();
    var fz = new TimeSeries();

    var tx = new TimeSeries();
    var ty = new TimeSeries();
    var tz = new TimeSeries();
    var socket = io.connect('http://localhost:3000');

    // Build the timeline
    var timeline = new SmoothieChart({ responsive: true, tooltip: true, sharpLines: true });

    if (hostId === 'fx') {

        timeline.addTimeSeries(sensor, seriesOptions[0]);

    } else if (hostId === 'fy') {

        timeline.addTimeSeries(sensor, seriesOptions[1]);

    } else if (hostId === 'fz') {

        timeline.addTimeSeries(sensor, seriesOptions[2]);

    } else if (hostId === 'tx') {

        timeline.addTimeSeries(sensor, seriesOptions[3]);

    } else if (hostId === 'ty') {

        timeline.addTimeSeries(sensor, seriesOptions[4]);

    } else if (hostId === 'tz') {

        timeline.addTimeSeries(sensor, seriesOptions[5]);

    } else if (hostId === 'all') {

        timeline.addTimeSeries(fx, seriesOptions[0]);
        timeline.addTimeSeries(fy, seriesOptions[1]);
        timeline.addTimeSeries(fz, seriesOptions[2]);

        timeline.addTimeSeries(tx, seriesOptions[3]);
        timeline.addTimeSeries(ty, seriesOptions[4]);
        timeline.addTimeSeries(tz, seriesOptions[5]);
    }

    socket.on('sensor-update', (msg) => {
        if (msg != null) {
            const readings = msg.data.split(',');

            var d = new Date().getTime()

            if (hostId === 'fx') {
                sensor.append(d, readings[0]);
            } else if (hostId === 'fy') {
                sensor.append(d, readings[1])
            } else if (hostId === 'fz') {
                sensor.append(d, readings[2])
            } else if (hostId === 'tx') {
                sensor.append(d, readings[3])
            } else if (hostId === 'ty') {
                sensor.append(d, readings[4])
            } else if (hostId === 'tz') {
                sensor.append(d, readings[5])
            } else if (hostId === 'all') {
                fx.append(d, readings[0])
                fy.append(d, readings[1])
                fz.append(d, readings[2])

                tx.append(d, readings[3])
                tx.append(d, readings[4])
                tx.append(d, readings[5])
            }
        }
    });

    timeline.streamTo(document.getElementById(hostId), 100);
}