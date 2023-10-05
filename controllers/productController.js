const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const db = require('../config/connection')
const { ObjectId } = require('mongodb')
const { trusted } = require('mongoose')
const fs = require('fs')
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
        }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },
        
      
      ])
        resolve(productData)
      }
      catch (err) {
        reject(err)
      }

    })
  },
  getLimitedProduct:(number)=>{
    let pageNumber=parseInt(number)
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
        }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },
        {
          $skip:pageNumber*10
        } ,
        {
          $limit:10
        }
      
      ])
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
        let images = [];
        images[0] = image.productMainImages[0].filename
        image.productImages.map((file) => {
          images.push(file.filename)
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

  updateProduct: (id, updateData) => {
    // const images = updateImage.map((file) => {
    //   return file.filename
    // })
    console.log(updateData)
    return new Promise(async (resolve, reject) => {
      const catId = await Category.findOne({ category: updateData.editPrCat })
      console.log(catId)
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
  },
  deleteImage: (productId, imageData) => {
    const imagePath = './public/images/uploads/' + imageData;
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('deleted')
      }
    })
    try {
      return new Promise(async (resolve, reject) => {
        await Product.updateOne({ _id: productId }, { $pull: { Images: imageData } })
        resolve()
      })
    } catch (err) {
      throw err
    }
  },
  changeMainImage: (existFileName, newImage) => {
    const imagePath = './public/images/uploads/' + existFileName.existMainImage;
    const productId = existFileName.productId;
    const newFileName = newImage.mainIMageChange[0].filename
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('deleted')
      }
    })
    return new Promise(async (resolve, reject) => {
      try {
        await Product.updateOne({ _id: productId }, { $set: { 'Images.0': newFileName } })
        resolve()
      } catch (err) {
        reject(err)
      }

    })
  },
  addNewImage: (productId, image) => {
    const file = image.addNewImageInput[0].filename
    return new Promise(async (resolve, reject) => {
      try {
        console.log(productId)
        await Product.updateOne({ _id: productId }, { $push: { Images: file } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },
  getProductByCat: (category) => {
    return new Promise(async (resolve, reject) => {
      const catId = await Category.findOne({ category: category }, { _id: 1 })
      const productData = await Product.aggregate([{
        $match: {
          Category: catId._id,
          Isdeleted: false
        }
      }, {
        $lookup: {
          from: 'categories',
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },{$sort:{createdAt:-1}}])
      resolve(productData)
    })
  },
  getFilteredProd: (catId, filterValues,sortValues) => {
    let sortquery;
    if(sortValues==='asc'){
      sortquery={Price:1}
    }else if(sortValues==='dsc'){
      sortquery={Price:-1}
    }else{
      sortquery={createdAt:-1}
    }
    return new Promise(async (resolve, reject) => {
      const ramValues = filterValues.filter((value) => value.startsWith('Ram:'));
      const brandValues = filterValues.filter((value) => value.startsWith('Brand:'));
      const romValues = filterValues.filter((value) => value.startsWith('Rom:'));
      const colorValues = filterValues.filter((value) => value.startsWith('Color:'));
      const processorValues = filterValues.filter((value) => value.startsWith('Processor'))
      const filterConditions = [];
      if (ramValues.length > 0) {
        const ramCondition = {
          $or: ramValues.map((ram) => ({
            'Features.RAM': ram.replace('Ram:', ''),
          })),
        };
        filterConditions.push(ramCondition);
      }

      if (brandValues.length > 0) {
        const brandCondition = {
          Brand: { $in: brandValues.map((brand) => brand.replace('Brand:', '')) },
        };
        filterConditions.push(brandCondition);
      }
      if (romValues.length > 0) {
        const romConditions = {
          'Features.Storage': { $in: romValues.map((rom) => rom.replace('Rom:', '')) },

        };
        filterConditions.push(romConditions)
      }
      if (colorValues.length > 0) {
        const colorConditions = {
          'Features.Color': {
            $in: colorValues.map((color) => {
              const cleanedColor = color.replace('Color:', '')
              return new RegExp(cleanedColor, 'i');
            })
          }

        }
        filterConditions.push(colorConditions)
      }
      if (processorValues.length > 0) {
        const processorConditions = {
          'Features.Processor': {
            $in: processorValues.map((porcessor) => {
              const cleanedProcessor = porcessor.replace('Processor:', '')
              return new RegExp(cleanedProcessor, 'i');
            })
          }
        }
        filterConditions.push(processorConditions)
      }
      try {
        if(filterValues[0]===''){
          const productData = await Product.aggregate([{
            $match: {
              Category: new ObjectId(catId),
              Isdeleted: false,
            }
          }, {
            $lookup: {
              from: 'categories',
              localField: 'Category',
              foreignField: '_id',
              as: 'Category'
            }
          }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },{$sort:sortquery}])
          resolve(productData)
        }
        else if (filterValues.length == 1) {
          const productData = await Product.aggregate([{
            $match: {
              Category: new ObjectId(catId),
              Isdeleted: false,
              $or: filterConditions
            }
          }, {
            $lookup: {
              from: 'categories',
              localField: 'Category',
              foreignField: '_id',
              as: 'Category'
            }
          }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },{$sort:sortquery}])
          resolve(productData)

        } else {

          console.log(filterConditions)
          const productData = await Product.aggregate([
            {
              $match: {
                Category: new ObjectId(catId),
                Isdeleted: false,
                $and: filterConditions
              },
            }, {
              $lookup: {
                from: 'categories',
                localField: 'Category',
                foreignField: '_id',
                as: 'Category'
              }
            }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },{$sort:sortquery}])
          resolve(productData)
        }
      } catch (err) {
        console.log(err)
      }
    })
  },
  searchProduct:(search)=>{
    return new Promise(async(resolve,reject)=>{
      const searchQuery=new RegExp(search,'i')
      const productData=await Product.aggregate([ {
        $lookup: {
          from: 'categories',
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },{
        $match: {
          Isdeleted: false,
          $or:[
            {Name:{$regex:searchQuery}},
            {Brand:{$regex:searchQuery}},
            {'Features.RAM':{$regex:searchQuery}},
            {'Features.Storage':{$regex:searchQuery}},
            {'Features.Color':{$regex:searchQuery}},
            {'Category.category':{$regex:searchQuery}}
          ]
        }
      }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
      console.log(productData)
      resolve(productData)
    })
  }
  // getSortedProduct: (catId, minmPrice, maxmPrice) => {
  //   return new Promise(async (resolve, reject) => {
  //     if(maxmPrice==='above:50000'){
  //       const productData = await Product.aggregate([{
  //         $match: {
  //           Category: new ObjectId(catId),
  //           Isdeleted: false,
  //           Price:{$gte:50000}
  //         }
  //       }, {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'Category',
  //           foreignField: '_id',
  //           as: 'Category'
  //         }
  //       }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
  //       resolve(productData)
  //     }else{
  //     const minPrice = parseInt(minmPrice)
  //     const maxPrice = parseInt(maxmPrice)
  //     if(isNaN(minPrice)){
  //       const productData = await Product.aggregate([{
  //         $match: {
  //           Category: new ObjectId(catId),
  //           Isdeleted: false,
  //           Price:{$lte:maxPrice}
  //         }
  //       }, {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'Category',
  //           foreignField: '_id',
  //           as: 'Category'
  //         }
  //       }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
  //       resolve(productData)
  //     }else{
  //       try {
  //       const productData = await Product.aggregate([{
  //         $match: {
  //           Category: new ObjectId(catId),
  //           Isdeleted: false,
  //           Price:{$gte:minPrice,$lte:maxPrice}
  //         }
  //       }, {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'Category',
  //           foreignField: '_id',
  //           as: 'Category'
  //         }
  //       }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
  //       resolve(productData)
  //     } catch (err) {
  //       console.log(err)
  //     }
  //     }
      
  //   }
  //   })
  // },
  // sortProduct:(id,sortBy)=>{
  //   return new Promise(async(resolve,reject)=>{
  //     if(sortBy==='asc'){
  //       const prodData=await Product.aggregate([{
  //         $match: {
  //           Isdeleted: false,
  //           Category:new ObjectId(id)
  //         }
  //       }, {
  //         $lookup: {
  //           from: 'categories',
  //           localField: 'Category',
  //           foreignField: '_id',
  //           as: 'Category'
  //         }
  //       }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }])
  //       console.log(prodData)
  //     }
  //   })
  // }

}
