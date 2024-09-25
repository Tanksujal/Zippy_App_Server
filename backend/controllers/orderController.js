const Cart = require('../models/cart')
const Order = require('../models/order')
const Product = require('../models/product')
const Seller = require('../models/seller')
const QRCode = require('qrcode');
// const createOrder = async (req, res) => {
//     try {
//       const userId = req.user.id;
//       const { shippingAddress, paymentMethod, isCOD } = req.body;
//       console.log(req.body);
  
//       // Fetch the user's cart
//       const cart = await Cart.findOne({ userId }).populate('cartitems');
  
//       if (!cart || cart.cartitems.length === 0) {
//         return res.status(404).send({
//           success: false,
//           message: 'Cart is empty'
//         });
//       }
  
//       // Fetch sellerId for each product in the cartitems
//       const populatedCartItems = await Promise.all(
//         cart.cartitems.map(async (item) => {
//           const product = await Product.findById(item.productId).select('sellerId');
//           return {
//             product: item.productId,
//             quantity: item.quantity,
//             price: item.price,
//             sellerId: product.sellerId, // Get sellerId from the product
//           };
//         })
//       );
  
//       const totalAmount = populatedCartItems.reduce((total, item) => {
//         return total + item.price * item.quantity;
//       }, 0);
  
//       // Create the new order
//       const newOrder = new Order({
//         user: userId,
//         items: populatedCartItems, // Use the populated cart items with sellerId
//         totalAmount,
//         shippingAddress: {
//           addressLine1: shippingAddress.addressLine1,
//           addressLine2: shippingAddress.addressLine2 || '',
//           city: shippingAddress.city,
//           state: shippingAddress.state,
//           postalCode: shippingAddress.postalCode,
//           country: shippingAddress.country
//         },
//         paymentMethod : isCOD ? 'Cash On Delivery' : paymentMethod,
//         isCOD: isCOD || false,
//         paymentStatus: isCOD ? 'Pending' : 'Completed'
//       });
      
  
//       await newOrder.save();
  
//       // Clear the cart after placing the order
//       cart.cartitems = [];
//       cart.totalPrice = 0;
//       await cart.save();
  
//      if (!isCOD) {
//       const sellerUPIId = 'seller-upi-id@bank'; // Replace with seller's UPI ID
//       const sellerName = 'Seller Name'; // Replace with the seller's name

//       // UPI payment link
//       const upiLink = `upi://pay?pa=${sellerUPIId}&pn=${sellerName}&am=${totalAmount}&cu=INR&tn=Order Payment`;

//       // Generate the QR code
//       const qrCode = await QRCode.toDataURL(upiLink);

//       res.status(201).send({
//         success: true,
//         message: 'Order placed successfully!',
//         order: newOrder,
//         qrCode, // Send the QR code to the frontend
//       });
//     } else {
//       res.status(201).send({
//         success: true,
//         message: 'Order placed successfully!',
//         order: newOrder,
//       });
//     }
//     } catch (error) {
//       console.error(error);
//       res.status(500).send({
//         success: false,
//         message: 'Failed to place the order.'
//       });
//     }
//   };
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, isCOD } = req.body;

    // Fetch the user's cart
    const cart = await Cart.findOne({ userId }).populate('cartitems');

    if (!cart || cart.cartitems.length === 0) {
      return res.status(404).send({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Fetch sellerId and sellerName for each product in the cartitems
    const populatedCartItems = await Promise.all(
      cart.cartitems.map(async (item) => {
        // Fetch the product to get the sellerId
        const product = await Product.findById(item.productId).select('sellerId');
        
        // Fetch the seller's name from the Seller model based on sellerId
        const seller = await Seller.findById(product.sellerId); // Assuming 'name' contains sellerName
        console.log(seller);
        
        
        return {
          product: item.productId,   // The product reference
          quantity: item.quantity,   // The quantity of this product in the cart
          price: item.price,         // The price of the product
          sellerId: product.sellerId, // Fetch the sellerId from the product
          sellerName: seller.username    // Fetch the seller's name from the Seller model
        };
      })
    );
console.log(populatedCartItems);

    const totalAmount = populatedCartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Create the new order
    const newOrder = new Order({
      user: userId,
      items: populatedCartItems, // Use the populated cart items with sellerId and sellerName
      totalAmount,
      shippingAddress: {
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      paymentMethod: isCOD ? 'Cash On Delivery' : paymentMethod,
      isCOD: isCOD || false,
      paymentStatus: isCOD ? 'Pending' : 'Completed',
    });

    await newOrder.save();


    cart.cartitems = [];
    cart.totalPrice = 0;
    await cart.save();

    if (!isCOD) {
      const firstSeller = populatedCartItems[0]; // Get the first seller's info for the UPI payment
      
      // UPI payment link (assuming payment goes to the first seller)
      const upiLink = `upi://pay?pa=${firstSeller.sellerId}@bank&pn=${firstSeller.sellerName}&am=${totalAmount}&cu=INR&tn=Order Payment`;
      console.log(upiLink);
      

      // Generate the QR code
      const qrCode = await QRCode.toDataURL(upiLink);

      res.status(201).send({
        success: true,
        message: 'Order placed successfully!',
        // order: newOrder,
        // qrCode, // Send the QR code to the frontend
      });
    } else {
      res.status(201).send({
        success: true,
        message: 'Order placed successfully!',
        order: newOrder,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Failed to place the order.',
    });
  }
};
 
const  getOrder = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch all orders for the user
      const orders = await Order.find({ user: userId })
        .populate('items.product') // Populate product details if needed
        .populate('items.sellerId', 'name') // Populate seller details if needed
        .exec();
  
      if (!orders || orders.length === 0) {
        return res.status(404).send({
          success: false,
          message: 'No orders found for this user'
        });
      }
  
      // Send the fetched orders
      res.status(200).send({
        success: true,
        orders
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  };
  const Updateorder = async(req,res) => {
    try {
     let orderId = req.query.id;
     
      const { status } = req.body; // New status from the frontend (e.g., "Ready to Ship")
  
      // Find the order by ID
      const order = await Order.findById(orderId);
  console.log(order);
  
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
  
    
      order.status = status;
      await order.save();
  
      res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        order,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order status',
      });
  }}
  const updateBulkOrderStatus = async (req, res) => {
    try {
      const { orderIds, status } = req.body; // orderIds: array of IDs, status: new status
  
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No orders provided',
        });
      }
  
      // Find orders and update their status in bulk
      const updatedOrders = await Order.updateMany(
        { _id: { $in: orderIds } }, // Filter: update only the orders whose IDs are in the orderIds array
        { $set: { status: status } }, // Set the new status for the orders
        { multi: true, new: true } // Options: multi allows updating multiple documents
      );
  
      if (!updatedOrders) {
        return res.status(404).json({
          success: false,
          message: 'Orders not found',
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Orders status updated to ${status}`,
        updatedOrders,
      });
    } catch (error) {
      console.error('Error updating orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update orders status',
      });
    }
  };
  
module.exports = {
    createOrder,getOrder,Updateorder,updateBulkOrderStatus
}