var express = require('express');
var router = express.Router();
const getAdmin = require('../controller/admin-controller')
const getProduct = require('../controller/product-controller')
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
router.get('/login', (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin/')
  } else {
    res.render('admin/login', { admin, logginErr: req.session.logginErr })
    req.session.logginErr = false
  }

})
router.get('/userslist', (req, res) => {
  getAdmin.getUsersList().then((userList) => {
    res.render('admin/userlist', {admin, userList })

  })
})

router.get('/blockuser/:id',(req,res)=>{
getAdmin.blockUser(req.params.id).then(()=>{
  res.redirect('/admin/userslist')
})
})

router.get('/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  req.session.admin = null
  res.redirect('/admin/login')
})
// Get Category
router.get('/category', (req, res) => {
  getProduct.getCategory().then((findCat) => {
    res.render('admin/category', { admin, findCat })
  })
})
router.get('/addcategory/', (req, res) => {
  res.render('admin/addcategory', { admin })
})
router.get('/editcategory/:id', (req, res) => {
  getProduct.getSinleCat(req.params.id).then((singleCat)=>{
    res.render('admin/editcategory',{admin, singleCat})
  })
  
})
router.get('/listcategory/:id',(req,res)=>{
  getProduct.listCategory(req.params.id).then(()=>{
    res.redirect('/admin/category')
  })
})

// post routes
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

// category
router.post('/addcategory', (req, res) => {
  getProduct.addCategory(req.body).then(() => {
    res.redirect('/admin/category')
  })
})
router.post('/editcategory/:id',(req,res)=>{
  getProduct.updateCategory(req.params.id,req.body).then(()=>{
    res.redirect('/admin/category')
  })
}) 
module.exports = router;
