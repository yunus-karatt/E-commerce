const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const productSchema = new mongoose.Schema({
  Name:{
    type:String,
    require:true
  },
  Category:{
    type:Schema.Types.ObjectId,
    ref:'Category',
    require:true
  },
  Brand:{
    type:String,
    require:true
  },
  Description:{
    type:String,
    require:true
  },
  Features:[
    {
      Processor:String,
      RAM:String,
      Storage:String,
      Operating_system:String,
      Color:String,
    }
  ],
  Price:Number,
  Stock_quantity:Number,
  Images:[String],
  Isdeleted:{
    type:Boolean,
    default:false

  }

},{
  timestamps:true
})
module.exports=mongoose.model('Product',productSchema)