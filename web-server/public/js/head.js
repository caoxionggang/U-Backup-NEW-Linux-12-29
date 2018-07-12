/**
 * Created by admin on 2017/11/6.
 */

//<!--顶部栏目-->
document.writeln("<div class=\"navbar navbar-fixed-top\" style=\"float:left;\">");
document.writeln("    <img src=\"img/head1.gif\" alt=\"head\" style=\"width:100%;height:120px;\">");
document.writeln("    <div style=\"margin-left:50px;margin-top:-120px;font-size:100px\"><i>U-BACKUP</i><span style=\"font-size:50px;\">  管理系统</span></div>");
document.writeln("    <div class=\"navbar-inner\" style=\"background:black;margin-top:-25px\">");
document.writeln("        <div class=\"container\">");
document.writeln("            <div class=\"nav-collapse\" ><br/>");
document.writeln("                <p id=\"userName\" style=\"float:left;margin:0 30px;color:#00bcf2\"></p>");
document.writeln("                <p id=\"home\" style=\"float:left;margin-right:30px;color:#00bcf2\">设备信息维护</p>");
document.writeln("                <p id=\"setup\" style=\"float:left;margin-right:30px;color:#00bcf2\">设置备份策略</p>");
document.writeln("                <p id=\"supervise_task\" style=\"float:left;color:#00bcf2\">系统实时监控</p>");
document.writeln("                <button type=\"button\" id=\"top_bar3\" style=\"float:right;color:#00bcf2;background:black;border:0\">注销</button>");
document.writeln("            </div>");
document.writeln("        </div>");
document.writeln("    </div>");
document.writeln("</div>");

//<!--退出确认框（隐含）,需点击显示-->
document.writeln("<div id=\'Out\' style=\"height:100px;width:200px;background-color:#0c84e4;margin-left:80%;margin-top:75px;display:none;position:absolute;\">");
document.writeln("    <div style=\"text-align: center;margin-top:2px;\"><img src=\"./img/head.jpg\" height=\"20\" width=\"20\"></div>");
document.writeln("    <div><p style=\"text-align:center;margin:8px;color:white\">确认退出？</p></div>");
document.writeln("    <div>");
document.writeln("        <div><div><button id=\"YesOut\" style=\"float:left;margin:0 25px;\">确定</button></div>");
document.writeln("        <div><button id=\"NoOut\" style=\"float:right;margin:0 25px;\">取消</button></div>");
document.writeln("    </div>");
document.writeln("</div>");

/*<div id='Out' style="height:100px;width:200px;background-color:#0c84e4;margin-left:80%;margin-top:75px;display:none;position:absolute;z-index:1">
    <div style="text-align: center;margin-top:2px;"><img src="./img/head.jpg" height="20" width="20"></div>
    <div><p style="text-align:center;margin:8px;color:white">确认退出？</p></div>
    <div>
        <div><button id="YesOut" style="float:left;margin:0 25px;">确定</button></div>
        <div><button id="NoOut" style="float:right;margin:0 25px;">取消</button></div>
    </div>
</div>*/
