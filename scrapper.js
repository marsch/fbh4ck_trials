var express = require("express");
var http = require('http'),
    jsdom = require('jsdom'),
    sys = require('sys'),
	url = require("url"),
	chain = require("slide").chain;


var scrapper = function () {
	var that = {};
	
	that.scrap = function (urlStr, method, data, callback) {
		console.log("SCRAPPING:"+urlStr);
		var urlObj = url.parse(urlStr),
			options = {};
		urlObj.port = urlObj.port || 80;
		
		options.host = urlObj.hostname;
		options.port = urlObj.port;
		options.path = urlObj.pathname;
		options.method = method;
		
		var request = http.request(options, function (response) {
			var recievedData = "";
			response.setEncoding("utf8");
			response.on("data", function (chunk) {
				recievedData += chunk;
			});
			response.on("end", function () {
				//think if no error
				if(response.statusCode >= 200 && response.statusCode <= 400 ) {
					jsdom.env(recievedData, [
					  'http://code.jquery.com/jquery-1.5.min.js'
					], function (errors, window) {
						if(errors) {
							return callback(errors, null);
						}
						return callback(null, window);
					});
				} else {
					return callback("SOMETHING WENT WRONG", null);
				}
			});
		});
		if(typeof data !== "undefined" && data !== null && data.constructor.toString().indexOf("String")) {
			request.write(data+"\n");
		}
		request.end(); 
	};
	
	return that;
};



var sc = scrapper();

//getlist "#inhaltsbereich div.inhalt > div ul:nth-child(2)"
var base_path = "http://www.bundestag.de/dokumente/tagesordnungen/";

var agenda = [];

sc.scrap(base_path+"index.html", "GET", "",function (err, window) {
	if(err) {
		throw err;
	}
	var $ = window.$;
	var toFetch = [];
	$("#inhaltsbereich div.inhalt > div ul:nth-child(2) li").each(function (index, element) {
		var curAgendaItem = {};
		curAgendaItem.link = base_path + $(element).find("a").attr("href");
		curAgendaItem.text = $(element).find("a").text();
		curAgendaItem.agenda =[];
		agenda.push(curAgendaItem);
		toFetch.push([sc, "scrap", curAgendaItem.link, "GET", ""]);
		
		
	});
	console.log("CHAIN IS:");
	console.log(toFetch);
	var dd = [];
	chain(toFetch, dd, function (errors, results) { 
		if(errors !== null) {
			throw "wow what happens";
		}
		for (var i in results) {
			var aQ = results[i];
			if(aQ && aQ.constructor.toString().indexOf("Function") !== -1) {
				aQ("#inhaltsbereich div.inhalt > div > p > .textkursiv, .einrueck").each(function(aIndex, aElement) {
					console.log("PUSHIN IT IN");
					agenda[i].agenda.push(aQ(aElement.html()));
				});
			}
		}
		console.log(agenda);
		console.log(" --- END ----");
	});
	
});


//var server = express.createServer();





/*

server.get("/api/agenda", function (req, res) {
	var options =  {
		host:'www.bundestag.de', 
		port: 80,
		path:"/", //dokumente/tagesordnungen/index.html",
		method: "GET", 
	};
	
	var request = http.request(options, function (response) {
		console.log('STATUS: ' + response.statusCode);
		console.log('HEADERS: ' + JSON.stringify(response.headers));
		var responseText = "";
		response.setEncoding('utf8');
		response.on('data', function (chunk) {
			responseText += chunk;;
		});
		response.on("end", function() {
			if(response.statusCode)
		});
	});	
	request.end();
	

});



server.use(express.static(__dirname + "/www"));

server.listen(8888);
*/