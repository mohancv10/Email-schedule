var sql = require("mssql");
var connect = function()
{
    var conn = new sql.ConnectionPool({
        server: "LAPTOP-71ECSG5V",
        port: 1433,
        user: "sa",
        password: "tech",
        database: "mydb",
        connectiontimeout: 150000,
        driver: "tedious",
        stream: false,
        options: {
            instanceName: "MSQLEXPRESS",
            encrypt: false
        } ,
        pool: {
            max: 15,
            min: 0,
            idle: 10000
        }
    });
    
 
    return conn;
};

module.exports = connect;