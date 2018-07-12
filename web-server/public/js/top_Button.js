/**
 * Created by admin on 2017/11/3.
 */
//取出已经存储在本地的数据
var sessionStorage = window.sessionStorage;

//通1过本地用户名、密码、token和用户ID的存储与否，来判断用户是否已经登录。若本地存储缺少其中一项，则跳转登录页面先进行登录。
if (sessionStorage['userName'] == null) {
    console.log('no user name');
    window.location.href = '/login.html'
} else {
    username = sessionStorage['userName'];
    console.log("userName = " + username);
    $('#userName').text("欢迎你" + username);  //将本地存储地用户名显示在顶栏
}
if (sessionStorage['token'] == null) {
    console.log('no token');
    window.location.href = '/login.html'
} else {
    token = sessionStorage['token'];
    console.log("token = " + token);
}
if (sessionStorage['userType'] == null) {
    console.log('no user type');
    window.location.href = '/login.html'
} else if(sessionStorage['userType'] == 88){
    userType = sessionStorage['userType'];
    $("#userSelected").show();
    console.log("userType = " + userType);
} else {
    userType = sessionStorage['userType'];
    console.log("userType = " + userType);
}
if (sessionStorage['userID'] == null) {
    console.log('no userID');
    window.location.href = '/login.html';
} else {
    userID = sessionStorage['userID'];
    console.log("userID = " + userID);
}

/********************************************************************顶部按钮**************************************************************************/
//顶部的主页按钮
$('#home').on('click', function () {
    window.open("/UserHome.html",'_self');
}).css("cursor", "pointer");

//顶部的‘设置任务’按钮
$("#setup").on('click', function () {
    window.open("/Setup.html",'_blank');
}).css("cursor", "pointer");

//顶部的‘修改密码’按钮
$("#userPasswordModify").on('click', function () {
    window.open("/modifyPass.html",'_blank');
}).css("cursor", "pointer");

//顶部栏的‘监控任务’按钮
$("#supervise_task").on('click',function(){
    window.open("/show_tasks.html",'_self');
}).css("cursor", "pointer");

//顶部栏的退出框效果
$('#top_bar3').on('click', function () {
    $('#Out').show();
    $('#YesOut').on('click', function () {
        window.sessionStorage.removeItem('userName');
        window.sessionStorage.removeItem('passWord');
        window.sessionStorage.removeItem('token');
        window.sessionStorage.removeItem('userType');
        window.sessionStorage.removeItem('userID');
        window.location.href = '/logout.html';
    });
    $('#NoOut').on('click', function () {
        $('#Out').hide();
    }).css("cursor", "pointer");
}).css("cursor", "pointer");