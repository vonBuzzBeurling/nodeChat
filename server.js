var port = 80;
var tabClient = [];

var fs = require("fs");
var express = require("express");
var app = express();
var os = require("os");
var ifaces = os.networkInterfaces();
var server = require("http").createServer(app);

app.use(express.static('client', {"index": "index.html"}));

app.get('/', function (request, response) {
    response.writeHead(200);
    response.end();
});


var io = require("socket.io")(server);
io.on("connect", function (socket) {

    socket.on("message", function (data) {
        var msg = JSON.parse(data);
        console.log(logTime(), logInColor("FgGreen", msg.user + ":"), logInColor("FgWhite", msg.message));
        io.emit("message", data);
    });

    socket.on("client_join", function (data) {
        var tempTab = [data, socket.id];
        refreshOnlineList(tempTab, "joining");
        io.emit("message", JSON.stringify({"user": "Server", "message": data + " joined", "type": "info"}));
        console.log(logTime(), logInColor("FgYellow", data + " joined"));
    });

    socket.on("client_leave", function (data) {
        var tempTab = [data, socket.id];
        refreshOnlineList(tempTab, "leaving");
    });

    socket.on("disconnect", function () {
        var tempTab = ["unknown", socket.id];
        refreshOnlineList(tempTab, "leaving");
    });

});

server.listen(port, function () {
    console.log(logTime(), logInColor("FgCyan", "Server open at:"));

    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
                console.log(logInColor("FgCyan", ifname + ':' + alias + " " + iface.address));
            } else {
                // this interface has only one ipv4 adress
                console.log("     ", logInColor("FgBlue", ifname), logInColor("FgCyan", iface.address));
            }
            ++alias;
        });
    });

    console.log("     ", logInColor("FgCyan", "on port: " + port));
});

//----------------------------------------------------------------------------------------------------------------------

function refreshOnlineList(selectedClient, type) {
    if (type == "leaving") {
        var foundit = true,
            index = 0;
        if (tabClient.length > 0 && tabClient[0].lenght > 0) {
            while (foundit) {
                if (tabClient[index][1] == selectedClient[1]) {
                    console.log(logTime(), logInColor("FgYellow", tabClient[0][0] + " left"));
                    tabClient.splice(index, 1);
                    foundit = false;
                } else if (index >= tabClient.length) {
                    foundit = true;
                } else {
                    index++;
                }
            }
        }else {
            return;
        }
    } else if (type == "joining") {
        tabClient.push(selectedClient);
    } else {
        console.error(logTime(), "Not a possible type");
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
    return String(color[colorName] + text + color.reset);
}

function logTime() {
    var date = new Date(),
        heure = date.getHours(),
        minute = date.getMinutes();

    if (heure < 10) {
        heure = String("0" + heure);
    }
    if (minute < 10) {
        minute = String("0" + minute);
    }

    return String("\x1b[35m" + heure + ":" + minute + "\x1b[0m");
}