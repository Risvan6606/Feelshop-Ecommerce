const user=require('../model/userSchema')
const bcrypt=require('bcrypt')
const orderschema=require('../model/orderSchema')
// const ejs=require('ejs')
// const pdf=require('html-pdf')
// const fs=require('fs')
const path=require('path')
const userSchema = require('../model/userSchema')
const orderSchema = require('../model/orderSchema')
const productSchema = require('../model/productSchema')
const admninIndex=async(req,res)=>{
    try {
        const userData=await userSchema.find({isAdmin:0})
        const total=await orderSchema.aggregate([{$group:{_id:null,totalAmout:{$sum:"$totalAmout"}}}])
        const Users=await userSchema.find({isAdmin:0}).count()
        const Orders=await orderSchema.find({}).count()
        const Products=await productSchema.find({}).count()
        const Total=total[0].totalAmout
        const onlineCount=await orderschema.aggregate([{$match:{paymentMethod:'Online'}},{$group:{_id:'$paymentMethod',total:{$count:{}}}}])
        const COD=await orderSchema.aggregate([{$match:{paymentMethod:'COD'}},{$group:{_id:'$paymentMethod',total:{$count:{}}}}])
        const onlineCounts = await orderschema.aggregate([{$group:{_id:"$paymentMethod",totalPayment:{$count:{}}}}])
        if(req.session.adminId){
        let sales=[]
        var date=new Date();
        var year=date.getFullYear()
        var currentyear=new Date(year,0,1)
        var salesByYear=await orderSchema.aggregate([{$match:{createdAt:{$gte:currentyear},status:{$ne:'Cancel'}}},{$group:{_id:{$dateToString:{format:'%m',date:'$createdAt'}},totalAmout:{$sum:'$totalAmout'},}},{$sort:{_id:1}}])
        for(let i=1;i<=12;i++){
            let result=true;
            for(let k=0;k<salesByYear.length;k++){
                result= false;
                if(salesByYear[k]._id==i){
                    sales.push(salesByYear[k])
                    break;
                }else{
                    result=true
                }
            }
            if(result)sales.push({_id:i,totalAmout:0})
        }
        let salesData=[]
        for (let i=0;i<sales.length;i++){
            salesData.push(sales[i].totalAmout)
        }
        res.render('index',{userData,onlineCount,onlineCounts,COD,Total,Users,Orders,Products,month:salesData})
    }else{
        res.redirect('/admin/login')
    }
    } catch (error) {
        console.log(error.message)
    }
}
const adminLogin=async(req,res)=>{
    try {
        res.render('sign')
    } catch (error) {
        console.log(error.message)
    }
    
}
const verifyAdmin=async(req,res)=>{
    try {
        const email=req.body.email
        const password=req.body.password
        const userData= await user.findOne({email:email})
        if(userData){
            const passwordMatch=await bcrypt.compare(password,userData.password)
            if(passwordMatch&&userData.isAdmin==1){
                req.session.adminId=userData._id
                res.redirect('/admin/')
            }else{
                res.render('sign',{message:'please check your password and email'})
            }
        }else{
            res.render('sign',{message:'please check your mail and'})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const adminLogout=async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/admin/login')
    } catch (error) {
        console.log(error.message)
    }
}
const table=async(req,res)=>{
    try {
        const userData=await user.find({isAdmin:0})
        res.render('usermanage',{userData})
    } catch (error) {
        console.log(error.message)
    }
}
const block=async(req,res)=>{
    const Id=req.query.id
    const data=req.query.data
    try {
        if(data){
            await user.updateOne({_id:Id},{$set:{isBlock:0}})
            res.redirect('/admin/usermanagement')
           
        }else{
            await user.updateOne({_id:Id},{$set:{isBlock:1}})
            res.redirect('/admin/usermanagement')
        }
    } catch (error) {
        console.log(error.message)
    }

}
const orderList=async(req,res)=>{
    try {
        const orderData=await orderschema.find()
        orderData.reverse()
        res.render('orderList',{orderData})
    } catch (error) {
        console.log(error.message)
    }
}
const orderStatusChange=async(req,res)=>{
    try {
        const data=req.query.data
        if(data){
        const orderData=await orderschema.findByIdAndUpdate(req.query.id,{status:'pending'})
        res.redirect('/admin/orderList')
    }else{
        const orderData=await orderschema.findByIdAndUpdate(req.query.id,{status:'placed'})
        res.redirect('/admin/orderList')
    }
    } catch (error) {
        console.log(error.message)
    }
}
const cancelorder=async(req,res)=>{
    try {
        await orderschema.findByIdAndUpdate(req.query.id,{status:'cancel'})
        res.redirect('/admin/orderList')
    } catch (error) {
        console.log(error.message)
    }
}
const deliveryProduct=async(req,res)=>{
    try {
        const Delivery=await orderschema.findByIdAndUpdate(req.body.orderId,{status:'Delivery'})
        const orderData=await orderSchema.findOne({_id:req.body.orderId})
        if(orderData.status=='Delivery'){
            const total=orderData.totalAmout
            const wallet=orderData.wallet
            const paid=total-wallet
            await orderSchema.findByIdAndUpdate(req.body.orderId,{$inc:{paid:paid}})
        }

        if(Delivery){
            
            res.json({status:true})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const approvingReturn=async(req,res)=>{
    try {
        const orderData=await orderSchema.findOne({_id:req.body.orderId})
        const product=orderData.product
        const status=orderData.status
        if(status=='Wait'){
            const totalAmount=orderData.totalAmout-req.session.dis
            const userId=orderData.userId
            await userSchema.findByIdAndUpdate(userId,{$inc:{wallet:totalAmount}})
        }
        const approve=await orderschema.findByIdAndUpdate(req.body.orderId,{status:'Returned'})
        if(approve){
            for(let i=0;i<product.length;i++){
                const productId=product[i].productId
                const count=product[i].count
                await productSchema.findByIdAndUpdate(productId,{$inc:{quantity:count}})
            }
            res.json({status:true})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const salesReports=async(req,res)=>{
    try {
        let from=new Date(req.query.from)
        let to=new Date(req.query.to)
        req.query.from?from=new Date(req.query.from):from ='All'
        req.query.to?to=new Date(req.query.to):to='All'
        if(from!=='All'&&to!=='All'){
            const orderDetails=await orderSchema.aggregate([{$match:{$and:[{Date:{$gte:from}},{Date:{$lte:to}}]}}])
            req.session.ordertls=orderDetails.reverse()
            const Products=orderDetails.product
            res.render('salesReport',{orderDetails,from,to,Products})
        }else{
            const orderDetails=await orderSchema.find({status:{$ne:'Cancel'}})
            req.session.ordertls=orderDetails.reverse()
            const products=orderDetails.product
            res.render('salesReport',{orderDetails,from,to,products})
        }
        
        // const orderDetail=await orderschema.find({status:{$ne:'Cancel'}}).sort({Date:-1})
        
    } catch (error) {
        console.log(error.message);
    }
}


// const exportSales=async(req,res)=>{
//     try {
//        await orderschema.find({status:{$ne:'Cancel'}}).sort({Date:-1})
//        const data={
//         report:req.session.ordertls
//        }
//       const filePath= path.resolve(__dirname,'../views/admin/orderToPdf.ejs')
//       const htmlString=fs.readFileSync(filePath).toString()
//       let option={
//         format:"A3"
//       }
//       const ejsData=ejs.render(htmlString,data)
//       pdf.create(ejsData,option).toFile('salesReport.pdf',(err,response)=>{
//         if(err)console.log(err)
    
//       const filepath=path.resolve(__dirname,'../salesReport.pdf')
//       fs.readFile(filepath,(error,file)=>{
//         if(error){
//             console.log(error);
//             return res.status(500).send('could not download file')
//         }
//         res.setHeader('Content-Type','application/pdf')
//         res.setHeader('Content-Disposition','attatchment;filename="salesReport.pdf')
//         res.send(file)
//       })
//     })
//     }catch (error) {
//         console.log(error.message)
//     }
// }



module.exports={
    admninIndex, 
    adminLogin,
    verifyAdmin,
    table,
    block,
    adminLogout,
    orderList,
    orderStatusChange,
    cancelorder,
    deliveryProduct,
    approvingReturn,
    // exportSales,
    salesReports

}
