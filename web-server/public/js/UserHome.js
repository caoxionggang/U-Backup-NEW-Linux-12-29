/**
 * Created by admin on 2017/11/2.
 */
/*UserHome页面的一系列动作*/

var httpHost = location.href.replace(location.hash, '');

//测试按钮点击动作
function update(){
    var userID = sessionStorage['userID'];
    var userName = sessionStorage['userName'];
    var systemID = $("#currentSystemID").text();
    var deviceID = $("#currentDeviceID").text();
    var fileID = $("#currentFileID").text();
    var systemName_selected = $("#currentSystem").text();
    var deviceName_selected = $("#currentDevice").text();
    var fileName_selected = $("#currentFileName").text();
    var task_time = new Date();
    var year = task_time.getFullYear();   //获取系统的年；
    var month = task_time.getMonth() + 1;   //获取系统月份，由于月份是从0开始计算，所以要加1
    var day = task_time.getDate(); // 获取系统日，
    var hour = task_time.getHours(); //获取系统时，
    var minute = task_time.getMinutes(); //分
    var second = task_time.getSeconds(); //秒
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
    var taskTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    $.post(httpHost + '/../get_deviceID', {'systemID': systemID, 'deviceName_selected': deviceName_selected}, function (data) {
        if (data.code === code.RETURNCODE.NODEVICENAME) {
            console.log("no device in this system!")
        } else {
            var deviceID = data.deviceID[0].deviceID;
            var deviceType = data.deviceID[0].deviceType;
            var ip = data.deviceID[0].ip;
            var deviceUsername = data.deviceID[0].deviceUsername;
            var devicePassword = data.deviceID[0].devicePassword;
            var devicePort = data.deviceID[0].devicePort;
            $.post(httpHost + '/../get_fileID', {'deviceID': deviceID, 'fileName_selected': fileName_selected}, function (data) {
                if (data.code === code.RETURNCODE.NOFILENAME) {
                    console.log("no file in this device!")
                } else {
                    var fileID = data.fileID[0].fileID;
                    var remotePath  = data.fileID[0].remotePath ;
                    var localPath  = data.fileID[0].localPath;
                    var routeCommand = data.fileID[0].routeCommand ;
                    var identifyKeywords = data.fileID[0].identifyKeywords ;
                    $.post(httpHost + '/../check_tasks_test_fileID', {'fileID': fileID}, function (data) {  //检查文件测试记录是否存在，若存在，则更新
                        if (data.code == code.RETURNCODE.OK) {  //若已有用户存在，则更改除用户外的其他字段
                            $.post(httpHost + '/../update_tasks_test_user_record', {'userID':userID,'systemID': systemID,'deviceID':deviceID,'taskTime':taskTime,'deviceType':deviceType,'fileID':fileID,'filename':fileName_selected,'ip':ip,'deviceUsername':deviceUsername,'devicePassword':devicePassword,'systemName':systemName_selected,'devicePort':devicePort, 'remotePath':remotePath,'localPath':localPath,'routeCommand':routeCommand,'identifyKeywords':identifyKeywords}, function (data) {
                                if (data.code == code.RETURNCODE.OK) {
                                    console.log("systemID = " + systemID + ";" + "deviceID = " + deviceID + ";" + "fileID = " + fileID + ";" + "在测试表上更新测试文件记录成功！");
                                    var interval = setInterval(function(){
                                        $.post(httpHost + '/../test_backupInfo', {'fileID': fileID}, function (data) {
                                            //console.log(data);
                                            var progress = data.script[0].progress;
                                            var script = data.script[0].script;
                                            if(script){
                                                var result_describe = progress + "\n" + script;
                                                $("#result_describe").val(result_describe);
                                                clearInterval(interval);
                                            }else if(!script){
                                                if(progress == "读取任务成功！"){
                                                    $("#result_describe").val(progress + "测试中,请稍候...");
                                                }else{
                                                    $("#result_describe").val(progress);
                                                }
                                            }
                                        })
                                    },1000)
                                } else if(data.code == code.RETURNCODE.FAIL) {
                                    console.log("systemID = " + systemID + ";" + "deviceID = " + deviceID + ";" + "fileID = " + fileID + ";" + "在测试表上更新测试文件记录失败！");
                                }else if(data.code == code.RETURNCODE.ERROR) {
                                    console.log("访问数据库出错，请重试!");
                                }
                            })
                        }else if(data.code == code.RETURNCODE.FALL){  //检查文件测试记录是否存在，若不存在，则写入
                            $.post(httpHost + '/../write_tasks_test_userID', {'userID':userID,'systemID': systemID,'deviceID':deviceID,'taskTime':taskTime,'deviceType':deviceType,'fileID':fileID,'filename':fileName_selected,'ip':ip,'deviceUsername':deviceUsername,'devicePassword':devicePassword,'systemName':systemName_selected,'devicePort':devicePort, 'remotePath':remotePath,'localPath':localPath,'routeCommand':routeCommand,'identifyKeywords':identifyKeywords}, function (data) {
                                if (data.code == code.RETURNCODE.OK) {
                                    console.log("systemID = " + systemID + ";" + "deviceID = " + deviceID + ";" + "fileID = " + fileID + ";" + "在测试表上写入新的测试文件记录成功！");
                                    var interval = setInterval(function(){
                                        $.post(httpHost + '/../test_backupInfo', {'fileID': fileID}, function (data) {
                                            var progress = data.script[0].progress;
                                            var script = data.script[0].script;
                                            if(script){
                                                var result_describe = progress + "\n" + script;
                                                $("#result_describe").val(result_describe);
                                                clearInterval(interval);
                                            }else if(!script){
                                                if(progress == "读取任务成功！"){
                                                    $("#result_describe").val(progress + "测试中,请稍候...");
                                                }else{
                                                    $("#result_describe").val(progress);
                                                }
                                            }
                                        })
                                    },1000)
                                } else if(data.code == code.RETURNCODE.FAIL) {
                                    console.log("systemID = " + systemID + ";" + "deviceID = " + deviceID + ";" + "fileID = " + fileID + ";" + "在测试表上写入新的测试文件记录失败！");
                                }else if(data.code == code.RETURNCODE.ERROR) {
                                    console.log("访问数据库出错，请重试!");
                                }
                            })
                        }else{
                            $("#result_describe").text("db error");
                        }
                    })
                }
            }) //取systemID
        }
    })
}

window.onload=function() {

        $(function () {  //启用页面中的所有的弹出框（popover）
            $("[data-toggle='popover']").popover();
        });

        /*********************************************************************策略写入以及测试**********************************************************************/

        //写入备份策略
        $("#write_strategy_confirm").on("click",function(){
            if(!$("#currentSystem").html()){
                layer.msg("请先选择系统!");
            }else{
                var userID = sessionStorage['userID'];
                var system_backup_Frequency = $("#Strategy option:selected").text();  //获取下拉框选定的备份频率
                var system_times = $("#system_backup_times").val().trim();
                var starttimeHaoMiao = (new Date()).getTime();
                var systemName_selected = $("#currentSystem").html();
                var systemID = $("#currentSystemID").html();
                var system_backup_Frequency_Drop_down = new Array('一个月','三个月');  //将下拉框选定值转化为备份频率数值
                var system_backup_Frequency_trans = new Array(30,91);
                for(var z = 0;z<system_backup_Frequency_Drop_down.length;z++){
                    if(system_backup_Frequency == system_backup_Frequency_Drop_down[z]){
                        var system_backup_Frequency_dis = system_backup_Frequency_trans[z];   //备份频率数值
                        break;
                    }
                }
                if(system_times) {      //备份次数不空
                    if(!isNaN(system_times)){
                        $.post(httpHost + '/../writeStrategy', {'userID':userID,'systemID': systemID,'systemName':systemName_selected,'system_times':system_times,"starttimeHaoMiao":starttimeHaoMiao,'systemName_selected':systemName_selected,'system_backup_Frequency_dis':system_backup_Frequency_dis}, function (data) {
                            layer.msg("正在写入,请稍等!",{time:10000});
                            setTimeout(function(){
                                if(data.code === code.RETURNCODE.OK){
                                    layer.msg("策略写入完毕!");
                                    var systems = data.systems;
                                    reLoadSystem(systems);
                                }else if(data.code === code.RETURNCODE.DBERROR){
                                    layer.msg("数据库错误，请稍后再试!")
                                }else if(data.code === 510) {
                                    layer.msg("此系统下没有设备，无需备份!");
                                }else{
                                    layer.msg("Fail");
                                }
                            },2000)

                        })
                    }else{
                        layer.msg("次数请输入数字!")
                    }
                }else{
                    layer.msg("请输入备份次数！");
                }
            }
        })

        //文件测试
        $("#Filetest").on("click",function(){
            if(!($("#fileName"))){
                //layer.msg("请先选择文件！")
                return;
            }else{
                $("#result_describe").val("");
                update();
            }
        })

        /*************************************************************修改系统、设备、文件********************************************************************/

         //修改系统
        $("#modify_system_confirm").on("click",function(){
            if(!($("#currentSystemID").html())){
                layer.msg("请先选择系统!")
            }else{
                var systemID = $("#currentSystemID").html();
                var new_systemDescribe = $("#modify_systemDescribe").val();
                $.post(httpHost + '/../modify_system', {'systemID': systemID,'new_systemDescribe':new_systemDescribe,'userID':userID}, function (data) {
                    if(data.code === code.RETURNCODE.OK){
                        console.log("update system success!");
                        layer.msg("修改系统描述成功!");
                        var systemName = data.systems;
                        reLoadSystem(systemName);
                    }else if(data.code === code.RETURNCODE.DBERROR){
                        layer.msg("访问数据库出错，请稍后重试或者刷新页面!");
                        console.log("access database error!")
                    }
                })
            }
        })

        //修改设备
        $("#modify_device_confirm").on("click",function(){
            if(!($("#currentDeviceID").html())){
                layer.msg("请先选择设备!")
            }else{
                var deviceID = $("#currentDeviceID").html();
                var systemID = $("#currentSystemID").html();
                //修改deviceDescribe
                var new_deviceDescribe = $("#modify_deviceDescribe").val();
                $.post(httpHost + '/../modify_device', {'deviceID': deviceID, 'new_deviceDescribe': new_deviceDescribe,'systemID':systemID}, function (data) {
                    if(data.code === code.RETURNCODE.OK){
                        var deviceName = data.devices;
                        reLoadDevice(deviceName);
                        console.log("update device success!");
                        layer.msg("修改设备描述成功！");
                    }else if(data.code === code.RETURNCODE.DBERROR){
                        console.log("access database error!")
                        layer.msg("访问数据库出错，请稍候重试或者刷新页面!")
                    }
                })
            }
        })

        //修改文件
        $("#modify_file_confirm").on("click",function(){
            if(!($("#currentFileID").html())){
                layer.msg("请先选择文件!")
            }else{
                var filename = $("#currentFileName").html();
                var fileID = $("#currentFileID").html();
                var deviceID = $("#currentDeviceID").html();
                var deviceType = $("#deviceType").html();
                if(deviceType == "主机"){  //若设备为主机
                    var new_fileDescribe = $("#modify_fileDescribe").val();
                    var new_remote_file = $("#modify_Remote_file").val();
                    $.post(httpHost + '/../modify_file', {'deviceType':deviceType,'filename':filename,'fileID': fileID,'new_fileDescribe': new_fileDescribe,'new_remote_file':new_remote_file,'deviceID':deviceID}, function (data) {
                        if(data.code === code.RETURNCODE.OK){
                            var fileName = data.files;
                            reLoadFile(fileName);
                            console.log("update file success!");
                            layer.msg("修改文件描述成功！");
                        }else if(data.code === code.RETURNCODE.DBERROR){
                            console.log("acess database error!")
                            layer.msg("访问数据库出错，请稍候重试或者刷新页面!")
                        }else if(data.code === code.RETURNCODE.ERROR){
                            console.log("acess database error!")
                            layer.msg("发生错误!")
                        }
                    })
                }else if(deviceType == "路由器"){  //若是路由器文件
                    var new_routeCommand = $("#modify_routeCommand").val();
                    var new_routeKeyword = $("#modify_routeKeyword").val();
                    $.post(httpHost + '/../modify_file', {'deviceType':deviceType,'fileID': fileID, 'new_routeCommand': new_routeCommand, 'new_routeKeyword': new_routeKeyword,'deviceID':deviceID}, function (data) {
                        if(data.code === code.RETURNCODE.OK){
                            var fileName = data.files;
                            reLoadFile(fileName);
                            console.log("update Routefile success!");
                            layer.msg("修改文件描述成功！");
                        }else if(data.code === code.RETURNCODE.DBERROR){
                            console.log("acess database error!")
                            layer.msg("访问数据库出错，请稍候重试或者刷新页面!")
                        }else if(data.code === code.RETURNCODE.ERROR){
                            console.log("acess database error!")
                            layer.msg("发生错误!")
                        }
                    })
                }
            }

        })

        //根据文件类型的不同，点击“修改文件”按钮显示不同界面
        $("#filemodify").on("click",function() {
            if ($("#deviceType").html() == "主机") {
                $("#modify_fileDescribe").attr('disabled', false);
                $("#modify_Remote_file").attr('disabled', false);
                $("#modify_routeCommand").attr('disabled', true);
                $("#modify_routeKeyword").attr('disabled', true);
                $("#modify1").show();
                $("#modify2").hide();
                $("#modify_routeCommand").val("");
                $("#modify_routeKeyword").val("");
            } else if ($("#deviceType").html() == "路由器") {
                $("#modify_fileDescribe").attr('disabled', true);
                $("#modify_Remote_file").attr('disabled', true);
                $("#modify_routeCommand").attr('disabled', false);
                $("#modify_routeKeyword").attr('disabled', false);
                $("#modify1").hide();
                $("#modify2").show();
                $("#modify_fileDescribe").val("");
                $("#modify_Remote_file").val("");
            }
        })

        /*************************************************************添加系统、设备、文件********************************************************************/

        //添加系统，并将系统添加入数据库
        $("#add_confirm").on("click",function(){
            var new_systemName = $("#add_systemName").val();
            var new_systemDescribe = $("#add_systemDescribe").val();
            var userID = sessionStorage['userID'];
            var userName = sessionStorage['userName'];
            if(!new_systemName){
                layer.msg("请输入系统名称!");
            }else{
                $.post(httpHost + '/../reName',{'userID':userID},function(data){//判断是否重名
                    if(data.code === code.RETURNCODE.OK){    //若用户下有系统存在
                        for(var i=0,j=0;i<data.systemName.length;i++) {
                            if (new_systemName == data.systemName[i].systemName) {
                                j++;
                            }
                        }
                        if(j>0){
                            layer.msg("当前用户下 <系统名> 重复！请更改 <系统名> ！");
                        }else{
                            $.post(httpHost + '/../newSystemName',{'new_systemName':new_systemName,'new_systemDescribe':new_systemDescribe,'userID':userID,'userName':userName},function(data){
                                if (data.code === code.RETURNCODE.OK) {
                                    var systemName = data.systems;
                                    reLoadSystem(systemName);
                                    layer.msg("添加系统成功！");
                                } else if(data.code === code.RETURNCODE.NAMEEXIST){
                                    layer.msg("当前用户的历史系统文件夹曾使用此名，请更换系统名！");
                                    console.log("add system fail!")
                                } else if(data.code === code.RETURNCODE.DBERROR){
                                    layer.msg("添加系统发生错误，请重试！");
                                    console.log("add system fail!")
                                }
                            })
                        }
                    }else if(data.code === code.RETURNCODE.FAIL){  //若用户下没有系统存在
                        $.post(httpHost + '/../newSystemName',{'new_systemName':new_systemName,'new_systemDescribe':new_systemDescribe,'userID':userID,'userName':userName},function(data){
                            if (data.code === code.RETURNCODE.OK) {
                                var systemName = data.systems;
                                reLoadSystem(systemName);
                                layer.msg("添加系统成功！");
                            }else if(data.code === code.RETURNCODE.NAMEEXIST){
                                layer.msg("当前用户的历史系统文件夹曾使用此名，请更换系统名！");
                                console.log("add system fail!")
                            }else if(data.code === code.RETURNCODE.DBERROR){
                                layer.msg("添加系统发生错误，请重试！");
                                console.log("add system fail!")
                            }
                        })
                    }else  if(data.code === code.RETURNCODE.DBERROR){
                        console.log("access database error");
                        layer.msg("访问数据库出错，请稍候重试或者刷新页面!")
                    }
                })
            }
        })

        //添加设备，并将设备添加入数据库
        $("#add_device_confirm").on("click",function(){
            var systemName_selected = $("#currentSystem").html();
            var new_deviceName = $("#add_deviceName").val();
            var new_deviceDescribe = $("#add_deviceDescribe").val();
            var new_deviceType = $("#add_deviceType option:selected").text();
            var new_deviceipAddress = $("#add_deviceipAddress").val();
            var new_deviceUserName = $("#add_deviceUserName").val();
            var new_devicePassword = $("#add_devicePassword").val();
            var new_devicePort = $("#add_devicePort").val();
            var userID = sessionStorage['userID'];
            var userName = sessionStorage['userName'];
            var systemID = $("#currentSystemID").html();
            if(new_deviceType == '设备类型'){
                layer.msg("请选择设备类型！")
            }else{
                if(new_deviceType == '主机'){
                    new_deviceType = 2;
                }else if(new_deviceType == '路由器'){
                    new_deviceType = 1;
                }
                var reg =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/ //正则表达式判断IP地址格式是否正确
                if(reg.test(new_deviceipAddress)) {
                    if(!new_deviceName){
                        layer.msg("请输入deviceName！");
                    }else{
                        $.post(httpHost + '/../redeviceName',{'systemID':systemID},function(data){  //判断是否重名
                            if(data.code === code.RETURNCODE.OK){  //若系统下有设备存在
                                for(var i=0,j=0;i<data.deviceName.length;i++) {
                                    if (new_deviceName == data.deviceName[i].deviceName) {
                                        j++;
                                    }
                                }
                                if(j>0){
                                    layer.msg("当前系统下 <设备名> 重复！请更改 <设备名>！");
                                }else{
                                    if(!new_deviceType||!new_deviceName||!new_deviceipAddress||!new_deviceUserName||!new_devicePassword||!new_devicePort){
                                        layer.msg("请按*号标注填写完整！");
                                    }else{
                                        if(new_deviceType == 2) {
                                            new_deviceType = 0;
                                        }
                                        var new_devicePassword_trans = encrypt(new_devicePassword);
                                        $.post(httpHost + '/../newDeviceName',{'new_deviceName':new_deviceName,'new_deviceDescribe':new_deviceDescribe,'new_deviceType':new_deviceType,'new_deviceipAddress':new_deviceipAddress,'new_devicePort':new_devicePort,'new_deviceUserName':new_deviceUserName,'new_devicePassword':new_devicePassword_trans,'systemID':systemID,'systemName_selected': systemName_selected,'userName':userName},function(data){
                                            if (data.code === code.RETURNCODE.OK) {
                                                var deviceName = data.devices;
                                                reLoadDevice(deviceName);
                                                layer.msg("添加设备成功！");
                                            }else if(data.code === code.RETURNCODE.NAMEEXIST){
                                                layer.msg("当前用户的历史设备文件夹曾使用此名，请更换系统名！");
                                            }else if(data.code === code.RETURNCODE.DBERROR){
                                                layer.msg("添加设备失败，请稍候再试！");
                                            }
                                        })
                                    }
                                }
                            }else if(data.code === code.RETURNCODE.FAIL){  //若系统下没有设备存在
                                if(!new_deviceType||!new_deviceName||!new_deviceipAddress||!new_deviceUserName||!new_devicePassword||!new_devicePort){
                                    layer.msg("请按*号标注填写完整！");
                                }else{
                                    if(new_deviceType == 2) {
                                        new_deviceType = 0;
                                    }
                                    var new_devicePassword_trans = encrypt(new_devicePassword);
                                    $.post(httpHost + '/../newDeviceName',{'new_deviceName':new_deviceName,'new_deviceDescribe':new_deviceDescribe,'new_deviceType':new_deviceType,'new_deviceipAddress':new_deviceipAddress,'new_devicePort':new_devicePort,'new_deviceUserName':new_deviceUserName,'new_devicePassword':new_devicePassword_trans,'systemID':systemID,'systemName_selected': systemName_selected,'userName':userName},function(data){
                                        if (data.code === code.RETURNCODE.OK) {
                                            var deviceName = data.devices;
                                            reLoadDevice(deviceName);
                                            layer.msg("添加设备成功！");
                                        }else if(data.code === code.RETURNCODE.NAMEEXIST){
                                            layer.msg("请更换设备名！");
                                        }else if(data.code === code.RETURNCODE.DBERROR){
                                            layer.msg("添加设备失败，请稍候再试！");
                                        }
                                    })
                                }
                            }else  if(data.code === code.RETURNCODE.DBERROR){
                                layer.msg("访问数据库出错，请稍后再试或者刷新页面！")
                                console.log("access database error!")
                            }
                        })
                    }
                }else{
                    $("#IPwrong").show();
                    layer.msg("IP输入有误！");
                }
            }
        })

        //添加设备密码时的密码显示与隐藏
        $("#pasDis").on("click",function(){
            var inputValue = $("#add_devicePassword").attr('type');
            console.log(inputValue);
            if(inputValue == 'password'){
                $("#add_devicePassword").attr('type','text');
                $("#appear").hide();
                $("#disappear").show();
            }else{
                $("#add_devicePassword").attr('type','password');
                $("#disappear").hide();
                $("#appear").show();
            }
        })

        //添加文件，并将文件添加入数据库
        $("#add_file_confirm").on("click",function(){
            var systemName_selected = $("#currentSystem").html();
            var systemID = $("#currentSystemID").html();
            var deviceName_selected = $("#currentDevice").html();
            var new_fileName = $("#add_fileName").val();
            var new_fileDescribe = $("#add_fileDescribe").val();
            var new_remote_file = $("#add_fileabsoluteAddress").val();
            var new_routeCommand = $("#add_routeCommand").val();
            var new_routeKeyword = $("#add_routeKeyword").val();
            var deviceType = $("#deviceType").html();
            var deviceID = $("#currentDeviceID").html();
            var fileType = deviceType;
            var userID = sessionStorage['userID'];
            var userName = sessionStorage['userName'];
            var newName = $("#currentFileAdress").html();
            if(deviceType == "主机"){  //如果文件所属的设备为主机
                if (!new_fileName) {
                    layer.msg("请输入文件名！");
                } else {
                    $.post(httpHost + '/../refileName', {'deviceID': deviceID}, function (data) {  //判断是否重名
                        console.log(data);
                        for (var i = 0, j = 0,m = 0; i < data.fileName.length; i++) {
                            if (new_fileName == data.fileName[i].filename && (new_remote_file == data.fileName[i].remotePath)) {
                                j++;
                            }
                            if (new_fileName == data.fileName[i].filename && (new_remote_file != data.fileName[i].remotePath)) {
                                m++;
                            }
                        }
                        if (j > 0) {
                            layer.msg("当前设备下<文件名>和<路径>均重复！请修改其中一项或两项均修改！");
                        } else if(m>0){   //文件名相同路径不同
                            if(new_remote_file && new_fileName){
                                $.post(httpHost + '/../newFileName_sameFilename', {'new_fileName': new_fileName,'fileType':fileType,'new_fileDescribe': new_fileDescribe, 'new_remote_file': new_remote_file, 'deviceID': deviceID,'systemName':systemName_selected,'systemID':systemID,'deviceName':deviceName_selected,'userName':userName,'newName':newName}, function (data) {
                                    if (data.code === code.RETURNCODE.OK) {
                                        var fileName = data.files;
                                        reLoadFile(fileName);
                                        layer.msg("添加文件成功！");
                                    } else {
                                        layer.msg("添加文件失败！");
                                    }
                                })
                            }else{
                                layer.msg("请按*号标注填写完整！")
                            }
                        } else{  //文件名和路径都不同
                            if(new_remote_file && new_fileName){
                                $.post(httpHost + '/../newFileName', {'new_fileName': new_fileName,'fileType':fileType,'new_fileDescribe': new_fileDescribe, 'new_remote_file': new_remote_file, 'deviceID': deviceID,'systemName':systemName_selected,'systemID':systemID,'deviceName':deviceName_selected,'userName':userName,'newName':newName}, function (data) {
                                    if (data.code === code.RETURNCODE.OK) {
                                        var fileName = data.files;
                                        reLoadFile(fileName);
                                        layer.msg("添加文件成功！");
                                    } else {
                                        layer.msg("添加文件失败！");
                                    }
                                })
                            }else{
                                layer.msg("请按*号标注填写完整！")
                            }
                        }
                    })
                }
            } else if(deviceType == "路由器") {  //如果文件所属设备为路由器
                $.post(httpHost + '/../get_ThirdDropDownList', {'deviceID': deviceID}, function (data) {
                    if (data.code === code.RETURNCODE.OK) {
                        layer.msg("此路由器设备下已有文件！一个路由器设备仅需一个文件！");
                    } else if (data.code === code.RETURNCODE.NONAME) {
                        if (new_routeCommand && new_routeKeyword) {
                            $.post(httpHost + '/../newRouteFile', {'deviceID': deviceID, 'systemName': systemName_selected,'systemID':systemID,'deviceName': deviceName_selected, 'userName': userName, 'new_routeCommand': new_routeCommand, 'new_routeKeyword': new_routeKeyword}, function (data) {
                                if (data.code === code.RETURNCODE.OK) {
                                    var fileName = data.files;
                                    reLoadFile(fileName);
                                    layer.msg("添加路由文件成功！");
                                } else if (data.code === code.RETURNCODE.DBERROR) {
                                    layer.msg("添加文件失败！");
                                }
                            })
                        } else {
                            layer.msg("请按*号标注填写完整！");
                        }
                    } else if (data.code === code.RETURNCODE.DBERROR) {
                        layer.msg("添加文件错误！请重试！");
                    }
                })
            }
        })

        //根据设备类型的不同，点击“添加文件”按钮显示不同界面
        $("#fileadd").on('click',function(){
            var deviceType = $("#deviceType").html();
            var userID = sessionStorage['userID'];
            var userName = sessionStorage['userName'];
            //先取得deviceID
            if(deviceType == "主机"){
                $("#add_fileName").attr('disabled',false);
                $("#add_fileDescribe").attr('disabled',false);
                $("#add_fileabsoluteAddress").attr('disabled',false);
                $("#add_routeCommand").attr('disabled',true);
                $("#add_routeKeyword").attr('disabled',true);
                $("#file_backup_interval").attr('disabled',false);
                $("#route_backup_interval").attr('disabled',true);
                $("#device1").show();
                $("#device2").hide();
            }else if(deviceType == "路由器"){
                $("#add_fileName").attr('disabled',true);
                $("#add_fileDescribe").attr('disabled',true);
                $("#add_fileabsoluteAddress").attr('disabled',true);
                $("#add_routeCommand").attr('disabled',false);
                $("#add_routeKeyword").attr('disabled',false);
                $("#file_backup_interval").attr('disabled',true);
                $("#route_backup_interval").attr('disabled',false);
                $("#device2").show();
                $("#device1").hide();
            }else{
                layer.msg("无法之别设备类型，不能添加文件!");
                $("#fileadd").attr("disabled",true);
            }
        })

        /*************************************************************删除系统、设备、文件*********************************************************************/

        //删除系统，将系统移除出数据库
        $("#delete_system_confirm").on("click",function(){
            if(!($("#currentSystemID").html())){
                layer.msg("请先选择系统!");
            }else{
                var systemID = $("#currentSystemID").html();
                var userID = sessionStorage['userID'];
                $.post(httpHost + '/../delete_system', {'systemID': systemID}, function (data) {  //删除系统
                    if (data.code === code.RETURNCODE.OK) {
                        console.log("delete whole system success!");
                        layer.msg("删除系统成功!");
                        $("#getDevices").bootstrapTable('destroy');
                        $("#getFiles").bootstrapTable('destroy');
                        $("#device").hide();
                        $("#file").hide();
                        $.post(httpHost + '/../get_FirstDropDownList',{'userID':userID},function(data){
                            var systems = data.systemName;
                            reLoadSystem(systems);
                        })
                        return true;
                    } else if(data.code === code.RETURNCODE.DBERROR){
                        console.log("删除系统失败，请再试!");
                        layer.msg("删除系统发生错误!稍后再试！");
                    }
                })
            }
        })

        //删除设备，将设备移除出数据库
        $("#delete_device_confirm").on("click",function(){
            if(!($("#currentDeviceID").html())){
                layer.msg("请先选择设备!");
            }else{
                var deviceID = $("#currentDeviceID").html();
                var systemID = $("#currentSystemID").html();
                $.post(httpHost + '/../delete_device', {'deviceID': deviceID}, function (data) {  //删除设备
                    if(data.code === code.RETURNCODE.OK){
                        console.log("成功删除设备!");
                        layer.msg("成功删除设备!");
                        $.post(httpHost + '/../get_SecondDropDownList',{'systemID':systemID},function(data){
                            var deviceName = data.deviceName;
                            $("#getFiles").bootstrapTable('destroy');
                            $("#file").hide();
                            reLoadDevice(deviceName);
                        })
                    }else if(data.code === code.RETURNCODE.DBERROR) {
                        console.log("删除设备失败，请再试!");
                        layer.msg("删除设备发生错误!稍后再试！");
                    }
                })
            }
        })

        //删除文件，将文件移除出数据库
        $("#delete_file_confirm").on("click",function(){
            if(!($("#currentFileID").html())){
                layer.msg("请先选择文件!");
            }else {
                var fileID = $("#currentFileID").html();
                var deviceID = $("#currentDeviceID").html();
                $.post(httpHost + '/../delete_file', {'fileID': fileID,'deviceID':deviceID}, function (data) {  //删除文件
                    if(data.code === code.RETURNCODE.OK){
                        console.log("delete file success!");
                        layer.msg("删除文件成功!");
                        $.post(httpHost + '/../get_ThirdDropDownList',{'deviceID':deviceID},function(data){
                            var fileName = data.fileName;
                            reLoadFile(fileName);
                        })
                    }else if(data.code === code.RETURNCODE.DBERROR){
                        console.log("delete file fail!");
                        layer.msg("删除文件发生错误!稍后再试！");
                    }
                })
            }
        })

        /*************************************************************生成下载链接*********************************************************************/

        //生成下载链接
        $("#download").on("click",function(){
        var userName = sessionStorage['userName'];
        var systemName = $("#currentSystem").html();
        var deviceName = $("#currentDevice").html();
        var deviceType = $("#deviceType").html();
        var deviceID = $("#currentDeviceID").html();
        var fileName = $("#currentFileName").html();
        var fileID = $("#currentFileID").html();
        var newName = $("#currentFileAdress").html();
        if(!newName){
            layer.msg("请先选择下载的文件项!");
        }else{
            if(deviceType == "主机"){   //若为主机
                var fileName_selected = $("#currentFileName").html();
                $.post(httpHost + '/../get_fileID', {'fileName_selected': fileName,'deviceID':deviceID}, function (data) {
                    var FilePath = 'File/' + newName;
                    $.post(httpHost + '/../get_file_path', {'userName':userName,'systemName':systemName,'deviceName':deviceName,'fileName':fileName,'fileID':fileID,'newName':newName}, function (data) {
                        if(data.code === code.RETURNCODE.FAIL){
                            layer.msg("没有此文件的下载信息！")
                        }
                        if(data.code === code.RETURNCODE.DBERROR){
                            layer.msg("此文件在文件夹间复制失败！")
                        }
                        if(data.code === code.RETURNCODE.OK){
                            $(function(){
                                var fileName = newName;
                                var link = FilePath;
                                $("#link").attr("href",link);
                                $("#link").attr("download",fileName);
                                $("#link").show();
                            })
                        }
                    })
                })
            }else if(deviceType == "路由器"){  //若设备为路由器
                var fileName_selected = $("#currentFileName").html();
                var FilePath = 'File/' + fileName_selected + '.txt';
                $.post(httpHost + '/../get_route_file_path', {'userName':userName,'systemName':systemName,'deviceName':deviceName,'fileName':fileName_selected,'newName':newName}, function (data) {
                    if(data.code === code.RETURNCODE.FAIL){
                        layer.msg("没有此文件的下载信息！")
                    }
                    if(data.code === code.RETURNCODE.DBERROR){
                        layer.msg("此文件在文件夹间复制失败！")
                    }
                    if(data.code === code.RETURNCODE.OK){
                        $(function(){
                            var fileName = fileName_selected;
                            var link = FilePath;
                            $("#link").attr("href",link);
                            $("#link").attr("download",fileName);
                            $("#link").show();
                        })
                    }
                })
            }
        }

    })

        /*************************************************************清除数据*********************************************************************/

        //点击清除系统界面输入数据
        $("#deleteSystemData").on("click",function(){
            $("#add_systemName").val("");
            $("#add_systemDescribe").val("");
        })

        //点击清除设备界面输入数据
        $("#deleteDeviceData").on("click",function(){
            $("#add_deviceName").val("");
            $("#add_deviceDescribe").val("");
            $("#add_deviceipAddress").val("");
            $("#add_deviceUserName").val("");
            $("#add_devicePassword").val("");
            $("#add_devicePort").val("");
            $("#IPwrong").hide();
        })

        //点击清除文件界面输入数据
        $("#deleteFileData").on("click",function(){
            $("#add_fileName").val("");
            $("#add_fileDescribe").val("");
            $("#add_fileabsoluteAddress").val("");
            $("#add_routeCommand").val("");
            $("#add_routeKeyword").val("");
        })

    }