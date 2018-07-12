
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

//修改密码
app.post('/modify', function(req, res) {
    var msg = req.body;
    var userID = msg.userID;
    var newPass = msg.newPass_trans;
    var oldPass = msg.oldPass_trans;
    mysql.query('select password from users where userID = ?',[userID],function(err,re){
        if(!err){
            console.log(re);
            if(re!=null && re.length>=1){
                if(re[0].password === oldPass){
                    mysql.query('update users set password = ? where userID = ?',[newPass,userID],function(err,re){
                        if(!err){
                            console.log('password modify success!');
                            res.send({code: code.RETURNCODE.OK});
                        }else{
                            console.log('password modify fail!');
                            res.send({code: code.RETURNCODE.FAIL});
                        }
                    })
                }else if(re[0].password !== oldPass){
                    console.log("error")
                    res.send({code: code.RETURNCODE.ERROR});
                }
            }
        }else{
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//登录
app.post('/login', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;  //获取前端的中的body数据
    var username = msg.username;  //获取前端的username
    var pwd = msg.password;       //获取前端的pwd
    mysql.query('select userID,userName,passWord,userType from users where userName = ?',[username],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                var rs = re[0];
                if (pwd != rs.passWord) {
                    console.log('password incorrect!');
                    res.send({code: code.RETURNCODE.WRONGPASS});
                }else{
                    res.send({code: code.RETURNCODE.OK, 'token': Token.create(rs.userName, Date.now()), 'userName': rs.userName,'userType': rs.userType,'userID':rs.userID});
                    console.log("Login success!");
                }
            }else {
                console.log("userName is not exist!");
                res.send({code: code.RETURNCODE.NONAME});
            }
        } else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    });
});

//注册
app.post('/register', function(req, res) {
    var msg = req.body;
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
    mysql.query("select userName from users where userName = ?",[msg.name],function(err,res1){
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
                        console.log('register fail!'+err);
                        fs.rmdir(userPath, function() {
                            return;
                        });
                    }else{
                        mysql.query("insert into users (userName,password) values(?,?)",[msg.name, msg.password],function(err,res3) {
                            if(err){
                                console.log("database error!"+err);
                                res.send({code: code.RETURNCODE.DBERROR});
                            }else{
                                console.log("register success!");
                                res.send({code: code.RETURNCODE.OK});
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

//超级用户下取用户名下拉框列表
app.post('/get_UserList', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;
    var userType =msg.userType;
    if (!userType) {
        console.log("userType is empty!");
        return;
    }
    //登录后，将指定用户id下的系统拿出来
    mysql.query('select * from users where userType = ?',[0],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                res.send({code: code.RETURNCODE.OK,'users':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            } else {
                console.log("There is no user in this user!");
                res.send({code: code.RETURNCODE.NOSYSTEM});
            }
        }
        else {
            console.log("access data erro!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

});

//超级用户下，若不指定用户名，返回所有用户的所有系统
app.post('/get_AllSystems', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;
    var userType =msg.userType;
    if (!userType) {
        console.log("userType is empty!");
        return;
    }
    //登录后，将指定用户id下的系统拿出来
    mysql.query('select * from systems',function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                res.send({code: code.RETURNCODE.OK,'systems':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            } else {
                console.log("There is no system in this user!");
                res.send({code: code.RETURNCODE.NOSYSTEM});
            }
        }
        else {
            console.log("access data erro!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

});

//超级用户下，点击下拉框后，取得用户id
app.post('/get_userID', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg = req.body;
    var userName =msg.userName;
    if (!userName) {
        console.log("userName is empty!");
        return;
    }
    //登录后，将指定用户id下的系统拿出来
    mysql.query('select userID from users where userName = ?',[userName],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                console.log(re);
                res.send({code: code.RETURNCODE.OK,'userID':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            } else {
                console.log("There is no userID in this user!");
                res.send({code: code.RETURNCODE.NOSYSTEM});
            }
        }
        else {
            console.log("access data erro!hh");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

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
    mysql.query('select * from systems where userID = ?',[userID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                res.send({code: code.RETURNCODE.OK,'systemName':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            } else {
                console.log("There is no system in this user!");
                res.send({code: code.RETURNCODE.NOSYSTEM});
            }
        }
        else {
            console.log("access data erro!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

});

//取二级下拉框列表
app.post('/get_SecondDropDownList', function(req, res) {  //req-->request：请求数据    res-->respond：发送数据
    var msg=req.body;
    var systemID = msg.systemID;
    if (!systemID) {
        console.log("systemID is empty!");
        return;
    }
    mysql.query('select * from devices where systemID = ? ',[systemID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                res.send({code: code.RETURNCODE.OK,'deviceName':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            }
            else {
                console.log("deviceName in this system is not exist!");
                res.send({code: code.RETURNCODE.NODEVICENAME});
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
    }
    mysql.query('select * from devices where deviceName = ? and systemID = ?',[deviceName,systemID],function(err,re){
        if(err == null) {
            if(re!= null && re.length>=1) {
                res.send({code: code.RETURNCODE.OK,'deviceID':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
            }
            else {
                console.log("deviceID in this system is not exist!");
                res.send({code: code.RETURNCODE.NODEVICEID});
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
    console.log(deviceID)
    if (!deviceID) {
        console.log("deviceName is empty!");
        return;
    }
    mysql.query('select * from files where deviceID = ? ',[deviceID],function(err,re){
        if(err == null) {
            if(re!= null && re.length >=1) {
                res.send({code: code.RETURNCODE.OK,'fileName':re,'fileID':re});  //re:将在数据库中得到的数据发送到前端，re：property，将某属性数据发送到前端
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
    }
    mysql.query('select * from files where filename = ? and deviceID = ?',[fileName,deviceID],function(err,re){
        if(err == null) {
            if(re!= null && re.length>=1){
                res.send({code: code.RETURNCODE.OK,'fileID':re});  //re:将在数据库中得到的数据发送到前端
            }
            else {
                console.log("no fileID here!");
                res.send({code: code.RETURNCODE.NOFILEID});
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
    var userID = msg.userID;
    var new_systemDescribe = msg.new_systemDescribe;
    mysql.query('update systems set systemDescribe = ? where systemID = ?',[new_systemDescribe,systemID],function(err,re){
        if(err == null) {
            console.log("update success!");
            mysql.query("select * from systems where userID = ?",[userID],function(err1,re1){
                console.log(re1);
                res.send({code: code.RETURNCODE.OK,'systems':re1});
            })
        } else {
            console.log("access data erro");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//修改设备
app.post('/modify_device', function(req, res){
    var msg=req.body;
    var deviceID = msg.deviceID;
    var systemID = msg.systemID;
    var new_deviceDescribe = msg.new_deviceDescribe;
    mysql.query('update devices set deviceDescribe = ? where deviceID = ?',[new_deviceDescribe,deviceID],function(err,re){
        if(err == null) {
            console.log("update device success!");
            mysql.query("select * from devices where systemID = ?",[systemID],function(err1,re1){
                console.log(re1);
                res.send({code: code.RETURNCODE.OK,'devices':re1});
            })
        } else {
            console.log("access data erro 1");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
});

//修改文件
app.post('/modify_file', function(req, res){
    var msg=req.body;
    var filename = msg.filename;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var deviceID = msg.deviceID;
    var new_fileDescribe = msg.new_fileDescribe;
    var new_remotePath = msg.new_remote_file;
    var new_filenameOnPath = new_remotePath + '/' + filename;
    var new_routeCommand = msg.new_routeCommand;
    var new_routeKeyword = msg.new_routeKeyword;
    if(deviceType == "主机"){
        if(new_fileDescribe && new_remotePath){
            mysql.query('update files set fileDescribe = ?,remotePath = ? ,filenameOnPath = ? where fileID = ?',[new_fileDescribe,new_remotePath,new_filenameOnPath,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access data erro 1");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_fileDescribe && new_remotePath){
            mysql.query('update files set remotePath=? where fileID = ?',[new_remotePath,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access data erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(new_fileDescribe && !new_remotePath){
            mysql.query('update files set fileDescribe=? where fileID = ?',[new_fileDescribe,fileID],function(err,re){
                if(err == null) {
                    console.log("update file success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access data erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_fileDescribe && !new_remotePath){
            return;
        }
    }else if(deviceType == "路由器"){
        if(new_routeCommand && new_routeKeyword) {
            mysql.query('update files set routeCommand = ?,identifyKeywords = ? where fileID = ?', [new_routeCommand, new_routeKeyword, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access RouteFileData erro 1");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_routeCommand && new_routeKeyword){
            mysql.query('update files set identifyKeywords = ? where fileID = ?', [new_routeKeyword, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access RouteFileData erro 2");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(new_routeCommand && !new_routeKeyword){
            mysql.query('update files set routeCommand = ? where fileID = ?', [new_routeCommand, fileID], function (err, re) {
                if (err == null) {
                    console.log("update Routefile success!");
                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                        console.log(re1);
                        res.send({code: code.RETURNCODE.OK,'files':re1});
                    })
                } else {
                    console.log("access RouteFileData erro 3");
                    res.send({code: code.RETURNCODE.DBERROR});
                }
            })
        }else if(!new_routeCommand && !new_routeKeyword){
            return;
        }
    }else{
        res.send({code: code.RETURNCODE.ERROR});
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
    mysql.query("select * from files where deviceID = ?",[deviceID],function(err,re){
        if (!err ) {
            res.send({code: code.RETURNCODE.OK,'fileName':re});
        } else {
            console.log("search db err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

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
            fs.exists(systemPath,function(exists){
                if(exists){
                    mysql.query("insert into systems (systemName,systemDescribe,userID) values (?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                        if (err == null) {
                            console.log("insert success!");
                            mysql.query("select * from systems where userID = ?",[userID],function(err1,re1){
                                console.log(re1);
                                res.send({code: code.RETURNCODE.OK,'systems':re1});
                            })
                        } else {
                            console.log("insert error!");
                            res.send({code: code.RETURNCODE.DBERROR});
                        }
                    });
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create fail!');
                            fs.rmdir(systemPath, function(err) {
                                return;
                            });
                        }else{
                            mysql.query("insert into systems (systemName,systemDescribe,userID) values (?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                                if (err == null) {
                                    console.log("insert success!");
                                    mysql.query("select * from systems where userID = ?",[userID],function(err1,re1){
                                        console.log(re1);
                                        res.send({code: code.RETURNCODE.OK,'systems':re1});
                                    })
                                } else {
                                    console.log("insert error!");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }
                    });
                }
            })
        }else{   //若用户文件夹不存在，则先创建用户文件夹，再在用户文件夹下创建系统文件夹
            fs.mkdir(userPath,function(err){
                if(err){
                    res.send({code: code.RETURNCODE.DBERROR});
                    console.log('create userfolder fail!');
                    fs.rmdir(systemPath, function(err) {
                        return;
                    });
                }else{
                    fs.mkdir(systemPath,function(err){   //创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.DBERROR});
                            console.log('create fail!');
                            fs.rmdir(systemPath, function(err) {
                                return;
                            });
                        }else{
                            mysql.query("insert into systems (systemName,systemDescribe,userID) values ( ?,?,?)",[systemName,systemDescribe,userID],function(err,re){
                                if (err == null) {
                                    console.log("insert success!");
                                    mysql.query("select * from systems where userID = ?",[userID],function(err1,re1){
                                        console.log(re1);
                                        res.send({code: code.RETURNCODE.OK,'systems':re1});
                                    })
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
    var ip = msg.new_deviceipAddress;
    var deviceUserName = msg.new_deviceUserName;
    var devicePassword = msg.new_devicePassword;
    var systemID = msg.systemID;
    var devicePort = msg.new_devicePort;
    var systemName = msg.systemName_selected;
    var userName = msg.userName;
    var folderPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;
    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if(exists){         //若用户文件夹存在
            fs.exists(systemPath,function(exists){  //先判断系统文件夹是否存在
                if(exists){      //若系统文件夹存在
                    fs.exists(devicePath,function(exists){  //先判断设备文件夹是否存在
                        if(exists){  //若该设备路径下的设备文件夹存在，则直接讲数据插入数据库，不再额外创建设备文件夹
                            mysql.query("insert into devices (deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUsername,devicePassword,systemID) values (?,?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID],function(err,re){
                                if (err == null) {
                                    console.log("insert success!");
                                    mysql.query("select * from devices where systemID = ?",[systemID],function(err1,re1){
                                        console.log(re1);
                                        res.send({code: code.RETURNCODE.OK,'devices':re1});
                                    })
                                }else {
                                    console.log("insert fail!1");
                                    res.send({code: code.RETURNCODE.DBERROR});
                                }
                            });
                        }else{  //若该设备路径下的设备文件夹不存在，则创建设备文件夹且讲数据写入数据库
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUsername,devicePassword,systemID) values (?,?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (err == null) {
                                            console.log("insert success!");
                                            mysql.query("select * from devices where systemID = ?",[systemID],function(err1,re1){
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK,'devices':re1});
                                            })
                                        }else {
                                            console.log("insert fail!1");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                            fs.rmdir(devicePath, function(err) {
                                                return;
                                            });
                                        }
                                    });
                                }
                            })
                        }
                    })
                }else{  //若系统文件夹不存在
                    fs.mkdir(systemPath,function(err){  //先创系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.log('create systemfolder fail!');
                            fs.rmdir(systemPath, function(err) {
                                return;
                            });
                        }else{  //接着创建设备文件夹
                            fs.mkdir(devicePath,function(err){
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function(err) {
                                        return;
                                    });
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (err == null) {
                                            console.log("insert success!");
                                            mysql.query("select * from devices where systemID = ?",[systemID],function(err1,re1){
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK,'devices':re1});
                                            })
                                        }else {
                                            console.log("insert fail!2");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                            fs.rmdir(devicePath, function(err) {
                                                return;
                                            });
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
                    console.log('create userfolder fail!');
                    fs.rmdir(userPath, function(err) {
                        return;
                    });
                }else{
                    fs.mkdir(systemPath,function(err){   //接着创建系统文件夹
                        if(err){
                            res.send({code: code.RETURNCODE.EXIST});
                            console.log('create systemfolder fail!');
                            fs.rmdir(systemPath, function(err) {
                                return;
                            });
                        }else{
                            fs.mkdir(devicePath,function(err){  //再接着创建设备文件夹
                                if(err){
                                    res.send({code: code.RETURNCODE.EXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function(err) {
                                        return;
                                    });
                                }else{
                                    mysql.query("insert into devices (deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID) values (?,?,?,?,?,?,?,?)",[deviceName,deviceDescribe,deviceType,ip,devicePort,deviceUserName,devicePassword,systemID],function(err,re){
                                        if (err == null) {
                                            console.log("insert success!");
                                            mysql.query("select * from devices where systemID = ?",[systemID],function(err1,re1){
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK,'devices':re1});
                                            })
                                        }else {
                                            console.log("insert fail!3");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                            fs.rmdir(devicePath, function(err) {
                                                return;
                                            });
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

//添加主机文件（文件名相同，路径不同）
app.post('/newFileName_sameFilename', function(req, res) {
    console.log("same name,diff path")
    var msg = req.body;
    var filename = msg.new_fileName;
    var fileDescribe = msg.new_fileDescribe;
    var remotePath = msg.new_remote_file;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var systemID = msg.systemID;
    var fileType = 0;
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName + '/' + filename;
    var folderPath =  __dirname.replace(/\/web-server$/,'') + '/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;
    var filePath = folderPath + userName + '/' + systemName + '/' + deviceName + '/' + filename;
    if(remotePath.charAt(remotePath.length - 1) == '/'){
        var filenameOnPath = remotePath + filename;
        var remotePath = remotePath.slice(0,remotePath.length-1);
    }
    if(remotePath.charAt(remotePath.length - 1) != '/'){
        var filenameOnPath = remotePath + '/' + filename;
    }
    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if (exists) {         //若用户文件夹存在
            fs.exists(systemPath, function (exists) {  //先判断系统文件夹是否存在
                if (exists) {      //若系统文件夹存在
                    fs.exists(devicePath, function (exists) {  //先判断设备文件夹是否存在
                        if (exists) {  //若设备文件夹存在
                            fs.exists(filePath, function (exists) {  //先判断文件文件夹是否存在
                                if (exists) {
                                    mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                        if (!err) {
                                            console.log("insert success!");
                                            mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK, 'files': re1});
                                            })
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    })
                                } else {
                                    fs.mkdir(filePath,function(err){
                                        if(err){
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create devicefolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        }else{
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                    fs.rmdir(filePath, function (err) {
                                                        return;
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        } else {  //设备文件夹不存在
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {  //若系统文件夹不存在
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } else {  //若用户文件夹不存在
            fs.mkdir(userPath, function (err) {
                if (err) {
                    res.send({code: code.RETURNCODE.NAMEEXIST});
                    console.log('create userfolder fail!');
                    fs.rmdir(userPath, function (err) {
                        return;
                    });
                } else {
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

//添加主机文件（文件名和路径均不同）
app.post('/newFileName', function(req, res) {
    var msg = req.body;
    var filename = msg.new_fileName;
    var fileDescribe = msg.new_fileDescribe;
    var remotePath = msg.new_remote_file;
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var systemID = msg.systemID;
    var fileType = 0;
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName + '/' + filename;
    var folderPath =  __dirname.replace(/\/web-server$/,'') + '/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;
    var filePath = folderPath + userName + '/' + systemName + '/' + deviceName + '/' + filename;
    if(remotePath.charAt(remotePath.length - 1) == '/'){
        var filenameOnPath = remotePath + filename;
        var remotePath = remotePath.slice(0,remotePath.length-1);
    }
    if(remotePath.charAt(remotePath.length - 1) != '/'){
        var filenameOnPath = remotePath + '/' + filename;
    }
    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if (exists) {         //若用户文件夹存在
            fs.exists(systemPath, function (exists) {  //先判断系统文件夹是否存在
                if (exists) {      //若系统文件夹存在
                    fs.exists(devicePath, function (exists) {  //先判断设备文件夹是否存在
                        if (exists) {  //若设备文件夹存在
                            fs.exists(filePath,function(exists){  //先判断文件文件夹是否存在
                                if(exists){
                                    mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                        console.log("fileFolder exist 1050")
                                        if (!err) {
                                            console.log("insert success!");
                                            mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK, 'files': re1});
                                            })
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    })
                                }else{
                                    fs.mkdir(filePath, function (err) {  //创建文件文件夹
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail 1066!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        } else {  //设备文件夹不存在
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                } else {  //若系统文件夹不存在
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } else {  //若用户文件夹存在
            fs.mkdir(userPath, function (err) {
                if (err) {
                    res.send({code: code.RETURNCODE.NAMEEXIST});
                    console.log('create userfolder fail!');
                    fs.rmdir(userPath, function (err) {
                        return;
                    });
                } else {
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (filename,fileType,fileDescribe,remotePath,deviceID,localPath,filenameOnPath,systemID) values (?,?,?,?,?,?,?,?)", [filename, fileType, fileDescribe, remotePath, deviceID, localPath, filenameOnPath, systemID], function (err, re) {
                                                if (!err) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?", [deviceID], function (err1, re1) {
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK, 'files': re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

//添加路由文件
app.post('/newRouteFile', function(req, res) {
    var msg = req.body;
    var routeCommand = msg.new_routeCommand;
    var identifyKeywords = msg.new_routeKeyword
    var deviceID = msg.deviceID;
    var deviceName = msg.deviceName;
    var userName = msg.userName;
    var systemName = msg.systemName;
    var systemID = msg.systemID;
    var fileType = 1;
    var filename = 'routeFile';
    var fileDescribe = 'routeFile';
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + "/" + systemName + "/" + deviceName + "/" + filename;
    var folderPath = __dirname.replace(/\/web-server$/,'') + '/UserFile/';
    var userPath = folderPath + userName;
    var systemPath = folderPath + userName + '/' + systemName;
    var devicePath = folderPath + userName + '/' + systemName +'/' + deviceName;
    var filePath = folderPath + userName + '/' + systemName + '/' + deviceName + '/' + filename;
    fs.exists(userPath, function(exists) {   //先判断用户文件夹是否存在
        if (exists) {         //若用户文件夹存在
            fs.exists(systemPath, function (exists) {  //先判断系统文件夹是否存在
                if (exists) {      //若系统文件夹存在
                    fs.exists(devicePath, function (exists) {  //先判断设备文件夹是否存在
                        if (exists) {  //若设备文件夹存在
                            fs.exists(filePath,function(exists){  //先判断陆游文件文件夹是否存在
                                if(exists){
                                    mysql.query("insert into files (deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID) values (?,?,?,?,?,?,?,?)",[deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID],function(err,re){
                                        if (!err ) {
                                            console.log("insert success!");
                                            mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                                                console.log(re1);
                                                res.send({code: code.RETURNCODE.OK,'files':re1});
                                            })
                                        } else {
                                            console.log("insert fail!");
                                            res.send({code: code.RETURNCODE.DBERROR});
                                        }
                                    });
                                }else{
                                    console.log("routeFile not exist! 1281")
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID) values (?,?,?,?,?,?,?,?)",[deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID],function(err,re){
                                                if (!err ) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK,'files':re1});
                                                    })
                                                } else {
                                                    console.log("insert fail!");
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        } else {  //设备文件夹不存在
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID) values (?,?,?,?,?,?,?,?)",[deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID],function(err,re){
                                                if (!err ) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK,'files':re1});
                                                    })
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
                } else {  //若系统文件夹不存在
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID) values (?,?,?,?,?,?,?,?)",[deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID],function(err,re){
                                                if (!err ) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK,'files':re1});
                                                    })
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
                }
            })
        } else {  //若用户文件夹存在
            fs.mkdir(userPath, function (err) {
                if (err) {
                    res.send({code: code.RETURNCODE.NAMEEXIST});
                    console.log('create userfolder fail!');
                    fs.rmdir(userPath, function (err) {
                        return;
                    });
                } else {
                    fs.mkdir(systemPath, function (err) {
                        if (err) {
                            res.send({code: code.RETURNCODE.NAMEEXIST});
                            console.log('create systemFolder fail!');
                            fs.rmdir(systemPath, function (err) {
                                return;
                            });
                        } else {
                            fs.mkdir(devicePath, function (err) {  //先创建设备文件夹
                                if (err) {
                                    res.send({code: code.RETURNCODE.NAMEEXIST});
                                    console.log('create devicefolder fail!');
                                    fs.rmdir(devicePath, function (err) {
                                        return;
                                    });
                                } else {
                                    fs.mkdir(filePath, function (err) {
                                        if (err) {
                                            res.send({code: code.RETURNCODE.NAMEEXIST});
                                            console.log('create fileFolder fail!');
                                            fs.rmdir(filePath, function (err) {
                                                return;
                                            });
                                        } else {
                                            mysql.query("insert into files (deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID) values (?,?,?,?,?,?,?,?)",[deviceID,filename,fileType,fileDescribe,localPath,routeCommand,identifyKeywords,systemID],function(err,re){
                                                if (!err ) {
                                                    console.log("insert success!");
                                                    mysql.query("select * from files where deviceID = ?",[deviceID],function(err1,re1){
                                                        console.log(re1);
                                                        res.send({code: code.RETURNCODE.OK,'files':re1});
                                                    })
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
                }
            })
        }
    })
});

//删除系统
app.post('/delete_system',function(req,res){
    var msg = req.body;
    var systemID = msg.systemID;
    mysql.query('delete from systems where systemID = ?',[systemID],function(err,re){
        if(err == null){
            res.send({code: code.RETURNCODE.OK});
        }else{
            console.log("delete err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//删除设备
app.post('/delete_device',function(req,res){
    var msg = req.body;
    var deviceID = msg.deviceID;
    mysql.query('delete from devices where deviceID = ?',[deviceID],function(err,re){
        if(err == null){
            res.send({code: code.RETURNCODE.OK});
        }else{
            console.log("delete device err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//删除文件
app.post('/delete_file',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    var deviceID = msg.deviceID;
    console.log(deviceID);
    mysql.query('delete from files where fileID = ?',[fileID],function(err,re){
        if(err == null){
            res.send({code: code.RETURNCODE.OK});
        }else{
            console.log("delete file err!");
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })
})

//查处指定fileID下的所有记录
app.post('/get_file_backupInfo',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    mysql.query('select * from tasksHistory where fileID = ?',[fileID],function(err,re){
        if(err == null){
            if(re != null){
                console.log("select file success!");
                res.send({code: code.RETURNCODE.OK,task_time:re,state:re});
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

//检查tasks_test表里的用户记录是否存在
app.post('/check_tasks_test_fileID',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    mysql.query('select * from tasks where fileID = ? and priority =?',[fileID,0],function(err,re){
        if(err == null){
            if(re != null && re.length >= 1){
                console.log("check testFileID exist!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("check testFileID not exist!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("check testFileID err!");
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//更新用户测试记录写入tasks_test表
app.post('/update_tasks_test_user_record',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var deviceID = msg.deviceID;
    var taskTime = msg.taskTime;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var filename = msg.filename;
    var ip = msg.ip;
    var deviceUsername = msg.deviceUsername;
    var devicePassword = msg.devicePassword;
    var systemName = msg.systemName;
    var devicePort = msg.devicePort;
    var remotePath = msg.remotePath;
    var localPath = msg.localPath;
    var routeCommand = msg.routeCommand;
    var identifyKeywords = msg.identifyKeywords;
    mysql.query('update tasks set script = null,progress = null where fileID = ? and priority = ?',[fileID,0],function(err,re){
        if(err == null){
            mysql.query('update tasks set userID = ?,systemID = ?,deviceID=?,taskTime=?,deviceType=?,filename=?,ip=?,deviceUsername=?,devicePassword=?,devicePort=?,remotePath=?,localPath=?,routeCommand=?,identifyKeywords=?,state =?,count=? where fileID = ? and priority = ?',[userID,systemID,deviceID,taskTime,deviceType,filename,ip,deviceUsername,devicePassword,devicePort,remotePath,localPath,routeCommand,identifyKeywords,-1,1,fileID,0],function(err,re){
                if(err == null){
                    if(re != null){
                        console.log("update userRecord success! hahaha");
                        res.send({code: code.RETURNCODE.OK});
                    }else{
                        console.log("update userRecord fail!");
                        res.send({code:code.RETURNCODE.FAIL});
                    }
                }else{
                    console.log(err);
                    console.log("update userRecord err!");
                    res.send({code: code.RETURNCODE.ERROR});
                }
            })
        }else{
            console.log(err);
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
    var deviceID = msg.deviceID;
    var taskTime = msg.taskTime;
    var state = -1;
    var count = 1;
    var priority = 0;
    var deviceType = msg.deviceType;
    var fileID = msg.fileID;
    var filename = msg.filename;
    var ip = msg.ip;
    var deviceUsername = msg.deviceUsername;
    var devicePassword = msg.devicePassword;
    var systemName = msg.systemName;
    var devicePort = msg.devicePort;
    var remotePath = msg.remotePath;
    var localPath = msg.localPath;
    var routeCommand = msg.routeCommand;
    var identifyKeywords = msg.identifyKeywords;
    mysql.query('insert into tasks (userID,systemID,deviceID,taskTime,state,count,deviceType,fileID,filename,ip,deviceUsername,devicePassword,devicePort,remotePath,localPath,routeCommand,identifyKeywords,priority) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[userID,systemID,deviceID,taskTime,state,count,deviceType,fileID,filename,ip,deviceUsername,devicePassword,devicePort,remotePath,localPath,routeCommand,identifyKeywords,priority],function(err,re){
        if(err == null){
            if(re != null){
                console.log("insert testFile success!");
                res.send({code: code.RETURNCODE.OK});
            }else{
                console.log("insert testFile fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("insert testFile err!");
            console.log(err);
            res.send({code: code.RETURNCODE.ERROR});
        }
    })
})

//查出测试备份文件的状态以及屏幕截图
app.post('/test_backupInfo',function(req,res){
    var msg = req.body;
    var fileID = msg.fileID;
    mysql.query('select * from tasks where fileID = ? and priority = ?',[fileID,0],function(err,re){
        if(err == null ){
            if(re != null && re.length>=1){
                res.send({code: code.RETURNCODE.OK,progress:re,script:re});
            }else{
                console.log("select test fail!");
                res.send({code:code.RETURNCODE.FAIL});
            }
        }else{
            console.log("select test err!");
            res.send({code: code.RETURNCODE.DBERROR});
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
    var fileID = msg.fileID;
    var newName = msg.newName;
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/'+ userName + '/' + systemName + '/' + deviceName + '/' + fileName + '/' + newName;
    var FilePath = __dirname + '/public/File/' + newName;
    fs.readFile(localPath,function (err, data) {
        if (err) {
            console.log(localPath)
            console.log("读取失败!");
            res.send({code:code.RETURNCODE.FAIL});
        }else{
            fs.writeFile(FilePath,data,function(err,re){
                if(err == null){
                    console.log("文件已保存!");
                    res.send({code:code.RETURNCODE.OK,'FilePath':re});
                }else {
                    res.send({code:code.RETURNCODE.DBERROR});
                    console.log('cuowu');
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
    var newName = msg.newName;
    var localPath = __dirname.replace(/\/web-server$/,'')+'/UserFile/' + userName + '/' + systemName + '/' + deviceName + '/' + fileName + '/' + newName;
    var FilePath = __dirname +'/public/File/' + newName ;
    fs.readFile(localPath,function (err, data) {
        if (err) {
            console.log("读取失败!");
            res.send({code:code.RETURNCODE.FAIL});
        }else{
            fs.writeFile(FilePath,data,function(error,re){
                console.log(FilePath);
                if(error == null){
                    console.log("文件已保存!");
                    res.send({code:code.RETURNCODE.OK});
                }else {
                    console.log(error)
                    res.send({code:code.RETURNCODE.DBERROR});
                    console.log('cuowu')
                }
            })
        }
    });
})

//写入策略
app.post('/writeStrategy',function(req,res){
    var msg = req.body;
    var userID = msg.userID;
    var systemID = msg.systemID;
    var system_times = msg.system_times;
    var systemName = msg.systemName;
    var system_backup_Frequency_dis = msg.system_backup_Frequency_dis;
    if(system_backup_Frequency_dis == 30){
        var system_backup_Frequency = "一个月";
    }else if(system_backup_Frequency_dis == 91){
        var system_backup_Frequency = "三个月";
    }
    var count = 0;
    mysql.query('select * from devices where systemID = ?',[systemID],function(err,re){
        if(!err){
            if(re != null && re.length >=1){
                mysql.query('select * from files where systemID = ?',[systemID],function(err,re){
                    if(!err){
                        if(re != null && re.length >= 1){
                            for(var j=0;j<re.length;j++){
                                (function(){
                                    var fileID = re[j].fileID;
                                    var fileName = re[j].filename;
                                    var remotePath = re[j].remotePath;
                                    var localPath = re[j].localPath;
                                    var routeCommand = re[j].routeCommand;
                                    var identifyKeywords = re[j].identifyKeywords;
                                    var deviceID = re[j].deviceID;
                                    mysql.query('select * from devices where deviceID = ?',[deviceID],function(err2,re2){
                                        if(err2 == null){
                                            var deviceType = re2[0].deviceType;
                                            var deviceName = re2[0].deviceName;
                                            var ip = re2[0].ip;
                                            var deviceUsername = re2[0].deviceUsername;
                                            var devicePassword = re2[0].devicePassword;
                                            var devicePort = re2[0].devicePort;
                                            mysql.query('delete from tasks where fileID = ? and state = ?', [fileID, 0], function (err1, re1) {
                                                if (err1 == null) {
                                                    var oDate = new Date();
                                                    for (var i = 0; i < system_times; i++) {
                                                        oDate.setTime(oDate.getTime() + i * system_backup_Frequency_dis * 24 * 60 * 60 * 1000);
                                                        var year = oDate.getFullYear();   //获取系统的年；
                                                        var month = oDate.getMonth() + 1;   //获取系统月份，由于月份是从0开始计算，所以要加1
                                                        var day = oDate.getDate(); // 获取系统日，
                                                        var hour = oDate.getHours(); //获取系统时，
                                                        var minute = oDate.getMinutes(); //分
                                                        var second = oDate.getSeconds(); //秒
                                                        if (month < 10) {
                                                            var month = '0' + month.toString();
                                                        }
                                                        if (day < 10) {
                                                            var day = '0' + day.toString();
                                                        }
                                                        if (hour < 10) {
                                                            var hour = '0' + hour.toString();
                                                        }
                                                        if (minute < 10) {
                                                            var minute = '0' + minute.toString();
                                                        }
                                                        if (second < 10) {
                                                            var second = '0' + second.toString();
                                                        }
                                                        var task_time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
                                                        mysql.query('insert into tasks (userID,systemID,deviceID,deviceType,fileID,taskTime,state,remotePath,localPath,routeCommand,identifyKeywords,filename,ip,deviceUsername,devicePassword,devicePort,count) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [userID, systemID, deviceID, deviceType, fileID, task_time, 0, remotePath, localPath, routeCommand, identifyKeywords, fileName,ip,deviceUsername,devicePassword,devicePort,3], function (err3, re3) {
                                                            if(!err3){
                                                                console.log(count);
                                                                if(count++ == re.length){
                                                                    console.log("ok 1");
                                                                    console.log(system_backup_Frequency);
                                                                    mysql.query('update systems set frequency = ? where systemID = ?',[system_backup_Frequency,systemID],function(err4,re4){
                                                                        if(!err4){
                                                                            mysql.query("select * from systems where userID = ?",[userID],function(err5,re5){
                                                                                console.log(re5);
                                                                                res.send({code: code.RETURNCODE.OK,'systems':re5});
                                                                                return;
                                                                            })
                                                                        }else{
                                                                            console.log("cuowu 4")
                                                                            res.send({code: code.RETURNCODE.DBERROR});
                                                                        }
                                                                    })

                                                                }
                                                            }else{
                                                                console.log(err3)
                                                                console.log("cuowu 1")
                                                                res.send({code: code.RETURNCODE.DBERROR});
                                                            }
                                                        })
                                                        month = parseInt(month);
                                                        day = parseInt(day);
                                                        hour = parseInt(hour);
                                                        minute = parseInt(minute);
                                                        second = parseInt(second);
                                                    }
                                                }else{
                                                    console.log("cuowu 2");
                                                    console.log(err1)
                                                    res.send({code: code.RETURNCODE.DBERROR});
                                                }
                                            })
                                        }else{
                                            console.log("cuowu 3")
                                            res.send({code: code.RETURNCODE.DBERROR});
                                            return;
                                        }
                                    })
                                })()
                            }
                        }
                    }
                })
            }else{
                console.log("no device in this system")
                res.send({code: code.RETURNCODE.NODEVICEID});
            }
        }else{
            res.send({code: code.RETURNCODE.DBERROR});
        }
    })

})


//Init mysql
mysql.init();

//
//var engine = require('../bin/engine.js');
//engine();

console.log("Web server has started.\nPlease log on http://127.0.0.1:8090");
app.listen(8090);