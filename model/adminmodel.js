const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  email:{
    type:String,
    require:true
  },
  password:{
    type:String,
    require:true
  },
  
},{
    timestamps:true
  })
module.exports = mongoose.model('Admin', adminSchema); 