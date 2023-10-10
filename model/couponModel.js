const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    require: true
  },
  endDate: {
    type: Date,
    require: true
  },
  discountValue: {
    type: Number,
    require: true,
  },
  usedUsersCount: {
    type:Number,
    default:0
  },
  usersLimit:{
    type:Number,
    require:true
  },
  description:{
    type:String,
    require:true
  },
  couponCode:{
    type:String,
    require:true
  },
  purchaseLimit:{
    type:Number,
  }
})
module.exports = mongoose.model('coupon', couponSchema)