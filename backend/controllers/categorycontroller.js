const Category = require('../models/category')
const Product = require('../models/product')
const path = require('path')
const fs = require('fs')
const createCategory = async(req,res) => {
    try {
    
        
        const image = req.file.filename
         const sellerId = req.user.id
         
        const {name,description} = req.body
        const existingCategory = await Category.findOne({ slug : name });
        if (existingCategory) {
            return res.status(400).send({
                success: false,
                message: 'Category name already exists'
            });
        }
        let category = new Category({sellerId,name,description,image})
    
        
        category = await category.save()
        if(!category){
            return res.status(400).send({
                sucees : false,
                message:"Category not created"
            })
        }
        res.status(201).send({
            success : true,
            message : "Category created successfully",
            category
        })
    } catch (err) {
        console.log(err)
        res.status(500).send({
            success : false,
            message : err
        })
    }
}
const deleteCategory = async(req,res) => {
    try {
        const deleteId = req.query.id
        console.log(deleteId);
        const categorydelte =  await Category.findByIdAndDelete(deleteId)
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
const updateCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
      const updateId = req.query.id;
  
      // Find the existing category to check for current image
      let category = await Category.findById(updateId);
      if (!category) {
        return res.status(404).send({
          success: false,
          message: "Category not found",
        });
      }
  
      // If a new image is uploaded, update the image and delete the old one
      let image = category.image; // keep the old image by default
      if (req.file) {
        const newImage = req.file.filename;
  
        // Remove the old image if a new one is uploaded
        if (category.image) {
          const oldImagePath = path.join(__dirname, "..", "uploads", category.image);
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
  
      // Update the category with or without image
      let categoryupdate = await Category.findByIdAndUpdate(
        updateId,
        {
          name: name,
          description: description,
          slug: name,
          image: image,
        },
        { new: true } // To return the updated category
      );
  
      if (!categoryupdate) {
        return res.status(400).send({
          success: false,
          message: "Category not updated",
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Category updated successfully",
        categoryupdate,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: error.message || "Server error",
      });
    }
  };
const allCategory = async(req,res) => {
    try {
        const category = await Category.find({})
        if(!category){
            return res.status(400).send({
                success : false,
                message : "Category not found"
            })
        }
        return res.status(200).send({
            success : true,
            message : "Category found",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success : false,
            message : error
        })
    }
}
const SellerCategoryFind = async(req,res) => {
  try {
    const sellerId = req.user.id;  // Assuming seller ID is available in req.user
    
    // Find categories added by this seller
    const categories = await Category.find({ sellerId });
    
    if (!categories || categories.length === 0) {
        return res.status(400).send({
            success: false,
            message: "No categories found for this seller"
        });
    }

    // Optionally, find products for each category created by this selle

    return res.status(200).send({
        success: true,
        message: "Categories found for this seller",
        categories,
    });
} catch (error) {
    console.log(error);
    res.status(500).send({
        success: false,
        message: "Server error"
    });
}
}
const getproductfromcategory = async(req,res) => {
  try {
    const categoryId = req.query.id
    const products = await Product.find({category: categoryId}).populate('category')
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
const getcategory = async(req,res) => {
    try {
        const categoryname = req.query.slug
        let category = await Category.findOne({slug : categoryname })
        if(!category){
            return res.status(400).send({
                success : false,
                message : "Category not found"
            })
        }
        return res.status(200).send({
            success : true, 
            message : "Category found",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success : false,
            message : error
        })
    }
}
module.exports = {
    createCategory,deleteCategory,updateCategory,allCategory,getcategory,SellerCategoryFind,getproductfromcategory
}