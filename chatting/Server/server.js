const { json } = require('express');
var express= require('express');
var app = express();
var server = require('http').Server(app);

let db = [];
var io = require('socket.io')(server,{
    cors : {
        origin: "*", credentials: true
    },
    extraHeaders : {
        "Access-Control-Allow-Origin" : "*"
    }
});


io.on('connection', socket=>{
    console.log(`connecting ' ${socket.client.id}`);
    socket.emit('load', db);
    socket.on('message', (message)=>{
        
        let m = JSON.parse(message)
        db.push(m);
        console.log(`${m.name} : ${m.text} : ${m.key}`);
        io.emit('message', message);
    })
})


server.listen(3000,()=>{
    console.log('om Server is starting on port 3000');
})