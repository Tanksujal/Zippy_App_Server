const Category = require('../models/category')
const Product = require('../models/product')
const path = require('path')
const fs = require('fs')
const createProduct = async(req,res) => {
    try {
        let category = req.body.category
        let cateogryfind = await Category.findById(category)
        if(!cateogryfind){
            return res.status(400).send({
                success : false,
                message : "Category not found"
            })
        }
        const image = req.file.filename
        const sellerId = req.user.id
        const {name,description,price,stock,productDiscountPrice,productUnit,productQuantity,productStock,productKeyFeatures,manufacturerDetails,returnPolicy,countryOfOrigin} = req.body
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).send({
                success: false,
                message: 'Product name already exists'
            });
        }
        let product = new Product({
            sellerId,
            name:name,
            description : description,
            image :image,
            price : price,
            stock :stock,
            category : cateogryfind,
            productDiscountPrice : productDiscountPrice,
            productUnit : productUnit,
            productQuantity:productQuantity,
            productStock:productStock,
            productKeyFeatures:productKeyFeatures,
            manufacturerDetails:manufacturerDetails,
            returnPolicy:returnPolicy,
            countryOfOrigin:countryOfOrigin
        })
         product = await product.save()
        if(!product) {
            return res.status(400).send({
                success : false,
                message : "Product not created"
            })
        }
        return res.status(200).send({
            success : true,
            message : "Product Created SuccesFully",
            product
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success : false,
            message : error
        })
    }
}
const delteProduct = async(req,res) => {
    try {
        const deleteId = req.query.id
        console.log(deleteId);
        const categorydelte =  await Product.findByIdAndDelete(deleteId)
        if(!categorydelte){
            return res.status(400).send({
                success : false,
                message : "Category not deleted"
            })
        }
        const imagePath = categorydelte.image;
    if (imagePath) {
      const fullImagePath = path.join(__dirname, "..", "uploads", imagePath)
      fs.unlink(fullImagePath, (err) => {
        if (err) {
          console.error("Error deleting the image file:", err);
          return res.status(500).send({
            success: false,
            message: "Category deleted, but error deleting image file",
          });
        }
        console.log("Image file deleted successfully");
      });
    }

    return res.status(200).send({
      success: true,
      message: "Category and image deleted successfully",
      categorydelte,
    });
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success : false,
            message : error
        })
    }
}
const allProduct = async(req,res) => {
    try {
        const product = await Product.find({}).populate('category')
        if(!product){
            return res.status(400).send({
                success : false,
                message : "Product not found"
            })
        }
        return res.status(200).send({
            success : true,
            message : "Product found",
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success : false,
            message : error
        })
    }
}
const updateProduct = async (req, res) => {
    try {
      const updateId = req.query.id;
      console.log(updateId);
      
      const {
        name,
        description,
        price,
        stock,
        category, // This will be the category ID
        productDiscountPrice,
        productUnit,
        productQuantity,
        productStock,
        productKeyFeatures,
        manufacturerDetails,
        returnPolicy,
        countryOfOrigin,
      } = req.body;
  console.log(req.body);
  
      // Find the existing product to check for the current image
      let product = await Product.findById(updateId);
      if (!product) {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
  
      // Find the category
      let categoryFind = await Category.findById(category);
      if (!categoryFind) {
        return res.status(400).send({
          success: false,
          message: "Category not found",
        });
      }
  
      // If a new image is uploaded, update the image and delete the old one
      let image = product.image; // Keep the old image by default
      if (req.file) {
        const newImage = req.file.filename;
  
        // Remove the old image if a new one is uploaded
        if (product.image) {
          const oldImagePath = path.join(__dirname, "..", "uploads", product.image);
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Error deleting the old image:", err);
            } else {
              console.log("Old image deleted successfully");
            }
          });
        }
  
        image = newImage; // Update with the new image
      }
  
      // Update the product with the new data
      let productUpdate = await Product.findByIdAndUpdate(
        updateId,
        {
          name: name || product.name,
          description: description || product.description,
          image: image, // Update image only if a new one is uploaded
          price: price || product.price,
          stock: stock || product.stock,
          category: categoryFind._id, // Update the category ID
          productDiscountPrice: productDiscountPrice || product.productDiscountPrice,
          productUnit: productUnit || product.productUnit,
          productQuantity: productQuantity || product.productQuantity,
          productStock: productStock || product.productStock,
          productKeyFeatures: productKeyFeatures || product.productKeyFeatures,
          manufacturerDetails: manufacturerDetails || product.manufacturerDetails,
          returnPolicy: returnPolicy || product.returnPolicy,
          countryOfOrigin: countryOfOrigin || product.countryOfOrigin,
        },
        { new: true } // To return the updated product
      );
  
      if (!productUpdate) {
        return res.status(400).send({
          success: false,
          message: "Product not updated",
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Product updated successfully",
        product: productUpdate,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
};
const SellerProductFind = async(req,res) => {
  try {
    const sellerId = req.user.id;  // Assuming seller ID is available in req.user
    
    // Find categories added by this seller
    const products = await Product.find({ sellerId }).populate('category')
    
    if (!products || products.length === 0) {
        return res.status(400).send({
            success: false,
            message: "No Product found for this seller"
        });
    }

    // Optionally, find products for each category created by this selle

    return res.status(200).send({
        success: true,
        message: "Categories found for this seller",
        products,
    });
} catch (error) {
    console.log(error);
    res.status(500).send({
        success: false,
        message: "Server error"
    });
}
} 
  
const getProduct = async(req,res) => {
    try {
        const productname = req.query.slug
        let product = await Product.findOne({slug : productname })
        if(!product){
            return res.status(400).send({
                success : false,
                message : "product not found"
            })
        }
        return res.status(200).send({
            success : true, 
            message : "product found",
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success : false,
            message : error
        })
    }
}
const getproductfromproduct = async(req,res) => {
  try {
    const productId = req.query.id
    console.log(productId);
    
    const products = await Product.findById(productId).populate('category')
    if (!products || products.length === 0) {
      return res.status(400).send({
        success: false,
        message: "No products found for this category"
        });
    }
    return res.status(200).send({
      success: true,
      message: "Products found for this category",
      products
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Server error"
      });
  }
}
const allProductByCategories = async (req, res) => {
  try {
    // Get all distinct categories from the products collection
    const categories = await Product.distinct('category');

    // Create an object to hold products grouped by category
    const categoryProducts = {};

    // Loop through each category and fetch products for that category, populating the category field
    for (const category of categories) {
      const products = await Product.find({ category }).populate('category', 'name'); // Populate category name
      
      // Access category name through populated field
      if (products.length > 0 && products[0].category && products[0].category.name) {
        const categoryName = products[0].category.name;
        categoryProducts[categoryName] = products; // Use category name as key instead of ID
      }
    }

    res.status(200).json({
      success: true,
      categories: categoryProducts,  // Send the dynamically generated category-products object
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
};

module.exports = {
    createProduct,delteProduct,allProduct,updateProduct,getProduct,SellerProductFind,getproductfromproduct,allProductByCategories
}