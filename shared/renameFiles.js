/**
 * Created by xingyongkang on 2016/11/23.
 */
var fs = require('fs');
var path = require('path');
console.log(__dirname);
var dirName = path.join("c:\\jsshop\\PNGs\\pokes");

//console.log(path.basename(baseName,".png"));
var files = fs.readdirSync(dirName);

for(var poke in files){
    var sourceFileFullName = path.join(dirName,files[poke]);

    var sName = path.basename(sourceFileFullName,'.png');
    var sstr = sName.substring(0,2);

    var num1 = 0;
    var num2 = 0;
    switch(sstr)
    {
        case "黑桃":
            num1 = 0;
            break;
        case "红心":
            num1 = 1;
            break;
        case "梅花":
            num1 = 2;
            break;
        case "方块":
            num1 = 3;
            break;
        case "大王":
            num1 = 4;
            num2 = 1;
            break;
        case "小王":
            num1 = 4;
            num2 = 0
            break;
    }

    var ssstr ;
    ssstr = sName.match('([0-9]|[AJQK])+');
    //console.log(ssstr);

    if(ssstr != null) {
        console.log(ssstr[0]);
        switch (ssstr[0]) {
            case "10":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                num2 = parseInt(ssstr[0])-1;
                break;
            case "J":
                num2 = 10;
                break;
            case "Q":
                num2 = 11;
                break;
            case "K":
                num2 = 12;
                break;
            case "A":
                num2 = 0;
                break;

        }

    }
   // console.log("result: "+num1 + "-"+ num2);
    var sname = (num1*13+ num2).toString() + ".png";
    var destineFileFullName = path.join(dirName, sname);
    console.log(sourceFileFullName);
    console.log(destineFileFullName);
    fs.renameSync(sourceFileFullName,destineFileFullName);
    /*
    fs.renameSync(sourceFileFullName,destineFileFullName,function(err,sourceFileFullName,destineFileFullName){
        if(err)
            console.log('err find')
        else
            console.log(sourceFileFullName+"->"+destineFileFullName);
    });
    */


}
