const Admin= require('../model/adminModel');
const User = require('../model/userModel');
const db = require('../config/connection');
const bcrypt = require('bcrypt');
module.exports={
  doAdminLogin:(adminData)=>{
    let response ={}
    return new Promise(async(res,rej)=>{
      let admin = await Admin.findOne({Email:adminData.Adminemail})
      if(admin){
        bcrypt.compare(adminData.Adminpassword,admin.get('Password'),(err,result)=>{
          if(err){
            console.log("password checking error"+err)
          }else if(result){
            console.log(result)
            response.admin =result
            response.status = true
            res(response)
          }else{
            response.logginErr="Please check your password"
            res(response)
          }
        })
      }else{
        response.logginErr="Please enter a valid email"
        res(response)
      }
    })
  },
  getUsersList:()=>{
    return new Promise(async(resolve,reject)=>{
     const userList=await User.find({}).lean()
     resolve(userList)
    })
  },
  blockUser:(id)=>{
    return new Promise(async(resolve,reject)=>{
      let userBlock = await User.findOne({_id:id})
      userBlock = !userBlock.Isblocked
      await User.updateOne({_id:id},{$set:{Isblocked:userBlock}})
      resolve()
    })
  }
} 