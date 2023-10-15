const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  category:{
    type:String,
    require:true
  },
  list:{
    type:Boolean,
    require:true,
    default:true
  },
  offers:[
    {
      discount:{
        type:Number,
      },
      startDate:{
        type:Date,
      },
      endDate:{
        type:Date
      }
    }
  ]
},{
  timestamps:true
})
module.exports = mongoose.model('Category', categorySchema);