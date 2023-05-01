const productSchema = require("../model/productSchema")
const user=require('../model/userSchema')
const  cartSchema=require('../model/cartSchema')
const { products } = require("./userController")
const couponSchema=require('../model/couponSchema')


const addToCart=async(req,res)=>{
    try {
        const productid=req.body.id
        const discountPrice=req.body.productPDiscount
        const productData=await productSchema.findOne({_id:productid})
        const userData=await user.findOne({_id:req.session.userId})
        const status=productData.status
        if(status==false){
            res.json({out:true})
        }else{
        if(req.session.userId){
            const userid=req.session.userId;
            const cartData=await cartSchema.findOne({userId:userid})
            if(cartData){
                const productExist= cartData.products.findIndex((product)=>product.productId==productid)
                if(productExist != -1){
                    await cartSchema.updateOne({userId:userid,"products.productId":productid},{$inc:{"products.$.count":1}})
                    res.json({success:true})
                }else{
                    await cartSchema.findOneAndUpdate({userId:req.session.userId},{$push:{products:{productId:productid,productPrice:discountPrice}}})
                    res.json({success:true})
                }
            }else{
                const cart= new cartSchema({
                    userId:userData._id,
                    user:userData.name,
                    products:[{
                        productId:productid,
                        productPrice:discountPrice
                    }]
                })
                const cartDatas=await cart.save()
                if(cartDatas){
                    res.json({success:true})
                }else{
                    res.redirect('/product')
                }
            }
        }else{
            res.redirect('/login')
        }}
    } catch (error){
        console.log(error.message);  
    }
}
const cartrender=async(req,res)=>{
    try {
       const session=req.session.userId;
       const userdata=await user.findOne({_id:session})
       const cartData=await cartSchema.findOne({userId:session}).populate('products.productId')

       if(req.session.userId){
       if(cartData){
        if(cartData.products.length>0){
            const products=cartData.products
            const total=await cartSchema.aggregate([{$match:{user:userdata.name}},{$unwind:'$products'},{$project:{productPrice:'$products.productPrice',cou:'$products.count'}},{$group:{_id:null,total:{$sum:{$multiply:['$productPrice','$cou']}}}}])
            const Total =total[0].total;
            const userId=userdata._id
            let customer=true
            const STD=45
            for(let i=0;i<products.length;i++){
                if(products[i].count==0){
                    await cartSchema.updateOne({userId:session},{$pull:{products:{count:0}}})
                }
            }
            res.render('cart',{customer,userdata,products,Total,userId,session,userdata,STD})
        }else{
    let customer=true;
    res.render('cartEmpty',{customer,userdata,session,message:'No product added to cart',wishlist:false}) 
}
       }else{
        let customer=true
        res.render('cartEmpty',{customer,userdata,session,message:'No product added to cart',wishlist:false})
       }
    }else{
        res.redirect('/sign')
    }
    } catch (error) {
        console.log(error.message)
    }
}
const cartprDlt=async(req,res)=>{
    try {
        const remove=await cartSchema.updateOne({userId:req.body.session},{$pull:{products:{productId:req.body.productId}}})
        if(remove){
            res.json({status:true})
        }
    } catch (error) {
        console.log(error.message)  
    }
}
const changeCount=async(req,res)=>{
    try {
        const userid=req.session.userId
          const cartData= await cartSchema.updateOne({userId:userid,"products._id":req.body.id},{$inc:{"products.$.count":req.body.count}})
          if(cartData){
            res.json({success:true})
          }
    } catch (error) {
        console.log(error.message)
    }  
}
module.exports={
addToCart,
cartrender,
cartprDlt,
changeCount
}