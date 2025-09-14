const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    amount : {
        type:Number,
        min:0,
        trim:true,
        required:true
    },
    isCredit : {
        type:Boolean,
        required:true
    }
})

let Transaction = mongoose.model('Transaction',transactionSchema)

module.exports = Transaction