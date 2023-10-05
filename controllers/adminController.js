const Admin = require('../model/adminModel');
const User = require('../model/userModel');
const Product = require('../model/productModel')
const order = require('../model/orderModel');
const db = require('../config/connection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');


module.exports = {
  doAdminLogin: (adminData) => {
    let response = {}
    return new Promise(async (res, rej) => {
      let admin = await Admin.findOne({ Email: adminData.Adminemail })
      if (admin) {
        bcrypt.compare(adminData.Adminpassword, admin.get('Password'), (err, result) => {
          if (err) {
            console.log("password checking error" + err)
          } else if (result) {
            response.admin = result
            response.status = true
            res(response)
          } else {
            response.logginErr = "Please check your password"
            res(response)
          }
        })
      } else {
        response.logginErr = "Please enter a valid email"
        res(response)
      }
    })
  },

  getUsersList: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const userList = await User.find({}).sort({ Username: 1 }).limit(5).lean()
        // const userList= await User.aggregate([
        //   {
        //     $lookup:{
        //       from:'orders',
        //       localField:'_id',
        //       foreignField:'userId',
        //       as:'orders'
        //     }
        //   }
        // ])
        resolve(userList)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  blockUser: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userBlock = await User.findOne({ _id: id })
        userBlock = !userBlock.Isblocked
        await User.updateOne({ _id: id }, { $set: { Isblocked: userBlock } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getLimitedUser: (skipLimit) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userList = await User.find({}).sort({ Username: 1 }).skip(skipLimit).limit(5).lean()
        resolve(userList)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  findUser: (searchQ) => {
    return new Promise(async (resolve, reject) => {
      try {
        let searchQuery = new RegExp(searchQ);
        const userList = await User.find({ Username: { $regex: searchQuery } })
        resolve(userList)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  // getOrderData: () => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const orderData = await order.aggregate([{
  //         $unwind: '$products'
  //       },
  //       {
  //         $lookup: {
  //           from: 'products',
  //           localField: 'products.productId',
  //           foreignField: '_id',
  //           as: 'productDetails'
  //         }
  //       },
  //       {
  //         $unwind: '$productDetails'
  //       }
  //       ])
  //       for (x in orderData) {
  //         orderData[x].orderDate = orderData[x].orderDate.toISOString().split('T')[0]
  //       }
  //       resolve(orderData)
  //     }
  //     catch (err) {
  //       reject(err)
  //     }

  //   })
  // },
  getOrderData: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const orderData = await order.aggregate([
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
            }
          }
        ])
        for (x in orderData) {
          orderData[x].orderDate = orderData[x].orderDate.toISOString().split('T')[0]
        }
        resolve(orderData)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  getManageOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cartData = await order.aggregate([{ $match: { _id: new ObjectId(orderId) } }, {
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
          }
        },])
        console.log(cartData)
        resolve(cartData)
      }
      catch (err) {
        reject(err)
      }

    })
  },

  updateOrderStatus: (orderId, status) => {
    return new Promise(async (resolve, reject) => {
      try {
        //  if (status === 'cancelled') {
        //         const orderData = await order.findOne({ _id: updateData.orderId, 'products.productId': updateData.productId })
        //         const quantity = orderData.products.find(id => id.productId.equals(new ObjectId(updateData.productId)))
        //         await order.updateOne({ _id: updateData.orderId, 'products.productId': updateData.productId }, { $set: { 'products.$.itemStatus': "cancelled" } })
        //         await order.updateOne({ _id: updateData.orderId }, { $inc: { totalPrice: -quantity.pricePerQnt } })
        //         await Product.updateOne({ _id: updateData.productId }, { $inc: { Stock_quantity: quantity.quantity } })
        //         resolve()
        //       } 
        if (status === 'shipped') {
          await order.updateOne({ _id: orderId }, { $set: { orderStatus: "shipped", shippedDate: new Date() } })
          resolve()
        } else if (status === 'delivered') {
          await order.updateOne({ _id: orderId }, { $set: { orderStatus: "delivered", deliveredDate: new Date() } })
          resolve()
        }
      }
      catch (err) {
        reject(err)
      }

    })
  },
  getSalesReport: () => {
    return new Promise(async (resolve, reject) => {
      const salesReport = await order.aggregate([{
        $match: {
          orderStatus: 'delivered'
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
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.Category',
          foreignField: '_id',
          as: 'productDetails.Category'
        }
      },
      {
        $project: {
          orderDate: 1,
          'address.firstName': 1,
          'productDetails.Name': 1,
          'productDetails.Category.category': 1,
          'products.pricePerQnt': 1,
          'products.quantity': 1,
          paymentMethod: 1

        }
      }
      ])
      for (x in salesReport) {
        salesReport[x].orderDate = salesReport[x].orderDate.toISOString().split('T')[0]
      }
      resolve(salesReport)
    })

  },
  getFilterSalesReport: (paymentMethod) => {
    return new Promise(async (resolve, reject) => {
      const salesReport = await order.aggregate([{
        $match: {
          orderStatus: 'delivered',
          paymentMethod: paymentMethod
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
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.Category',
          foreignField: '_id',
          as: 'productDetails.Category'
        }
      },
      {
        $project: {
          orderDate: 1,
          'address.firstName': 1,
          'productDetails.Name': 1,
          'productDetails.Category.category': 1,
          'products.pricePerQnt': 1,
          'products.quantity': 1,
          paymentMethod: 1

        }
      }
      ])
      for (x in salesReport) {
        salesReport[x].orderDate = salesReport[x].orderDate.toISOString().split('T')[0]
      }
      resolve(salesReport)
    })
  },
  getDatedReport: (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      if (startDate === endDate) {
        const today = new Date();
        const startTime = new Date(today);
        startTime.setUTCHours(0, 0, 0, 0);
        const endTime = new Date(today);
        endTime.setUTCHours(23, 59, 59, 999);
        const salesReport = await order.aggregate([{
          $match: {
            orderStatus: 'delivered',
            orderDate: {
              $gte: startTime,
              $lte: endTime
            }
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
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.Category',
            foreignField: '_id',
            as: 'productDetails.Category'
          }
        },
        {
          $project: {
            orderDate: 1,
            'address.firstName': 1,
            'productDetails.Name': 1,
            'productDetails.Category.category': 1,
            'products.pricePerQnt': 1,
            'products.quantity': 1,
            paymentMethod: 1

          }
        }
        ])
        for (x in salesReport) {
          salesReport[x].orderDate = salesReport[x].orderDate.toISOString().split('T')[0]
        }
        resolve(salesReport)
      } else {
        startDate = new Date(startDate)
        endDate = new Date()
        const salesReport = await order.aggregate([{
          $match: {
            orderStatus: 'delivered',
            orderDate: {
              $gte: startDate,
              $lte: endDate
            }
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
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetails.Category',
            foreignField: '_id',
            as: 'productDetails.Category'
          }
        },
        {
          $project: {
            orderDate: 1,
            'address.firstName': 1,
            'productDetails.Name': 1,
            'productDetails.Category.category': 1,
            'products.pricePerQnt': 1,
            'products.quantity': 1,
            paymentMethod: 1

          }
        }
        ])
        for (x in salesReport) {
          salesReport[x].orderDate = salesReport[x].orderDate.toISOString().split('T')[0]
        }
        console.log(salesReport)
        resolve(salesReport)
      }

    })
  },
  getDashboardData: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const userCount = await User.find({}).count()
        const blockedUsers = await User.find({ Isblocked: true }).count()
        const salesCount = await order.find({ orderStatus: 'delivered' }).count()
        const revenue = await order.aggregate([{
          $match: {
            orderStatus: 'delivered'
          }
        }, {
          $group: {
            _id: null,
            revenue: { $sum: '$totalPrice' }
          }
        }, {
          $project: {
            _id: 0
          }
        }
        ])
        const placedOrder=await order.find({ orderStatus: 'placed' }).count()
        const monthlySales=await order.aggregate([
          {
            $match:{
              orderStatus: 'delivered'
            }
          },
          {
            $project:{
              month:{$month:'$orderDate'},
              year:{$year:'$orderDate'},
              totalAmount:'$totalPrice'
            }
          },
          {
            $group:{
              _id:{
                year:'$year',
                month:'$month',
              },
              totalSale:{$sum:'$totalAmount'}
            }
          },{
            $sort:{
              '_id.month':1
            }
          }
        ])
        console.log(monthlySales)
        const dashboarData = {
          userCount,
          blockedUsers,
          salesCount,
          revenue: revenue[0].revenue,
          placedOrder,
          monthlySales
        }
        console.log(dashboarData)
        resolve(dashboarData)
      }
      catch (err) {
        reject(err)
      }

    })
  }



  // getUserOrderList:(skipLimit)=>{
  //   return new Promise(async(resolve,reject)=>{
  //   const userData=  await order.aggregate([{
  //       $unwind:'$products'
  //     },
  //     {
  //       $match:{'products.itemStatus':{$ne:'cancelled'}}
  //     },
  //     {
  //       $group:{
  //         _id:'$userId',
  //         orderCount:{$sum:1}
  //       }
  //     },
  //     {
  //       $lookup:{
  //         from:'users',
  //         localField:'_id',
  //         foreignField:'_id',
  //         as:'user'
  //       }
  //     },
  //     {
  //       $unwind:'$user'
  //     },
  //     {
  //       $skip:skipLimit
  //     },
  //     {
  //       $limit:5
  //     }
  //   ])

  //     resolve(userData)
  //   })
  // }
} 