var port = 80;
var tabClient = [];

var fs = require("fs");
var express = require("express");
var app = express();
var server = require("http").createServer(app);

app.use(express.static('client',{"index":"index.html"}));

app.get('/', function (request, response) {
    response.writeHead(200);
    response.end();
});


var io = require("socket.io")(server);
io.on("connection", function (socket) {

    socket.on("message", function (data) {
        var msg = JSON.parse(data);
        console.log(logInColor("FgGreen",msg.user + ":"), logInColor("FgWhite", msg.message));
        io.emit("message", data);
    });

    socket.on("client_join", function (data) {
        refreshOnlineList(data, "joining");
        console.log(logInColor("FgYellow", data), "joined");
    });

    socket.on("client_leave", function (data) {
        refreshOnlineList(data, "leaving");
        console.log(logInColor("FgYellow" ,data), "left");
    });

});
server.listen(port, function () {
    console.log(logInColor("FgBlue", "Server open on port " + port));
});

function refreshOnlineList(selectedClient, type) {
    if (type == "leaving") {
        var foundit = true,
            index = 0;

        while (foundit) {
            if (tabClient[index] == selectedClient) {
                tabClient.splice(index, 1);
                foundit = false;
            } else {
                index++;
            }
        }
    } else if (type == "joining") {
        tabClient.push(selectedClient);
    } else {
        console.error("Not a possible type");
    }

    io.emit("refreshList", JSON.stringify(tabClient));
}

function logInColor(colorName, text) {
    var color =
    {
        reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m"
    };
    return String(color[colorName] + text);
}