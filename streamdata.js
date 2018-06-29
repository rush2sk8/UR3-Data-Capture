//***************************************************SETUP CODE**************************************************///
const SENSOR_INTERVAL_TIME = 100;
const IP_ADDRESS = '10.20.0.15';
var enable_logging = false;

const http = require('http');

var xml2js = require('xml2js');
var fs = require('fs');
var parser = new xml2js.Parser();

var forcetorquestream = null;
var robotstream = null;

const express = require('express');
const app = express();
const expressServer = app.listen(3000);
const io = require('socket.io')(expressServer);
const bodyParser = require('body-parser');
const PythonShell = require('python-shell');
var currData = 'NONE';
var currRobotData = 'NONE'
var timeRecieved = 0;
var prevRobotData = "NONE"

//*************************************************CMD LINE ARGS CODE*******************************************///
if (process.argv[2] === '-h' || process.argv[2] === '-help') {
    console.log("usage: node streamdata.js [-h] [-log t/f]");
    process.exit();
} else if (process.argv[2] === '-log') {
    const flag = process.argv[3];

    if (flag && (flag.toUpperCase() === 'T' || flag.toUpperCase() === 'TRUE')) {
        enable_logging = true;

        //create the write stream file
        forcetorquestream = fs.createWriteStream(Date.now() + '_forcetorque_data.csv');

        //stream to write robot data to the file 
        robotstream = fs.createWriteStream(Date.now() + '_robot_data.csv');

        //if logging is enabled write this header
        forcetorquestream.write("Fx (N),Fy (N),Fz (N),Tx (Nm),Ty (Nm),Tz (Nm)\n");

        //if logging is enabled write this header
        robotstream.write("X, Y, Z, RX, RY, RZ\n");
    }
}

//write the information to the console every X ms
setInterval(() => {
    console.log(currRobotData)
    //console.log(currData)
}, 250);

//***********************************CATCH ALL THE PYTHON OUTPUT CODE*******************************************///
// Use python shell
var pyshell = new PythonShell('rtd.py', {
    mode: 'text',
    pythonOptions: ['-u'], // get print results in real-time
});

//when we get a message from the script
pyshell.on('message', function(buf) {

    if (buf != null && buf.length > 1) {

        currRobotData = buf.toString();
        if (prevRobotData !== "NONE" && checkRobotData(currRobotData, prevRobotData) === false) {
            io.sockets.emit('robot-update', { data: currRobotData })
        }
        prevRobotData = currRobotData

        if (enable_logging) robotstream.write(currRobotData + "\n")

        // console.log(currRobotData)
    }
});

//catch the error where the python script fails
pyshell.end((err, code, signal) => {
    if (err) {
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
    }
});

//makes sure that the current data is different than the previous data
function checkRobotData(data1, data2) {
    const data = data1.split(", ");
    const other2 = data2.split(", ")

    for (var i = data.length - 1; i >= 0; i--)
        if (parseFloat(data[i]).toFixed() !== parseFloat(other2[i]).toFixed()) return false

    return true
}

//********************************************GET AND COMPUTE DATA CODE*******************************************///
//run a GET to the XML status
function getAndParseXML() {

    //get the data
    var req = http.request({ host: IP_ADDRESS, path: '/status.xml' }, function(response) {
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

                //create a string
                const string = "Fx:" + Fx_newton.toFixed(4) + ',' + "Fy:" + Fy_newton.toFixed(4) + ',' + "Fz:" + Fz_newton.toFixed(4) + ',' + "Tx:" + Tx_newton.toFixed(4) + ',' + "Ty:" + Ty_newton.toFixed(4) + ',' + "Tz:" + Tz_newton.toFixed(4);

                const s = Fx_newton.toFixed(4) + ',' + Fy_newton.toFixed(4) + ',' + Fz_newton.toFixed(4) + ',' + Tx_newton.toFixed(4) + ',' + Ty_newton.toFixed(4) + ',' + Tz_newton.toFixed(4);

                // console.log(s)

                currData = string;
                timeRecieved = Date.now()

                //send the data to the local website
                io.sockets.emit('sensor-update', { data: s })

                //if the logging is enabled then write it to the file
                if (enable_logging) forcetorquestream.write(s + "\n")

            });

        });
    });
    //if there is a timeout then stop
    req.on('socket', function(socket) {
        socket.setTimeout(100);
        socket.on('timeout', function() {
            req.abort();
        });
    });

    req.on('error', function(err) {
        // if (err.code === "ECONNRESET") {}
    });

    req.end()
}

//run it every X ms
setInterval(getAndParseXML, SENSOR_INTERVAL_TIME); //////////////////REENABLE WHEN SITE IS UP

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
    if (enable_logging) {
        forcetorquestream.end();
        robotstream.end()
    }
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

//localhost:3000/api/robotxyz
router.get('/robotxyz', (req, res) => { res.json({ data: currRobotData.split(',').slice(0, 3) }) })

//localhost:3000/api/robotxyz
router.get('/robottorque', (req, res) => { res.json({ data: currRobotData.split(',').slice(3, 6) }) })

//non routed will just send you to the website localhost:3000/ 
app.get('/', (req, res) => { res.sendFile(__dirname + '/website/index.html') })

app.get('/robotviz', (req, res) => { res.sendFile(__dirname + '/website/3d_plotting/main.html') })

app.get('/adddata', (req, res) => { res.sendFile(__dirname + '/website/adddata/main.html') })

//used for other files that might be needed
app.use(express.static(__dirname + '/'));

//used for other files that might be needed
app.use(express.static(__dirname + '/website/3d_plotting/'));

//add data 
app.use(express.static(__dirname + '/website/adddata/'));

//capture data back from the website
io.sockets.on('connection', (socket) => {

    socket.on('add', (a) => {
        console.log("data")
        writeNewConfiguration(a.data)
    })
});


function writeNewConfiguration(data) {
    var string = "<?xml version=\"1.0\"?>" + "\n" + "<rtde_config>" + "\n" + " <recipe key=\"out\">" + "\n" + "<field name=\"actual_TCP_pose\" type=\"VECTOR6D\"/>" 
    const entries = data.split(',');
    for (var i = 0; i < entries.length; i++) {
        string += entries[i] + "\n"
    }
    string += "</recipe>" + "\n" + "</rtde_config>" 
    fs.writeFileSync("record_configuration.xml", string)
}