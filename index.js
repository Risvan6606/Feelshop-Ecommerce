const mongoose=require('mongoose')
mongoose.connect("mongodb+srv://risvangalfan:sJVGpfUmhbCZ7nbS@cluster0.pzhy0ii.mongodb.net/feelshop").then(()=>console.log('mongodb Connected....'))
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
 


 app.use('/admin',adminRoute)


app.listen(3000,()=>{
    console.log('server started...')
})