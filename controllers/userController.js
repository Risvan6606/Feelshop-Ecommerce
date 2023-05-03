const user=require('../model/userSchema')
const bcrypt=require('bcrypt')
const nodeMailer=require('nodemailer')
const productschema=require('../model/productSchema')
const addressSchema=require('../model/adressSchema')
const cartSchema = require('../model/cartSchema')
const orderSchema=require('../model/orderSchema')
const userSchema = require('../model/userSchema')
const couponSchema=require('../model/couponSchema')
const bannerShema=require('../model/bannerSchema')
const categorySchema=require('../model/categorySchema')
const Razorpay=require('razorpay')
const dotenv=require('dotenv')
dotenv.config()
const { log } = require('console')
var instance = new Razorpay({
    key_id: process.env.KeyId,
    key_secret:process.env.keySecret,
  });
//   const ejs =require('ejs')
//   const pdf=require('html-pdf')
//   const fs= require('fs')
  const path = require('path')


let emailR
let nameR
let paidAmount
let minusWallet

const indexrender=async(req,res)=>{
    const session=req.session.userId;
    const userdata=await user.findOne({_id:session})
    try {
        const banner=await bannerShema.find()
        if(session){
        res.render('index',{session,userdata,banner})
        }else{
            res.render('index',{session,userdata,banner})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const login=async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const cart=async(req,res)=>{
    const session=req.session.userId;
    const userdata=await user.findOne({_id:session})
    try {
        if(session){
            res.render('cart',{session,userdata})
            }else{
                res.render('cart',{session,userdata})
            }
        } catch (error) {
        console.log(error.message)
    }
}
//otp generating
function  generateotp(){
    var randomNumber = Math.floor(Math.random() * 9000) + 1000;
     
        return  randomNumber;
}
let otps=  generateotp()

//mail send
const sendVerifyMail=async(name,email)=>{
    try{
        const trasporter=nodeMailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.email,
                pass:process.env.pass
            }
        })
        const mailOptions={
            from:'speckshouse162@gmail.com',
            to:email,
            subject:'For verifation mail',
            html:`<p>Hi  ${name} this is your otp${otps}`
        }
        trasporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error.message)
            }else{
                console.log('email has send',info.response)
            }
        })
    }catch(error){
        console.log(error.message)
    }
}
//sequre password.
const sequirePassword= async(password)=>{
    try {
       const passwordHash=await bcrypt.hash(password,10)
       return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}
//  sign up
const signup=async(req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message)
    }
}
const insertUser=async(req,res)=>{
    try {
        const sPassword=await sequirePassword(req.body.password)
       
      const User=new user({
            name:req.body.name,
            mobile:req.body.mobile,
            email:req.body.email,
            password:sPassword,
            isAdmin:0
        })
        const email=req.body.email
        const name=req.body.name
        emailR=email
        nameR=name
        const emailMatch=await user.findOne({email:email})
        if(emailMatch){
            res.render('signup',{message:'email already exist'})
        }else{
       
        if(req.body.name.trim().length==0||req.body.password.trim().length==0){
            res.render('signup',{message:'space not allowed'})

        }else{
            const userData= await User.save()
        if(userData){
            //  .userId=userData._id
            sendVerifyMail(req.body.name,req.body.email,userData._id)
            res.redirect('/otpVerification');
        }else{
            res.redirect('/sign');
        }
    }
}
    } catch (error) {
        console.log(error.message)
    }
}
//otp Verication
const otp=async(req,res)=>{
    try {
        res.render('otpVerification')
        
    } catch (error) {
        console.log(error.message)
    }
}
const postotp=async(req,res)=>{
    try {


        if(req.body.otp==otps){
            await user.updateOne({email:emailR},{$set:{isVerified:1}})
            // req.session.destroy()
           res.redirect('/login')
        }else{
            res.render('otpVerification',{message:'Enterd otp is inccrect'})
        }
    } catch (error) {
        console.log(error.message+'hai')
    }
}
//login

const verifyuser=async(req,res)=>{
    try {
       const password=req.body.password
       const email=req.body.email
       const userData=await user.findOne({ email: email })
       if(userData){
       const passwordMatch=await bcrypt.compare(password,userData.password)
       if(passwordMatch&&userData.isVerified==1){
        req.session.userId=userData._id
        res.redirect('/')
       }
       else if(userData.isBlock==1){
        res.render('login',{message:'you bloked please try again latter'})
       }
       else{
        res.render('login',{message:'Please check your password and Email'})
       }
       }else{
        res.render('login',{message:'please check your password and Email'})
       }
    } catch (error) {
        console.log(error.message)
    }
}
const userLogout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/login')
    } catch (error) {
        console.log(error.message)
    }
}

const products=async(req,res)=>{
    const session=req.session.userId;
    const userdata=await user.findOne({_id:session})
    try {
        if( req.query.search!==undefined&&req.query.category==undefined&&req.query.value==undefined){
            req.query.value=req.session.values
            req.query.category=req.session.category
        }
        await productschema.updateMany({quantity:0},{$set:{status:false}})
        const page = Number(req.query.page) || 1
        const limit =6
        const skip = (page - 1) * limit

        let price = req.query.value 
        let Category = req.query.category || "All"
        let Search = req.query.search || ""
        Search = Search.trim()
        req.session.values=price
        req.session.category=Category
        const categoryData = await categorySchema.find({Block : false},{name : 1, _id :0})
        let cat = []
        for(i = 0; i < categoryData.length ; i++){
            cat[i] = categoryData[i].name
        }
        let sort;
        Category === "All" ? Category = [...cat] : Category = req.query.category.split(',')
        price === "High" ? sort = -1 : sort = 1          
        const products = 
        await productschema.aggregate([
            {$match : {name : {$regex : '^'+Search, $options : 'i'},catogary : {$in : Category}}},
            {$sort : {price : sort}},
            {$skip : skip},
            {$limit : limit}
        ])
        const productCount = (await productschema.find({name : {$regex : Search, $options :'i'}}).where("catogary").in([...Category])).length
        
        const totalPage = Math.ceil(productCount / limit)
        res.render('product',{session,userdata,categoryData,products,price,Category,Search,page,totalPage})
    } catch (error) {
        console.log(error);
    }
}

const productDetails=async(req,res)=>{
    const Id= req.query.id
    const session=req.session.userId;
    const userdata=await user.findOne({_id:session})
    try {
      const products=await productschema.findById({_id:Id})
        res.render('productDetail',{products,session,userdata})
    } catch (error) {
        console.log(error.message)
    }
}
// forgetpassword start
const Loadforget = async(req,res)=>{
    try {
        res.render('forgetPassword')
    } catch (error) {
        console.log(error.message);
    }
}
const Forgetpost = async(req,res)=>{
    try {
        const userData = await user.findOne({email:req.body.email})
        nameR=userData.name
        emailR=userData.email
        if(userData){
          const   Id = userData._id 
            sendVerifyMail(userData.name,req.body.email)
            res.redirect('/forgetotp?id='+Id)
        }else{
            res.render('forgetPassword',{message:'please check your mail'})
        }
    } catch (error) {
        console.log(error.message);
        res.render('forgetPassword',{message:'please check your mail'})
    }
}
const forgetotp = async(req,res)=>{
    try {
        res.render('otpVerification')
    } catch (error) {
        console.log(error.message);
    }
}
const ConformPass = async(req,res)=>{
    try {
        res.render('conformPass')
    } catch (error) {
        console.log(error.message);
    }
}
const Verifyforget = async(req,res)=>{
    try {
        const Id = req.query.id
        const forotp = req.body.otp
if(forotp==otps){
    res.redirect('/conformPass?id='+Id)
}else{
    res.render('otpVerification',{message:'inavalid otp'})
}
    } catch (error) {
        console.log(error.message);
    }
}
const newpass=async(req,res)=>{
    try {
        const Id = req.query.id
       const newpass= req.body.newpass
       const conformpass=req.body.conformpass
       if(newpass==conformpass&&newpass.trim().length!==0){
       const forpassHash=await sequirePassword(conformpass)
        const userData= await user.findByIdAndUpdate({_id:Id},{$set:{password:forpassHash}})
        res.redirect('/login')
       }else{
        res.render('conformPass',{message:'password are mismatch',})
       }
    } catch (error) {
        console.log(error.message)
    }
}
// forget pass end
const resendotp=async(req,res)=>{
    try {
       otps=generateotp()
   sendVerifyMail(nameR,emailR)
   const id=await user.findOne({email:emailR})
   const ID=id._id
   res.redirect('/forgetotp?id='+ID)
    } catch (error) {  
        console.log(error.message); 
    }  
}
const profileRender=async(req,res)=>{
    try {
        const session=req.session.userId
        const addressData=await addressSchema.findOne({userId:session})
       const userdata=await user.findOne({_id:session})
       const couponData=await couponSchema.find()
        res.render('profile',{session,userdata,addressData,couponData})
    } catch (error) {
        console.log(error.message)
    }
}
const checkout=async(req,res)=>{
    try {
        if(req.query.payment!=='COD'){
            const session=req.session.userId
            const userdata=await user.findOne({_id:session})
        const cartData=await cartSchema.findOne({userId:req.session.userId})
        const products=cartData.products
        const addressdata=await addressSchema.findOne({userId:req.session.userId})
       const walletamount= userdata.wallet
      if(addressdata==null){
        res.redirect('/addAddress')
      }else{
        res.render('checkOut',{session,walletamount,addressdata,products})
      }
       
        }else{
        const session=req.session.userId
        const userdata=await user.findOne({_id:session})
        const total=await cartSchema.aggregate([{$match:{user:userdata.name}},{$unwind:'$products'},{$project:{productPrice:'$products.productPrice',cou:'$products.count'}},{$group:{_id:null,total:{$sum:{$multiply:['$productPrice','$cou']}}}}])
        const wallet=userdata.wallet
        let Total=total[0].total;
        const address=req.query.address
        const payment=req.query.payment
        let amount=Math.round(req.query.total)
        if(wallet>Total){
          paidAmount=wallet-Total
        }else{
              paidAmount=Total-wallet
        }
        if (wallet>Total) {
            minusWallet=Total
        }else{
            minusWallet=wallet
        }
        if(payment=='COD'){
            paidAmount=0
        }
        const dis=req.body.dis
        const cartDatas=await cartSchema.findOne({userId:userdata._id})
        const product=cartDatas.products
        const status=payment ==='COD'?'placed':'pending'
        const newOrder=new orderSchema({
            deliveryDetails:address,
            user:userdata.name,
            userId:userdata._id,
            paymentMethod:'Wallet',
            product:product,
            totalAmout:Total,
            Date:Date.now(),
            status:status,
            wallet:minusWallet,
            paid:amount
        })
                await newOrder.save()
    const orderid=newOrder._id
    const totalAmount=newOrder.totalAmout
    
    if(status==='placed'){
        await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
        await cartSchema.deleteOne({userId:userdata._id})
    
        for(let i=0;i<product.length;i++){
            const productId=product[i].productId
            const quantity=product[i].count
            await productschema.findByIdAndUpdate(productId,{$inc:{quantity:-quantity}})
        }
          res.redirect('/ordersuccess')
        //   change else if
    }else if(wallet>Total){
        await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
        await cartSchema.deleteOne({userId:userdata._id})
        await orderSchema.findByIdAndUpdate({ _id: newOrder._id}, { $set: { status: "placed" } })
        for(let i=0;i<product.length;i++){
            const productId=product[i].productId
            const quantity=product[i].count
            await productschema.findByIdAndUpdate(productId,{$inc:{quantity:-quantity}})
        }
          res.json({codsuccess:true})
    }else{
        await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
        const paid=paidAmount-dis
        var options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "" + orderid,
        };
        instance.orders.create(options, function (err, order) {
            res.json({ order });
        });
    
    }
}
    } catch (error) {
        console.log(error.message)
    }
}


const orderPlace=async(req,res)=>{
    try {
    const session=req.session.userId
    const userdata=await user.findOne({_id:session})
    const total=await cartSchema.aggregate([{$match:{user:userdata.name}},{$unwind:'$products'},{$project:{productPrice:'$products.productPrice',cou:'$products.count'}},{$group:{_id:null,total:{$sum:{$multiply:['$productPrice','$cou']}}}}])
    const wallet=userdata.wallet
    let Total=total[0].total;
    const address=req.body.address
    const payment=req.body.payment
    let amount=Math.round(req.body.total)
    if(wallet>Total){
      paidAmount=wallet-Total
    }else{
          paidAmount=Total-wallet
    }
    if (wallet>Total) {
        minusWallet=Total
    }else{
        minusWallet=wallet
    }
    if(payment=='COD'){
        paidAmount=0
    }
    const dis=req.body.dis
 
    const cartData=await cartSchema.findOne({userId:userdata._id})
    const product=cartData.products
    const status=payment ==='COD'?'placed':'pending'
    const newOrder=new orderSchema({
        deliveryDetails:address,
        user:userdata.name,
        userId:userdata._id,
        paymentMethod:payment,
        product:product,
        totalAmout:Total,
        Date:Date.now(),
        status:status,
        wallet:minusWallet,
        paid:amount,
        couponDiscound:dis
        
    })
            await newOrder.save()
const orderid=newOrder._id
const totalAmount=newOrder.totalAmout

if(status==='placed'){
    await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
    await cartSchema.deleteOne({userId:userdata._id})

    for(let i=0;i<product.length;i++){
        const productId=product[i].productId
        const quantity=product[i].count
        await productschema.findByIdAndUpdate(productId,{$inc:{quantity:-quantity}})
    }
      res.json({codsuccess:true})
    //   change else if
}else if(wallet>Total){
    await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
    await cartSchema.deleteOne({userId:userdata._id})
    await orderSchema.findByIdAndUpdate({ _id: newOrder._id}, { $set: { status: "placed" } })
    for(let i=0;i<product.length;i++){
        const productId=product[i].productId
        const quantity=product[i].count
        await productschema.findByIdAndUpdate(productId,{$inc:{quantity:-quantity}})
    }
      res.json({codsuccess:true})
}else{
    await userSchema.findByIdAndUpdate({_id:session},{$inc:{wallet:-newOrder.wallet}})
    const paid=paidAmount-dis
    var options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "" + orderid,
    };
    instance.orders.create(options, function (err, order) {
        res.json({ order });
    });

}
    } catch (error) {
        console.log(error.message)
    }
}
const ordersuccess = async (req, res) => {
    try {
        const session=req.session.userId
      const userdata=await userSchema.findOne({_id:session})
        res.render("orderPlace",{session,userdata})
    } catch (error) {
    
        console.log(error);
    }
}
const verifypayment = async (req, res) => {
    try {
        let userData = await userSchema.findOne({_id: req.session.userId})

        const details = (req.body);
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", process.env.keySecret)
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == details.payment.razorpay_signature) {
            await orderSchema.findByIdAndUpdate({
                _id: details.order.receipt
            },
                { $set: { paymentId: details.payment.razorpay_payment_id } })

            await orderSchema.findByIdAndUpdate({ _id: details.order.receipt }, { $set: { status: "placed" } })
            const cartData=await cartSchema.findOne({userId:userData._id})
             const product=cartData.products
            for(let i=0;i<product.length;i++){
                const productId=product[i].productId
                const quantity=product[i].count
                await productschema.findByIdAndUpdate(productId,{$inc:{quantity:-quantity}})
            }
            await cartSchema.deleteOne({ userId: userData._id })
            res.json({ success: true })
        } else {
            await orderSchema.deleteOne({ _id: details.order.receipt });
            res.json({ success: false });

        }
  
    } catch (error) {
        console.log(error)
    }
}
const orderDetails=async(req,res)=>{
    try {
        const session=req.session.userId
        const userdata=await userSchema.findOne({_id:session})
        const orderData=await orderSchema.find({user:userdata.name})
        orderData.reverse()
        if(orderData){  
            res.render('orderDetals',{orderData,session,userdata})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const userOrderCancel=async(req,res)=>{
    try {
        const Id=req.body.id
        const orderDatas=await orderSchema.findOne({_id:Id})
        const walletamount=await orderDatas.wallet
        const payment =orderDatas.paymentMethod
        const payAmount=orderDatas.paid
        if(payment=='Online'){
            const totalAmount=walletamount+payAmount
            await userSchema.findByIdAndUpdate(req.session.userId,{$inc:{wallet:totalAmount}})
        }else{
        await userSchema.findByIdAndUpdate(req.session.userId,{$inc:{wallet:walletamount}})
        }
        const orderData=await orderSchema.findByIdAndUpdate({_id:Id},{$set:{status:'Cancel'}})
        if(orderData){
            res.json({status:true})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const orderReturn=async(req,res)=>{
    try {
        const orderData=await orderSchema.findByIdAndUpdate({_id:req.body.productId},{$set:{status:'Wait'}})
        if(orderData){
            res.json({status:true})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const orderDetailView=async(req,res)=>{
    try {
        const session=req.session.userId
        const userdata=await userSchema.findById(session)
       const orderId= req.query.orderId
       const orderData=await orderSchema.findById({_id:orderId}).populate("product.productId")
       const product=orderData.product
       res.render('orderDetailView',{session,userdata,orderData,product})
    } catch (error) {
        console.log(error.message);
    }
}
// const orderInvoice=async(req,res)=>{
//     try {
//         const id =req.query.id
//         const orderdetails = await orderSchema.findOne({_id:id}).populate("product.productId").sort({Date:-1})
//         const orderData= orderdetails.product        
//         const data={
//             report:orderdetails,
//             data:orderData
//         }
//         const filepath =path.resolve(__dirname,'../views/users/invoicePdf.ejs')
//         const htmlstring=fs.readFileSync(filepath).toString()
//        let option={
//         format:"A3"
//        }
//        const ejsData=  ejs.render(htmlstring,data)
//        pdf.create(ejsData,option).toFile('Invoice.pdf',(err,response)=>{
//         if(err) console.log(err);

//       const filepath= path.resolve(__dirname,'../invoice.pdf')
//       fs.readFile(filepath,(err,file)=>{
//         if(err) {
//             console.log(err);
//             return res.status(500).send('could not download file')
//         }
//         res.setHeader('Content-Type','application/pdf')
//         res.setHeader('Content-Disposition','attatchment;filename="Purchase Invoice.pdf"')

//         res.send(file)

//       })
//        })
        
//     } catch (error) {
//         console.log(error.message);
        
//     }
// }

module.exports={
    indexrender,
    products,
    login,
    cart,
    signup,
    otp,
    insertUser,
    verifyuser,
    postotp,
    userLogout,
    productDetails,
    Loadforget,
    Forgetpost,
    forgetotp,
    ConformPass,
    Verifyforget,
    newpass,
    resendotp,
    profileRender,
    checkout,
    orderPlace,
    orderDetails,
    userOrderCancel,
    orderReturn,
    verifypayment,
    ordersuccess,
    orderDetailView,
    // orderInvoice

}