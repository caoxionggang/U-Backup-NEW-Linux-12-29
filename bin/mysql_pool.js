/**
 * Created by bluseayan on 17-12-1.
 */

var mysql = require('../web-server/node_modules/mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    port            : 3306,
    user            : 'root',
    password        : 'ubackup',
    database        :'ubackup'
});

module.exports = pool;