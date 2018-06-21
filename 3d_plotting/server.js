const express = require('express');
const app = express();
const expressServer = app.listen(3000);
const io = require('socket.io')(expressServer);

//non routed will just send you to the website localhost:3000/ 
app.get('/', (req, res) => { res.sendFile(__dirname + '/main.html') })

//used for other files that might be needed
app.use(express.static(__dirname + '/'));

