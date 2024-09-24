const Cart = require('../models/cart')
const CartItems = require('../models/cartItem')
const Product = require('../models/product')
const addcart = async(req,res) => {
    try {
        const userId = req.user.id
        console.log(userId);
        
        const {productId,quantity,price} = req.body
        console.log(req.body);
        
        let cart = await Cart.findOne({userId}).populate('cartitems');
        console.log(cart);
        
        if(!cart) {
            cart = new Cart({userId,cartitems:[]})
        }
        console.log(cart);
        const existingItem = await cart.cartitems.find((item)=> {
            console.log(item.productId);
            
            return item.productId == productId
        })
        if(existingItem) {
            existingItem.quantity += quantity
            existingItem.price = price
        } else {
            const cartItem = await new CartItems({productId,quantity,price})
            await cartItem.save();
            await cartItem.populate('productId')
            cart.cartitems.push(cartItem)
        }
        cart.totalPrice = cart.cartitems.reduce((acc,item)=> acc + item.price * item.quantity,0)
        await cart.save()
        console.log(cart);
        
        res.status(201).send({
            success : true,
            message:'Item added to cart',
            cart
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to add item to cart',
        })
    }
}
const getcart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user's cart and populate cartitems and product details
        let cart = await Cart.findOne({ userId })
            .populate({
                path: 'cartitems',
                populate: {
                    path: 'productId',
                    model: 'Product', // Ensure this matches your Product model name
                    select: 'name price category image' // Adjust fields based on what you need
                }
            });

        if (!cart) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found',
            });
        }

        res.status(200).send({
            success: true,
            message: 'Cart retrieved successfully',
            cart
        });
    } catch (error) {
        console.error('Error retrieving cart:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to retrieve cart',
        });
    }
};




const deletecart = async(req,res) => {
    try {
        const userId = req.user.id;
        const id = req.query.id;
        let cart = await Cart.findOne({ userId }).populate('cartitems');
        console.log(cart);
        
        if (!cart) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found',
            });
        }
        const itemIndex = cart.cartitems.findIndex(item => item._id.toString() === id);

        if (itemIndex === -1) {
            return res.status(404).send({
                success: false,
                message: 'Item not found in cart',
            });
        }

        cart.cartitems.splice(itemIndex, 1);
        cart.totalPrice = cart.cartitems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        await cart.save();

        // Optionally, delete the CartItem document if you want to clean up
        // await CartItems.findByIdAndDelete(itemId);

        res.status(200).send({
            success: true,
            message: 'Item removed from cart',
            cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Failed to remove item from cart',
        });
    }
}
const updatecart = async(req,res) => {
    try {
        const userId = req.user.id;
        const id = req.query.id;
        const { quantity } = req.body;

        // Validate quantity
        if (quantity <= 0) {
            return res.status(400).send({
                success: false,
                message: 'Quantity must be greater than 0',
            });
        }

        // Find the user's cart and populate the cartitems
        let cart = await Cart.findOne({ userId }).populate('cartitems');

        if (!cart) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found',
            });
        }

        // Find the item in the cart
        const existingItem = cart.cartitems.find(item => item._id.toString() === id);

        if (!existingItem) {
            return res.status(404).send({
                success: false,
                message: 'Item not found in cart',
            });
        }

        // Update the quantity and price of the existing item
        existingItem.quantity = quantity;
        existingItem.price = req.body.price || existingItem.price; // Optionally update the price if provided
        await existingItem.save(); 
        // Update the total price of the cart
        cart.totalPrice = cart.cartitems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        // Save the updated cart
        await cart.save();
        
        res.status(200).send({
            success: true,
            message: 'Cart item updated successfully',
            cart,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'Failed to update cart item',
        });
    }
}
module.exports = {addcart,getcart,deletecart,updatecart}