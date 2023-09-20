const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  Username:{
    type:String,
    require:true
},  
Password:{
    type:String,
    require:true
},
Confirmpassword:{
    type:String,
    require:true
},
Mobilenumber:{
    type:Number,
    require:true
},
Email:{
    type:String,
    require:true
},
Isverified:{
    type:Boolean,
    require:true,
    default:false
},
Isblocked:{
    type:Boolean,
    require:true,
    default:false
}


},{
    timestamps:true
  })

module.exports = mongoose.model('User', userSchema); 