const mongoose= require('mongoose');
const addressSchema= new mongoose.Schema({
userId:{
  type:mongoose.Types.ObjectId,
  ref:'users',
  require:true
},
firstName:{
  type:String,
  require:true,
},
lastName:{
  type:String,
  require:true
},
address:{
  type:Array,
  require:true,
},
city:{
  type:String,
  require:true
},
state:{
  type:String,
  require:true
},
pincode:{
  type:Number,
  require:true,
},
landMark:{
  type:String
}
})

module.exports=mongoose.model('address',addressSchema)