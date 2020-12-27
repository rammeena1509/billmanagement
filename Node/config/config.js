//var crypto= require('crypto').randomBytes(256).toString('hex');

var dbType = 'mongodb';
// var dbUrl = 'localhost';
var dbUrl = '<db url>';
var dbPort = '<db port>';
var dbName = '<db name>';

module.exports=
{
    uri:dbType+'://'+dbUrl+':'+dbPort+'/'+dbName,
    secret: "<app secret>",
    db: dbName,
    port:3000
}
