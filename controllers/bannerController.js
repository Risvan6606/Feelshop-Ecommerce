const bannerSchema=require('../model/bannerSchema')

const viewBanner=async(req,res)=>{
    try {
        const data=await bannerSchema.find()
        res.render('banner',{data})
    } catch (error) {
        console.log(error.message);
    }
}
const addBanner=async(req,res)=>{
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error.message);
    }
}
const insertBanner = async (req,res) => {
    try {
        const heading = req.body.heading
        const description = req.body.description
        const image = req.file.filename
        
        const data = new bannerSchema({
            heading : heading,
            description : description,
            image : image,
            
        })

        const result = await data.save()
        if(result){
            res.redirect('/admin/banner')
        }

    } catch (error) {
        console.log(error.message)
    }
}
const unlistBanner=async(req,res)=>{
    try {
        const id=req.query.id
        const data=await bannerSchema.findById(id)
        if(data.status==true){
            await bannerSchema.findByIdAndUpdate(id,{status:false})
        }else{
            await bannerSchema.findByIdAndUpdate(id,{status:true})
        }
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    addBanner,
    insertBanner,
    viewBanner,
    unlistBanner,
  
}