const mongoose=require('mongoose');
const walletSchema=new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    ref:'users',
    require:true
  },
  balance:{
    type:Number,
    require:true
  }
})
module.exports=mongoose.model('wallet',walletSchema)