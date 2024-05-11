const express=require('express');
const path=require('path');
const app=express();

//setting up the parsers
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//setting up public static files
app.use(express.static(path.join(__dirname,'public')));
// console.log(path.join(__dirname+'/public')) 
// console.log(__dirname+'/public');
app.set('view engine','ejs');


app.get("/",function(req,res)
{
  res.render("index");
});

app.get("/author/:username",function(req,res)
{
  const temp=req.params.username;
  res.send(`${temp}`);
});

app.get("/author/:username/:age",function(req,res)
{
  res.send(`Name: ${req.params.username}  Age: ${req.params.age}`)
})

app.listen(3000,function()
{
  console.log("It is running....")
});