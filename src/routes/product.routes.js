const express=require("express");
const router=express.Router();
const productController=require("../controllers/product.controller.js");

router.post('/', productController.createProduct);

// Create multiple products
router.post('/creates', productController.createMultipleProduct);

// Get all products with filtering and pagination
router.get('/', productController.getAllProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get products by subcategory
router.get('/subcategory/:subCategoryId', productController.getProductsBySubCategory);

// Get a specific product by ID
router.get('/:id', productController.findProductById);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
