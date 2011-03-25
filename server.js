var express = require("express");
var server = express.createServer();

server.use(express.static(__dirname + "/www"));

server.listen(8888);