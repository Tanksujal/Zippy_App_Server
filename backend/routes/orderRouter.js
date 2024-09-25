const express = require('express')
const { isLoggedIn } = require('../middlewares/authmiddlwares')
const { createOrder, getOrder, Updateorder, updateBulkOrderStatus } = require('../controllers/orderController')
const router = express.Router()
router.post('/create-order',isLoggedIn,createOrder)
router.get('/getorder',isLoggedIn,getOrder)
router.post('/updateorderstatus',Updateorder)
router.post('/updateBulkOrderStatus',updateBulkOrderStatus)
module.exports = router