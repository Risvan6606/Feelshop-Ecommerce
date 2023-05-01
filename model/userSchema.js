const mongoose=require('mongoose')
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Number,
        required:true
    },
    isVerified:{
        type:Number,
        default:0
    },
    isBlock:{
        type:Number,
        default:0  
    },
    whishList:{
        type:String,
        required:false
    },
    wallet:{
        type:Number,
        default:0
    }
})

 module.exports= mongoose.model('signup',userSchema)