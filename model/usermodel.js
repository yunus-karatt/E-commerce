const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Username: {
        type: String,
        require: true
    },
    Password: {
        type: String,
        require: true
    },
    Confirmpassword: {
        type: String,
        require: true
    },
    Mobilenumber: {
        type: Number,
        require: true
    },
    Email: {
        type: String,
        require: true
    },
    Isverified: {
        type: Boolean,
        require: true,
        default: false
    },
    Isblocked: {
        type: Boolean,
        require: true,
        default: false
    },
    WalletBalance: {
        type: Number,
        default: 0
    },
    walletTopUp: [{
        topUpDate: {
            type: Date,
            default: Date.now
        },
        amount:{
            type:Number
        }
    }],
    referenceId: {
        type: String,
        require: true,
    },
    referencedBy: {
        type: mongoose.Types.ObjectId
    }


}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema);  