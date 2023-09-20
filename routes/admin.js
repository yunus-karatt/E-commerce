var express = require('express');
var router = express.Router();
const multer = require('multer')
const multerFunction = require('../helpers/helperFunction')
// const upload = multer({dest:"./public/images/uploads"})

const getAdmin = require('../controllers/adminController')
const getProduct = require('../controllers/productController')

let admin = 1;

// session checking middlewar
function isValidate(req, res, next) {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET Admin listing. */
router.get('/', isValidate, function (req, res, next) {
  let adminData = req.session.admin
  res.render('admin/Dashboard', { admin, adminData });
});

router.get('/login',(req, res) => {
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
router.get('/userslist',isValidate, (req, res) => {
  getAdmin.getUsersList().then((userList) => {
    res.render('admin/userlist', { admin, userList })

  })
})

router.get('/blockuser/:id',isValidate, (req, res) => {
  getAdmin.blockUser(req.params.id).then(() => {
    res.redirect('/admin/userslist')
  })
})

// Get Category
router.get('/category', isValidate,(req, res) => {
  getProduct.getAllCategory().then((findCat) => {
    res.render('admin/category', { admin, findCat })
  })
})

router.get('/addcategory/',isValidate, (req, res) => {
  res.render('admin/addcategory', { admin })
})

router.get('/editcategory/:id',isValidate, (req, res) => {
  getProduct.getSinleCat(req.params.id).then((singleCat) => {
    res.render('admin/editcategory', { admin, singleCat })
  })
})

router.get('/listcategory/:id',isValidate, (req, res) => {
  getProduct.listCategory(req.params.id).then(() => {
    res.redirect('/admin/category')
  })
})

// GET Products
router.get('/products',isValidate, (req, res) => {
  getProduct.listProduct().then((productData)=>{
    res.render('admin/productlist', { admin,productData})
  })


})

router.get('/addproduct',isValidate, (req, res) => {
  getProduct.getCategory().then((findCat) => {
    res.render('admin/addproduct', { admin, findCat })
  })
})

router.get('/deleteproduct/:id',isValidate,(req,res)=>{
  getProduct.deleteProduct(req.params.id).then(()=>{
    res.redirect('/admin/products')
  })
})
router.get('/editproduct/:id',isValidate,async(req,res)=>{
 const productData= await getProduct.getSinglePr(req.params.id)
 const productCat = await getProduct.getSinleCat(productData.Category)
  getProduct.getProductEditCategory(productCat).then((findCat)=>{
    res.render('admin/editproduct',{admin,productData,findCat,productCat})
  })
  
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
  getProduct.addCategory(req.body).then(() => {
    res.redirect('/admin/category')
  })
})

router.post('/editcategory/:id', (req, res) => {
  getProduct.updateCategory(req.params.id, req.body).then(() => {
    res.redirect('/admin/category')
  })
})

// post products
router.post('/addproduct',multerFunction.upload.array('productImages',12), (req, res) => {
  getProduct.addProduct(req.body,req.files).then(()=>{
    
    res.redirect('/admin/products')
  })  
})

router.post('/editproduct/:id',multerFunction.upload.array('productImages',12),(req,res)=>{
  getProduct.updateProduct(req.params.id,req.body,req.files).then(()=>{
    res.redirect('/admin/products')
  })
  
}) 
module.exports = router;
