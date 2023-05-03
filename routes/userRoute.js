const express=require('express')
const userRoute=express()
const userController=require('../controllers/userController')
const cartController=require('../controllers/cartController')
const addressControll=require('../controllers/addressController')
const whishListController=require('../controllers/whishlistController')
const couponController=require('../controllers/couponController')
const session=require('express-session')
const config=require('../config/config')


userRoute.use(session({
    secret:config.sessionScrect,
    saveUninitialized:true,
    resave:false
}))
const userAuth=require('../middlware/userAuth')
const whishlistSchema = require('../model/whishlistSchema')
userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')


userRoute.get('/',userController.indexrender)
userRoute.get('/product',userController.products)
userRoute.get('/productDetails',userController.productDetails)  
userRoute.get('/sign',userAuth.isLogout,userController.signup)
userRoute.post('/sign',userController.insertUser)
userRoute.get('/otpVerification',userController.otp)
userRoute.post('/otpVerification',userController.postotp)
userRoute.get('/forgetPassword',userController.Loadforget)
userRoute.post('/forgetPassword',userController.Forgetpost)
userRoute.get('/forgetotp',userController.forgetotp)
userRoute.post('/forgetotp',userController.Verifyforget)
userRoute.get('/otpresend',userController.resendotp)
userRoute.get('/login',userAuth.isLogout,userController.login)
userRoute.post('/login',userController.verifyuser)
userRoute.get('/logout',userController.userLogout)
userRoute.get('/conformPass',userController.ConformPass)
userRoute.post('/conformPass',userController.newpass)
userRoute.patch('/addtoCart',cartController.addToCart)
userRoute.get('/cart',cartController.cartrender)
userRoute.delete('/cartprDlt',cartController.cartprDlt)
userRoute.patch('/changeCount',cartController.changeCount)
userRoute.get('/profile',userController.profileRender)
userRoute.patch('/addtowhishlist',whishListController.addtowhishlist)
userRoute.get('/whishlist',whishListController.wishlist)  
userRoute.get('/removewish',whishListController.wishlistremove)
userRoute.patch('/whishToCart',whishListController.addTowish)
userRoute.post('/applyCoupon',couponController.applyCoupon)
userRoute.get('/checkout',userAuth.isLogin,userController.checkout)
userRoute.post('/placeorder',userController.orderPlace)
userRoute.post ('/verifypayment',userController.verifypayment)
userRoute.get("/ordersuccess",userController.ordersuccess)
userRoute.get('/addAddress',userAuth.isLogin,addressControll.addAdress)
userRoute.post('/addAddress',addressControll.addressPost)
userRoute.post('/addressRemove',addressControll.removeAddress)
userRoute.get('/orderDetails',userController.orderDetails)
userRoute.get('/orderDetailview',userController.orderDetailView)
userRoute.post('/userOrderCancel',userController.userOrderCancel)
userRoute.post('/returnproduct',userController.orderReturn)
// userRoute.get('/invoice_pdf',userController.orderInvoice)
// userRoute.get('/ins',userController.invoice)











module.exports=userRoute