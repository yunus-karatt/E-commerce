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
  paymentMethod:{
    type:String,
    require:true
  },
  orderStatus:{
    type:String,
    require:true
  }

})
module.exports=mongoose.model('order',orderSchema)