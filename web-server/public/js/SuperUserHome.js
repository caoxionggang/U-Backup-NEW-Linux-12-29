/**
 * Created by admin on 2017/12/16.
 */
/**
 * Created by admin on 2017/11/2.
 */
/*SuperUserHome页面的一系列动作*/

var httpHost = location.href.replace(location.hash, '');

window.onload=function() {

    $(function () {  //启用页面中的所有的弹出框（popover）
        $("[data-toggle='popover']").popover();
    });

    $("#selectUser").on("click",function(){
        var userName = $("#selectUser").val();
        if(userName == '-- 请选择用户 --'){
            var userType = sessionStorage['userType'];
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
        }else{
            $.post(httpHost + '/../get_userID', {'userName': userName}, function (data) {
                var userID= data.userID[0].userID;
                $.post(httpHost + '/../get_FirstDropDownList', {'userID': userID}, function (data) {  //将获取的userid数据库比对，post请求与后台交互拿出此用户下的system,拿出数据后执行function
                    console.log(code.RETURNCODE.NOSYSTEM)
                    if (data.code === 517) {
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
            })
        }
    })
}