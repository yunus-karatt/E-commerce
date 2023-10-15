const Category = require('../model/categoryModel')
const Product = require('../model/productModel')
const db = require('../config/connection')
const userController = require('../controllers/userController')
const { ObjectId } = require('mongodb')
const { trusted } = require('mongoose')
const fs = require('fs')
const { count } = require('console')
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
  productCount: async () => {
    try {
      const count = await Product.aggregate([{
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
      }, { $match: { 'Category.list': true } }
        , {
        $group: {
          _id: null,
          count: { $sum: 1 },

        }
      }, {
        $project: {
          count: 1,
          _id: 0
        }
      }
      ])
      let totalPages
      let totalPageArr = []
      let lastPage
      if (count.length !== 0) {
        totalPages = Math.ceil(count[0].count / 10)
        for (let i = 1; i <= totalPages; i++) {
          totalPageArr.push(i)
        }
      }
      if (totalPageArr.length != 0) {
        lastPage = totalPageArr[totalPageArr.length - 1]

      }
      return { totalPageArr, lastPage }
    }
    catch (err) {
      return (err)
    }

  },
  getLimitedProduct: async (number) => {
    let pageNumber = parseInt(number)
    const limit = 10
    const skip = (pageNumber - 1) * limit

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
          $skip: skip
        },
        {
          $limit: limit
        }

        ])

        for (const product of productData) {
          const currentDate = new Date();
          if (product && product.Category && product.Category.offers) {


            for (const offer of product.Category.offers) {
              if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                product.offerPercentage = offer.discount
                product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
              }
            }
          }
        }
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
    return new Promise(async (resolve, reject) => {
      try {
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
      }
      catch (err) {
        reject(err)
      }

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
        await Product.updateOne({ _id: productId }, { $push: { Images: file } })
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  },
  getProductByCat: (category, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wishData;
        if (user) {
          userController.getWishLish(user).then((data) => wishData = data)

        }
        const catId = await Category.findOne({ category: category }, { _id: 1 })
        let productData = await Product.aggregate([
          {
            $match: {
              Category: catId._id,
              Isdeleted: false
            }
          },
          {
            $lookup: {
              from: 'categories',
              localField: 'Category',
              foreignField: '_id',
              as: 'Category'
            }
          },
          {
            $unwind: '$Category'
          },
          {
            $unwind: '$Features'
          },
          {
            $match: { 'Category.list': true }
          },
          {
            $sort: { createdAt: -1 }
          },
        ])
        if (wishData && wishData.length != 0) {
          productData = productData.map((id) => {
            if (wishData[0].productId.includes(id._id)) {
              return { ...id, inWishlist: true }
            }
            return id
          })
        }
        for (const product of productData) {
          const currentDate = new Date();
          if (product && product.Category && product.Category.offers) {
            for (const offer of product.Category.offers) {
              if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                product.offerPercentage = offer.discount
                product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
              }
            }
          }
        }
        resolve(productData)
      }
      catch (err) {
        reject(err)
      }

    })
  },
  getFilteredProd: (catId, filterValues, sortValues, user) => {
    let sortquery;
    let wishData;
    if (user) {
      userController.getWishLish(user).then((data) => wishData = data)

    }
    if (sortValues === 'asc') {
      sortquery = { Price: 1 }
    } else if (sortValues === 'dsc') {
      sortquery = { Price: -1 }
    } else {
      sortquery = { createdAt: -1 }
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
        if (filterValues[0] === '') {
          let productData = await Product.aggregate([{
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
          }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }, { $sort: sortquery },

          ])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        }
        else if (filterValues.length == 1) {
          let productData = await Product.aggregate([{
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
          }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }, { $sort: sortquery }])
          if (wishData) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)

        } else {

          let productData = await Product.aggregate([
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
            }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } }, { $sort: sortquery },
          ])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        }
      } catch (err) {
        reject(err)
      }
    })
  },
  searchProduct: (search, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        const searchQuery = new RegExp(search, 'i')
        let wishData;
        if (user) {
          userController.getWishLish(user).then((data) => wishData = data)
        }
        let productData = await Product.aggregate([{
          $lookup: {
            from: 'categories',
            localField: 'Category',
            foreignField: '_id',
            as: 'Category'
          }
        }, {
          $match: {
            Isdeleted: false,
            $or: [
              { Name: { $regex: searchQuery } },
              { Brand: { $regex: searchQuery } },
              { 'Features.RAM': { $regex: searchQuery } },
              { 'Features.Storage': { $regex: searchQuery } },
              { 'Features.Color': { $regex: searchQuery } },
              { 'Category.category': { $regex: searchQuery } }
            ]
          }
        }, { $unwind: '$Category' }, { $unwind: '$Features' }, { $match: { 'Category.list': true } },])
        if (wishData && wishData.length !== 0) {
          productData = productData.map((id) => {
            if (wishData[0].productId.includes(id._id)) {
              return { ...id, inWishlist: true }
            }
            return id
          })
        }
        for (const product of productData) {
          const currentDate = new Date();
          if (product && product.Category && product.Category.offers) {
            for (const offer of product.Category.offers) {
              if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                product.offerPercentage = offer.discount
                product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
              }
            }
          }
        }
        resolve(productData)
      }
      catch (err) {
        reject(err)
      }

    })
  },
  getFilteredSearchProd: (search, filterValues, sortValues, user) => {
    let sortquery;
    let wishData;
    if (user) {
      userController.getWishLish(user).then((data) => wishData = data)
    }
    const searchQuery = new RegExp(search, 'i')
    if (sortValues === 'asc') {
      sortquery = { Price: 1 }
    } else if (sortValues === 'dsc') {
      sortquery = { Price: -1 }
    } else {
      sortquery = { createdAt: -1 }
    }
    return new Promise(async (resolve, reject) => {
      const ramValues = filterValues.filter((value) => value.startsWith('Ram:'));
      const brandValues = filterValues.filter((value) => value.startsWith('Brand:'));
      const romValues = filterValues.filter((value) => value.startsWith('Rom:'));
      const colorValues = filterValues.filter((value) => value.startsWith('Color:'));
      const processorValues = filterValues.filter((value) => value.startsWith('Processor'));
      const categoryValues = filterValues.filter((value) => value.startsWith('Cat'))
      const filterConditions = [];
      const categoryConditions = [];
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
      if (categoryValues.length > 0) {
        const categoryCondition = {
          'Category.category': {
            $in: categoryValues.map((category) => {
              const cleanedCategory = category.replace('Cat:', '')
              return new RegExp(cleanedCategory, 'i');
            })
          }
        }
        categoryConditions.push(categoryCondition)
      }
      try {
        if (categoryConditions.length == 0 && filterConditions.length != 0) {
          let productData = await Product.aggregate([
            {
              $match: {
                Isdeleted: false,
                $and: filterConditions,

                $or: [
                  { Name: { $regex: searchQuery } },
                  { Brand: { $regex: searchQuery } },
                  { 'Features.RAM': { $regex: searchQuery } },
                  { 'Features.Storage': { $regex: searchQuery } },
                  { 'Features.Operating_system': { $regex: searchQuery } },
                  { 'Features.Color': { $regex: searchQuery } },
                ]
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'Category',
                foreignField: '_id',
                as: 'Category'
              }
            },
            {
              $unwind: '$Category'
            },
            {
              $unwind: '$Features'
            },
            {
              $match: { 'Category.list': true, }
            },
            {
              $sort: sortquery
            }
          ])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        }
        else if (filterConditions.length == 0 && categoryConditions.length !== 0) {
          let productData = await Product.aggregate([
            {
              $match:
              {
                Isdeleted: false,
                $or: [
                  { Name: { $regex: searchQuery } },
                  { Brand: { $regex: searchQuery } },
                  { 'Features.RAM': { $regex: searchQuery } },
                  { 'Features.Storage': { $regex: searchQuery } },
                  { 'Features.Operating_system': { $regex: searchQuery } },
                  { 'Features.Color': { $regex: searchQuery } },
                ]
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'Category',
                foreignField: '_id',
                as: 'Category'
              }
            },
            {
              $unwind: '$Category'
            },
            {
              $unwind: '$Features'
            },
            {
              $match:
              {
                'Category.list': true,
                $or: categoryConditions
              }
            },
            {
              $sort: sortquery
            }
          ])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        } else if (filterConditions.length == 0 && categoryConditions.length == 0) {
          let productData = await Product.aggregate([
            {
              $match:
              {
                Isdeleted: false,
                $or: [
                  { Name: { $regex: searchQuery } },
                  { Brand: { $regex: searchQuery } },
                  { 'Features.RAM': { $regex: searchQuery } },
                  { 'Features.Storage': { $regex: searchQuery } },
                  { 'Features.Operating_system': { $regex: searchQuery } },
                  { 'Features.Color': { $regex: searchQuery } },
                ]
              },
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'Category',
                foreignField: '_id',
                as: 'Category'
              }
            },
            {
              $unwind: '$Category'
            },
            {
              $unwind: '$Features'
            },
            {
              $match: {
                'Category.list': true,
              }
            }, { $sort: sortquery }])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        }
        else {
          let productData = await Product.aggregate([
            {
              $match:
              {
                Isdeleted: false,
                $and: filterConditions,
                $or: [
                  { Name: { $regex: searchQuery } },
                  { Brand: { $regex: searchQuery } },
                  { 'Features.RAM': { $regex: searchQuery } },
                  { 'Features.Storage': { $regex: searchQuery } },
                  { 'Features.Operating_system': { $regex: searchQuery } },
                  { 'Features.Color': { $regex: searchQuery } },
                ]
              },
            },
            {
              $lookup: {
                from: 'categories',
                localField: 'Category',
                foreignField: '_id',
                as: 'Category'
              }
            },
            {
              $unwind: '$Category'
            },
            {
              $unwind: '$Features'
            },
            {
              $match: {
                'Category.list': true,
                $or: categoryConditions
              }
            }, { $sort: sortquery }])
          if (wishData && wishData.length != 0) {
            productData = productData.map((id) => {
              if (wishData[0].productId.includes(id._id)) {
                return { ...id, inWishlist: true }
              }
              return id
            })
          }
          for (const product of productData) {
            const currentDate = new Date();
            if (product && product.Category && product.Category.offers) {


              for (const offer of product.Category.offers) {
                if (offer.startDate <= currentDate && offer.endDate >= currentDate) {
                  product.offerPercentage = offer.discount
                  product.offerPrice = product.Price - (product.Price * offer.discount) / 100;
                }
              }
            }
          }
          resolve(productData)
        }
      } catch (err) {
        reject(err)
      }
    })
  },
  addCategoryOffer: (formData) => {
    return new Promise(async (resolve, reject) => {
      try {
        const catData = await Category.findOneAndUpdate(
          { _id: formData.formData.catId },
          {
            $push: {
              offers: {
                $each: [
                  {
                    startDate: formData.formData.startDate,
                    endDate: formData.formData.endDate,
                    discount: formData.formData.discountAmount
                  },
                ],
              },
            },
          },
          { new: true }
        );
        resolve()
      }
      catch (err) {
        reject(err)
      }
    })
  }
}
