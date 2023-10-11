var express = require('express');
var router = express.Router();
const userget = require('../controllers/userController');
const getProduct = require('../controllers/productController');
const otp = require('../helpers/nodemailer');
const userAuth = require('../middle ware/userAuthMiddleware');
const nocache = require('nocache');

/* GET login,signup */
router.get('/', async function (req, res, next) {
  res.render('user/Homepage', { user: req.session.user });
});

router.get('/login', nocache(), (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login-page', { msg: req.session.userLogErr })
    req.session.userLogErr = false;
  }
})

router.get('/signup', nocache(), (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/signup')
  }
})

router.get('/otplogin', nocache(), (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  } else {
    res.render('user/otplogin')
  }
})

router.get('/logout', nocache(), (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect('/')
})

// Get products
router.get('/viewproduct/:id', (req, res) => {
  getProduct.viewproduct(req.params.id)
    .then((product) => {
      res.render('user/product-view', { product })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// wish list
router.get('/api/wishlist', userAuth.isUserValid, (req, res) => {
  if (req.session.user) {
    userget.getWishLish(req.session.user)
      .then((wishListData) => {
        if (wishListData.length > 0) {
          res.json(wishListData)
        } else {
          res.json([])
        }

      })
      .catch((error) => {
        res.status(500).send('An error occurred: ' + error.message);
      })
  } else {
    res.json([])
  }
})

router.get('/wishlist', userAuth.isUserValid, (req, res) => {
  userget.getWishListData(req.session.user)
    .then((wishListData) => {
      console.log(wishListData)
      res.render('user/wishList', { wishListData })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// get about us
router.get('/aboutus', (req, res) => {
  res.render('user/aboutUs')
})

// CONTACT US
router.get('/contactus', (req, res) => {
  res.render('user/contactus')
})

// cart
router.get('/viewcart', userAuth.isUserValid, (req, res) => {
  userget.getCart(req.session.user._id)
    .then((cartData) => {
      res.render('user/cart', { cartData })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// CHECKOUT
router.get('/checkout', userAuth.isUserValid, (req, res) => {
  const userId = req.session.user._id;
  Promise.all([userget.getAddress(userId), userget.getCart(userId), userget.getWallet(userId)])
    .then(([userAddress, cartData, wallet]) => {
      res.render('user/checkout', { userAddress, cartData, wallet, isCheckoutPage: true });
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// profiele
router.get('/myprofile', userAuth.isUserValid, async (req, res) => {
  const userId = req.session.user._id
  try {
    const userData = await userget.getUser(userId)
    res.render('user/userProfile', { userData })
  }
  catch (err) {
    res.status(500).send('An error occurred: ' + error.message);
  }

})

// Address
router.get('/manageaddress', userAuth.isUserValid, (req, res) => {
  const userId = req.session.user._id
  userget.getAddress(userId)
    .then((userAddress) => {
      res.render('user/addressManage', { userAddress })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})
router.get('/addaddress', userAuth.isUserValid, (req, res) => {
  res.render('user/addNewAddress')
})

router.get('/updateaddress/:id', userAuth.isUserValid, (req, res) => {
  const addressId = req.params.id
  userget.singleAddress(addressId)
    .then((address) => {
      res.render('user/addressEdit', { address })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/forgott-password', (req, res) => {
  res.render('user/forgottPassword')
})

router.get('/view-order', userAuth.isUserValid, async (req, res) => {
  const userId = req.session.user._id
  userget.getOrder(userId)
    .then((orderData) => {

      res.render('user/view-order', { orderData })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})
// ORDER 

router.get('/view-order-details/:id', userAuth.isUserValid, async (req, res) => {
  const orderId = req.params.id;
  try {
    const orderData = await userget.getSingleOrder(orderId)
    res.render('user/orderDetails', { orderData })
  }
  catch (err) {

  }

})

router.get('/cancel-single-order/:orderid/:productid', userAuth.isUserValid, (req, res) => {
  const orderId = req.params.orderid;
  const productId = req.params.productid;
  userget.cancelOrder(orderId, productId)
    .then(() => {
      res.redirect('/view-order-details/' + orderId)
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// router.get('/cancel-order/:id', userAuth.isUserValid, (req, res) => {
//   const orderId = req.params.id
//   userget.cancelAllOrder(orderId)
//     .then(() => {
//       res.redirect('/view-order')
//     })
//     .catch((error) => {
//       res.status(500).send('An error occurred: ' + error.message);
//     })
// })

router.get('/category', (req, res) => {
  const category = req.query.category
  getProduct.getProductByCat(category)
    .then((prodData) => {
      res.render('user/listbycat', { prodData, user: req.session.user })

    })
})

router.get('/categroy-filter', (req, res) => {
  const catId = req.query.category
  const filterValues = req.query.values.split(',')
  const sort = req.query.sort;
  getProduct.getFilteredProd(catId, filterValues, sort)
    .then((prodData) => {
      res.json(prodData)
    })
})

router.get('/search-filter', (req, res) => {
  const search = req.query.search;
  const filterValues = req.query.values.split(',');
  const sort = req.query.sort;
  getProduct.getFilteredSearchProd(search, filterValues, sort)
    .then((prodData) => res.json(prodData))
})

router.get('/api/products', async (req, res) => {
  const pageNumber = req.query.page
  const user = req.session.user
  let wishData;
  if (user) {
    wishData = await userget.getWishLish(user)
  }
  getProduct.getLimitedProduct(pageNumber)
    .then((response) => {

      if (wishData&&wishData.length !== 0) {
        const wishListProductIds = new Set(wishData[0].productId.map(String));
        response.forEach((product) => {

          if (wishListProductIds.has(String(product._id))) {
            product.isInWishList = true;
          } else {
            product.isInWishList = false;
          }

        })
        res.json({ response, user: req.session.user })
      } else {
        res.json({ response, user: req.session.user })

      }
    })
})

router.get('/search', (req, res) => {
  const search = req.query.search
  getProduct.searchProduct(search)
    .then(response => {
      res.render('user/listbycat', { prodData: response, search: true })
    })
})

router.get('/getCoupons', (req, res) => {
  userget.getCoupons()
    .then(couponData => res.json(couponData))
})

router.get('/wallet', userAuth.isUserValid, (req, res) => {
  Promise.all([userget.getWallet(req.session.user._id),userget.getWalletHistory(req.session.user._id)])
  .then(([wallet,walletHistory])=>{
    res.render('user/wallet',{wallet,walletHistory})
  })
}) 

router.get('/topup-wallet/:amount',(req,res)=>{
  const amount=req.params.amount
  userget.topupWallet(amount)
  .then((response)=>res.json(response))
})

// router.get('/sort-by-price',(req,res)=>{
//   const catId= req.query.category
//   const minPrice= req.query.minprice
//   const maxPrice=req.query.maxprice
//   getProduct.getSortedProduct(catId,minPrice,maxPrice)
//   .then((response)=>{
//     res.json(response)
//   })
// })

// router.get('/sort-product',(req,res)=>{
//   const catId= req.query.catid
//   const sortBy=req.query.sort

//   getProduct.sortProduct(catId,sortBy)

// })
// POST
router.post('/signup', (req, res) => {
  userget.doSignup(req.body)
    .then((user) => {
      if (user) {
        res.sendStatus(400)
      }
      else {
        res.sendStatus(200)
      }
    }).catch((error) => {
      res.status(500).send('Internal Server Error');
    });
})

router.post('/login', (req, res) => {
  userget.doLogin(req.body)
    .then((response) => {
      if (response.userLogErr) {
        req.session.userLogErr = response.userLogErr
        res.redirect('/login');
      } else {
        req.session.user = response.user
        req.session.userLoggedIn = true
        res.redirect('/')
      }
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/otplogin', (req, res) => {
  userget.doOtpLogin(req.body.mobilenumber)
    .then((response) => {
      if (response) {
        res.sendStatus(200)
      } else {
        res.sendStatus(400)
      }
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/createsession', (req, res) => {
  userget.createSession(req.body)
    .then((response) => {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/loginsession', (req, res) => {
  userget.createLoginSession(req.body.mobilenumber)
    .then((response) => {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// WISH LIST
router.post('/api/wishlist', (req, res) => {
  userget.wishListFn(req.body)
    .then(() => {
      res.send()
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// CART
router.post('/api/addcart', (req, res) => {
  if (req.session.user) {
    const productId = req.body.productId
    const userId = req.session.user._id
    userget.addToCart(userId, productId)
      .then(() => {
        res.json({ loggedIn: true })
      })
      .catch((error) => {
        res.status(500).send('An error occurred: ' + error.message);
      })
    // .catch(() => {
    //   res.json({ stock: false })
    // })
  } else {
    res.json({ loggedIn: false })
  }
})

router.post('/update-cart', userAuth.isUserValid, (req, res) => {
  const userId = req.session.user._id;
  const productId = req.body.productId;
  const count = req.body.count
  const existCount = req.body.existCount
  userget.updateCart(userId, productId, count, existCount)
    .then((response) => {
      console.log(response)
      if (response) {
        res.json({ response })
      } else {
        res.json({ updated: true })
      }
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// post address
router.post('/addaddress', userAuth.isUserValid, (req, res) => {
  const userId = req.session.user._id;
  let address;
  if (req.body.checkOutAddData) {
    address = req.body.checkOutAddData
  } else {
    address = req.body;
  }

  const redirect = req.body.redirect;
  userget.addAddress(userId, address)
    .then((addressId) => {
      if (redirect) {
        res.redirect('/manageaddress')
      } else {
        res.json({ addressId })
      }
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/updateaddress/:id', (req, res) => {
  const addressId = req.params.id
  const addressData = req.body
  userget.updateAddress(addressId, addressData)
    .then(() => {
      res.redirect('/manageaddress')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// update address
router.post('/update-profile', (req, res) => {
  const userId = req.session.user._id
  userget.updateProfile(userId, req.body.updateData)
    .then(() => {
      res.json({ update: true })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// CHANGE NUMBER
router.post('/change-number', (req, res) => {
  const mobileNum = req.body.mobileNumber
  const userId = req.session.user._id
  userget.updateMobile(userId, mobileNum)
    .then((response) => {
      res.json({ updated: true })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/check-mobile-exists', (req, res) => {
  const mobileNumber = req.body.mobileNumber
  userget.checkMobileExist(mobileNumber)
    .then((user) => {
      res.json({ user })
    }).catch((err) => {
      console.log(err)
    })
})

// change password
router.post('/change-password', (req, res) => {
  userget.changePassword(req.body)
    .then(() => {
      res.json({ updated: true })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// changepassword
router.post('/send-emial-otp', (req, res) => {
  const email = req.body.email
  const emailotp = otp.sentOtp(email)
  req.session.otp = emailotp
  res.json({ otp: true })
})

router.post('/confirm-otp', (req, res) => {
  const mailOtp = req.body.otp
  if (req.session.otp == mailOtp) {
    res.json({ otpVerified: true })
  } else {
    res.json({ otpVerified: false })
  }
})

router.post('/place-order', (req, res) => {
  const userId = req.session.user._id;
  const orderData = req.body.orderData;

  userget.placeOrder(userId, orderData)
    .then((status) => {
      if (status.status === 'cod') {
        res.json({ status })
      } else {
        status.method = 'online'
        res.json({ status })
      }

    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/verify-payment', (req, res) => {
  const userId = req.session.user._id
  const paymentData = req.body
  userget.paymentVerification(paymentData)
    .then(() => {
      userget.changeOrderStatus(paymentData.order, userId)
        .then((orderId) => {
          res.json({ updated: true, orderId })
        })
        .catch((err) => {
          console.log(err)
        })
    })

})

router.post('/verify-topup-payment',(req,res)=>{
  const userId = req.session.user._id
  const paymentData = req.body
  const topUpAmount=paymentData.order.amount/100
  userget.paymentVerification(paymentData)
  .then(()=>{
    userget.updateWallet(userId,topUpAmount)
    .then(()=>res.json({updated:true}))
  })
  .catch((err)=>console.log(err))
})

// router.post('/search', async(req, res) => {
//   const search = req.body.searchInput
//   const user = req.session.user
//   let wishData;
//   if(user){
//        wishData = await userget.getWishLish(user)
//   }
//   getProduct.searchProduct(search)
//     .then((response) => {
//       if (wishData) {
//         const wishListProductIds = new Set(wishData[0].productId.map(String));
//         response.forEach((product) => {

//           if (wishListProductIds.has(String(product._id))) {
//             product.isInWishList = true; 
//           } else {
//             product.isInWishList = false; 
//           }

//         })
//         res.render('user/search', { prodData: response })
//       } else {
//         res.render('user/search', { prodData: response })

//       }
//     })
//   // getProduct.searchProduct(search)
//   //   .then((response) => {
//   //     res.render('user/search', { prodData: response })
//   //   })
// })

// CANCELL ORDER
router.post('/cancel-order', userAuth.isUserValid, (req, res) => {
  const orderId = req.body.orderId;
  const reason = req.body.userInput;
  const paymentMethod = req.body.paymentMethod
  const userId = req.session.user._id
  userget.cancelAllOrder(orderId, reason, paymentMethod, userId)
    .then(() => {
      res.redirect('/view-order')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})


// DELETE
// delete wishlist
router.delete('/wishlist', (req, res) => {
  wishData = req.body
  userget.deleteWishlist(wishData)
    .then(() => {
      res.send()
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// Remove cart item
router.delete('/removecart', (req, res) => {
  const productId = req.body
  const userId = req.session.user._id
  userget.removeCartItem(productId, userId)
    .then(() => {
      res.send()
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// remove addess
router.delete('/deleteAddress', (req, res) => {
  const addressId = req.body
  userget.deleteAddress(addressId)
    .then(() => {
      res.send()
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})


// PUT methods
// update address

module.exports = router; 
