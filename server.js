var express = require('express');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('scrabble.sqlite');

var length = 5;
var weight = 7;

var create_problem = function(length, weight, callback){
    var query = "SELECT * FROM racks WHERE length = ? and weight <= ? order by random() limit 0, 1";
    db.get(query, [length, weight], function(err, row){
        callback(row);
    });
};

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'public')));


//multi-rooms: 
//check out http://stackoverflow.com/questions/16423150/socket-io-subscribe-to-multiple-channels

io.on('connection', function (socket) {
    var yourgame = {};
    socket.emit("welcome");
    socket.on("new game", function(data){
        var length = data.len || 7;
        var weight = data.weight || length + 3;
        create_problem(length, weight, function(row){
            yourgame.rack = row.rack;
            yourgame.words = row.words;
            yourgame.tries = 0;
            console.log(yourgame);
            socket.emit("game", {rack: yourgame.rack, weight: yourgame.weight, tries: 0});
        });
    });
    socket.on("answer", function(data){
        console.log(data.answer);
        console.log(yourgame.words);
        yourgame.tries += 1;
        if ((yourgame.words.indexOf(data.answer) > -1) && (data.answer.length == yourgame.rack.length) && (data.answer.indexOf("@") == -1)){
            socket.emit("win", {tries: yourgame.tries});
        } else {
            socket.emit("wrong", {tries: yourgame.tries});
        }
    });
});

/*
create_problem(length, weight, function(row){
    console.log(row.rack+":: "+row.words);
});
*/

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});