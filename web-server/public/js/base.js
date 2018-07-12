/**
 * Created by xingyongkang on 2016/12/21.
 */
//var name = 'abc';
//exports.name = name;
code = {
    OK: 200,
    FAIL: 500,

    ENTRY: {
        FA_TOKEN_INVALID: 	1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 	1003
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 		3001,
        FA_CHANNEL_NOT_EXIST: 	3002,
        FA_UNKNOWN_CONNECTOR: 	3003,
        FA_USER_NOT_ONLINE: 	3004
    },
    STATE: {
        INIT: 					0,
        WAIT: 					80,
        STARTBETTING: 			10,
        BETTING: 				20,
        STOPBETTING:			30,
        ANOUNCERESULT: 			40,
        CELEBRATE:				50,
        CLEAR: 					60,
        GENERATESCENE:			70
    },
    COMMAND:{
        HELLO:			88,
        OPERATE: 		0,
        LOGIN:			1,
        LOGOUT:			2,
        CHANGESTATE: 	3,
        SHOWTIME: 		4,
        SHOWBETTING:	5,
        SHOWALLBETTING: 6,
        SHOWUSERS:		7,
        USERLOGIN:		8,
        USERLOGOUT:	    9,
        SHOWSCENE:		10,
        SHOWRESULT:		11,
        UPSCORE:		12,
        DOWNSCORE:		13,
        LIVESTREAM:		14,
        CHAT:			15
    },
    DATAINDEX:{
        BALANCE:		0,
        SWITCHUNIT:		1,
        WINSCORE:		2,
        BONUS:			3,
        STATE:			4,
        BETSTART:		5
    },

    ACCOUNTOPERATION:{
        UPSCORE:		0,
        DOWNSCORE:		1,
        BET:			2,
        WIN:			3
    },
    USERTYPE:{
        USER:         0,
        BOSS:         1,
        LEVEL1:       2,
        LEVEL2:       3,
        LEVEL3:       4,
        LEVEL4:       5,
        LEVEL5:       6,
        PRINTER:      7,
        ANCHOR:       21,
        SECRETARY:    22,
        SUPERVISER:   88

    },
    ROOMTYPE:{
        EMPTY:      0,
        HALL:       1,
        CHATROOM:   2,
        GAMEROOM:   3,
        FULL:        4,
    },
    OPERATIONTYPE:{
        ADD:        0,
        GAME:       1,
        WIN:        2,
        TRANSFER:   3,
        BALANCE:    4
    },
    RETURNCODE:{
        OK:              200,
        EXPIRED:        300,
        NORIGHT:        400,
        DBERROR:        500,
        NAMEEXIST:      501,
        WRONGINTRODUCER:   502,
        NONAME:             503,
        WRONGPASS:          504,
        ROOMIDNULL:         505
    },
    CODESTRING:{
        OK:         '操作成功',
        EXPIRED:    '登陆过期',
        NORIGHT:    '越权操作',
        DBERROR:    '数据库出错',
        NAMEEXIST:  '用户名已存在',
        WRONGINTRODUCER:  '介绍人不存在',
        NONAME:             '用户名不存在',
        WRONGPASS:          '密码错误',
        ROOMIDNULL:      '介绍人暂未分配大厅'
    }

};


var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";
util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
    //  html sanitizer
    toStaticHTML: function(inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function(digits, n) {
        n = n.toString();
        while(n.length < digits)
            n = '0' + n;
        return n;
    },
    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function(date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },

    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    dateString: function(date) {
        var year = date.getFullYear().toString();
        var month = (date.getMonth()+1).toString();
        var day = (date.getDay()+1).toString();
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        var seconds = date.getSeconds().toString();
        return this.zeroPad(4, year)+"-"+this.zeroPad(2, month)+"-"+this.zeroPad(2, day)+" "+this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes)+  ":" + this.zeroPad(2, seconds);
    },

    //does the argument only contain whitespace?
    isBlank: function(text) {
        var blank = /^\s*$/;
        return(text.match(blank) !== null);
    }
};



//always view the most recent message when it is added
function scrollDown(base) {
    window.scrollTo(0, base);
    $("#entry").focus();
};

// add message on board
function addMessage(from, target, text, time) {
    var name = (target == '*' ? 'all' : target);
    if(text === null) return;
    if(time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } else if((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }
    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));
    messageElement.addClass("message");
    // sanitize
    text = util.toStaticHTML(text);
    //var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    messageElement.html(content);
    //the log is the stream that we view
    $("#messageBoard").append(messageElement);
    base += increase;
   // scrollDown(base);
};

// add account on board
function addAccount(operation,score, time) {
    if(text === null) return;
    if(time == null) {
        // if the time is null or undefined, use the current time.
        time = new Date();
    } else if((time instanceof Date) === false) {
        // if it's a timestamp, interpret it
        time = new Date(time);
    }
    //every message you see is actually a table with 3 cols:
    //  the time,
    //  the person who caused the event,
    //  and the content
    var messageElement = $(document.createElement("table"));
    messageElement.addClass("message");
    var strOperation = 'OPER';
    switch(operation){
        case code.ACCOUNTOPERATION.UPSCORE:
            strOperation = '上分';
            break;
        case code.ACCOUNTOPERATION.WIN:
            strOperation = '赢分';
            break;
        case code.ACCOUNTOPERATION.DOWNSCORE:
            strOperation = '赢分';
            break;
        case code.ACCOUNTOPERATION.BET:
            strOperation = '押分';
            break;
    }
    // sanitize
    text = util.toStaticHTML(text);
    //var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
    var content = '<tr>' + '  <td class="date">' + util.dateString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(strOperation) + '</td>' + '  <td class="msg-text">' + score + '</td>' + '</tr>';
    messageElement.html(content);
    //the log is the stream that we view
    $("#accountBoard").append(messageElement);
    base += increase;
    // scrollDown(base);
};



// init user list
function initUserList(data) {
    users = data.users;
    for(var i = 0; i < users.length; i++) {
        var slElement = $(document.createElement("option"));
        slElement.attr("value", users[i]);
        slElement.text(users[i]);
        $("#usersList").append(slElement);
    }
};

// add user in user list
function addUser(user,curUser) {
    var slElement = $(document.createElement("option"));
    slElement.attr("value", user);
    slElement.text(user);
    if(curUser != null){
        if(user == curUser){
            slElement.attr("selected", true);
        }
    }
    $("#usersList").append(slElement);
};
// remove all user from user list
function removeUsers() {
    $("#usersList option").each(
        function() {
            $(this).remove();
        });
};
// remove user from user list
function removeUser(user) {
    $("#usersList option").each(
        function() {
            if($(this).val() === user) $(this).remove();
        });
};



function sendMsg(msg)
{
    var route = "chat.chatHandler.send";
    var target = "*";
    /*
     pomelo.notify(route, {
     rid: roomID,
     content: msg,
     from: username,
     target: target
     });
     */

    pomelo.request(route, {
        rid: roomID,
        content: msg,
        from: username,
        target: target
    }, function(data) {

    });

}



function login(username, rid, myToken)
{
    queryEntry(username, function(host, port) {
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            var route = "connector.entryHandler.enter";
            pomelo.request(route, {
                username: username,
                rid: rid,
                token: myToken
            }, function(data) {
                if(data.error) {
                    //showError(DUPLICATE_ERROR);
                    window.location.href='/';
                    return;
                }else
                {
                    checkList.connected = true;
                }

            });
        });
    });
}
// query connector
function queryEntry(uid, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: window.location.hostname,
        port: 3014,
        log: true
    }, function() {
        pomelo.request(route, {
            uid: uid
        }, function(data) {
            pomelo.disconnect();
            if(data.code === 500) {
                showError(LOGIN_ERROR);
                return;
            }
            callback(data.host, data.port);
        });
    });
}

function getDiv(w,h,c){
    var t = game.make.graphics();
    t.beginFill(c);
    t.drawRoundedRect(0,0,w,h,45);
    t.endFill();
    var tex = t.generateTexture();
    return game.make.image(0,0,tex);

}
function hexStrToIntArray(hexStr) {
    var res = [];
    for (var i = 0; i < hexStr.length; i += 2) {
        var ts = hexStr.subStr(i, 2);
        var ti = parseInt(ts, 16);
        res.push(ti);

    }
    return res;
  
}
function intArrayToHexStr(intArray){
    var res = "";
    for(var i=0; i<intArray.length;i++){
        var ti = intArray[i];
        var ts = ti.toString(16);
        res += ts;
    }
    return res;
}