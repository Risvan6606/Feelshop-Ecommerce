const productschema=require('../model/productSchema')
const catogorySchma=require('../model/categorySchema')
const { query } = require('express')


// product listing
const listProduct=async(req,res)=>{
    try {
        const prodactlist= await productschema.find()
     
        if(prodactlist){
        res.render('productlist',{prodactlist,message:'product not added'})
        }else{
            res.render('productlist',{message:'product not added'})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const productAdd=async(req,res)=>{
    try {
        const catogoryData=await catogorySchma.find()
        res.render('productAdd',{catogoryData})
    } catch (error) {
        console.log(error.message)
    }
}
const productPost=async(req,res)=>{
    try {
        const image= [];
        for(let i=0;i<req.files.length;i++){
            image[i]=req.files[i].filename
        }
        if(req.body.name.trim().length==0||req.body.price.trim().length==0||req.body.discription.trim().length==0||req.body.catogory.trim().length==0||req.body.qty.trim().length==0||req.body.discount.trim().length==0){
            const catogoryData=await catogorySchma.find()
            res.render('productAdd',{message:'please fill all columns',catogoryData})
        }
        else if(req.body.price<0){
            const catogoryData=await catogorySchma.find()
            res.render('productAdd',{message:'please add valid price',catogoryData})
        }
        else if(req.body.qty<0){
            const catogoryData=await catogorySchma.find()
            res.render('productAdd',{message:'please add valid Quantity',catogoryData})
        }
        else if(req.body.discount<0){
            const catogoryData=await catogorySchma.find()
            res.render('productAdd',{message:'please add valid discount',catogoryData})
        }
        else{
       const products=new productschema({
            name:req.body.name,
            price:req.body.price, 
            image: image,
            discription:req.body.discription,  
            catogary:req.body.catogory,
            quantity:req.body.qty,
            discount:req.body.discount
           
        })
       const produc =await products.save()
       if(produc){
        res.redirect('/admin/productlist')
       }
    }
    } catch (error) {   
        console.log(error.message)
    }
}
const deleteProduct=async(req,res)=>{
    try {
      if(req.query.id){
        await productschema.deleteOne({_id:req.query.id})
        res.redirect('/admin/productlist')
      }else{
        res.render('productlist')
      }
    } catch (error) {
        console.log(error.message)
    }
}
const statusProduct=async(req,res)=>{
    try {
        if(req.query.data){
            await productschema.updateOne({_id:req.query.id},{$set:{status:false}})
            res.redirect('/admin/productlist')
        }else{
            await productschema.updateOne({_id:req.query.id},{$set:{status:true}})
            res.redirect('/admin/productlist')
        }
    } catch (error) {
        console.log(error.message)
    }
}
const productEdit=async(req,res)=>{
    const price= req.query.price
    const name= req.query.name
    const catogary= req.query.catogary
    const quantity= req.query.quantity  
    const discrip=req.query.discrip
    const Id=req.query.id
    const discount=req.query.discount
    try {
         const product=await catogorySchma.find()
         const images=await productschema.findOne({_id:Id})
        res.render('productEdit',{price,name,images,product,quantity,discrip,Id,discount})
    } catch (error) {
        console.log(error.message)
    }
}
const postProductEdit=async(req,res)=>{
    try{
        if(req.body.name.trim().length==0||req.body.price.trim().length==0||req.body.qty.trim().length==0||req.body.discription.trim().length==0||req.body.discount.trim().length==0){
            const price= req.query.price
    const name= req.query.name
    const catogary= req.query.catogary
    const quantity= req.query.quantity  
    const discrip=req.query.discrip
    const Id=req.query.id
    const discount=req.query.discount
    const product=await catogorySchma.find()
         const images=await productschema.findOne({_id:Id})
            res.render('productEdit',{price,name,images,product,quantity,discrip,Id,discount,message:'please fill all columns'})
        }else{
        if(req.files.length!=0){ 
    const images= [];
        for(let i=0;i<req.files.length;i++){
            images[i]=req.files[i].filename
        }
    const Iname=req.body.name
    const price=req.body.price
    const image=images
    const catogary=req.body.catogory
    const quantity=req.body.qty
    const descrip=req.body.discription
    const ID=req.body.ID
    const discount=req.body.discount

    
       await productschema.findByIdAndUpdate({_id:ID},{$set:{name:Iname,price:price,image:image,catogary:catogary,quantity:quantity,discription:descrip,discount:discount}})
        res.redirect('/admin/productlist')
    }else{
        const Iname=req.body.name
        const price=req.body.price
        const catogary=req.body.catogory
        const quantity=req.body.qty
        const descrip=req.body.discription
        const ID=req.body.ID
        const discount=req.body.discount
           await productschema.findByIdAndUpdate({_id:ID},{$set:{name:Iname,price:price,catogary:catogary,quantity:quantity,discription:descrip,discount:discount}})
            res.redirect('/admin/productlist')
    }
}
    } catch (error) {
        console.log(error.message)
    }
}
const singleRemove=async(req,res)=>{
    try {
        const index=req.body.index
        const id=req.body.id
        const productImage=await productschema.findById(id)
        const image=productImage.image[index]
        const remove=await productschema.updateOne({_id:id},{$pullAll:{image:[image]}})
        if(remove){
            res.json({success:true})
           
        }else{
            res.redirect('/admin/productEdit')
        }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports={
    listProduct,
    productAdd,
    productPost,
    deleteProduct,
    statusProduct,
    productEdit,
    postProductEdit,
    singleRemove
    
}
