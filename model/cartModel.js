const mongoose= require('mongoose')
const cartSchema= new mongoose.Schema({
userId:{
  type:mongoose.Types.ObjectId,
  ref:'users',
  require:true
},
productId:{
  type:[mongoose.Types.ObjectId],
  ref:'products',
  require:true
}
},{
  timestamps:true
})
module.exports= mongoose.model('cart',cartSchema)