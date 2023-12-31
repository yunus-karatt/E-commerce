const mongoose= require('mongoose');
const orderSchema= new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:'users',
    require:true,
  },
  address:{
    type:Object,
    require:true,
},
  products: [{
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'products',
      require: true
    },
    quantity: {
      type: Number,
      require:true
    },
    pricePerQnt:{
      type:Number,
      require:true
    },
    itemStatus:{
      type:String,
      default:'confirm'
    }
  }],
  totalPrice:{
    type:Number,
    require:true,
  },
  orderDate:{
    type:Date,
    default:Date.now
  },
  shippedDate:{
    type:Date,
  },
  deliveredDate:{
    type:Date,
  },
  cancelDate:{
    type:Date
  },
  paymentMethod:{
    type:String,
    require:true
  },
  orderStatus:{
    type:String,
    require:true
  },
  cancelReason:{
    type:String
  },
  couponId:{
    type: mongoose.Types.ObjectId,
      ref: 'coupons',
  }

})
module.exports=mongoose.model('order',orderSchema)