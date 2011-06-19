
/**
 * Module dependencies.
 */

var express = require('express');
var io      = require('socket.io');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
    app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
    res.render('index', {
        title: 'Refractor'
    });
});

var io = io.listen(app);

io.on('connection', function (client) {

    client.on('message', function (message) {
        console.log('client ' + client.sessionId + ' sent message: ' + message);
        client.broadcast(message);
    });
    client.on('disconnect', function() {
    })
});


var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d", app.address().port);
