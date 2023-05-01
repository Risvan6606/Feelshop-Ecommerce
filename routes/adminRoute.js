const express=require('express')
const  adminRoute=express()
const adminController=require('../controllers/adminController')
const catogoryConroller=require('../controllers/categoryController')
const productController=require('../controllers/productController')
const couponController=require('../controllers/couponController')
const bannerController=require('../controllers/bannerController')
const multer=require('multer')
const path=require('path')
const session=require('express-session')
const adminAuth=require('../middlware/adminAuth')
const config=require('../config/config')


adminRoute.use(session({
    secret:config.sessionScrect,
    saveUninitialized:true,
    resave:false
}))
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/admin/productImage'))
    },
    filename:(req,file,cb)=>{
        const name=Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload=multer({storage:storage})
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

adminRoute.get('/',adminAuth.isLogin,adminController.admninIndex)
adminRoute.get('/login',adminAuth.isLogout,adminController.adminLogin)
adminRoute.post('/login',adminController.verifyAdmin)
adminRoute.get('/logOut',adminAuth.isLogout,adminController.adminLogout)
adminRoute.get('/usermanagement',adminAuth.isLogin,adminController.table)
adminRoute.get('/blockUser',adminAuth.isLogin,adminController.block)
// catogorys
adminRoute.get('/catogory',adminAuth.isLogin,catogoryConroller.catogory)
adminRoute.get('/addcatogory',adminAuth.isLogin,catogoryConroller.addCatogory)
adminRoute.post('/addcatogory',catogoryConroller.inputCatogory)
adminRoute.get('/editcatogory',adminAuth.isLogin,catogoryConroller.editCatogory)
adminRoute.post('/editcatogory',catogoryConroller.editingCatogory)
adminRoute.get('/block',catogoryConroller.block)
// product side
adminRoute.get('/productlist',adminAuth.isLogin,productController.listProduct)
adminRoute.get('/productAdd',adminAuth.isLogin,productController.productAdd)
adminRoute.post('/productAdd',upload.array("image",4),productController.productPost)
adminRoute.get('/deleteProduct',adminAuth.isLogin,productController.deleteProduct)
adminRoute.get('/stausProduct',adminAuth.isLogin,productController.statusProduct)
adminRoute.get('/productEdit',adminAuth.isLogin,productController.productEdit)
adminRoute.post('/productEdit',upload.array('image',4),productController.postProductEdit)
adminRoute.post('/delteImage',productController.singleRemove)
// coupon
adminRoute.get('/coupon',adminAuth.isLogin,couponController.couponrender)
adminRoute.post('/coupon',couponController.couponPost)
adminRoute.get('/couponList',adminAuth.isLogin,couponController.couponList)
adminRoute.post('/deleteCoupon',couponController.couponRemove)
adminRoute.get('/couponedit',adminAuth.isLogin,couponController.couponEdit)
adminRoute.post('/couponedit',couponController.couponUpdate)
// order list
adminRoute.get('/orderList',adminAuth.isLogin,adminController.orderList)
// changed you
adminRoute.get('/statuschange',adminAuth.isLogin,adminController.orderStatusChange)
adminRoute.get('/ordercancel',adminAuth.isLogin,adminController.cancelorder)
adminRoute.post('/Delivery',adminController.deliveryProduct)
adminRoute.post('/approvel',adminController.approvingReturn)
// banner 
adminRoute.get('/addBanner',adminAuth.isLogin,bannerController.addBanner)
adminRoute.get('/banner',adminAuth.isLogin,bannerController.viewBanner)
adminRoute.post('/addBanner',upload.single('image'),bannerController.insertBanner)
adminRoute.get('/unlisting',adminAuth.isLogin,bannerController.unlistBanner)
adminRoute.get('/salesReport',adminAuth.isLogin,adminController.salesReports)
adminRoute.get('/exportToPdf',adminAuth.isLogin,adminController.exportSales)

module.exports=adminRoute