//create real time graphss
function init() {
    initHost('fx');
    initHost('fy');
    initHost('fz');
    initHost('tx');
    initHost('ty');
    initHost('tz');
    initHost('all');
}

var seriesOptions = [
    { strokeStyle: 'rgb(255, 0,  0)', fillStyle: 'rgba(255, 0, 0,  0.3)',  lineWidth: 3 },
    { strokeStyle: 'rgb(0, 255,  0)', fillStyle: 'rgba(0, 255, 0,  0.3)',  lineWidth: 3 },
    { strokeStyle: 'rgb(0, 0,  255)', fillStyle: 'rgba(0, 0, 255,  0.3)',  lineWidth: 3 },
    { strokeStyle: 'rgb(255, 255,0)', fillStyle: 'rgba(255, 255, 0, 0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(255, 0,255)', fillStyle: 'rgba(255, 0, 255, 0.3)', lineWidth: 3 },
    { strokeStyle: 'rgb(0, 255,255)', fillStyle: 'rgba(0, 255, 255, 0.3)', lineWidth: 3 }
];

function initHost(hostId) {

    // Initialize an empty TimeSeries for each CPU.
    var sensor = new TimeSeries()
    var fx = new TimeSeries();
    var fy = new TimeSeries();
    var fz = new TimeSeries();

    var tx = new TimeSeries();
    var ty = new TimeSeries();
    var tz = new TimeSeries();

    var socket = io.connect('http://localhost:3000');

    // Build the timeline
    var timeline = new SmoothieChart({ responsive: true });
     
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

    }else if  (hostId === 'all'){

	    timeline.addTimeSeries(fx, seriesOptions[0]);
	    timeline.addTimeSeries(fy, seriesOptions[1]);
	    timeline.addTimeSeries(fz, seriesOptions[2]);

	    timeline.addTimeSeries(tx, seriesOptions[3]);
	    timeline.addTimeSeries(ty, seriesOptions[4]);
	    timeline.addTimeSeries(tz, seriesOptions[5]);
    }

    socket.on('sensor-update', (msg) => {
        const readings = msg.data.split(',');

        var d = new Date().getTime()

        if (hostId === 'fx') {
            sensor.append(d, readings[0])
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
        }else if (hostId === 'all'){
	        fx.append(d, readings[0])
	        fy.append(d, readings[1])
	        fz.append(d, readings[2])

	        tx.append(d, readings[3])
	        tx.append(d, readings[4])
	        tx.append(d, readings[5])
        }

    });

    timeline.streamTo(document.getElementById(hostId), 100);
}