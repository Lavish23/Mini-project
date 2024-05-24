const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const userModel=require('./models/user')
const postModel=require('./models/post');
const upload=require('./config/multerconfig');
const path=require('path');


app.set('view engine','ejs');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//static
app.use(express.static(path.join(__dirname,'public')));





app.get("/",function(req,res)
{
  res.render("index");
})

app.get("/profile/upload",function(req,res)
{
  res.render("profileupload");
})


app.post("/upload",isLoggedIn,upload.single("image"),async function(req,res)
{
  // console.log(req.file);
  let user=await userModel.findOne({email:req.user.email});
  user.profilepic=req.file.filename;
  await user.save();
  res.redirect("/profile");

})


app.post("/create",async function(req,res)
{
  //if user email already exits message
  let {name,username,email,age,password}=req.body;
  let user=await userModel.findOne({email});
  if(user) return res.status(500).send("User already exists");

  bcrypt.genSalt(10,function(err,salt)
{
    bcrypt.hash(password,salt,async function(err,hash)
  {
    // console.log(hash);
    let user=await userModel.create({
      name,
      username,
      email,
      age,
      password:hash,
    });
    let token=jwt.sign({email:email,userid: user._id},"secret");
    res.cookie("token",token);
    // res.send(user);
    res.redirect("/profile");
  })
})

})

app.get("/login",function(req,res)
{
  res.render("login")
})

app.post("/login",async function(req,res)
{

  //if user email already exits message
  let {email,password}=req.body;
  let user=await userModel.findOne({email});
  if(!user) return res.status(500).send("Something went wrong..");

  bcrypt.compare(password,user.password,function(err,result)
{
  if(result) 
    {
      let token=jwt.sign({email:email,userid: user._id},"secret");
      res.cookie("token",token);
      res.status(409).redirect("/profile");
    }
  else res.redirect("/login");
})
  
})

app.get("/logout",function(req,res)
{
  res.cookie("token","");
  res.redirect("/login");
})

app.get("/profile",isLoggedIn,async function(req,res)
{
  let user=await userModel.findOne({email:req.user.email}).populate("posts");
  //  console.log(user);
  res.render("profile",{user});
})


app.post("/post",isLoggedIn,async function(req,res)
{
  let user=await userModel.findOne({email:req.user.email});
  let {content}=req.body;
  //now we need to create the post

  let post=await postModel.create({
    user:user._id, //post kon user daal rha hai
    content,   
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
  // console.log(req.body);
})

app.get("/like/:id",isLoggedIn,async function(req,res)
{
  let post=await postModel.findOne({_id:req.params.id}).populate("user");
  if(post.likes.indexOf(req.user.userid)===-1)
    {
      post.likes.push(req.user.userid);
    }
    else
    {
     post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }

  await post.save();
  res.redirect("/profile");
  // console.log(req.user);
})


app.get("/edit/:id",isLoggedIn,async function(req,res)
{
  let post=await postModel.findOne({_id:req.params.id}).populate("user");
  res.render("edit",{post});
})

app.post("/update/:id",isLoggedIn,async function(req,res)
{
  // console.log(req.body);
  let post=await postModel.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
  res.redirect("/profile");
})


//protected routes
function isLoggedIn(req,res,next)
{
  if(req.cookies.token==="") res.redirect("/login");
  else
  {
    //decrypting the token to get the data which was entered when we made the token
    let data=jwt.verify(req.cookies.token,"secret");
    // console.log(data);
    req.user=data;
  }
  next();
}


app.listen(3000,function(err)
{
  console.log("working..");
})