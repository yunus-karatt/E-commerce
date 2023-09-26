const Product = require('../model/productModel');
const order = require('../model/orderModel')
const User = require('../model/userModel');
const wishList = require('../model/wishListModel');
const cart = require('../model/cartModel');
const address = require('../model/addressMode')
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
  getRawCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartData = await cart.findOne({ userId: userId })
      resolve(cartData)
    })
  },
  addToCart: async (userId, productId) => {
    // const productData = await Product.findOne({ _id: productId }).lean()
    // console.log(productData)

    // if (productData.Stock_quantity < 1) {
    //       reject()
    // }else{
    return new Promise(async (resolve, reject) => {
      const existUserCart = await cart.findOne({ userId: userId })
      if (existUserCart) {
        const index = existUserCart.product.findIndex((item) => item.productId.toString() === productId)
        if (index === -1) {
          await cart.updateOne({ userId: userId }, { $push: { product: { productId: productId } } })
          resolve()
        } else {
          await cart.updateOne({ userId: userId, 'product.productId': productId }, { $inc: { 'product.$.count': 1 } })
          resolve()
        }

      } else {
        const cartData = {
          userId: userId,
          product: {
            productId: productId
          }
        }
        await cart.create(cartData)
        resolve()
      }
      // }



    })
  },
  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      const cartData = await cart.aggregate([{ $match: { userId: new ObjectId(userId) } }, {
        $unwind: '$product'
      }, {
        $lookup: {
          from: 'products',
          localField: 'product.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      { $sort: { 'productDetails.Name': 1 } }
        ,
      {
        $group: {
          _id: '$productDetails._id',
          totalcount: { $sum: "$product.count" },
          totalPrice: {
            $sum: {
              $multiply: ["$product.count", "$productDetails.Price"]
            }
          },
          productName: { $first: "$productDetails.Name" },
          productFeatures: { $first: "$productDetails.Features" },
          productPrice: { $first: "$productDetails.Price" },
          productImage: { $first: "$productDetails.Images" }
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: 1 },
          totalPrice: { $sum: "$totalPrice" },
          products: {
            $push: {
              _id: "$_id",
              productName: "$productName",
              productFeatures: "$productFeatures",
              productPrice: "$productPrice",
              productImage: "$productImage",
              count: "$totalcount",
              price: "$totalPrice"
            },
          },
        },
      },

      ])
      resolve(cartData)
    })
  },
  removeCartItem: (prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(prodId)
      await cart.updateOne({ userId: userId }, { $pull: { product: { productId: prodId.productId } } })
      resolve()
    })
  },
  updateCart: (userId, productId, count,existCount) => {
    return new Promise(async (resolve, reject) => {
      const product= await Product.findOne({_id:productId})
      console.log(product.Stock_quantity)
      if(product.Stock_quantity==existCount&&count==1){
          resolve({stock:false})
      }else{
         await cart.updateOne({ userId: userId, 'product.productId': productId }, { $inc: { 'product.$.count': count } })
      resolve()
      }
     
    })
  },
  addAddress: (userId, userAddress) => {
    console.log(userAddress)
    const usersAddress = new address({
      userId: userId,
      firstName: userAddress.firstName,
      lastName: userAddress.lastName,
      address: userAddress.inputAddress,
      city: userAddress.inputCity,
      state: userAddress.inputState,
      pincode: userAddress.inputZip
    })
    return new Promise(async (resolve, reject) => {
      const saveAddress = await usersAddress.save()
      console.log(saveAddress._id)
      resolve(saveAddress._id)


    })
  },
  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      const userAddress = await address.find({ userId: userId }).lean()
      resolve(userAddress)
    })
  },
  deleteAddress: (addressId) => {
    console.log(addressId)
    return new Promise(async (resolve, reject) => {
      await address.deleteOne({ _id: addressId.addressId })
      resolve()
    })
  },
  singleAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      const addressData = await address.findOne({ _id: addressId }).lean()
      resolve(addressData)
    })
  },
  updateAddress: (addressId, addressData) => {
    return new Promise(async (resolve, reject) => {
      await address.updateOne({ _id: addressId }, {
        $set: {
          firstName: addressData.firstName,
          lastName: addressData.lastName,
          address: addressData.inputAddress,
          city: addressData.inputCity,
          pincode: addressData.inputZip
        }
      })
      resolve()
    })
  },
  getUser: async (userId) => {
    const user = await User.findOne({ _id: userId }).lean()
    return (user)
  },
  updateProfile: (userId, userData) => {
    const userName = userData.userName
    const email = userData.email
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ _id: userId }, { $set: { Username: userName, Email: email } })
      resolve()
    })
  },
  updateMobile: (userId, mobileNum) => {
    return new Promise(async (resolve, reject) => {
      await User.updateOne({ _id: userId }, { $set: { Mobilenumber: mobileNum } })
      resolve()
    })
  },
  checkMobileExist: (mobileNumber) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ Mobilenumber: mobileNumber }, { Mobilenumber: 1 })
      resolve(user)
    })
  },
  changePassword: (data) => {
    const mobile = data.mobileNumber

    return new Promise(async (resolve, reject) => {
      password = await bcrypt.hash(data.passData.password, 10)
      confirmPassword = await bcrypt.hash(data.passData.confirmPassword, 10)
      await User.updateOne({ Mobilenumber: mobile }, { $set: { Password: password, Confirmpassword: confirmPassword } })
      resolve()
    })
  },
  placeOrder:async (userId, orderData) => {
    const addressData= await address.findOne({_id:orderData.addressId})
    console.log(addressData)
    const orderDetails = {
      userId: userId,
      address: addressData,
      products: orderData.product,
      totalPrice: orderData.totalPrice,
      paymentMethod: orderData.paymentMethod,
      orderStatus: "confirm"
    }
    console.log(orderDetails.products)
    return new Promise(async (resolve, reject) => {
      const orderStatus = await order.create(orderDetails)
      // Update the product stock quantities
      const productUpdates = orderDetails.products.map((product) => ({
        updateOne: {
          filter: { _id: product.productId },
          update: { $inc: { Stock_quantity: -product.quantity } }
        }
      }));
      await Product.bulkWrite(productUpdates);
      await cart.deleteOne({userId:userId})
      resolve()
    })
  },
  getOrder:async(userId)=>{
    const orderData= await order.aggregate([{$match:{userId:new ObjectId(userId)}},
        {
          $unwind:'$products'
        },
        {
      $lookup:{
        from:'products',
        localField:'products.productId',
        foreignField:'_id',
        as:'productDetails'
      }
    },
    {
      $unwind:'$productDetails'
    }
    ])
    for(x in orderData){
      orderData[x].orderDate= orderData[x].orderDate.toISOString().split('T')[0]
    }
    return orderData
  },
  cancelOrder:(orderId,productId)=>{
    return new Promise(async(resolve,reject)=>{
      const orderData=await order.findOne({_id:orderId,'products.productId':productId})
      const quantity= orderData.products.find(id=>id.productId.equals(new ObjectId(productId)))
      await order.updateOne({_id:orderId,'products.productId':productId},{$set:{'products.$.itemStatus':"cancelled"}})
      await order.updateOne({_id:orderId},{$inc:{totalPrice:-quantity.pricePerQnt}})
      console.log(quantity)
      await Product.updateOne({_id:productId},{$inc:{Stock_quantity:quantity.quantity}})
      resolve()
    })
  }
} 