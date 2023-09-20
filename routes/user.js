var express = require('express');
var router = express.Router();
const userget = require('../controllers/userController')
const getProduct = require('../controllers/productController')
// session middleware
function isUserValid(req, res, next) {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET login,signup */
router.get('/', function (req, res, next) {
  getProduct.listProduct().then((prodData)=>{
    res.render('user/Homepage',{prodData,user:req.session.user});
  })
  
});

router.get('/login', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login-page', { msg: req.session.userLogErr })
    req.session.userLogErr = false;
  }
})

router.get('/signup', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/signup')
  }
})

router.get('/otplogin', (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/otplogin')
  }
})

router.get('/logout', (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/')
})
// Get products
router.get('/viewproduct/:id',(req,res)=>{
  getProduct.viewproduct(req.params.id).then((product)=>{
    res.render('user/product-view',{product})
  })  
})
// wish list
router.get('/api/wishlist',(req,res)=>{
  if(req.session.user){
    userget.getWishLish(req.session.user).then((wishListData)=>{
      if(wishListData.length>0){
        res.json(wishListData)
      }else{
        res.json([])
      }
      
    })
  }else{
    res.json([])
  }
 
})

router.get('/wishlist',(req,res)=>{
  userget.getWishListData(req.session.user).then((wishListData)=>{
    res.render('user/wishList',{wishListData})
  })
})
// get about us
router.get('/aboutus',(req,res)=>{
  res.render('user/aboutUs')
})
// CONTACT US
router.get('/contactus',(req,res)=>{
  res.render('user/contactus')
})

// cart
router.get('/viewcart',isUserValid,(req,res)=>{
  userget.getCart(req.session.user._id).then((cartData)=>{
    res.render('user/cart',{cartData})
  })
})
// profiele
router.get('/myprofile',isUserValid,async(req,res)=>{
  const userId= req.session.user._id
 const userData=await userget.getUser(userId)
 console.log(userData)
  res.render('user/userProfile',{userData})
})

// Address
router.get('/manageaddress',isUserValid,(req,res)=>{
  const userId= req.session.user._id
  userget.getAddress(userId).then((userAddress)=>{
    res.render('user/addressManage',{userAddress})
  })
  
})
router.get('/addaddress',isUserValid,(req,res)=>{
  res.render('user/addNewAddress')
})

router.get('/updateaddress/:id',isUserValid,(req,res)=>{
  const addressId=req.params.id
  userget.singleAddress(addressId).then((address)=>{
   res.render('user/addressEdit',{address})
  })
})
// POST
router.post('/signup', (req, res) => {
  userget.doSignup(req.body).then((user) => {
    if (user) {
      res.sendStatus(400)
    }
    else {
      res.sendStatus(200)
    }
  }).catch((error) => {
    console.error('Signup error:', error);
    res.status(500).send('Internal Server Error');
  });
})

router.post('/login', (req, res) => {
  userget.doLogin(req.body).then((response) => {
    if (response.userLogErr) {
      req.session.userLogErr = response.userLogErr
      res.redirect('/login');
    } else {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
  })
})

router.post('/otplogin', (req, res) => {
  userget.doOtpLogin(req.body.mobilenumber).then((response) => {
    if (response) {
      res.sendStatus(200)
    } else {
      res.sendStatus(400)
    }
  })
})

router.post('/createsession', (req, res) => {
  userget.createSession(req.body).then((response) => {
    req.session.user = response.user
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})

router.post('/loginsession', (req, res) => {
  userget.createLoginSession(req.body.mobilenumber).then((response) => {
    req.session.user = response.user
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})

// WISH LIST
router.post('/api/wishlist',(req,res)=>{
  userget.wishListFn(req.body).then(()=>{
    res.send()
  })
})
// CART
router.post('/api/addcart',(req,res)=>{
  if(req.session.user){
    const productId= req.body.productId
    const userId = req.session.user._id
    console.log(productId,userId)
    userget.addToCart(userId,productId).then(()=>{
      res.json({loggedIn:true})
    })
  }else{
    res.json({loggedIn:false})
  }
})
// post address
router.post('/addaddress',isUserValid,(req,res)=>{
  const userId= req.session.user._id;
  const address= req.body;
  userget.addAddress(userId,address)
  res.redirect('/manageaddress')
})

router.post('/updateaddress/:id',(req,res)=>{
  const addressId=req.params.id
  const addressData= req.body
  userget.updateAddress(addressId,addressData).then(()=>{
    res.redirect('/manageaddress')
  })
})
// update address
router.post('/update-profile',(req,res)=>{
  const userId= req.session.user._id
 userget.updateProfile(userId,req.body.updateData).then(()=>{
  res.json({update:true})
 })
})

// DELETE
// delete wishlist
router.delete('/wishlist',(req,res)=>{
  wishData= req.body
  userget.deleteWishlist(wishData).then(()=>{
    res.send()
  })
})

// Remove cart item
router.delete('/removecart',(req,res)=>{
 const productId= req.body
 const userId= req.session.user._id
 userget.removeCartItem(productId,userId).then(()=>{
  res.send()
 })
})

// remove addess
router.delete('/deleteAddress',(req,res)=>{
  const addressId= req.body
  userget.deleteAddress(addressId).then(()=>{
    res.send()
  })
})


// PUT methods
// update address

module.exports = router; 
