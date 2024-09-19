const express = require('express')
const { createProduct, delteProduct, allProduct, updateProduct, getProduct, SellerProductFind, getproductfromproduct, allProductByCategories } = require('../controllers/productController')
const {IsSeller} = require('../middlewares/authmiddlwares')
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
router.post('/create-product',upload.single('image'),IsSeller,createProduct)
router.delete('/delete-product',IsSeller,delteProduct)
router.get('/all-product',allProduct)
router.post('/update-product',IsSeller,updateProduct)
router.get('/getproduct',IsSeller,getProduct)
router.get('/getsellerproduct',IsSeller,SellerProductFind)
router.post('/getproductfromproduct',getproductfromproduct)
router.get('/products',allProductByCategories)
module.exports = router