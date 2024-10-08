
const express = require ("express");
const bodyParser = require ("body-parser");
const qbRoutes = require("./routes/qb");

const app = express();

//adding middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(qbRoutes);
app.set('view engine','ejs');
//incoming req as strings or arrays
app.use(express.urlencoded({extended:true}));//posting data to server (req.body)
app.use(express.static('views')); //for UI


app.get("/ordertable/",(req,res)=>{
  // console.log("Res from route",res);
  res.render('index',{title:'Orders 🧑💘',ordertable: res});
});

app.get("/",(req,res)=>{
    res.redirect('/ordertable/');
  });

  app.get("/searchingOrder/",(req,res)=>{
    
    res.render('searchOrder',{ title:'Search Order 💰 ',searching:res});
   
  })
  
app.use((req,res) => {
    console.log("404");
    res.status(404);
    res.render('404',{ title:'404'});
 })
app.listen(5000);