$(document).ready(main);

window.onbeforeunload = function(){
    socket.emit("client_leave", localUser);
};

var localUser;
var socket;

function main() {
    $("#ipInput").val(location.host);

    $("#loginTemplate").dialog({
        title: "Login",
        autoOpen: true,
        height: 375,
        width: 350,
        modal: true,
        buttons: [
            {
                text: "Connect",
                click: function () {
                    $(this).dialog("close");
                    connect();
                }
            }
        ]
    });

    $("#inputMessage").on("keypress", function (e) {
        if (e.which == 13) {
            prepareSend();
        }
    });
}

function connect() {
    var formData = $("#login").serializeArray();

    localUser = formData[0].value;
    var ip = formData[1].value,
        port = formData[2].value;

    socket = io("ws://" + ip.toString() + ":" + port, {
        reconnection: true,
        reconnectionDelay: 1500,
        reconnectionDelayMax: 15000,
        timeout: 20000
    });

    socket.on("connect", function () {
        postMsg("Client", "Connected to server", "info");
        socket.emit("client_join", localUser);
    });

    socket.on("error", function () {
        postMsg("Client", "Error connecting to server", "error");
    });

    socket.on("disconnect", function () {
        postMsg("Client", "Disconnected from the server", "error");
    });

    socket.on("reconnect_attempt", function (number) {
        postMsg("Client", "Trying to reconnect to the server - " + number, "info");
    });

    socket.on("reconnect_failed", function () {
        postMsg("Client", "Reconnection failed", "error");
    });

    socket.on("message",function(data){
        var msg = JSON.parse(data);
        postMsg(msg.user, msg.message, msg.type);
    });

    socket.on("refreshList",function(data){
        $("#onlineContainer").empty();

        var msg = JSON.parse(data);

        for(var i = 0; i < msg.length; i++){

            var tempDiv = $("<div></div>"),
                tempSpan = $("<span></span>");

            tempSpan.text(msg[i][0]);
            tempDiv.append(tempSpan);
            $("#onlineContainer").append(tempDiv);

        }
    });
}

// ----------------------------------------------------------------------------------------------------------------------
function prepareSend() {
    var msgToSend = $("#inputMessage").val();
    if (msgToSend != "" && msgToSend != ".") {
        send(msgToSend);
        $("#inputMessage").val("");
    }
}

function send(message, type) {
    if (type == undefined) {
        type = "normal";
    }
    var pack = {
        'user': localUser,
        'message': message,
        'type': type
    };

    socket.emit("message" ,JSON.stringify(pack));

}

function postMsg(username, message, type) {
    if (type == undefined) {
        type = "normal";
    }
    var date = new Date(),
        heure = date.getHours(),
        minute = date.getMinutes();

    if (heure < 10) {
        heure = String("0" + heure);
    }
    if (minute < 10) {
        minute = String("0" + minute);
    }

    var tempContainer = $('<div></div>'),
        tempTime = $('<span>' + heure + ':' + minute + ' </span>'),
        tempUser = $('<span>' + username + ' - </span>'),
        tempContent = $('<span>' + message + '</span>');

    switch (type) {
        case "normal":
            tempContainer.addClass("msgContainer");
            tempTime.addClass("msgTime");
            tempUser.addClass("msgUser");
            tempContent.addClass("msgContent");
            break;
        case "info":
            tempContainer.addClass("info");
            tempTime.addClass("info");
            tempUser.addClass("info");
            tempContent.addClass("info");
            break;
        case "error":
            tempContainer.addClass("error");
            tempTime.addClass("error");
            tempUser.addClass("error");
            tempContent.addClass("error");
            break;
    }

    tempContainer.append(tempTime).append(tempUser).append(tempContent);
    $("#contentContainer").append(tempContainer);
	$("#contentContainer").scrollTop(1E10);

}