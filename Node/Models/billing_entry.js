var mongoose = require('mongoose');
Schema = mongoose.Schema;

var billEntry =new mongoose.Schema(
{
    addedBy:{
        name:{type:String},
        usercode:{type:String},
    },
    paidBy:{
        name:{type:String},
        usercode:{type:String},
    },
    amount:{type:Number},
    comment:{type:String},
    participant:[
        {
            _id:false,
            name:{type:String},
            usercode:{type:String},
        }
    ],
    entryOn:{type:Date},
    paidOn:{type:Date}
});   
module.exports = mongoose.model('billing_entry',billEntry,'billing_entry');