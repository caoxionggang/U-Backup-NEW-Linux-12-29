/**
 * Created by admin on 2017/12/14.
 */

//系统中的编辑和删除按钮
function AddFunctionAlty(value,row,index){
    /*return [
        '<button id="TableEditor" type="button" class="btn btn-default">编辑</button> &nbsp;&nbsp;',
        '<button id="TableDelete" type="button" class="btn btn-default">删除</button>&nbsp;&nbsp;'
    ].join("")*/
}
//系统中的编辑和删除操作
window.operateEvents = {
    "click #TableEditor":function(e,value,row,index){  //修改编辑
        var systemID = row.systemID;
        console.log(row)
        console.log(index)
    }
}

//系统中的选择策略和写入备份策略按钮
function AddFunctionSetStrategy(value,row,index){
    return [
        '<select id="Strategy"><option>一个月</option><option>三个月</option></select> &nbsp;&nbsp;',
        '<input id="system_backup_times" placeholder="次数" style="width:100px;margin-right:10px">',
    ].join("")
}
//系统中的选择策略和写入备份策略操作
window.operateEventsSetStrategy = {
    "click #Strategy":function(e,value,row,index){
        //获取策略代码
    },
    "click #SetStrategy":function(e,value,row,index){
        //写入备份策略按钮代码
    }
}

//文件栏目中的测试按钮
function testFileButton(value,row,index){
    return [
        '<button id="testFile" type="button" class="btn btn-default">测试</button> '
    ].join("")
}
//文件栏目中的测试操作
window.testFile = {
    "click #testFile":function(e,value,row,index){  //修改编辑
        //文件测试代码
    }
}


//根据用户名，自动显示出该用户名下的系统
$.post(httpHost + '/../get_FirstDropDownList', {'userID': userID}, function (data) {  //将获取的userid数据库比对，post请求与后台交互拿出此用户下的system,拿出数据后执行function
    if (data.code === code.RETURNCODE.NOSYSTEM) {
        console.log("There is no system in this user!");
        $("#getSystems").bootstrapTable('destroy');
        return;
    } else if(data.code === code.RETURNCODE.OK){
        var systemName = data.systemName; //systemName值为json数组
        $(function(){   //页面加载自动触发函数
            reLoadSystem(systemName);
        })
    }else if(data.code === code.RETURNCODE.DBERROR){
        layer.msg("访问数据库出错，请稍候重试或者刷新页面!");
        console.log("access database error!")
    }
})

//点击系统栏目，显示出当前系统下的设备
$(function () {
    var userID = sessionStorage['userID'];
    $('#getSystems').on('click-row.bs.table', function (e, row, element)
    {
        $("#device").show();
        $("#file").hide();
        $("#fileHistory").hide();
        $("#currentDevice").text("");
        $("#currentDeviceID").text("");
        $("#deviceType").text("");
        $("#deviceadd").attr("disabled",false);
        $("#devicemodify").attr("disabled",false);
        $("#devicedelete").attr("disabled",false);
        $("#currentFileID").text("");
        $("#noFile").show();
        $("#fileName").text("");
        $("#Filetest").attr("disabled",true);
        $("#result_describe").text("");
        $('.success').removeClass('success');//去除之前选中的行的，选中样式
        $(element).addClass('success');//添加当前选中的 success样式用于区别
        var systemName = row.systemName;
        var systemID = row.systemID;
        var systemDescribe = row.systemDescribe;
        $("#currentSystem").text(systemName);
        $("#currentSystemID").text(systemID);
        $("#modify_systemDescribe").val(systemDescribe);
        $.post(httpHost + '/../get_SecondDropDownList', {'systemID': systemID}, function (data) {
            if (data.code === 507) {
                console.log("There is no device in this system!");
                $("#getDevices").bootstrapTable('destroy');
                $("#getFiles").bootstrapTable('destroy');
                return;
            }else if(data.code === code.RETURNCODE.OK){
                var deviceName = data.deviceName; //deviceName值为json数组
                $(function(){   //页面加载自动触发函数
                    for(var i=0;i<deviceName.length;i++){
                        if(deviceName[i].deviceType == 0){
                            deviceName[i].deviceType = "主机";
                        }else if(deviceName[i].deviceType == 1){
                            deviceName[i].deviceType = "路由器";
                        }
                    }
                    $("#getFiles").bootstrapTable('destroy');
                    reLoadDevice(deviceName);
                })
            }else{
                layer.msg("访问数据库出错，请稍后重试或者刷新页面!");
                console.log("access database error!")
            }
        })
    });
})

//点击设备栏目，显示出当前设备下的文件
$(function () {
    var userID = sessionStorage['userID'];
    $('#getDevices').on('click-row.bs.table', function (e, row, element)
    {
        $("#file").show();
        $("#fileHistory").hide();
        $("#fileadd").attr("disabled",false);
        $("#filemodify").attr("disabled",false);
        $("#filedelete").attr("disabled",false);
        $("#Filetest").attr("disabled",true);
        $("#fileName").text("");
        $("#currentFileID").text("");
        $("#result_describe").text("");
        $("#noFile").show();
        $('.success').removeClass('success');//去除之前选中的行的，选中样式
        $(element).addClass('success');//添加当前选中的 success样式用于区别
        var deviceName = row.deviceName;
        var deviceType = row.deviceType;
        var devciceDescribe = row.deviceDescribe;
        if(row.deviceType == 0){
            deviceType = "主机";
        }else if(row.deviceType == 1){
            deviceType = "路由器";
        }
        var deviceID = row.deviceID;
        $("#currentDevice").text(deviceName);
        $("#deviceType").text(deviceType);
        $("#currentDeviceID").text(deviceID);
        $("#modify_deviceDescribe").val(devciceDescribe);
        $.post(httpHost + '/../get_ThirdDropDownList', {'deviceID': deviceID}, function (data) {
            if (data.code === code.RETURNCODE.NONAME) {
                console.log("no file in this device!")
                $("#getFiles").bootstrapTable('destroy');
                return;
            } else if(data.code === code.RETURNCODE.OK){
                var fileName = data.fileName; //fileName值为json数组
                $(function(){   //页面加载自动触发函数
                    reLoadFile(fileName);
                })
            }else if(data.code === code.RETURNCODE.DBERROR){
                layer.msg("访问数据库出错，请稍后重试或者刷新数据库!")
                console.log("access database error!")
            }
        })
    });
})

//点击文件栏目，显示出当前文件下的历史文件备份记录
$(function () {
    var userID = sessionStorage['userID'];
    $('#getFiles').on('click-row.bs.table', function (e, row, element)
    {
        $("#fileHistory").show();
        $("#currentFileID").text(row.fileID);
        $("#currentFileName").text(row.filename);
        $("#modify_fileDescribe").val(row.fileDescribe);
        $("#modify_Remote_file").val(row.remotePath);
        $("#modify_routeCommand").val(row.routeCommand);
        $("#modify_routeKeyword").val(row.identifyKeywords);
        $("#fileName").text(row.filename);
        $("#noFile").hide();
        $("#Filetest").attr("disabled",false);
        $('.success').removeClass('success');//去除之前选中的行的，选中样式
        $(element).addClass('success');//添加当前选中的 success样式用于区别
        var fileID = $("#currentFileID").text();
        $("#link").hide();
        $("#currentFileAdress").text("");
        $.post(httpHost + '/../get_file_backupInfo', {'fileID': fileID}, function (data) {
            var state = data.state;
            $.each(state,function(i,state){
                switch (data.state[i].state){
                    case 1:data.state[i].state = '备份失败';break;
                    case 9:data.state[i].state = '备份成功';break;
                    default:data.state[i].state = '未知状态';
                }
            })
            $.each(state,function(j,state){
                var task_time_trans = new Date(data.state[j].taskTime).toLocaleString();
                if(task_time_trans == '2017/12/19 上午12:00:00'){
                    data.state[j].taskTime = '2017/12/19 上午00:00:00';
                }else{
                    data.state[j].taskTime = task_time_trans;
                }
            })
            $("#getTasks").bootstrapTable('destroy').bootstrapTable({
                data: data.state,
                search:true,
                pagination:true,
                pageNumber:"1",
                pageSize: 10,
                showRerfesh:true,
                searchAlign:"left",
                uniqueId:"ID",
                clickToSelect: true,
                singleSelect: true,
                columns:[{
                    field:'taskTime',
                    title:'备份时间'
                },{
                    field:'state',
                    title:'备份状态'
                },{
                    field:'script',
                    title:'script'
                }]
            });
        })
    });
})

//选中文件的历史备份情况
$(function () {
    var userID = sessionStorage['userID'];
    $('#getTasks').on('click-row.bs.table', function (e, row, element) {
        $('.success').removeClass('success');//去除之前选中的行的，选中样式
        $(element).addClass('success');//添加当前选中的 success样式用于区别
        $("#link").hide();
        $("#currentFileAdress").html(row.newName);
    })
})



