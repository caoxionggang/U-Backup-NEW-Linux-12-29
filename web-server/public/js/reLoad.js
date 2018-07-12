/**
 * Created by admin on 2017/12/22.
 */

//系统表刷新
function reLoadSystem(systems){
    $("#getSystems").bootstrapTable('destroy').bootstrapTable({
        data:systems,
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
            field:'systemName',
            title:'系统名称'
        },{
            field:'systemDescribe',
            title:'系统描述'
        },{
            field:'frequency',
            title:'当前备份策略',
        }]
    });
}

//设备表刷新
function reLoadDevice(devices){
    $("#getDevices").bootstrapTable('destroy').bootstrapTable({
        data:devices,
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
}

//刷新文件表
function reLoadFile(files){
    $("#getFiles").bootstrapTable('destroy').bootstrapTable({
        data:files,
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
            field:'filename',
            title:'文件名称'
        },{
            field:'fileDescribe',
            title:'文件描述'
        },{
            field:'remotePath',
            title:'远程地址'
        },{
            field:'routeCommand',
            title:'路由命令'
        },{
            field:'identifyKeywords',
            title:'路由关键字'
        }]
    });
}