const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/ekart').then(()=>console.log('mongodb Connected....'))
const express=require('express')
const app= express()
const path =require("path")

app.use((req, res, next) => {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});

app.use(express.static(path.join(__dirname,"public")))
const userRoute=require('./routes/userRoute')
const adminRoute=require('./routes/adminRoute')
const { connected } = require('process')
 app.use('/',userRoute)
 
// app.use(express.static('public/user'))

 app.use('/admin',adminRoute)
// app.use(express.static('public/admin'))

app.listen(3000,()=>{
    console.log('server started...')
})