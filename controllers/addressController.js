const adressSchema=require('../model/adressSchema')
const user=require('../model/userSchema')

const addAdress=async(req,res)=>{
    try {
        const session=req.session.userId
        const userdata=user.findOne({_id:session})
        res.render('addAdress',{session,userdata})
    } catch (error) {
        console.log(error.message)
    }
}
const addressPost=async(req,res)=>{
    try {
        const Fname=req.body.fName
        const Lname=req.body.Lname
        const mobile=req.body.mobile
        const address=req.body.address
        const state=req.body.state
        const city=req.body.city
        const pin=req.body.pincode
        const session=req.session.userId
        const userdata= await user.findOne({_id:req.session.userId})
            const addressExist=await adressSchema.findOne({userId:session})
            if(addressExist){
                const addressdata=await adressSchema.updateOne({userId:session},{$push:{address:{Fname:Fname,Lname:Lname,mobile:mobile,address:address,state:state,city:city,pincode:pin}}})
                if(addressdata){
                res.redirect('/checkout')
                }
            }else{
           const cartData= new adressSchema({
                userId:req.session.userId,
                user:userdata.name,
                address:[{
                    Fname:Fname,
                    Lname:Lname,
                    mobile:mobile,
                    address:address,  
                    state:state,
                    city:city,
                    pincode:pin
                }]
            })
            if(cartData){
               const cartdata=await cartData.save()
                res.redirect('/checkout')
               }
        }
    } catch (error) {
        console.log(error.message)
    }
}
const removeAddress=async(req,res)=>{
    try {
        
      const remove= await adressSchema.updateOne({userId:req.body.session},{$pull:{address:{_id:req.body.addressId}}})
      if(remove){
        res.json({status:true})
      }
    } catch (error) {
        console.log(error.message)
    }
}
module.exports={
    addAdress,
    addressPost,
    removeAddress
}