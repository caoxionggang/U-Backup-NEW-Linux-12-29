/**
 * Created by admin on 2017/12/16.
 */
/**
 * Created by admin on 2017/12/14.
 */

//刚进入页面时，自动显示出所有用户的所有系统
$.post(httpHost + '/../get_AllSystems', {'userType': userType}, function (data) {  //将获取的userid数据库比对，post请求与后台交互拿出此用户下的system,拿出数据后执行function
    if (data.code === code.RETURNCODE.NOSYSTEM) {
        console.log("There is no system in this user!");
        $("#getSystems").bootstrapTable('destroy');
        return;
    } else if(data.code === code.RETURNCODE.OK){
        var systems = data.systems; //systemName值为json数组
        $(function(){   //页面加载自动触发函数
            reLoadSystem(systems);
        })
    }else if(data.code === code.RETURNCODE.DBERROR){
        layer.msg("访问数据库出错，请稍候重试或者刷新页面!");
        console.log("access database error!")
    }
})

//超级用户下的下拉框选择用户
$(function(){
    var userName = window.sessionStorage['userName'];
    $.post(httpHost + '/../get_UserList', {'userType': userType}, function (data) {
        var user = data.users;
        for(var i=0;i<user.length;i++){
            var userName = user[i].username;
            var systemElement = $(document.createElement("option"));
            systemElement.attr("value", userName);
            systemElement.text(userName);
            $("#selectUser").append(systemElement);
        }
    })
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
        $("#currentSystem").text(systemName);
        $("#currentSystemID").text(systemID);
        $.post(httpHost + '/../get_SecondDropDownList', {'systemID': systemID}, function (data) {
            if (data.code === 507) {
                console.log("There is no device in this system!");
                $("#getDevices").bootstrapTable('destroy');
                $("#getFiles").bootstrapTable('destroy');
                return;
            }else if(data.code === code.RETURNCODE.OK){
                var deviceName = data.deviceName; //deviceName值为json数组
                $(function(){   //页面加载自动触发函数
                    $("#getFiles").bootstrapTable('destroy');
                    $("#getDevices").bootstrapTable('destroy').bootstrapTable({
                        data:deviceName,
                        pagination:true,
                        search:true,
                        searchAlign:'left',
                        pageNumber:"1",
                        pageSize: 10,
                        showRerfesh:true,
                        uniqueId:"ID",
                        clickToSelect: true,
                        singleSelect: true,
                        columns:[{
                            field:'deviceName',
                            title:'设备名称'
                        },{
                            field:'deviceDescribe',
                            title:'设备描述'
                        },{
                            field:'deviceType',
                            title:'设备类型'
                        },{
                            field:'ip',
                            title:'设备IP'
                        },{
                            field:'devicePort',
                            title:'设备端口'
                        },{
                            field:'deviceUsername',
                            title:'设备用户名'
                        }]
                    });
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
        if(row.deviceType == 0){
            deviceType = "主机";
        }else if(row.deviceType == 1){
            deviceType = "路由器";
        }
        var deviceID = row.deviceID;
        $("#currentDevice").text(deviceName);
        $("#deviceType").text(deviceType);
        $("#currentDeviceID").text(deviceID);
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
        $("#fileName").text(row.filename);
        $("#noFile").hide();
        $("#Filetest").attr("disabled",false);
        $('.success').removeClass('success');//去除之前选中的行的，选中样式
        $(element).addClass('success');//添加当前选中的 success样式用于区别
        var fileID = $("#currentFileID").text();
        $("#link").hide();
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