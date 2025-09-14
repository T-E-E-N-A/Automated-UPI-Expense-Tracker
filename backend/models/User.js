const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name : {
        type:String,
        trim:true,
        required:true
    },
    email : {
        type:String,
        trim:true,
        required:true
    },
    password : {
        type:String,
        trim:true,
        required:true
    },
    transactions : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Expense'
        }
    ]
});

let User = mongoose.model('User',userSchema)

module.exports = User