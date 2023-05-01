const cartSchema = require('../model/cartSchema')
const productschema=require('../model/productSchema')
const user=require('../model/userSchema')
const whishListSchema=require('../model/whishlistSchema')

const addtowhishlist=async(req,res)=>{
    try {
        const productId=req.body.id
        const session=req.session.userId
        const productData =await productschema.findOne({_id:productId})  
        const userData=await user.findOne({_id:session})
        const whishListData=await whishListSchema.findOne({user:userData._id})
        if(whishListData){
            const wishExits=whishListData.product.findIndex((product)=>product.productId==productId);
        if(wishExits!=-1){
            res.json({productExit:true})
        }else{
            await whishListSchema.updateOne({user:userData._id},
                {
                    $push:{
                        product:[{
                            productId:productData._id,
                        name:productData.name,
                        price:productData.price
                    }]
                }
                })
        }
        res.json({status:true})
    }else{
        const whishList=new whishListSchema({
            user:userData._id,
            product:[{
            productId:productData.id,
            name:productData.name,
            price:productData.price
         } ]
        })
        await whishList.save()
        res.json({status:true})
    }
    } catch (error) {
        console.log(error.message)
    }
}
const wishlist=async(req,res)=>{
    try {
       const session= req.session.userId
       const userdata=await user.findOne({_id:session})
       const wishlistData=await whishListSchema.findOne({user:session}).populate('product.productId')
       const products=wishlistData.product
       if(products.length==0){
        res.render('cartEmpty',{session,userdata,wishlist:true})
       }else{
        res.render('Whishlist',{session,userdata,wishlistData,products})
       }
    } catch (error) {
        console.log(error.message)
    }
}
const wishlistremove=async(req,res)=>{
    try {
        const Id=req.query.id
        const remove=await whishListSchema.updateOne({user:Id},{$pull:{product:{productId:req.query.prId}}})
        if(remove){
            res.redirect('/whishlist')
        }   
    } catch (error) {
        console.log(error.message)
    }
}
const addTowish=async(req,res)=>{
    try {
        const productid=req.body.id
        const productData=await productschema.findOne({_id:productid})
        const userData=await user.findOne({_id:req.session.userId})
        const status=productData.status
        if(status==false){
            res.json({out:true})
        }else{
        if(req.session.userId){
            const userid=req.session.userId;
            const cartData=await cartSchema.findOne({userId:userid})
            if(cartData){
                const productExist= await cartData.products.findIndex((product)=>product.productId==productid)
                if(productExist != -1){
                    await whishListSchema.updateOne({user:req.session.userId},{$pull:{product:{productId:productid}}})                   
                    res.json({success:true})
                }else{
                    await cartSchema.findOneAndUpdate({userId:req.session.userId},{$push:{products:{productId:productid,productPrice:productData.price}}})
                    await whishListSchema.updateOne({user:req.session.userId},{$pull:{product:{productId:productid}}})                   
                     res.json({success:true})
                }
            }else{
                const productData= await whishListSchema.updateOne({user:req.session.userId},{$pull:{product:{productId:productid}}})
              const cart= new cartSchema({
                    userId:userData._id,
                    user:userData.name,
                    products:[{
                        productId:productid,
                        productPrice:productData.price
                    }]
                })
                const cartDatas=await cart.save()
                if(cartDatas){
                    
                    res.json({success:true})
                }else{
                    res.redirect('/whishlist')
                }
            }
        }else{
            res.redirect('/login')
        }}
    } catch (error){
        console.log(error.message);
       
    }
}
module.exports={
    wishlist,
    addtowhishlist,
    wishlistremove,
    addTowish
}
