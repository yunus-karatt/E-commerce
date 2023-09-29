module.exports={
  // session checking middlewar
 isValidate:(req, res, next)=>{
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}
}