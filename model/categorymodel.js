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
  }
},{
  timestamps:true
})
module.exports = mongoose.model('Category', categorySchema);