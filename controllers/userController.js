const Product = require('../model/productModel');
const order = require('../model/orderModel')
const User = require('../model/userModel');
const wishList = require('../model/wishListModel');
const cart = require('../model/cartModel');
const address = require('../model/addressMode')
const db = require('../config/connection');
const bcrypt = require('bcrypt');
const crypto = require('crypto')
const { ObjectId } = require('mongodb');
const Razorpay = require('razorpay');
const { resolve } = require('path');
const Category = require('../model/categoryModel')

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      try {
        Userdata.Password = await bcrypt.hash(Userdata.Password, 10)
        Userdata.Confirmpassword = await bcrypt.hash(Userdata.Confirmpassword, 10)
        let user = await User.findOne({ Mobilenumber: Userdata.Mobilenumber })
        if (user) {
          res(user)
        } else {
          await User.insertMany([Userdata])
          res()
        }
      }
      catch (err) {
        rej(err)
      }

    })
  },

  doLogin: (userLogin) => {
    let response = {}
    return new Promise(async (res, rej) => {
      try {
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
      }
      catch (err) {
        rej(err)
      }
    })
  },

  doOtpLogin: (mobile) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({ Mobilenumber: mobile })
        if (user) {
          resolve(user)
        } else {
          resolve()
        }
      }
      catch (err) {
        reject(err)
      }

    })
  },

  createSession: (userSession) => {
    let response = {}
    return new Promise(async (res, rej) => {
      try {
        let signupUser = await User.updateOne({ Mobilenumber: userSession.userData.Mobilenumber }, { Isverified: true })
        response.user = signupUser
        res(response)
      }
      catch (err) {
        rej(err)
      }
    })
  },

  createLoginSession: (loginNumber) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {}
        let otpUser = await User.findOne({ Mobilenumber: loginNumber })
        response.user = otpUser
        resolve(response)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  wishListFn: (wishListData) => {
    const { productId, userId } = { ...wishListData }
    return new Promise(async (resolve, reject) => {
      try {
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
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getWishLish: (user) => {
  
    const wishId = user._id
    return new Promise(async (resolve, reject) => {
      try {
        const wishListData = await wishList.find({ userId: wishId })
        resolve(wishListData)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getWishListData: (user) => {
    const wishId = new ObjectId(user._id);
    return new Promise(async (resolve, reject) => {
      try {
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
        resolve(wishListDetails)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  deleteWishlist: (wishData) => {
    return new Promise(async (resolve, reject) => {
      try {
        await wishList.updateOne({ userId: wishData.userId }, { $pull: { productId: wishData.productId } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getRawCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cartData = await cart.findOne({ userId: userId })
        resolve(cartData)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  addToCart: async (userId, productId) => {
    // const productData = await Product.findOne({ _id: productId }).lean()
    // console.log(productData)

    // if (productData.Stock_quantity < 1) {
    //       reject()
    // }else{
    return new Promise(async (resolve, reject) => {
      try {
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
      }
      catch (err) {
        reject(err)
      }
      // }
    })
  },

  getCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      }
      catch (err) {
        reject(err)
      }
    })
  },

  removeCartItem: (prodId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await cart.updateOne({ userId: userId }, { $pull: { product: { productId: prodId.productId } } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  updateCart: (userId, productId, count, existCount) => {
    return new Promise(async (resolve, reject) => {
      try {
        const product = await Product.findOne({ _id: productId })
        if (product.Stock_quantity == existCount && count == 1) {
          resolve({ stock: false })
        } else {
          await cart.updateOne({ userId: userId, 'product.productId': productId }, { $inc: { 'product.$.count': count } })
          resolve()
        }
      }
      catch (err) {
        reject(err)
      }
    })
  },

  addAddress: (userId, userAddress) => {
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
      try {
        const saveAddress = await usersAddress.save()
        resolve(saveAddress._id)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userAddress = await address.find({ userId: userId }).lean()
        resolve(userAddress)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  deleteAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await address.deleteOne({ _id: addressId.addressId })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  singleAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const addressData = await address.findOne({ _id: addressId }).lean()
        resolve(addressData)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  updateAddress: (addressId, addressData) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      }
      catch (error) {
        reject(error)
      }
    })
  },

  getUser: async (userId) => {
    try {
      const user = await User.findOne({ _id: userId }).lean()
      return (user)
    }
    catch (err) {
      throw err
    }

  },

  updateProfile: (userId, userData) => {
    const userName = userData.userName
    const email = userData.email
    return new Promise(async (resolve, reject) => {
      try {
        await User.updateOne({ _id: userId }, { $set: { Username: userName, Email: email } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  updateMobile: (userId, mobileNum) => {
    return new Promise(async (resolve, reject) => {
      try {
        await User.updateOne({ _id: userId }, { $set: { Mobilenumber: mobileNum } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  checkMobileExist: (mobileNumber) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({ Mobilenumber: mobileNumber }, { Mobilenumber: 1 })
        resolve(user)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  changePassword: (data) => {
    const mobile = data.mobileNumber
    return new Promise(async (resolve, reject) => {
      try {
        password = await bcrypt.hash(data.passData.password, 10)
        confirmPassword = await bcrypt.hash(data.passData.confirmPassword, 10)
        await User.updateOne({ Mobilenumber: mobile }, { $set: { Password: password, Confirmpassword: confirmPassword } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  placeOrder: async (userId, orderData) => {
    const addressData = await address.findOne({ _id: orderData.addressId })
    const orderDetails = {
      userId: userId,
      address: addressData,
      products: orderData.product,
      totalPrice: orderData.totalPrice,
      paymentMethod: orderData.paymentMethod,
      orderStatus: orderData.orderStatus
    }

    return new Promise(async (resolve, reject) => {
      try {
        const orderStatus = await order.create(orderDetails)
        // Update the product stock quantities
        if (orderStatus.paymentMethod === 'cod') {
          const productUpdates = orderDetails.products.map((product) => ({
            updateOne: {
              filter: { _id: product.productId },
              update: { $inc: { Stock_quantity: -product.quantity } }
            }
          }));
          await Product.bulkWrite(productUpdates);
          await cart.deleteOne({ userId: userId })
          resolve({ status: 'cod' })
        } else {
          var options = {
            amount: orderDetails.totalPrice * 100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: orderStatus._id
          };
          instance.orders.create(options, function (err, order) {
            resolve(order)
          });
        }


      }
      catch (err) {
        reject(err)
      }

    })
  },
  getOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const orderData = await order.aggregate([
          {
            $match: {
              userId: new ObjectId(userId)
            }
          },
          {
            $unwind: '$products'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'products.productId',
              foreignField: '_id',
              as: 'products.productDetails'
            }
          },
          {
            $group: {
              _id: '$_id',
              userId: { $first: '$userId' },
              address: { $first: '$address' },
              totalPrice: { $first: '$totalPrice' },
              paymentMethod: { $first: '$paymentMethod' },
              orderStatus: { $first: '$orderStatus' },
              orderDate: { $first: '$orderDate' },
              products: { $push: '$products' },
              cancellationDate: {
                $first: {
                  $cond: [
                    { $eq: ['$orderStatus', 'cancelled'] },
                    '$cancelDate',
                    null // Set to null if not cancelled
                  ]
                }
              },
              shipmentDate: {
                $first: {
                  $cond: [
                    { $in: ['$orderStatus', ['shipped', 'delivered']] },
                    '$shippedDate',
                    null // Set to null if not shipped
                  ]
                }
              },
              deleveredDate: {
                $first: {
                  $cond: [{ $eq: ['$orderStatus', 'delivered'] }, '$deliveredDate', null]
                }
              }
            }

          },
          {
            $project: {
              userId: 1,
              address: 1,
              totalPrice: 1,
              totalProduct: { $size: '$products' },
              paymentMethod: 1,
              orderStatus: 1,
              orderDate: 1,
              products: 1,
              cancellationDate: 1,
              shipmentDate: 1,
              shipmentDateForDlv: 1,
              deleveredDate: 1
            }
          }
        ])
        for (x in orderData) {
          orderData[x].orderDate = orderData[x].orderDate.toISOString().split('T')[0]
          if (orderData[x].shipmentDate) {
            orderData[x].shipmentDate = orderData[x].shipmentDate.toISOString().split('T')[0]
          }
          if (orderData[x].deleveredDate) {
            orderData[x].deleveredDate = orderData[x].deleveredDate.toISOString().split('T')[0]
          }
          if (orderData[x].cancellationDate) {
            orderData[x].cancellationDate = orderData[x].cancellationDate.toISOString().split('T')[0]
          }
        }
        resolve(orderData)
      }
      catch (err) {
        reject(err)
      }
    })
  }
  ,
  getSingleOrder: async (orderId) => {
    try {
      const orderData = await order.aggregate([{ $match: { _id: new ObjectId(orderId) } },
      {
        $unwind: '$products'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      }
      ])
      for (x in orderData) {
        orderData[x].orderDate = orderData[x].orderDate.toISOString().split('T')[0]
      }
      return orderData
    }
    catch (err) {
      throw err
    }

  },

  cancelOrder: (orderId, productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const orderData = await order.findOne({ _id: orderId, 'products.productId': productId })
        const quantity = orderData.products.find(id => id.productId.equals(new ObjectId(productId)))
        await order.updateOne({ _id: orderId, 'products.productId': productId }, { $set: { 'products.$.itemStatus': "cancelled" } })
        await order.updateOne({ _id: orderId }, { $inc: { totalPrice: -quantity.pricePerQnt } })
        const updateOrderData = await order.findOne({ _id: orderId })
        if (updateOrderData.totalPrice == 0) {
          await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'cancelled', cancelDate: new Date() } })
        }
        await Product.updateOne({ _id: productId }, { $inc: { Stock_quantity: quantity.quantity } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  cancelAllOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cancelledOrder = await order.findById(orderId);
        for (const product of cancelledOrder.products) {
          if (product.itemStatus != 'cancelled') {
            const foundProduct = await Product.findById(product.productId);
            foundProduct.Stock_quantity += product.quantity;
            await foundProduct.save();
          }

        }
        cancelledOrder.orderStatus = 'cancelled';
        cancelledOrder.totalPrice = 0;
        cancelledOrder.cancelDate = new Date();
        for (const product of cancelledOrder.products) {
          product.itemStatus = 'cancelled';
        }
        cancelledOrder.save()
        // await order.updateOne({_id:orderId},{$set:{orderStatus:'cancelled',totalPrice:0,'products.$[].itemStatus':'cancelled'}});
        resolve()
      }
      catch (err) {
        console.log(err)
        reject(err)
      }
    })
  },

  paymentVerification: (orderData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        hmac.update(orderData.response.razorpay_order_id + '|' + orderData.response.razorpay_payment_id)
        let generatedSignature = hmac.digest('hex')
        let isSignatureValid = generatedSignature === orderData.response.razorpay_signature;
        if(isSignatureValid){
          resolve()
        }
        else{
          reject()
        }
      }
      catch (err) {
        reject(err)
      }
    })

  },
  changeOrderStatus:(orderData,userId)=>{
    const orderId= orderData.status.receipt
    return new Promise(async(resolve,reject)=>{
      try{
        // const orderData= await order.findOne({_id:orderId})
        const updatedOrder = await order.findOneAndUpdate(
          { _id: orderId },
          { $set: { orderStatus: 'placed' } },
          { new: true }
        );      console.log('..............................',updatedOrder)
      const productUpdates = updatedOrder.products.map((product) => ({
        updateOne: {
          filter: { _id: product.productId },
          update: { $inc: { Stock_quantity: -product.quantity } }
        }
      }));
      await Product.bulkWrite(productUpdates);
      await cart.deleteOne({ userId: userId })
      resolve()
      }
      catch(err){
        reject(err)
      }
    })
  },
 
} 