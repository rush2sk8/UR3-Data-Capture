//***************************************************SETUP CODE**************************************************///
const INTERVAL_TIME = 100;
const IP_ADDRESS = '10.20.0.15';
var enable_logging = false;

const http = require('http');

var xml2js = require('xml2js');
var fs = require('fs');
var parser = new xml2js.Parser();

var stream = null;

const express = require('express');
const app = express();
const expressServer = app.listen(3000);
const io = require('socket.io')(expressServer);
const bodyParser = require('body-parser');
var currData = 'NONE';
var timeRecieved = 0;


//***********************************CATCH ALL THE PYTHON OUTPUT CODE*******************************************///
const captureSpawn = require('capture-spawn')
const spawn = require('cross-spawn-async')
const cp = spawn('cmd', ['/s', '/c', 'python', 'rtd.py'], {
    stdio: [null, process.stdout, process.stderr]
})

var stream = captureSpawn(cp, function callback(err, res, buf) {
    if (err) {
        return console.error(err)
    } else {
        if (buf != null && buf.length > 1) {
            io.sockets.emit('robot-update', { data: buf.toString() })
        }
    }
});
//*************************************************CMD LINE ARGS CODE*******************************************///
if (process.argv[2] === '-h') {
    console.log("usage: node streamdata.js [-h] [-log t/f]");
    process.exit();
} else if (process.argv[2] === '-log') {
    const flag = process.argv[3];

    if (flag && (flag.toUpperCase() === 'T' || flag.toUpperCase() === 'TRUE')) {
        enable_logging = true;

        //create the write stream file
        stream = fs.createWriteStream(Date.now() + '_data.csv');

        //if logging is enabled write this header
        stream.write("Fx (N),Fy (N),Fz (N),Tx (Nm),Ty (Nm),Tz (Nm)\n");
    }
}

//********************************************GET AND COMPUTE DATA CODE*******************************************///
//run a GET to the XML status
function getAndParseXML() {

    //get the data
    http.request({ host: IP_ADDRESS, path: '/status.xml' }, function(response) {
        var xmlData = '';

        //chunk the data
        response.on('data', function(chunk) { xmlData += chunk });

        //when the end of the data is reached then parse the xml data
        response.on('end', function() {

            parser.parseString(xmlData, (err, result) => {

                //get the data
                Cts_Fx = (result['response']['Cts.Fx'])[0];
                Cts_Fy = (result['response']['Cts.Fy'])[0];
                Cts_FzP = (result['response']['Cts.FzP'])[0];
                Cts_Tx = (result['response']['Cts.Tx'])[0];
                Cts_Ty = (result['response']['Cts.Ty'])[0];
                Cts_Tz = (result['response']['Cts.Tz'])[0];
                Cts_FzN = (result['response']['Cts.FzN'])[0];

                NC_Fx = (result['response']['NC.Fx'])[0];
                NC_Fy = (result['response']['NC.Fy'])[0];
                NC_FzP = (result['response']['NC.FzP'])[0];
                NC_Tx = (result['response']['NC.Tx'])[0];
                NC_Ty = (result['response']['NC.Ty'])[0];
                NC_Tz = (result['response']['NC.Tz'])[0];
                NC_FzN = (result['response']['NC.FzN'])[0];

                //get the raw numbers
                Fx_raw = Number((result['response']['Fx'])[0]);
                Fy_raw = Number((result['response']['Fy'])[0]);
                Fz_raw = Number((result['response']['Fz'])[0]);
                Tx_raw = Number((result['response']['Tx'])[0]);
                Ty_raw = Number((result['response']['Ty'])[0]);
                Tz_raw = Number((result['response']['Tz'])[0]);

                //compute the fx 
                Fx_newton = Fx_raw * NC_Fx / Cts_Fx;
                Fy_newton = Fy_raw * NC_Fy / Cts_Fy;
                Fz_newton = Fz_raw * NC_FzP / Cts_FzP;
                Tx_newton = Tx_raw * NC_Tx / Cts_Tx / 1000;
                Ty_newton = Ty_raw * NC_Ty / Cts_Ty / 1000;
                Tz_newton = Tz_raw * NC_Tz / Cts_Tz / 1000;

                //log the data
                console.log("***********")
                console.log("Fx " + Fx_newton.toFixed(4))
                console.log("Fy " + Fy_newton.toFixed(4))
                console.log("Fz " + Fz_newton.toFixed(4))

                console.log("Tx " + Tx_newton.toFixed(4))
                console.log("Ty  " + Ty_newton.toFixed(4))
                console.log("Tz " + Tz_newton.toFixed(4))

                //create a string
                const string = "Fx:" + Fx_newton.toFixed(4) + ',' + "Fy:" + Fy_newton.toFixed(4) + ',' + "Fz:" + Fz_newton.toFixed(4) + ',' + "Tx:" + Tx_newton.toFixed(4) + ',' + "Ty:" + Ty_newton.toFixed(4) + ',' + "Tz:" + Tz_newton.toFixed(4);

                const s = Fx_newton.toFixed(4) + ',' + Fy_newton.toFixed(4) + ',' + Fz_newton.toFixed(4) + ',' + Tx_newton.toFixed(4) + ',' + Ty_newton.toFixed(4) + ',' + Tz_newton.toFixed(4);

                currData = string;
                timeRecieved = Date.now()

                //send the data to the local website
                io.sockets.emit('sensor-update', { data: s })

                //if the logging is enabled then write it to the file
                if (enable_logging) stream.write(s + "\n")
            });

        });
    }).end();
}

//run it every X ms
setInterval(getAndParseXML, INTERVAL_TIME);

//***************************************************WINDOWS CODE**************************************************///
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function() { process.emit("SIGINT") });
}

//if sigint is captured then end the stream and exit the program
process.on("SIGINT", function() {
    if (enable_logging)
        stream.end();
    process.exit();
});

//***************************************************WEBSITE CODE**************************************************///

//create an api route
var router = express.Router();

//make the output in json format
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api', router);

//localhost:3000/api displays this message
router.get('/', function(req, res) { res.json({ message: 'hooray! welcome to our api!' }) });

//localhost:3000/api/data returns the data 
router.get('/data', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData }) });

//localhost:3000/api/force
router.get('/force', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData.split(',').slice(0, 3) }) })

//localhost:3000/api/torque
router.get('/torque', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData.split(',').slice(3, 6) }) })

//localhost:3000/api/routes
router.get('/routes', (req, res) => { res.json([{ data: "/api/data" }, { force: "/api/force" }, { torque: "api/torque" }]) })

//non routed will just send you to the website localhost:3000/ 
app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') })

//used for other files that might be needed
app.use(express.static(__dirname + '/'));