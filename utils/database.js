const mysql = require("mysql2");

const mysqlConnection = mysql.createConnection({
    host:"localhost",
    user: "root",
    port:"3306",
    database: "coffeeshopproject",
    password:"hesy123",
    multipleStatements:true
});

mysqlConnection.connect((err)=>{
    if(!err){
        console.log("Connected!");
    }else {
        console.log("Connection failed!",err.sqlMessage);
    }
    
});

module.exports = mysqlConnection;