const mongoose=require('mongoose')

const couponSchema=new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    discoundType:{
        type:String,
        required:true
    },
    discountAmount:{
        type:Number,
    },
    maxCartAmount:{
        type:Number
    },
    maxDicountAmount:{
        type:Number
    },
    user:{
        type:Array,
        ref:'signup',
        default:[]
    },
    maxCount:{
        type:Number
    },
    status:{
        type:Boolean,
        default:true
    },
    expiryDate:{
        type:Date,
        required:true
    }
})
module.exports=mongoose.model('coupon',couponSchema)
