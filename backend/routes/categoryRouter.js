const express = require('express')
const { createCategory, deleteCategory, updateCategory, allCategory, getcategory, SellerCategoryFind, getproductfromcategory } = require('../controllers/categorycontroller')
const { IsSeller } = require('../middlewares/authmiddlwares')
const router = express.Router()
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12,function(err,name){ 
        const fn = name.toString("hex")+path.extname(file.originalname)
        cb(null, fn)
      })
    }
})
const upload = multer({ storage: storage })
router.post('/create-category',upload.single('image'),IsSeller,createCategory)
router.delete('/delete-category',IsSeller,deleteCategory)
router.post('/update-category',upload.single('image'),IsSeller,updateCategory)
router.get('/all-category',allCategory)
router.get('/getsellercategory',IsSeller,SellerCategoryFind)
router.get('/getcategory',getcategory)
router.post('/getproductincategory',getproductfromcategory)
module.exports = router