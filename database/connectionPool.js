const mysql = require("mysql");
const dbconfig=require("../database/dbconfig");
const connectionPool ={

    pool: null,

    init: function(){
        this.pool=mysql.createPool(dbconfig);
    },
    getPool: function(){
        return this.pool;
    },
};
module.exports=connectionPool;