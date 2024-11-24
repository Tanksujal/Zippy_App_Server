const express = require('express')
const router = express.Router()
router.use('/auth',require('../routes/authRouter'))
router.use('/seller',require('../routes/adminRouter'))
router.use('/category',require('../routes/categoryRouter'))
router.use('/product',require('../routes/productRouter'))
router.use('/cart',require('../routes/cartRouter'))
router.use('/order',require('../routes/orderRouter'))
module.exports = router