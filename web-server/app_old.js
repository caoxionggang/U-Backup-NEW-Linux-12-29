/**
 * Created by bluseayan on 17-9-22.
 */


var express = require('express');
var Token = require('../shared/token');
//var secret = require('../shared/config/session').secret;
var userDao = require('./lib/dao/userDao');
var mysql = require('./lib/dao/mysql/mysql');
var code = require('../shared/code');
var async = require('async');
var fs = require('fs');
//var app = express.createServer();
var app = express();

//console.log(code.name);
//console.log(Token.name);

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.set('view engine', 'jade');
    app.set('views', __dirname + '/public');
    app.set('view options', {layout: false});
    app.set('basepath',__dirname + '/public');
});

app.configure('development', function(){
    console.log('hawk:.....'+__dirname);
    app.use(express.static(__dirname + '/public/'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
});

//登录
app.post('/login', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;  //获取前端的中的body数据

    var username = msg.username;  //获取前端的username
    var pwd = msg.password;       //获取前端的pwd
    if (!username || !pwd) {       //若获取的username或pwd为空
        console.log("name or password is empty!");  //则打印日志“name or password is empty!”
        res.send({code: code.RETURNCODE.DBERROR});    //向前端发送code.RETURNCODE.DBERROR（在文件base.js中对应为500）
        return;
    }
    mysql.query('select userID,userName,passWord,userType from user where userName = ?',[username],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                var rs = re[0];
                if (pwd != rs.passWord) {
                    console.log('password incorrect!');
                    res.send({code: code.RETURNCODE.WRONGPASS});
                    return;
                }
                res.send({code: code.RETURNCODE.OK, 'token': Token.create(rs.userName, Date.now()), 'userName': rs.userName,'userType': rs.userType,'userID':rs.userID});
                console.log("Login success!");
            }else {
                console.log("userName is not exist!");
                //	res.send({code: code.RETURNCODE.NONAME});
                res.send({code: code.RETURNCODE.NONAME});
                return;
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }

    });
});

//注册
app.post('/register', function(req, res) {
    //console.log('req.params');
    var msg = req.body;
    console.log(msg.name);
    console.log(msg.password);

    if (!msg.name) {
        console.log("name is empty!");
        return;
    }
    if (!msg.password) {
        console.log("password is empty!");
        return;
    }
    if(!msg.password2){
        console.log("RePassword is empty!");
        return;
    }

    mysql.query("select userName from user where userName = ?",[msg.name],function(err,res1){
        //判断用户名是否已被注册
        if (!err ) {
            if (!!res1 && res1.length >= 1){
                console.log("user in db already exist!");
                res.send({code: code.RETURNCODE.NAMEEXIST});
            } else{
                var folderPath =__dirname.replace(/\/web-server$/,'')+'/UserFile/';
                var userPath = folderPath + msg.name;
                fs.mkdir(userPath,function(err){   //创建用户文件夹
                    if(err){
                        res.send({code: code.RETURNCODE.EXPIRED});
                        console.error(err);
                        console.log('register fail!');
                    }else{
                        mysql.query("insert into user (userName,passWord) values(?,?)",[msg.name, msg.password],function(err,res3) {
                            if(err){
                                console.log("database error!");
                                res.send({code: code.RETURNCODE.DBERROR});
                            }else{
                                console.log("register success!");
                                res.send({code: code.RETURNCODE.OK});
                                console.log('创建用户目录成功!');
                            }
                        });
                    }
                });
            }
        } else {
            console.log("database error!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });
});

//取一级下拉框列表
app.post('/get_FirstDropDownList', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;
    var userID =msg.userID;
    if (!userID) {
        console.log("userid is empty!");
        return;
    }
    //登录后，将指定用户id下的系统拿出来
    mysql.query('select systemName from systems where userID = ?',[userID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                //var rs = re[0];
                res.send({code: code.RETURNCODE.OK,'systemName':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
                /*for(var i=0;i<re.length;i++) {
                 console.log(re[i])
                 }*/
            } else {
                console.log("There is no system in this user!");
                res.send({code: code.RETURNCODE.NOSYSTEM});
                return;
            }
        }
        else {
            console.log("access data erro!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

});

//取system的ID等各属性
app.post('/get_systemID', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg=req.body;
    var userID = msg.userID;
    var systemName = msg.systemName_selected;
    if (!systemName) {
        console.log("systemName is empty!");
        return;
    }
    mysql.query('select systemID,systemDescribe from systems where systemName = ? and userID = ?',[systemName,userID],function(err,re){
        if(err == null) {
            if(re!= null && re.length>=1) {
                var systemID=re[0].systemID;
                var systemDescribe = re[0].systemDescribe;
                res.send({code: code.RETURNCODE.OK,'systemID':re,'systemDescribe':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端.
            }
            else {
                console.log("此系统不存在system!");
                res.send({code: code.RETURNCODE.NOSYSTEMID});
                return;
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//取二级下拉框列表
app.post('/get_SecondDropDownList', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg=req.body;
    var systemID = msg.systemID;
    //console.log('systemID = '+ systemID);
    if (!systemID) {
        console.log("systemID is empty!");
        return;
    }
    mysql.query('select deviceName from devices where systemID = ? ',[systemID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                console.log(re);
                res.send({code: code.RETURNCODE.OK,'deviceName':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            }
            else {
                console.log("deviceName in this system is not exist!");
                res.send({code: code.RETURNCODE.NODEVICENAME});
                return;
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//取device的ID等各属性
app.post('/get_deviceID', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg=req.body;
    var systemID = msg.systemID;
    var deviceName = msg.deviceName_selected;
    if (!deviceName) {
        console.log("deviceName is empty!");
        return;
    }
    mysql.query('select * from devices where deviceName = ? and systemID = ?',[deviceName,systemID],function(err,re){
        if(err == null) {
            if(re!= null && re.length>=1) {
                var deviceID=re[0].deviceID;
                //console.log('deviceID = ' + deviceID);
                var deviceDescrib = re[0].deviceDescrib;
                //console.log('deviceDescrib = ' + deviceDescrib);
                var deviceType=re[0].deviceType;
                var deviceState=re[0].deviceState;
                var ipAddress=re[0].ipAddress;
                //console.log('ipAddress = ' + ipAddress);
                var deviceUserName=re[0].deviceUserName;
                var devicePassword=re[0].devicePassword;
                //console.log('devicePassword = ' + devicePassword);
                //console.log(re);
                //res.send({code: code.RETURNCODE.OK,'deviceName':re});
                res.send({code: code.RETURNCODE.OK,'deviceID':re,'deviceDescrib':re,'deviceType':re,'deviceState':re,'ipAddress':re,'deviceUserName':re,'devicePassword':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            }
            else {
                console.log("deviceID in this system is not exist!");
                res.send({code: code.RETURNCODE.NODEVICEID});
                return;
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//取三级下拉框列表
app.post('/get_ThirdDropDownList', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg=req.body;
    var deviceID = msg.deviceID;
    if (!deviceID) {
        console.log("deviceName is empty!");
        return;
    }
    mysql.query('select fileName,fileID from files where deviceID = ? ',[deviceID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                //var rs = re[0];
                res.send({code: code.RETURNCODE.OK,'fileName':re,'fileID':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
                var fileName = re[0].fileName;
            }
            else {
                res.send({code: code.RETURNCODE.NONAME});
                console.log("no file is in this device!");
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//取file的ID等各属性
app.post('/get_fileID', function(req, res) {
    var msg=req.body;
    var deviceID = msg.deviceID;
    var fileName = msg.fileName_selected;
    if (!fileName) {
        console.log("fileName is empty!");
        //return;
    }
    mysql.query('select * from files where fileName = ? and deviceID = ?',[fileName,deviceID],function(err,re){
        if(err == null) {
            if(re!= null && re.length>=1){
                var fileID=re[0].fileID;
                var fileDescribe = re[0].fileDescribe;
                var remote_file = re[0].remote_file;
                var local_path = re[0].local_path;
                var route_command = re[0].route_command;
                var route_keywords = re[0].route_keywords;
                res.send({code: code.RETURNCODE.OK,'fileID':re});  //re:将在数据库中得到的数据发送到前端
            }
            else {
                console.log("no fileID here!");
                res.send({code: code.RETURNCODE.NOFILEID});
                return;
            }
        }
        else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//修改系统
app.post('/modify_system', function(req, res){
    var msg=req.body;
    var systemID = msg.systemID;
    var new_systemDescribe = msg.new_systemDescribe;
    mysql.query('update systems set systemDescribe = ? where systemID = ?',[new_systemDescribe,systemID],function(err,re){
        if(err == null) {
            console.log("update success!");
            res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
        } else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
    /*if(new_systemName && new_systemDescribe){
     mysql.query('update systems set systemName = ? , systemDescribe = ? where systemID = ?',[new_systemName,new_systemDescribe,systemID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else if(!new_systemName && new_systemDescribe){
     mysql.query('update systems set systemDescribe = ? where systemID = ?',[new_systemDescribe,systemID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else if(new_systemName && !new_systemDescribe){
     mysql.query('update systems set systemName = ? where systemID = ?',[new_systemName,systemID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else {
     return;
     }*/

});

//修改设备
app.post('/modify_device', function(req, res){
    var msg=req.body;
    var deviceID = msg.deviceID;
    var new_deviceDescribe = msg.new_deviceDescribe;
    mysql.query('update devices set deviceDescrib = ? where deviceID = ?',[new_deviceDescribe,deviceID],function(err,re){
        if(err == null) {
            console.log("update device success!");
            res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
        } else {
            console.log("access data erro 1");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
    /*if(new_deviceName && new_deviceDescribe){
     mysql.query('update devices set deviceDescrib = ? where deviceID = ?',[new_deviceDescribe,deviceID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update device success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update device fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro 1");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else if(!new_deviceName && new_deviceDescribe){
     mysql.query('update devices set deviceDescribe = ? where deviceID = ?',[new_deviceDescribe,deviceID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update device success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update device fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro 2");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else if(new_deviceName && !new_deviceDescribe){
     mysql.query('update devices set deviceName = ? where deviceID = ?',[new_deviceName,deviceID],function(err,re){
     if(err == null) {
     if(re!= null) {
     console.log("update device success!");
     res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
     }
     else {
     console.log("update device fail!");
     res.send({code: code.RETURNCODE.UPDATEFAIL});
     return;
     }
     }
     else {
     console.log("access data erro 3");
     res.send({code: code.RETURNCODE.DBERROR});
     }
     })
     }else{
     return;
     }*/

});

//修改文件
app.post('/modify_file', function(req, res){
    var msg=req.body;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var new_fileDescribe = msg.new_fileDescribe;
    var new_remote_file = msg.new_remote_file;
    var new_routeCommand = msg.new_routeCommand;
    var new_routeKeyword = msg.new_routeKeyword;

    if(deviceType == 0){
        if(new_fileDescribe && new_remote_file){
            mysql.query('update files set fileDescribe = ?,remote_file= ? where fileID = ?',[new_fileDescribe,new_remote_file,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access data erro 1");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_fileDescribe && new_remote_file){
            mysql.query('update files set remote_file=? where fileID = ?',[new_remote_file,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access data erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(new_fileDescribe && !new_remote_file){
            mysql.query('update files set fileDescribe=? where fileID = ?',[new_fileDescribe,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access data erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_fileDescribe && !new_remote_file){
            return;
        }
    }else if(deviceType == 1){
        if(new_routeCommand && new_routeKeyword) {
            mysql.query('update files set route_command = ? , route_keywords = ? where fileID = ?', [new_routeCommand, new_routeKeyword, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access RouteFileData erro 1");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_routeCommand && new_routeKeyword){
            mysql.query('update files set route_keywords = ? where fileID = ?', [new_routeKeyword, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access RouteFileData erro 2");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(new_routeCommand && !new_routeKeyword){
            mysql.query('update files set route_command = ? where fileID = ?', [new_routeCommand, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    res.send({code: code.RETURNCODE.OK});  //re:将在数据库中得到的数据发送到前端
                } else {
                    console.log("access RouteFileData erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_routeCommand && !new_routeKeyword){
            return;
        }
    }

});

//修改系统名或添加系统时判断systemName是否重复
app.post('/reName',function(req, res){
    var msg=req.body;
    var userID = msg.userID;
    mysql.query("select * from systems where userID = ?",[userID],function(err,re){
        if (err == null ) {
            if(re!= null && re.length>=1){
                res.send({code: code.RETURNCODE.OK,'systemName':re});
                console.log(re);
            }else{
                res.send({code: code.RETURNCODE.FAIL});
                console.log("seach rename fail!")
            }
        } else {
            console.log("search db err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//修改设备名或添加设备时判断systemName是否重复
app.post('/redeviceName',function(req, res){
    var msg=req.body;
    var systemID = msg.systemID;
    mysql.query("select deviceName from devices where systemID = ?",[systemID],function(err,re){
        if (err == null) {
            if(re!=null &&re.length>=1){
                res.send({code: code.RETURNCODE.OK,'deviceName':re});
                console.log(re);
            }else{
                res.send({code: code.RETURNCODE.FAIL});
                console.log("seach fail")
            }
        } else {
            console.log("search db err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//修改文件名或添加文件时判断systemName是否重复
app.post('/refileName',function(req, res){
    var msg=req.body;
    var deviceID = msg.deviceID;
    mysql.query("select fileName from files where deviceID = ?",[deviceID],function(err,re){
        if (!err ) {
            res.send({code: code.RETURNCODE.OK,'fileName':re});
            console.log(re);
        } else {
            console.log("search db err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//添加系统
/*app.post('/newSystemName', function(req, res) {
    var msg = req.body;
    var systemName = msg.new_systemName;
    var systemDescribe = msg.new_systemDescribe;
    var userID = msg.userID;
    var userName = msg.userName;

    var folderPath = __dirname.replace(/\/web-server$/g,'')+'/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;

    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if(exists){         //若用户文件夹存在则直接创建系统文件夹
            fs.mkdir(systemPath,function(err){   //创建系统文件夹
                if(err){
                    res.send({code: code.RETURNCODE.EXIST});
                    console.error(err);
                    console.log('create fail!');
                }else{
                    mysql.query("insert into systems (systemName,systemDescribe,userID) values ( ?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                        if (!err ) {
                            console.log("insert success!");
                            res.send({code: code.RETURNCODE.OK});
                        } else {
                            console.log("insert fail!");
                            res.send({code: code.RETURNCODE.DBERROR});
                        }
                    });
                }
            });
        }else{   //若用户文件夹不存在，则先创建用户文件夹，再在用户文件夹下创建系统文件夹
            fs.mkdir(userPath,function(err){
                if(err){
                    res.send({code: code.RETURNCODE.EXIST});
                    console.error(err);
                    console.log('create userfolder fail!');
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.error(err);
                            console.log('create fail!');
                        }else{
                            mysql.query("insert into systems (systemName,systemDescribe,userID) values ( ?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                                if (!err ) {
                                    console.log("insert success!");
                                    res.send({code: code.RETURNCODE.OK});
                                } else {
                                    console.log("insert fail!");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }
                    });
                }
            })
        }
    });
});

//添加设备
app.post('/newDeviceName', function(req, res) {
    var msg = req.body;
    var deviceName = msg.new_deviceName;
    var deviceDescribe = msg.new_deviceDescribe;
    var deviceType = msg.new_deviceType;
    var deviceipAddress = msg.new_deviceipAddress;
    var deviceUserName = msg.new_deviceUserName;
    var devicePassword = msg.new_devicePassword;
    var systemID = msg.systemID;
    var userName = msg.userName;
    var systemName = msg.systemName_selected;

    var folderPath = __dirname.replace(/\/web-server$/g,'')+'/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;

    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if(exists){         //若用户文件夹存在
            fs.exists(systemPath,function(exists){  //先判断系统文件夹是否存在
                if(exists){      //若系统文件夹存在
                    fs.mkdir(devicePath,function(err){
                        if(err){
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.error(err);
                            console.log('create devicefolder fail! 1');
                        }else{
                            mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                if (!err ) {
                                    console.log("insert success!");
                                    res.send({code: code.RETURNCODE.OK});
                                } else {
                                    console.log("insert fail!");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }
                    })
                }else{  //若系统文件夹不存在
                    fs.mkdir(systemPath,function(err){  //先创系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.error(err);
                            console.log('create systemfolder fail! 2');
                        }else{
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.error(err);
                                    console.log('create devicefolder fail! 3');
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (!err ) {
                                            console.log("insert success!");
                                            res.send({code: code.RETURNCODE.OK});
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    });
                                }
                            })
                        }
                    })

                }
            })
        }else{   //若用户文件夹不存在，则先创建用户文件夹，再在用户文件夹下创建系统文件夹
            fs.mkdir(userPath,function(err){
                if(err){
                    res.send({code: code.RETURNCODE.EXIST});
                    console.error(err);
                    console.log('create userfolder fail! 4');
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.error(err);
                            console.log('create systemfolder fail! 5');
                        }else{
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.error(err);
                                    console.log('create devicefolder fail! 6');
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (!err ) {
                                            console.log("insert success!");
                                            res.send({code: code.RETURNCODE.OK});
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            })
        }
    });

});

//添加主机文件
app.post('/newFileName', function(req, res) {
    var msg = req.body;
    var fileName = msg.new_fileName;
    var fileDescribe = msg.new_fileDescribe;
    var new_remote_file = msg.new_remote_file;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;

    var localPath = __dirname.replace(/\/web-server$/g,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName;
    if(new_remote_file.charAt(new_remote_file.length - 1) == '/'){
        var new_remote_file = new_remote_file + fileName;
    }
    if(new_remote_file.charAt(new_remote_file.length - 1) != '/'){
        var new_remote_file = new_remote_file + '/' + fileName;
    }

    mysql.query("insert into files (fileName,fileDescribe,remote_file,deviceID,local_path) values (?,?,?,?,?)",[fileName,fileDescribe,new_remote_file,deviceID,localPath],function(err,re){
        if (!err ) {
            console.log("insert success!");
            res.send({code: code.RETURNCODE.OK});
        } else {
            console.log("insert fail!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });

});

//添加路由文件
app.post('/newRouteFile', function(req, res) {
    var msg = req.body;
    var routeCommand = msg.new_routeCommand;
    var routeKeyword = msg.new_routeKeyword
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var fileName = 'routeFile';
    var fileDescribe = 'routeFile';

    var localPath = __dirname.replace(/\/web-server$/g,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName;
    mysql.query("insert into files (deviceID,fileName,fileDescribe,local_path,route_command,route_keywords) values (?,?,?,?,?,?)",[deviceID,fileName,fileDescribe,localPath,routeCommand,routeKeyword],function(err,re){
        if (!err ) {
            console.log("insert success!");
            res.send({code: code.RETURNCODE.OK});
        } else {
            console.log("insert fail!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });

});*/

//添加系统
app.post('/newSystemName', function(req, res) {
    var msg = req.body;
    var systemName = msg.new_systemName;
    var systemDescribe = msg.new_systemDescribe;
    var userID = msg.userID;
    var userName = msg.userName;

    var folderPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;

    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if(exists){         //若用户文件夹存在则直接创建系统文件夹
            fs.mkdir(systemPath,function(err){   //创建系统文件夹
                if(err){
                    res.send({code: code.RETURNCODE.NAMEEXIST});
                    console.error(err);
                    console.log('create fail!-1');
                }else{
                    mysql.query("insert into systems (systemName,systemDescribe,userID) values ( ?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                        if (err == null) {
                            console.log("insert success!");
                            res.send({code: code.RETURNCODE.OK});
                        } else {
                            console.log("insert error!");
                            res.send({code: code.RETURNCODE.DBERROR});
                        }
                    });
                }
            });
        }else{   //若用户文件夹不存在，则先创建用户文件夹，再在用户文件夹下创建系统文件夹
            fs.mkdir(userPath,function(err){
                if(err){
                    res.send({code: code.RETURNCODE.DBERROR});
                    console.error(err);
                    console.log('create userfolder fail!-2');
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.DBERROR});
                            console.error(err);
                            console.log('create fail!');
                        }else{
                            mysql.query("insert into systems (systemName,systemDescribe,userID) values ( ?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                                if (err == null) {
                                    console.log("insert success!");
                                    res.send({code: code.RETURNCODE.OK});
                                } else {
                                    console.log("insert error!");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }
                    });
                }
            })
        }
    });
});

//添加设备
app.post('/newDeviceName', function(req, res) {
    var msg = req.body;
    var deviceName = msg.new_deviceName;
    var deviceDescribe = msg.new_deviceDescribe;
    var deviceType = msg.new_deviceType;
    var deviceipAddress = msg.new_deviceipAddress;
    var deviceUserName = msg.new_deviceUserName;
    var devicePassword = msg.new_devicePassword;
    var systemID = msg.systemID;
    var userName = msg.userName;
    var systemName = msg.systemName_selected;

    var folderPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;

    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if(exists){         //若用户文件夹存在
            fs.exists(systemPath,function(exists){  //先判断系统文件夹是否存在
                if(exists){      //若系统文件夹存在
                    fs.mkdir(devicePath,function(err){
                        if(err){
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.error(err);
                            console.log('create devicefolder fail! 1');
                        }else{
                            mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                if (!err ) {
                                    console.log("insert success!");
                                    res.send({code: code.RETURNCODE.OK});
                                } else {
                                    console.log("insert fail!");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }
                    })
                }else{  //若系统文件夹不存在
                    fs.mkdir(systemPath,function(err){  //先创系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.error(err);
                            console.log('create systemfolder fail! 2');
                        }else{
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.error(err);
                                    console.log('create devicefolder fail! 3');
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (!err ) {
                                            console.log("insert success!");
                                            res.send({code: code.RETURNCODE.OK});
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    });
                                }
                            })
                        }
                    })

                }
            })
        }else{   //若用户文件夹不存在，则先创建用户文件夹，再在用户文件夹下创建系统文件夹
            fs.mkdir(userPath,function(err){
                if(err){
                    res.send({code: code.RETURNCODE.EXIST});
                    console.error(err);
                    console.log('create userfolder fail! 4');
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.error(err);
                            console.log('create systemfolder fail! 5');
                        }else{
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.error(err);
                                    console.log('create devicefolder fail! 6');
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescrib,deviceType,ipAddress,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,deviceipAddress,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (!err ) {
                                            console.log("insert success!");
                                            res.send({code: code.RETURNCODE.OK});
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            })
        }
    });

});

//添加主机文件
app.post('/newFileName', function(req, res) {
    var msg = req.body;
    var fileName = msg.new_fileName;
    var fileDescribe = msg.new_fileDescribe;
    var new_remote_file = msg.new_remote_file;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;

    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName;
    if(new_remote_file.charAt(new_remote_file.length - 1) == '/'){
        var new_remote_file = new_remote_file + fileName;
    }
    if(new_remote_file.charAt(new_remote_file.length - 1) != '/'){
        var new_remote_file = new_remote_file + '/' + fileName;
    }

    mysql.query("insert into files (fileName,fileDescribe,remote_file,deviceID,local_path) values (?,?,?,?,?)",[fileName,fileDescribe,new_remote_file,deviceID,localPath],function(err,re){
        if (!err ) {
            console.log("insert success!");
            res.send({code: code.RETURNCODE.OK});
        } else {
            console.log("insert fail!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });

});

//添加路由文件
app.post('/newRouteFile', function(req, res) {
    var msg = req.body;
    var routeCommand = msg.new_routeCommand;
    var routeKeyword = msg.new_routeKeyword
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var fileName = 'routeFile';
    var fileDescribe = 'routeFile';

    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName;

    /*console.log(localPath);
     console.log(routeCommand);
     console.log(routeKeyword);
     console.log(deviceID);*/

    mysql.query("insert into files (deviceID,fileName,fileDescribe,local_path,route_command,route_keywords) values (?,?,?,?,?,?)",[deviceID,fileName,fileDescribe,localPath,routeCommand,routeKeyword],function(err,re){
        if (!err ) {
            console.log("insert success!");
            res.send({code: code.RETURNCODE.OK});
        } else {
            console.log("insert fail!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });

});

//拿到一个system下所有device信息
app.post('/get_AlldeviceID',function(req,res){
    var msg = req.body;
    var systemID = msg.systemID;
    mysql.query('select * from devices where systemID = ?',[systemID],function(err,re){
        if(err == null){
            if(re != null && re.length>=1){
                res.send({code:code.RETURNCODE.OK,deviceID:re,deviceName:re,deviceDescrib:re,deviceType:re,deviceState:re,ipAddress:re,deviceUserName:re,devicePassword:re});
                console.log("取出所有device信息成功!");
            }else{
                console.log("取出所有device信息失败!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("取出所有device信息错误!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//拿到一个device下所有file信息
app.post('/get_AllfileID',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    mysql.query('select * from files where deviceID = ?',[deviceID],function(err,re){
        if(err == null){
            if(re != null && re.length>=1){
                res.send({code:code.RETURNCODE.OK,fileID:re,fileDescrib:re,fileType:re,fileState:re,absoluteAddress:re,localAddress:re});
                //console.log("取出所有file信息成功!");
            }else{
                //console.log("取出所有file信息失败!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            //console.log("取出所有file信息错误!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//删除系统
app.post('/delete_system',function(req,res){
    var msg = req.body;
    var systemID = msg.systemID;
    //console.log('deviceID 652 = '+ systemID);
    mysql.query('delete from systems where systemID = ?',[systemID],function(err,re){
        if(err == null){
            if(re != null){
                mysql.query('delete from devices where systemID = ?',[systemID],function(err,re){
                    if(err == null) {
                        if (re != null) {
                            console.log("delete system success!");
                            res.send({code: code.RETURNCODE.OK});
                        }else{
                            console.log("delete fail!");
                            res.send({code:code.RETURNCODE.FAIL});
                        }
                    }else{
                        console.log("delete err!");
                        res.send({code: code.RETURNCODE.NOFILEID});
                    }
                })
            }else{
                console.log("delete fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("delete err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//删除设备
app.post('/delete_device',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    //console.log('deviceID 652 = '+ deviceID);
    mysql.query('delete from files where deviceID = ?',[deviceID],function(err,re){
        if(err == null){
            if(re != null){
                mysql.query('delete from devices where deviceID = ?',[deviceID],function(err,re){
                    if(err == null) {
                        if (re != null) {
                            console.log("delete device success!");
                            res.send({code: code.RETURNCODE.OK});
                        }else{
                            console.log("delete device fail!");
                            res.send({code:code.RETURNCODE.FAIL});
                        }
                    }else{
                        console.log("delete device err!");
                        res.send({code: code.RETURNCODE.NOFILEID});
                    }
                })
            }else{
                console.log("delete fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("delete device err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//删除文件
app.post('/delete_file',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    //console.log(fileID);
    mysql.query('delete from files where fileID = ?',[fileID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("delete file success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("delete file fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("delete file err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//在备份表上写入设备备份策略
app.post('/write_deviceID',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var deviceID = msg.deviceID;
    var deviceType = msg.deviceType;
    var task_time = msg.task_time;
    var host = msg.host;
    var host_user = msg.host_user;
    var password = msg.password;
    /*console.log(deviceID);
     console.log(systemID);
     console.log(task_time);*/
    mysql.query('insert into tasks (userID,systemID,deviceID,deviceType,task_time,State,host,host_user,password) values (?,?,?,?,?,?,?,?,?)',[userID,systemID,deviceID,deviceType,task_time,0,host,host_user,password],function(err,re){
        if(err == null){
            if(re != null){
                console.log("insert device backup_strategy success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("insert device backup_strategy fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("insert device backup_strategy err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//在备份表上检查写入的设备备份策略是否重复
app.post('/check_deviceID',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    //console.log(deviceID);
    mysql.query('select State = ? from tasks where deviceID=? ',[0,deviceID],function(err,re){
        if(err == null){
            if(re != null && re.length>=1){
                console.log("check success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("check fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("check err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//在备份表上删除状态为未备份的，旧的设备备份策略
app.post('/delete_tasks_deviceID',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    //console.log(deviceID);
    mysql.query('delete from tasks where deviceID = ? and state = ? ',[deviceID,0],function(err,re){
        if(err == null){
            if(re != null){
                console.log("delete duplicate device success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("delete duplicate device fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("delete duplicate device err!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//在备份表上写入文件备份策略
app.post('/write_fileID',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var systemName = msg.systemName;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var fileName = msg.fileName;
    var task_time = msg.task_time;
    var host = msg.host;
    var host_user = msg.host_user;
    var password = msg.password;
    var remote_file = msg.remote_file;
    var local_path = msg.local_path;
    var route_command = msg.route_command;
    var route_keywords = msg.route_keywords;
    var file_backup_Frequency_dis = msg.file_backup_Frequency_dis;
    console.log("systemName="+systemName);
    console.log("deviceName="+deviceName);
    console.log("fileName="+fileName);
    mysql.query('insert into tasks (userID,systemID,deviceID,deviceType,fileID,task_time,State,host,host_user,password,remote_file,local_path,route_command,route_keywords,file_frequency,systemName,deviceName,fileName) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[userID,systemID,deviceID,deviceType,fileID,task_time,0,host,host_user,password,remote_file,local_path,route_command,route_keywords,file_backup_Frequency_dis,systemName,deviceName,fileName],function(err,re){
        if(err == null){
            if(re != null){
                console.log("insert success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("insert fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("insert err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//在备份表上检查写入的文件备份策略是否重复
app.post('/check_fileID',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    console.log(fileID);
    mysql.query('select state = ? from tasks where fileID = ?',[0,fileID],function(err,re){
        if(err == null){
            if(re != null && re.length>=1 ){
                console.log("file that state=0 exist!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("no file that state=0 exist!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("check err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//在备份表上删除状态为未备份的，旧的文件备份策略
app.post('/delete_tasks_fileID',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    //console.log(fileID);
    mysql.query('delete from tasks where fileID = ? and state = ?',[fileID,0],function(err,re){
        if(err == null){
            if(re != null){
                console.log(re);
                console.log("delete duplicate file success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("delete duplicate file fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("delete duplicate file err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//查处指定userID下的所有systemID
app.post('/get_user_backupInfo',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    mysql.query('select systemID from tasks where userID = ?',[userID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select system success!");
                res.send({code: code.RETURNCODE.OK,systemID:re});
            }else{
                console.log("select system fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select system err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//查处指定systemID下的所有记录
app.post('/get_system_backupInfo',function(req,res){
    var msg = req.body;
    var systemID = msg.systemID_inArray;
    mysql.query('select * from tasks where systemID = ?',[systemID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select system success!");
                res.send({code: code.RETURNCODE.OK,systemID:re});
            }else{
                console.log("select system fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select system err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//查处指定deviceID下的所有记录
app.post('/get_device_backupInfo',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    mysql.query('select * from tasks where deviceID = ?',[deviceID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select device success!");
                res.send({code: code.RETURNCODE.OK,deviceID:re});
            }else{
                console.log("select device fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select device err!");
            res.send({code: code.RETURNCODE.NODEVICEID});
        }
    })
})

//查处指定fileID下的所有记录
app.post('/get_file_backupInfo',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    mysql.query('select result_describe,task_time,state from tasks where fileID = ?',[fileID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select file success!");
                res.send({code: code.RETURNCODE.OK,task_time:re,state:re,result_describe:re});
            }else{
                console.log("select file fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select file err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//查出指定systemID和指定task_time下的所有记录
app.post('/get_taskAmount_backupInfo',function(req,res){
    var msg = req.body;
    var systemID = msg.systemID_inArray;
    var task_time = msg.task_time;
    mysql.query('select * from tasks where systemID = ? and task_time = ?',[systemID,task_time],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select system success!");
                res.send({code: code.RETURNCODE.OK,systemID:re});
            }else{
                console.log("select system fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select system err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//检查tasks_test表里的用户记录是否存在
app.post('/check_tasks_test_userID',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    //console.log(userID);
    mysql.query('select * from tasks_test where userID = ?',[userID],function(err,re){
        if(err == null){
            if(re != ''){
                console.log(re);
                console.log("check userID exist!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("check userID not exist!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("check userID err!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//更新用户测试记录写入tasks_test表
app.post('/update_tasks_test_user_record',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var systemName = msg.systemName;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var fileName = msg.fileName;
    var host = msg.host;
    var host_user = msg.host_user;
    var password = msg.password;
    var remote_file = msg.remote_file;
    var local_path = msg.local_path;
    var route_command = msg.route_command;
    var route_keywords = msg.route_keywords;
    if(fileID == ''){
        fileID = null;
    }
    if(password == ''){
        password = null;
    }
    if(remote_file == ''){
        remote_file = null;
    }
    if(route_command == ''){
        route_command=null;
    }
    if(route_keywords == ''){
        route_keywords=null;
    }
    /*console.log(userID);
     console.log(systemID);
     console.log(deviceID);
     console.log(deviceType);
     console.log(fileID);
     console.log(host);
     console.log(host_user);
     console.log(password);
     console.log(remote_file);
     console.log(local_path);
     console.log(route_command);
     console.log(route_keywords);*/
    mysql.query('update tasks_test set systemID=?,systemName=?,deviceID=?,deviceName=?,deviceType=?,fileID=?,fileName=?,state=?,host=?,host_user=?,password=?,remote_file=?,local_path=?,route_command=?,route_keywords=? where userID = ?',[systemID,systemName,deviceID,deviceName,deviceType,fileID,fileName,0,host,host_user,password,remote_file,local_path,route_command,route_keywords,userID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("update userRecord success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("update userRecord fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("update userRecord err!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//将新的用户测试记录写入tasks_test表
app.post('/write_tasks_test_userID',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var systemName = msg.systemName;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var fileName = msg.fileName;
    var host = msg.host;
    var host_user = msg.host_user;
    var password = msg.password;
    var remote_file = msg.remote_file;
    var local_path = msg.local_path;
    var route_command = msg.route_command;
    var route_keywords = msg.route_keywords;
    console.log(typeof(userID));
    if(fileID == ''){
        fileID = null;
    }
    if(password == ''){
        password = null;
    }
    if(remote_file == ''){
        remote_file = null;
    }
    if(route_command == ''){
        route_command=null;
    }
    if(route_keywords == ''){
        route_keywords=null;
    }
    /*console.log(userID);
     console.log(systemID);
     console.log(deviceID);
     console.log(deviceType);
     console.log(fileID);
     console.log(host);
     console.log(host_user);
     console.log(password);
     console.log(remote_file);
     console.log(local_path);
     console.log(route_command);
     console.log(route_keywords);*/
    mysql.query('insert into tasks_test (userID,systemID,systemName,deviceID,deviceName,deviceType,fileID,fileName,state,host,host_user,password,remote_file,local_path,route_command,route_keywords) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[userID,systemID,systemName,deviceID,deviceName,deviceType,fileID,fileName,0,host,host_user,password,remote_file,local_path,route_command,route_keywords],function(err,re){
        if(err == null){
            if(re != null){
                console.log("insert userRecord success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("insert userRecord fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("insert userRecord err!");
            console.log(err);
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//查出测试备份文件的状态以及屏幕截图
app.post('/test_backupInfo',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    mysql.query('select state,result_describe,realtime_state,last_result from tasks_test where userID = ?',[userID],function(err,re){
        if(err == null){
            if(re != null && re.length>=1){
                //console.log(re);
                //console.log("select test success!");
                res.send({code: code.RETURNCODE.OK,task_time:re,state:re,realtime_state:re,result_describe:re,last_result:re});
            }else{
                console.log("select test fail!");
                res.send({code:code.RETURNCODE.EXPIRED});
            }
        }else{
            console.log("select test err!");
            res.send({code: code.RETURNCODE.NOFILEID});
        }
    })
})

//将userFile里面的文件复制到web-server下的public里（主机文件）
app.post('/get_file_path',function(req,res){
    var msg = req.body;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var deviceName = msg.deviceName;
    var fileName = msg.fileName;
    var remote_file = msg.remote_file;
    remote_file.match(/\//g);
    var l = RegExp.leftContext;
    var r = RegExp.rightContext;
    var new_name= '['+ l.replace(/\//g,'-')+']'+r;

    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/'+ userName + '/' + systemName + '/' + deviceName + '/' + new_name;
    var FilePath = __dirname + '/public/File/' + new_name;

    fs.readFile(localPath,function (err, data) {
        if (err) {
            //throw err;
            console.log("读取失败!");
            console.log(err);
            res.send({code:code.RETURNCODE.FAIL});
        }else{
            console.log(data);
            fs.writeFile(FilePath,data,function(error,re){
                if(error == null){
                    console.log('ok');
                    console.log(data);
                    console.log("文件已保存!");
                    res.send({code:code.RETURNCODE.OK,'new_name':new_name});
                }else {
                    console.log('cuowu');
                    res.send({code:code.RETURNCODE.DBERROR});
                }
            })
        }
    });

})

//将userFile里面的文件复制到web-server下的public里（路由器文件）
app.post('/get_route_file_path',function(req,res){
    var msg = req.body;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var deviceName = msg.deviceName;
    var fileName = msg.fileName;


    console.log(fileName);
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + '/' + systemName + '/' + deviceName + '/' + fileName;
    var FilePath = __dirname +'/public/File/' + fileName;

    fs.readFile(localPath,function (err, data) {
        if (err) {
            //throw err;
            console.log("读取失败!");
            console.log(err);
            res.send({code:code.RETURNCODE.FAIL});
        }else{
            console.log(data);
            fs.writeFile(FilePath,data,function(error,re){
                if(error == null){
                    console.log('ok');
                    console.log(data);
                    console.log("文件已保存!");
                    res.send({code:code.RETURNCODE.OK});
                }else {
                    console.log('cuowu');
                    res.send({code:code.RETURNCODE.DBERROR});
                }
            })
        }
    });

})

//取出文件备份频率
app.post('/get_file_backup_frequency',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    mysql.query('select file_frequency from tasks where fileID = ? and state = ?',[fileID,0],function(err,re){
        if(err == null){
            if(re != null && re.length>=1){
                console.log(re);
                console.log("select file_frequency success!");
                res.send({code:code.RETURNCODE.OK,file_frequency:re});
            }else{
                console.log(re.length);
                console.log("no file_frequency!");
                res.send({code:code.RETURNCODE.EXPIRED});
            }
        }else{
            console.log("select file_frequency err!");
            res.send({code:code.RETURNCODE.DBERROR});
        }
    })

})


//Init mysql
mysql.init();

console.log("Web server has started.\nPlease log on http://127.0.0.1:8090");
app.listen(8090);
