const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
    require: true
  },
  product: [{
    productId: {
      type: mongoose.Types.ObjectId,
      ref: 'products',
      require: true
    },
    count: {
      type: Number,
      default: 1
    }
  }]
}, {
  timestamps: true
})
module.exports = mongoose.model('cart', cartSchema)