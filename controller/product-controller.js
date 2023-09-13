const Category= require('../model/categorymodel')
const db = require('../config/connection')
const { ObjectId } = require('mongodb')
module.exports={
  getCategory:()=>{
    return new Promise(async(res,rej)=>{
     let categorydata=await Category.find()
     res(categorydata)
    })
  },
  addCategory:(categoryData)=>{
    return new Promise(async(resolve,reject)=>{
      await Category.create(categoryData);
      resolve()
    })

  },
  getSinleCat:(id)=>{
    return new Promise(async(resolve,reject)=>{
      singleCat = await Category.findOne({_id:id}).lean()
      resolve(singleCat)
    })
  },
  updateCategory:(id,catName)=>{
    console.log(id,catName.singleCategory)
    return new Promise(async(resolve,reject)=>{
      await Category.updateOne({_id:id},{$set:{category:catName.singleCategory}})
      resolve()
    })
  },
  listCategory:(id)=>{
    return new Promise(async(resolve,reject)=>{
      let listValue= await Category.findOne({_id:id},{list:1})
       listValue=!listValue.list;
      await Category.updateOne({_id:id},{$set:{list:listValue}})
      resolve()
    })
  }
}
