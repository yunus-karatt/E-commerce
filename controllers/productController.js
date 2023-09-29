const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const db = require('../config/connection')
const { ObjectId } = require('mongodb')
const { trusted } = require('mongoose')
module.exports = {
  // CATEGORY
  getAllCategory: () => {
    return new Promise(async (res, rej) => {
      try {
        let categorydata = await Category.find().lean()
        res(categorydata)
      }
      catch (err) {
        rej(err)
      }

    })
  },

  getCategory: () => {
    return new Promise(async (res, rej) => {
      try {
        let categorydata = await Category.find({ list: true }).lean()
        res(categorydata)
      }
      catch (err) {
        rej(err)
      }

    })
  },

  addCategory: (categoryData) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(categoryData)
        const existCategory = await Category.findOne({ category: categoryData.category })
        if (existCategory) {
          reject(new Error('category exist'))
        } else {
          await Category.create(categoryData);
          resolve()
        }

      }
      catch (err) {
        reject(err)
      }

    })
  },

  getSinleCat: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        singleCat = await Category.findOne({ _id: id }).lean()
        resolve(singleCat)
      }
      catch (err) {
        reject(err)
      }

    })
  },

  updateCategory: (id, catName) => {
    return new Promise(async (resolve, reject) => {
      try {
        await Category.updateOne({ _id: id }, { $set: { category: catName.singleCategory } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  listCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let listValue = await Category.findOne({ _id: id }, { list: 1 })
        listValue = !listValue.list;
        await Category.updateOne({ _id: id }, { $set: { list: listValue } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  listProduct: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const productData = await Product.aggregate([{
          $match: {
            Isdeleted: false
          }
        }, {
          $lookup: {
            from: 'categories',
            localField: 'Category',
            foreignField: '_id',
            as: 'Category'
          }
        }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
        resolve(productData)
      }
      catch (err) {
        reject(err)
      }

    })
  },

  addProduct: (product, image) => {
    return new Promise(async (resolve, reject) => {
      try {
        const images = image.map((file) => {
          return file.filename
        })
        let categId = await Category.findOne({ category: product.productCategory }, { _id: 1 });
        if (product.productCategory === 'Laptop') {
          const newProduct = ({
            Name: product.productName,
            Category: categId,
            Brand: product.productBrand,
            Description: product.productDescription,
            Features: [{
              Processor: product.productProcessor,
              RAM: product.productRam,
              Storage: product.productStorage,
              Operating_system: product.productOs,
              Color: product.productColor
            }],
            Price: product.productPrice,
            Stock_quantity: product.productQuantity,
            Images: images
          })
          await Product.create(newProduct)
        } else {
          const newProduct = ({
            Name: product.productName,
            Category: categId,
            Brand: product.productBrand,
            Description: product.productDescription,
            Features: [{
              RAM: product.productRam,
              Storage: product.productStorage,
              Operating_system: product.productOs,
              Color: product.productColor
            }],
            Price: product.productPrice,
            Stock_quantity: product.productQuantity,
            Images: images
          })
          await Product.create(newProduct)
        }
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },

  deleteProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await Product.updateOne({ _id: prodId }, { $set: { Isdeleted: true } })
        resolve()
      }
      catch (err) {
        reject(err)
      }

    })
  },

  getSinglePr: async (id) => {
    try {
      const productData = await Product.findOne({ _id: id }).lean()
      return productData
    }
    catch (err) {
      throw err;
    }
  },

  updateProduct: (id, updateData, updateImage) => {
    const images = updateImage.map((file) => {
      return file.filename
    })
    return new Promise(async (resolve, reject) => {
      const catId = await Category.findOne({ category: updateData.editPrCat })
      if (updateData.editPrCat === 'Laptop') {
        await Product.updateOne({ _id: id }, {
          $set: {
            Name: updateData.editPrName,
            Category: catId,
            Brand: updateData.editPrBrand,
            Description: updateData.editPrDes,
            Features: [{
              Processor: updateData.editPrProcessor,
              RAM: updateData.editPrRam,
              Storage: updateData.editPrStorage,
              Operating_system: updateData.editPrOs,
              Color: updateData.editPrColor
            }],
            Price: updateData.editPrPrice,
            Stock_quantity: updateData.editPrQuant,
            Images: images

          }
        })
      } else {
        await Product.updateOne({ _id: id }, {
          $set: {
            Name: updateData.editPrName,
            Category: catId,
            Brand: updateData.editPrBrand,
            Description: updateData.editPrDes,
            Features: [{
              RAM: updateData.editPrRam,
              Storage: updateData.editPrStorage,
              Operating_system: updateData.editPrOs,
              Color: updateData.editPrColor
            }],
            Price: updateData.editPrPrice,
            Stock_quantity: updateData.editPrQuant,
            Images: images

          }
        })
      }
      resolve()
    })
  },

  getProductEditCategory: (cat) => {
    return new Promise(async (resolve, reject) => {
      try {
        const category = await Category.find({ _id: { $ne: cat._id }, list: true }).lean()
        resolve(category)
      }
      catch (err) {
        reject(err)
      }
    })
  },

  viewproduct: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const product = await Product.aggregate([{ $match: { _id: new ObjectId(id) } }, {
          $lookup: {
            from: 'categories',
            localField: 'Category',
            foreignField: '_id',
            as: 'Category'
          }
        }, { $unwind: '$Category' }, { $unwind: '$Features' }])
        resolve(product)
      }
      catch (err) {
        reject(err)
      }
    })
  }
}
