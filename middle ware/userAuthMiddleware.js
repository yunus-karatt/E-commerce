// session middleware

module.exports={
   isUserValid:(req, res, next)=> {
    if (req.session.userLoggedIn) {
      next()
    } else {
      res.redirect('/login')
    }
  }
  

}