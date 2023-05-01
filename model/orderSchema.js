const mongoose=require('mongoose')
const orderSchma=new mongoose.Schema({
  deliveryDetails:{
    type:String,
    required:true
  },
  user:{
    type:String,
    ref:'user'
  },
  userId:{
    type:String
  },
  paymentMethod:{
    type:String,
    default:'wallet'
  },
  product:[
    {
        productId:{
            type:String,
            ref:'product',
            required:true
        },
        count:{
            type:Number,
            required:true
        }
    }],
    totalAmout:{
        type:Number,
    },
    Date:{
        type:Date
    },
    status:{
        type:String,
    },
    paid:{
      type:Number

    },
    wallet:{
      type:Number,
    },
    paymentId:{
        type:String
    },

},{
    timestamps:true
}
);
module.exports=mongoose.model("order",orderSchma)