/**
 * Created by cao on 17-12-26.
 */


function encrypt(pass) {
    var a = pass;
    var ascii ='';
    for(var i=0;i<a.length;i++){
        var b = a[i].charCodeAt() * 7;
        ascii = ascii + b.toString();
    }
    return ascii;
}
//console.log(encrypt('At'))

function decrypt(pass1){
    var c = pass1.toString();
    var pass = '';
    for(var j=0;j<c.length/3;j++){
        var d = String.fromCharCode((c.substring(3*j,3*(j+1))/7));
        pass = pass + d;
    }
    return pass;
}
//console.log(decrypt(encrypt('At')));