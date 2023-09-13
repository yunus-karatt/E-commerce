
const User = require('../model/usermodel');
const db = require('../config/connection');
const bcrypt = require('bcrypt');


module.exports = {

  doSignup: function(userData){
    let Userdata = {
      Username:userData.userData.Username,
      Password:userData.userData.Password,
      Confirmpassword:userData.userData.Confirmpassword,
      Mobilenumber:userData.userData.Mobilenumber,
      Email:userData.userData.Email,
    }
    return new Promise(async(res,rej)=>{
      Userdata.Password=await bcrypt.hash(Userdata.Password,10)
      Userdata.Confirmpassword=await bcrypt.hash(Userdata.Confirmpassword,10)
      let user =await User.findOne({Mobilenumber:Userdata.Mobilenumber})
      if(user){
        res(user)
      }else{
        await User.insertMany([Userdata])
      res()
      }
    })
  },
  doLogin:(userLogin)=>{
    let response={}
    return new Promise(async(res,rej)=>{
      let loginData=await User.findOne({Username:userLogin.Username})
      if(loginData){
        bcrypt.compare(userLogin.Password,loginData.Password).then((userStatus)=>{
          if(userStatus){
            response.user=loginData
            res(response)
          }else{
            response.userLogErr="Please check your password"
            res(response)
          }
        })
      }else{
        response.userLogErr= "Please Enter a valid username";
        res(response)
      }
    })
  },
  doOtpLogin:(mobile)=>{
    console.log(`*******${mobile}`)
    return new Promise(async(resolve,reject)=>{
      const user= await User.findOne({Mobilenumber:mobile})
      if(user){
        resolve(user)
      }else{
        resolve()
      }
    })
  },
  createSession:(userSession)=>{
    let response={}
    return new Promise(async(res,rej)=>{
     let signupUser= await User.updateOne({Mobilenumber:userSession.userData.Mobilenumber},{Isverified:true})
       response.user = signupUser
       res(response)

    })
  },
  createLoginSession:(loginNumber)=>{
    return new Promise(async(resolve,reject)=>{
      let response={}
      let otpUser = await User.findOne({Mobilenumber:loginNumber})
      response.user= otpUser
      resolve(response)
    })
  }
} 