const catogorySchma=require('../model/categorySchema')
const productSchema = require('../model/productSchema')

const catogory=async(req,res)=>{
    try {
        const catogoryData=await catogorySchma.find()
        res.render('catogory',{catogoryData})
    } catch (error) {
      console.log(error.message)  
    }
}
const addCatogory=async (req,res)=>{
    try {
        res.render('addCatogory')
    } catch (error) {
        console.log(error.message)
    }
}
const inputCatogory=async(req,res)=>{
    try {
        const catogoryschma=new catogorySchma({
            name:req.body.catogory
        })
        const  datas=req.body.catogory
       
        if(req.body.catogory.trim().length==0){
            res.render('addCatogory',{message:'space not allowed'})
        }else{
           const already=await catogorySchma.findOne({name:datas})
           if(already){
            res.render('addCatogory',{message:'this catogory allready added'})
           }else{
            const catogorys=await catogoryschma.save()
            res.redirect('/admin/catogory')
           }
        }
      
    } catch (error) {
        console.log(error.message)
    }
}
const editCatogory=async(req,res)=>{
    try {
      const edit= req.query.name
        res.render('editCatogory',{edit})
    } catch (error) {
        console.log(error.message)
    }
}
const editingCatogory=async(req,res)=>{
    try {
       if(req.body.newcat.trim().length==0){
        res.render('editCatogory',{message:'space not allowed'})
       }else{
        const edit=await catogorySchma.updateOne({name:req.body.oldcat},{$set:{name:req.body.newcat}})
       res.redirect('/admin/catogory')
       }
    } catch (error) {
        console.log(error.message)
    }
}
const block=async(req,res)=>{
    try {
        if(req.query.data&&req.query.id){
          const data= await productSchema.updateMany({catogary:req.query.name},{$set:{blocked:1}})
       await catogorySchma.updateOne({_id:req.query.id},{$set:{Block:false}})
             res.redirect('/admin/catogory')
        }else{
            const data= await productSchema.updateMany({catogary:req.query.name},{$set:{blocked:0}})
            await catogorySchma.updateOne({_id:req.query.id},{$set:{Block:true}})
            res.redirect('/admin/catogory')
        }
       
    } catch (error) {
        console.log(error.message)
    }
}
module.exports={
    catogory,
    addCatogory, 
    inputCatogory,
    editCatogory,
    editingCatogory,
    block
}