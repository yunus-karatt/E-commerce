
const User = require('../model/userModel');
const wishList = require('../model/wishListModel');
const cart = require('../model/cartModel');
const address= require('../model/addressMode') 
const db = require('../config/connection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');


module.exports = {

  doSignup: function (userData) {
    let Userdata = {
      Username: userData.userData.Username,
      Password: userData.userData.Password,
      Confirmpassword: userData.userData.Confirmpassword,
      Mobilenumber: userData.userData.Mobilenumber,
      Email: userData.userData.Email,
    }
    return new Promise(async (res, rej) => {
      Userdata.Password = await bcrypt.hash(Userdata.Password, 10)
      Userdata.Confirmpassword = await bcrypt.hash(Userdata.Confirmpassword, 10)
      let user = await User.findOne({ Mobilenumber: Userdata.Mobilenumber })
      if (user) {
        res(user)
      } else {
        await User.insertMany([Userdata])
        res()
      }
    })
  },
  doLogin: (userLogin) => {
    let response = {}
    return new Promise(async (res, rej) => {
      let loginData = await User.findOne({ Username: userLogin.Username })
      if (loginData) {
        if (loginData.Isblocked) {
          response.userLogErr = "You are blocked for the time, Please contact us"
          res(response)
        } else {
          bcrypt.compare(userLogin.Password, loginData.Password).then((userStatus) => {
            if (userStatus) {
              response.user = loginData
              res(response)
            } else {
              response.userLogErr = "Please check your password"
              res(response)
            }
          })
        }
      } else {
        response.userLogErr = "Please Enter a valid username";
        res(response)
      }
    })
  },
  doOtpLogin: (mobile) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ Mobilenumber: mobile })
      if (user) {
        resolve(user)
      } else {
        resolve()
      }
    })
  },
  createSession: (userSession) => {
    let response = {}
    return new Promise(async (res, rej) => {
      let signupUser = await User.updateOne({ Mobilenumber: userSession.userData.Mobilenumber }, { Isverified: true })
      response.user = signupUser
      res(response)

    })
  },
  createLoginSession: (loginNumber) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      let otpUser = await User.findOne({ Mobilenumber: loginNumber })
      response.user = otpUser
      resolve(response)
    })
  },
  wishListFn: (wishListData) => {
    const { productId, userId } = { ...wishListData }
    return new Promise(async (resolve, reject) => {
      const existwishList = await wishList.findOne({ userId: userId })
      if (!existwishList) {

        await wishList.create(wishListData)
        resolve()
      } else {
        const index = existwishList.productId.indexOf(productId)
        if (index === -1) {
          existwishList.productId.push(productId)
          await existwishList.save()
          resolve()
        } else {
          existwishList.productId.splice(index, 1)
          await existwishList.save()
          resolve()
        }
      }

    })
  },
  getWishLish: (user) => {
    const wishId = user._id
    return new Promise(async (resolve, reject) => {
      const wishListData = await wishList.find({ userId: wishId })
      resolve(wishListData)
    })
  },
  getWishListData: (user) => {
    const wishId = new ObjectId(user._id);
    return new Promise(async (resolve, reject) => {
      //  console.log(wishId)
      const wishListDetails = await wishList.aggregate([{ $match: { userId: wishId } }, {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'products'
        }
      }, { $unwind: '$products' }, { $unwind: '$products.Features' }, {
        $project: {
          products: {
            _id: 1,
            Name: 1,
            Images: 1,
            Price: 1
          },
          features: '$products.Features',

        }
      }])
      console.log(wishListDetails)
      resolve(wishListDetails)
    })
  },
  deleteWishlist: (wishData) => {
    return new Promise(async (resolve, reject) => {
      await wishList.updateOne({ userId: wishData.userId }, { $pull: { productId: wishData.productId } })
      resolve()
    })
  },
  addToCart: (userId, productId) => {
    return new Promise(async (resolve, reject) => {
      await cart.updateOne({ userId: userId }, { $push: { productId: productId } }, { upsert: true })
      resolve()
    })
  },
  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartData = await cart.aggregate([{ $match: { userId: new ObjectId(userId) } }, {
        $unwind: '$productId'
      }, {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'products'
        }
      }, { $unwind: '$products' },
      {
        $group: {
          _id: '$products._id',
          productName: { $first: "$products.Name" },
          productImage: { $first: { $arrayElemAt: ["$products.Images", 0] } },
          productPrice: { $first: "$products.Price" },
          productFeature:{$first:'$products.Features'},
          count: { $sum: 1 },
          totalPrice: { $sum: "$products.Price" }
        }
      },{$unwind:'$productFeature'},{
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          productImage: 1,
          productPrice: 1,
          count: 1,
          totalPrice: 1,
          productFeature:1
        }
      }])
      resolve(cartData)
    })
  },
  removeCartItem:(prodId,userId)=>{
    return new Promise(async(resolve,reject)=>{
       await cart.updateOne({userId:userId},{$pull:{'productId':prodId.productId}})
      resolve()
    })
  },
  addAddress:(userId,userAddress)=>{
    console.log(userAddress)
    const usersAddress= new address({
      userId:userId,
      firstName:userAddress.firstName,
      lastName:userAddress.lastName,
      address:userAddress.inputAddress,
      city:userAddress.inputCity,
      state:userAddress.inputState,
      pincode:userAddress.inputZip
    })
    return new Promise(async(resolve,reject)=>{
      await usersAddress.save()
    })
  },
  getAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      const userAddress= await address.find({userId:userId}).lean()
      resolve(userAddress)
    })
  },
  deleteAddress:(addressId)=>{
    console.log(addressId)
    return new Promise(async(resolve,reject)=>{
      await address.deleteOne({_id:addressId.addressId})
      resolve()
    })
  },
  singleAddress:(addressId)=>{
    return new Promise(async(resolve,reject)=>{
      const addressData= await address.findOne({_id:addressId}).lean()
      resolve(addressData)
    })
  },
  updateAddress:(addressId,addressData)=>{
    return new Promise(async(resolve,reject)=>{
      await address.updateOne({_id:addressId},{$set:{
        firstName:addressData.firstName,
        lastName:addressData.lastName,
        address:addressData.inputAddress,
        city:addressData.inputCity,
        pincode:addressData.inputZip
      }})
      resolve()
    })
  },
  getUser:async(userId)=>{
    const user=await User.findOne({_id:userId}).lean( )
    return(user)
  },
  updateProfile:(userId,userData)=>{
    const userName=userData.userName
    const email= userData.email
    return new Promise(async(resolve,reject)=>{
      await User.updateOne({_id:userId},{$set:{Username:userName,Email:email}})
      resolve()
    })
  }
} 