const mongoose=require('mongoose')
const catogorySchma= mongoose.Schema({
     name:{
        type:String,
        required:true
     },
        Block:{
            type:Boolean,
            default:true
        }
})
 module.exports= mongoose.model('catogory',catogorySchma)