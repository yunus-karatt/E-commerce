var express = require('express');
var router = express.Router();
const multer = require('multer');
const multerFunction = require('../helpers/helperFunction');
// const upload = multer({dest:"./public/images/uploads"})
const getAdmin = require('../controllers/adminController');
const getProduct = require('../controllers/productController');
const adminAuth = require('../middle ware/adminAuthMiddleware');


let admin = 1;



/* GET Admin listing. */
router.get('/', adminAuth.isValidate, function (req, res, next) {
  let adminData = req.session.admin
  getAdmin.getDashboardData()
  .then((dashData)=>{
    res.render('admin/Dashboard', { admin, adminData, dashData});

  })
  .catch((err)=>{
    next(err)
  })
});

router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin/')
  } else {
    res.render('admin/login', { admin, logginErr: req.session.logginErr })
    req.session.logginErr = false
  }
})

router.get('/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  req.session.admin = null
  res.redirect('/admin/login')
})

// Get user
router.get('/userslist', adminAuth.isValidate, (req, res) => {
  getAdmin.getUsersList()
    .then((userList) => {
      res.render('admin/userlist', { admin, userList })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// router.get('/userslist/:skip',(req,res)=>{
//   let skipLimit= req.params.skip
//   skipLimit= parseInt(skipLimit)
//   getAdmin.getUserOrderList(skipLimit)
//   .then((userList)=>{
//     res.render('admin/userlist', { admin, userList })
//   })
// })

router.get('/get-limited-user/:skip',adminAuth.isValidate, (req, res) => {
  const skip = req.params.skip;
  getAdmin.getLimitedUser(skip)
    .then((userList) => {
      res.json(userList)
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/search-user/:search',adminAuth.isValidate,(req, res) => {
  const searchQuery = req.params.search;
  // console.log(req.params.search)
  getAdmin.findUser(searchQuery)
    .then((userList) => {
      console.log(userList)
      res.json(userList)
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/blockuser/:id', adminAuth.isValidate, (req, res) => {
  getAdmin.blockUser(req.params.id)
    .then(() => {
      res.redirect('/admin/userslist')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// Get Category
router.get('/category', adminAuth.isValidate, (req, res) => {
  getProduct.getAllCategory()
    .then((findCat) => {
      res.render('admin/category', { admin, findCat })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/addcategory/', adminAuth.isValidate, (req, res) => {
  res.render('admin/addcategory', { admin })
})

router.get('/editcategory/:id', adminAuth.isValidate, (req, res) => {
  getProduct.getSinleCat(req.params.id).then((singleCat) => {
    res.render('admin/editcategory', { admin, singleCat })
  })
})

router.get('/listcategory/:id', adminAuth.isValidate, (req, res) => {
  getProduct.listCategory(req.params.id)
    .then(() => {
      res.redirect('/admin/category')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// GET Products
router.get('/products', adminAuth.isValidate, (req, res) => {
  getProduct.listProduct()
    .then((productData) => {
      res.render('admin/productlist', { admin, productData })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/addproduct',adminAuth.isValidate, (req, res) => {
  getProduct.getCategory()
    .then((findCat) => {
      res.render('admin/addproduct', { admin, findCat })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/deleteproduct/:id', adminAuth.isValidate, (req, res) => {
  getProduct.deleteProduct(req.params.id)
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/editproduct/:id',adminAuth.isValidate, async (req, res) => {
  try {
    const productData = await getProduct.getSinglePr(req.params.id)
    const productCat = await getProduct.getSinleCat(productData.Category)
    getProduct.getProductEditCategory(productCat)
      .then((findCat) => {
        res.render('admin/editproduct', { admin, productData, findCat, productCat })
      })
      .catch((error) => {
        res.status(500).send('An error occurred: ' + error.message);
      })
  }
  catch (err) {
    //     const productData= await getProduct.getSinglePr(req.params.id)
    //  const productCat = await getProduct.getSinleCat(productData.Category)
    //   getProduct.getProductEditCategory(productCat).then((findCat)=>{
    //     res.render('admin/editproduct',{admin,productData,findCat,productCat})
    //   })
  }

})

// orders
router.get('/get-orders', adminAuth.isValidate, (req, res) => {
  getAdmin.getOrderData()
    .then((orderData) => {
      res.render('admin/orders', { admin, orderData })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/manage-order/:orderId', adminAuth.isValidate, (req, res) => {
  const orderId = req.params.orderId;
  getAdmin.getManageOrder(orderId)
    .then((data) => {
      res.render('admin/manageOrder', { admin, data })
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.get('/update-order-status',adminAuth.isValidate, (req, res) => {
  const orderId = req.query.orderId
  const status = req.query.status
  getAdmin.updateOrderStatus(orderId, status)
    .then(() => {
      res.redirect(`/admin/manage-order/${orderId}`)
    })
})
// get sales report
router.get('/salesreport',adminAuth.isValidate,(req,res)=>{
  getAdmin.getSalesReport()
  .then((salesReport)=>{
    res.render('admin/salesReport',{admin,salesReport})
  })
  
})

router.get('/sales-report/:payment',adminAuth.isValidate,(req,res)=>{
  const paymentMethod= req.params.payment;
  getAdmin.getFilterSalesReport(paymentMethod)
  .then((salesReport)=>{
    res.json(salesReport)
  })
})

router.get('/dated-sales-report',adminAuth.isValidate,(req,res)=>{
  const startDate=req.query.startDate
  const endDate=req.query.endDate
  getAdmin.getDatedReport(startDate,endDate)
  .then((salesReport)=>{
    res.json(salesReport)
  })
})

router.get('/manage-coupon',(req,res)=>{
  getAdmin.getCoupon()
  .then(couponData=>res.render('admin/manageCoupon',{admin, couponData}))
  
})

// POST ROUTES
router.post('/login', (req, res) => {
  getAdmin.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      res.redirect('/admin/')
    } else {
      req.session.logginErr = response.logginErr
      res.redirect('/admin/login')
    }
  })
})

//post category
router.post('/addcategory', (req, res) => {
  getProduct.addCategory(req.body)
    .then(() => {
      res.redirect('/admin/category')
    })
    .catch((error) => {
      if (error.message == 'category exist') {
        res.render('admin/addcategory', { err: 'category already exist' })
      } else {
        res.status(500).send('An error occurred: ' + error.message);
      }

    })
})

router.post('/editcategory/:id', (req, res) => {
  getProduct.updateCategory(req.params.id, req.body)
    .then(() => {
      res.redirect('/admin/category')
    })
    .catch((error) => {
      res.status(500).send('An error occurred: ' + error.message);
    })
})

// post products
router.post('/addproduct', multerFunction.upload.fields([
  { name: 'productMainImages' },
  { name: 'productImages' }
]), (req, res) => {
  getProduct.addProduct(req.body, req.files)
    .then(() => {
      res.json({ success: true })
    })
    .catch((error) => {
      console.log(error)
      res.status(500).send('An error occurred: ' + error.message);
    })
})

router.post('/editproduct/:id', (req, res) => {
  getProduct.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/products')
  })
})

router.post('/change-main-image', multerFunction.upload.fields([{ name: 'mainIMageChange' }]), (req, res) => {
  const existFileName = req.body;
  const newImage = req.files;
  getProduct.changeMainImage(existFileName,newImage)
  .then(()=>{
    res.json({updated:true})
  })
  .catch((err)=>{
    console.log(err)
  })
})

router.post('/add-image', multerFunction.upload.fields([{ name: 'addNewImageInput' }]),(req,res)=>{
  console.log(req.body)
  const productId=req.body.addProductId
  const newImage=req.files
  getProduct.addNewImage(productId,newImage)
  .then((resolve)=>{
    res.json({updated:true})
  })
  .catch(err=>console.log(err))
})

router.post('/create-coupon',(req,res)=>{
  const formData=req.body
getAdmin.createCoupon(formData)
.then(()=>res.json({created:true}))
})

// router.post('/update-order-status', (req, res) => {
//   const orderUpdate = req.body.mngOrderData;
//   getAdmin.updateOrderStatus(orderUpdate)
//     .then(() => {
//       res.json({ updated: true })
//     })
//     .catch((error) => {
//       res.status(500).send('An error occurred: ' + error.message);
//     })
// })

router.put('/delete-product-image/:productId/:ImageData', (req, res) => {
  const productId = req.params.productId
  const imageData = req.params.ImageData
  getProduct.deleteImage(productId, imageData)
    .then(() => res.json({ updated: true }))
})

module.exports = router;
