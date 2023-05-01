const couponSchema=require('../model/couponSchema')

// coupon
const couponrender=async(req,res)=>{
    try {
        res.render('coupon')
    } catch (error) {
        console.log(error.message)
    }
}
const couponPost=async(req,res)=>{
    try {
        const coupon=new couponSchema({
            code:req.body.code,
            discoundType:req.body.discoundType,
            discountAmount:req.body.discountAmount,
            expiryDate:req.body.date,
            maxCartAmount:req.body.maxCartAmount,
            maxDicountAmount:req.body.maxDicountAmount,
            maxCount:req.body.maxCount
        })
        const couponData=coupon.save()
        if(couponData){
            res.render('coupon',{message:'coupon added successfully'})
            
        }else{
            res.render('coupon',{message:'coupon added fail'})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const couponList=async(req,res)=>{
    try {
        const couponData=await couponSchema.find()
        res.render('couponList',{couponData})
    } catch (error) {
        console.log(error.message)
    }
}
const couponRemove=async(req,res)=>{
    try {
      const deletet=await couponSchema.deleteOne({_id:req.body.id})
      if(deletet){
        res.json({success:true})
        res.redirect('/admin/productList')
    }else{
        res.redirect('/admin/productList')
    }
    } catch (error) {
        console.log(error.message)
    }
}
const couponEdit=async(req,res)=>{
    try {
       const couponData= await couponSchema.find({_id:req.query.id})
       if(couponData){
        res.render('couponEdit',{couponData})
       }
    } catch (error) {
        console.log(error.message)
    }
}
const couponUpdate=async(req,res)=>{
    try {
        if(req.body.date){
        const code=req.body.code
        const discoundType=req.body.discoundType
        const discountAmount=req.body.discountAmount
        const expiryDate=req.body.date
        const maxCartAmount=req.body.maxCartAmount
        const maxDicountAmount=req.body.maxDicountAmount
        const maxCount=req.body.maxCount
        const Id=req.body.id
      const updateData=await  couponSchema.findByIdAndUpdate({_id:Id},{$set:{code:code,discoundType:discoundType,discountAmount:discountAmount,expiryDate:expiryDate,maxCartAmount:maxCartAmount,maxDicountAmount:maxDicountAmount,maxCount:maxCount}})
      if(updateData){
        res.redirect('/admin/couponList')
      }
        }else{
            const code=req.body.code
            const discoundType=req.body.discoundType
            const discountAmount=req.body.discountAmount
            const maxCartAmount=req.body.maxCartAmount
            const maxDicountAmount=req.body.maxDicountAmount
            const maxCount=req.body.maxCount
            const Id=req.body.id
          const updateData= await couponSchema.findByIdAndUpdate({_id:Id},{$set:{code:code,discoundType:discoundType,discountAmount:discountAmount,maxCartAmount:maxCartAmount,maxDicountAmount:maxDicountAmount,maxCount:maxCount}})
          if(updateData){
            res.redirect('/admin/couponList')
          }
        }
    } catch (error) {
        console.log(error.message)
    }
}
const applyCoupon=async(req,res)=>{
    try {
        const userId=req.session.userId
        const code=req.body.code
        const amount =Number(req.body.amount)
        const userExist=await couponSchema.findOne({code:code,user:{$in:[userId]}})
        if(userExist){
            res.json({user:true})
        }else{
            const couponData=await couponSchema.findOne({code:code})
            if(couponData){
            if(couponData.maxCount<=0){
                res.json({limit:true})
            }else{
                if(couponData.status==false){
                    res.json({status:true})
                }else{
                    if(couponData.expiryDate<=new Date()){
                        res.json({date:true})
                    }else{
                        if(couponData.maxCartAmount>=amount){
                            res.json({cartAmount:true})
                        }else{
                            await couponSchema.findByIdAndUpdate({_id:couponData._id},{$push:{user:userId}})
                            await couponSchema.findByIdAndUpdate({_id:couponData._id},{$inc:{maxCount:-1}})
                            if(couponData.discoundType=='fixed'){
                                const discountAmount=couponData.discountAmount
                                const DisTotal=Math.round(amount-discountAmount)
                                return res.json({amountOkey:true,discountAmount,DisTotal})
                            }else if(couponData.discoundType=='persentage'){
                            const perAmount=(amount*couponData.discountAmount)/100
                            if(perAmount<=couponData.discountAmount){
                                const discountAmount=perAmount
                                const DisTotal=math.round(amount-discountAmount)
                                return res.json({amountOkey:true,discountAmount,DisTotal})
                            }
                            }else{
                                const discountAmount=couponData.maxDicountAmount
                                const DisTotal=Math.round(amount-discountAmount)
                                return res.json({amountOkey:true,discountAmount,DisTotal})
                            }
                        }
                    }
                }
            }
        }else{
            console.log('hai12');
            res.json({invalid:true})
        }
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    couponrender,
    couponPost,
    couponList,
    couponRemove,
    couponEdit,
    couponUpdate,
    applyCoupon
}