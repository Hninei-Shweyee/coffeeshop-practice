var express = require('express');
var router = express.Router();
const connectionPool = require("../database/connectionPool");

/* GET /customer */
router.get('/', function(req, res) {
    res.send('Customer list');
    
});

/* POST /customer */
router.post('/', function(req, res) {
   // console.log("post body",req.body);
    connectionPool.getPool()
    .query("insert into customer set ?", req.body,(err,result)=>{
        if(err) throw err;
        console.log(result);
   
   });
  
});

module.exports = router;
