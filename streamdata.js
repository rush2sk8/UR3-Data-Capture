//***************************************************SETUP CODE**************************************************///
var SENSOR_INTERVAL_TIME = 10;                      //sensor poll rate hz
var SENSOR_IP_ADDRESS = '10.20.0.15';               //sensor ip
var ROBOT_INTERVAL_TIME = 10;                       //robot data poll rate hz
var ROBOT_IP_ADDRESS = '10.20.0.25'                 //robot ip
var enable_logging = false;                         //loggin is false by default
            
const http = require('http');                       //http library used to get the sensor data
            
var xml2js = require('xml2js');                     //library for parsing the XML from the FT Sensor
var fs = require('fs');                             //filesystem for file I/O
var parser = new xml2js.Parser();                   //XML parser
            
var forcetorquestream = null;                       //file I/O stream for FT sensor values
var robotstream = null;                             //file I/O stream for robot data values
            
const express = require('express');                 //used to host a web server
const app = express();
const expressServer = app.listen(3000);             //listen the webserver on port 3000
const io = require('socket.io')(expressServer);     //create a websocket 
const bodyParser = require('body-parser');
const PythonShell = require('python-shell');        //shell to pyscript for robot data aqusision
var currData = 'NONE';
var currRobotData = 'NONE'
var timeRecieved = 0;

var prevRobotData = "NONE"
var extraRobotData = []
var pyshell;
//***********************************************READ EXTRA DATA CODE*******************************************///
//check if the file exists in a synchronous fashion 
if (fs.existsSync("./robot.extra")) {       
    var extra = fs.readFileSync("./robot.extra", "utf8", (err) => {}).split(',');
    for (var i = 0; i < extra.length; i++) {
        extraRobotData.push(extra[i])
    }
}
//*************************************************CMD LINE ARGS CODE*******************************************///
//check for command line arguments
if (process.argv.length < 4) {
    console.log("Usage: node streamdata.js <robot ip> <ft sensor ip> [options ...]");
    console.log("\nOptions:")
    console.log("-ftpoll <refresh rate (Hz)> \t Change the polling rate of the FT sensor. Default is 10Hz")
    console.log("-rbpoll <refresh rate (Hz)> \t Change the polling rate of the Robot Data. Default is 10Hz")
    console.log("-log <t/f> \t\t\t Enable logging. Default is false ")
    process.exit()
}

SENSOR_IP_ADDRESS = process.argv[3]
ROBOT_IP_ADDRESS = process.argv[2]

for (var i = 4; i < process.argv.length; i++) {
    if (process.argv[i] === '-log') {

        var flag = process.argv[i + 1];

        if (flag && (flag.toUpperCase() === 'T' || flag.toUpperCase() === 'TRUE')) {
            enable_logging = true;

            //create the write stream file
            forcetorquestream = fs.createWriteStream(Date.now() + '_forcetorque_data.csv');

            //stream to write robot data to the file 
            robotstream = fs.createWriteStream(Date.now() + '_robot_data.csv');

            //if logging is enabled write this header
            forcetorquestream.write("Current Time (ms),Fx (N),Fy (N),Fz (N),Tx (Nm),Ty (Nm),Tz (Nm)\n");

            //if logging is enabled write this header
            robotstream.write("Current Time (ms),X, Y, Z, RX, RY, RZ," + extraRobotData.toString() + "\n");
        }
    } else if (process.argv[i] === '-ftpoll') {
        SENSOR_INTERVAL_TIME = process.argv[i + 1];
    } else if (process.argv[i] === '-rbpoll') {
        ROBOT_INTERVAL_TIME = process.argv[i + 1];
    }
}

//write the information to the console every X ms
setInterval(() => {
    // clear command IMP
    // console.log('\033c')
    console.log("CRD: " + currRobotData)
    //console.log("CD: " + currData)
    // console.log("FT:" + SENSOR_INTERVAL_TIME + " RB: "+ ROBOT_INTERVAL_TIME)
}, 250);

//***********************************CATCH ALL THE PYTHON OUTPUT CODE*******************************************///
function runPythonProcess() {

    // Use python shell
    pyshell = new PythonShell('rtd.py', {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        args: ['--host', ROBOT_IP_ADDRESS, '--frequency', ROBOT_INTERVAL_TIME]
    });

    //when we get a message from the script
    pyshell.on('message', function(buf) {
        currRobotData = buf.toString();

        if (buf != null && buf.length > 1) {

            //basicall extract the mandatory xyz rx ry rz data and check if there is any extra
            var split = currRobotData.split(",")
            var toSend = ""
            var x = 0;

            for (var i = 0; i < 6; i++) toSend += split[i] + ","

            //if there is extra data put it in a different format based on what the data type is 
            if (split.length > 6) {

                for (var i = 6; i < split.length; i++) {

                    const extra = ((extraRobotData != null) && extraRobotData.length >= 1 && x < extraRobotData.length) ? extraRobotData[x].split(":")[1] : ""

                    if (extra === "VECTOR6D" || extra === "VECTOR6INT32") {

                        for (var j = i; j < i + 5; j++)
                            toSend += split[j] + '+'

                        toSend += split[i + 5] + ",";
                        i += 5;

                    } else if (extra === "VECTOR3D") {
                        for (var j = i; j < i + 2; j++)
                            toSend += split[j] + '+'

                        toSend += split[i + 2] + ",";
                        i += 2

                    } else
                        toSend += split[i] + ","

                    x++;
                }
            }

            //chop off the last comma
            toSend = toSend.substring(0, toSend.length - 1)

            //dont emit empty strings
            if (prevRobotData !== "NONE") {

                io.sockets.emit('robot-update', { data: toSend })

                if (checkRobotData(currRobotData, prevRobotData) === false) {
                    io.sockets.emit('plot-update', { data: currRobotData })
                }
            }

            prevRobotData = currRobotData

            if (enable_logging) robotstream.write(Date.now() + "," + toSend.replace(/\+/g, "") + "\n")
 
        }
    });

    //catch the error where the python script fails
    pyshell.end((err, code, signal) => {
        if (err) {
            console.log('The exit code was: ' + code);
            console.log('The exit signal was: ' + signal);
        }
    });
}

//used only to emit data when it changes
function checkRobotData(data1, data2) {
    const data = data1.split(", ");
    const other2 = data2.split(", ")

    for (var i = data.length - 1; i >= 0; i--) {
        if (parseFloat(data[i]).toFixed(1) !== parseFloat(other2[i]).toFixed(1)) return false
    }
    return true
}

//run the code once
runPythonProcess();

//********************************************GET AND COMPUTE DATA CODE*******************************************///
//run a GET to the XML status
function getAndParseXML() {

    //get the data
    var req = http.request({ host: SENSOR_IP_ADDRESS, path: '/status.xml' }, function(response) {
        var xmlData = '';

        //chunk the data
        response.on('data', function(chunk) { xmlData += chunk });

        //when the end of the data is reached then parse the xml data
        response.on('end', function() {

            //parse the xml string
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
                currData = string;
                timeRecieved = Date.now()

                //send the data to the local website
                io.sockets.emit('sensor-update', { data: s })

                //if the logging is enabled then write it to the file
                if (enable_logging) forcetorquestream.write(Date.now() + "," + s + "\n")

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
setInterval(getAndParseXML,  (1 / SENSOR_INTERVAL_TIME) * 1000); //////////////////REENABLE WHEN SITE IS UP

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

    if (extraRobotData.length >= 1) {
        fs.writeFileSync("robot.extra", extraRobotData)
    }

    process.exit();
});

//refresh the webpage
setTimeout(() => {
    io.sockets.emit('refresh', { data: "none" })
    console.log("refresh")
}, 1000)

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
router.get('/forcetorque', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData }) });

//localhost:3000/api/force
router.get('/force', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData.split(',').slice(0, 3) }) })

//localhost:3000/api/torque
router.get('/torque', (req, res) => { res.json({ data: "ΔT:" + (Date.now() - timeRecieved) + "," + currData.split(',').slice(3, 6) }) })

//localhost:3000/api/robotxyz
router.get('/robotxyz', (req, res) => { res.json({ data: currRobotData.split(',').slice(0, 3) }) })

//localhost:3000/api/robotxyz
router.get('/robotrotation', (req, res) => { res.json({ data: currRobotData.split(',').slice(3, 6) }) })

//non routed will just send you to the website localhost:3000/ 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/website/dashboard.html', (err) => {
        //on finish send the extra robot data
        setTimeout(() => { io.sockets.emit('add_labels', { data: extraRobotData.toString() }); }, 100)
    });

})

app.get('/robotviz', (req, res) => { res.sendFile(__dirname + '/website/3d_plotting/main.html') })

app.get('/adddata', (req, res) => { res.sendFile(__dirname + '/website/adddata/main.html') })

//used for other files that might be needed
app.use(express.static(__dirname + '/'));

//used for other files that might be needed
app.use(express.static(__dirname + '/website/3d_plotting/'));

//#include otherdata 
app.use(express.static(__dirname + '/website/adddata/'));
app.use(express.static(__dirname + '/website/assets/css'));
app.use(express.static(__dirname + '/website/assets/img'));
app.use(express.static(__dirname + '/website/assets/js'));
app.use(express.static(__dirname + '/website/assets/js/core'));
app.use(express.static(__dirname + '/website/assets/js/plugins'));
app.use(express.static(__dirname + '/website/'));

//capture data back from the website
io.sockets.on('connection', (socket) => {

    //write a new config kill the python process and replace it with a new one which loads the new configuration
    socket.on('add_data', (d) => {
        console.log(d)
        var data = d.data.split(',');

        //write the new record config BLOCKING
        writeNewConfiguration(data)
        console.log("data: "+data.toString())

        //kill the python process
        //pyshell.childProcess.kill('SIGINT')
        pyshell.terminate('SIGINT')
        //restart the pyshell this time loading the enw configuration
        runPythonProcess();

        extraRobotData = []
        extraRobotData = data;

        if (enable_logging)
            robotstream.write("Current Time(ms),X, Y, Z, RX, RY, RZ," + extraRobotData.toString() + "\n");

        if (extraRobotData.length >= 1) {
            fs.writeFileSync("robot.extra", extraRobotData)
        }

        //emit this to the main page so that you can keep the additional data persistent
        setTimeout(() => {
            io.sockets.emit('add_labels', { data: extraRobotData.toString() });
        }, 1000)
    });

    //if they request the additional dat labels then send them what we have
    socket.on('request_labels', (d) => {
        io.sockets.emit('add_labels', { data: extraRobotData.toString() });
    })
});

//writes the new record_configuration.xml and restart the process
function writeNewConfiguration(data) {
    var string = "<?xml version=\"1.0\"?>" + "\n" + "<rtde_config>" + "\n" + " <recipe key=\"out\">" + "\n" + "<field name=\"actual_TCP_pose\" type=\"VECTOR6D\"/>" + "\n"

    if (data != null && data.length >= 1)
        for (var i = 0; i < data.length; i++) {
            const split = data[i].split(":")
            if (split.length == 2)
                string += "<field name=\"" + split[0] + "\" type=\"" + split[1] + "\"/>" + "\n";
        }

    string += "</recipe>" + "\n" + "</rtde_config>"
    fs.writeFileSync("record_configuration.xml", string)
}