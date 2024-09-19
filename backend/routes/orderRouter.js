const express = require('express')
const { isLoggedIn } = require('../middlewares/authmiddlwares')
const { createOrder, getOrder } = require('../controllers/orderController')
const router = express.Router()
router.post('/create-order',isLoggedIn,createOrder)
router.get('/getorder',isLoggedIn,getOrder)
module.exports = router