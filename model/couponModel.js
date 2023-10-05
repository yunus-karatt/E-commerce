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
  discoutType: {
    type: String,
    require: true,
    enum: ['Percentage', 'Fixed']
  },
  discountValue: {
    type: Number,
    require: true,
  },
  usedUsers: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'users',
    }
  ],
  usersLimit:{
    type:Number,
    require:true
  },
  description:{
    type:String,
    require:true
  },
  coupenCode:{
    type:String,
    require:true
  }
})
module.exports = mongoose.model('coupon', couponSchema)