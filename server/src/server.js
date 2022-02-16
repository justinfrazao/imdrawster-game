require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  path: '/socket',
});
const apiRoutes = require('./controllers/api');
const socketHandler = require('./controllers/socketHandler');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

//Database
//Live Lobby codes are tracked with array of connected players 
//Look at LiveGame model, it replaces below object
// let gameReference = {};

// All live info goes to database first
// When a game is started, a snapshot of database is sent to game instance
// Database continues to update live, but game info stays enclosed in that instance
// Disconnects and replacements are handled inside of game instance and are populated from the database

//Object of game instances
//Referenced by lobby code
//Prevents having to iterate through an array and comparing strings
//I hope this is optimized to a map or something under the hood
//Look up how V8/Node does it in future
//set value to null and then delete the object to remove


io.on('connection', (socket) => {
  socketHandler(io, socket);
});

var server_port = process.env.YOUR_PORT || process.env.port || 5000;
http.listen(server_port, () => {
  console.log("Started on : " + server_port);
});
