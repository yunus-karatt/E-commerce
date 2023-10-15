const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  Email:{
    type:String,
    require:true
  },
  Password:{
    type:String,
    require:true
  },
  
},{
    timestamps:true
  })
module.exports = mongoose.model('Admin', adminSchema); 