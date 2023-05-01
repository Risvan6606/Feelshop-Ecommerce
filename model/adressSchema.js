const mongoose=require('mongoose')
const addressSchema=new mongoose.Schema({
    userId:{
        type:String,
        ref:'user',
        required:true,
    },
    user:{
        type:String,
        required:true
    },
address:[{
   Fname:{
    type:String,
    required:true,
   } ,
   Lname:{
    type:String,
    required:true
    // trim:true
   },
   mobile:{
    type:Number,
    required:true
    // trim:true

   },
   address:{
    type:String,
    required:true
   },
   state:{
    type:String,
    required:true
    // trim:true
   },
   city:{
    type:String,
    required:true
    // trim:true
   },
   pincode:{
    type:String,
    required:true
    // trim:true
   }
}]
})
module.exports=mongoose.model('address',addressSchema)
