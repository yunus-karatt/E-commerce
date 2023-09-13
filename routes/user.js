var express = require('express');
var router = express.Router();
const userget= require('../controller/user-controller')

// session middleware
function isUserValid(req,res,next){
if(req.session.userLoggedIn){
  next()
}else{
  res.redirect('/login')
}
}

/* GET  */
router.get('/', function(req, res, next) {
  console.log(req.session.user)
  res.render('index', { title: 'Express',user:req.session.user});
  
});

router.get('/login',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
    res.render('user/login-page',{msg:req.session.userLogErr})
    req.session.userLogErr=false;
  }
})

router.get('/signup',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
    res.render('user/signup')
  }
  
})

router.get('/otplogin',(req,res)=>{
  if(req.session.userLoggedIn){
    res.redirect('/')
  }else{
    res.render('user/otplogin')
  }
  
})
router.get('/logout',(req,res)=>{
  req.session.user= null;
  req.session.userLoggedIn=false;
  res.redirect('/')
})
// POST
router.post('/signup',(req,res)=>{
userget.doSignup(req.body).then((user)=>{
  if(user){
     res.sendStatus(400)
  }
  else{
    res.sendStatus(200)
    // res.redirect('/')
  }
  
}).catch((error) => {
  // Handle errors here
  console.error('Signup error:', error);
  res.status(500).send('Internal Server Error'); // Send an error response
});
})
router.post('/login',(req,res)=>{
  userget.doLogin(req.body).then((response)=>{
    if(response.userLogErr){
      req.session.userLogErr=response.userLogErr
      res.redirect('/login');
     
    }else{
    req.session.user =response.user
    req.session.userLoggedIn=true
    res.redirect('/')
    }
  })
})
router.post('/otplogin',(req,res)=>{
  userget.doOtpLogin(req.body.mobilenumber).then((response)=>{
    // console.log(req.body.mobilenumber)
    // console.log(response)
    if(response){
      res.sendStatus(200)
    }else{
      res.sendStatus(400)
    }

  })
})
router.post('/createsession',(req,res)=>{
  console.log(req.body)
  userget.createSession(req.body).then((response)=>{
    req.session.user =response.user
    req.session.userLoggedIn=true
    res.redirect('/')
  })
})
router.post('/loginsession',(req,res)=>{
  userget.createLoginSession(req.body.mobilenumber).then((response)=>{
    req.session.user=response.user
    req.session.userLoggedIn= true
    res.redirect('/')
  })
})
module.exports = router; 
