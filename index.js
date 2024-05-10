const express=require('express');
const app=express();

//setting up the parsers
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.get("/",function(req,res)
{
  res.send("chal rha hai");
});

app.listen(3000,function()
{
  console.log("It is running")
});