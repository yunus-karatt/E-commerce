const mongoos= require('mongoose')
const {Schema}= require('mongoose')
const wishListSchema = new mongoos.Schema({
  userId:{
    type:mongoos.Types.ObjectId,
    ref:'users',
    require:true
  },
  productId:{
    type:[mongoos.Types.ObjectId],
    ref:'products',
    require:true
  }
},{
  timestamps:true
})
module.exports=mongoos.model('wishList',wishListSchema)