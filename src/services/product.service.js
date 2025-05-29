const CategoryModel = require("../models/categoryModel");
const SubCategoryModel = require("../models/subCategory.model");
const Product = require("../models/product.model");

// Create a new product
async function createProduct(reqData) {
  try {
    // Handle category creation/finding
    let category = null;
    if (reqData.categoryName) {
      category = await CategoryModel.findOne({ name: reqData.categoryName });
      
      if (!category) {
        const newCategory = new CategoryModel({
          name: reqData.categoryName,
          image: reqData.categoryImage || ""
        });
        category = await newCategory.save();
      }
    }

    // Handle subcategory creation/finding
    let subCategory = null;
    if (reqData.subCategoryName && category) {
      subCategory = await SubCategoryModel.findOne({ 
        name: reqData.subCategoryName,
        category: category._id 
      });
      
      if (!subCategory) {
        const newSubCategory = new SubCategoryModel({
          name: reqData.subCategoryName,
          image: reqData.subCategoryImage || "",
          category: [category._id]
        });
        subCategory = await newSubCategory.save();
      }
    }

    // Create the product
    const product = new Product({
      title: reqData.title,
      color: reqData.color,
      description: reqData.description,
      discountedPrice: reqData.discountedPrice,
      discountPersent: reqData.discountPersent,
      imageUrl: reqData.imageUrl,
      brand: reqData.brand,
      price: reqData.price,
      sizes: reqData.sizes,
      quantity: reqData.quantity,
      category: category ? category._id : null,
      subCategory: subCategory ? subCategory._id : null,
    });

    const savedProduct = await product.save();
    return savedProduct;

  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
}

// Delete a product by ID
async function deleteProduct(productId) {
  try {
    const product = await findProductById(productId);

    if (!product) {
      throw new Error(`Product not found with id: ${productId}`);
    }

    await Product.findByIdAndDelete(productId);
    return "Product deleted successfully";

  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
}

// Update a product by ID
async function updateProduct(productId, reqData) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      reqData,
      { new: true, runValidators: true }
    ).populate('category').populate('subCategory');
    
    if (!updatedProduct) {
      throw new Error(`Product not found with id: ${productId}`);
    }
    
    return updatedProduct;

  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
}

// Find a product by ID
async function findProductById(id) {
  try {
    const product = await Product.findById(id)
      .populate("category")
      .populate("subCategory")
      .populate("ratings")
      .populate("reviews")
      .exec();
      
    if (!product) {
      throw new Error(`Product not found with id: ${id}`);
    }
    
    return product;

  } catch (error) {
    throw new Error(`Error finding product: ${error.message}`);
  }
}

// Get all products with filtering and pagination
async function getAllProducts(reqQuery) {
  try {
    let {
      category,
      subCategory,
      color,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      sort,
      stock,
      pageNumber,
      pageSize,
      brand
    } = reqQuery;

    pageSize = pageSize || 10;
    pageNumber = pageNumber || 1;

    let query = Product.find().populate("category").populate("subCategory");

    // Category filter
    if (category) {
      const existCategory = await CategoryModel.findOne({ name: category });
      if (existCategory) {
        query = query.where("category").equals(existCategory._id);
      } else {
        return { content: [], currentPage: 1, totalPages: 1 };
      }
    }

    // SubCategory filter
    if (subCategory) {
      const existSubCategory = await SubCategoryModel.findOne({ name: subCategory });
      if (existSubCategory) {
        query = query.where("subCategory").equals(existSubCategory._id);
      } else {
        return { content: [], currentPage: 1, totalPages: 1 };
      }
    }

    // Color filter
    if (color) {
      const colorSet = new Set(color.split(",").map(color => color.trim().toLowerCase()));
      const colorRegex = colorSet.size > 0 ? new RegExp([...colorSet].join("|"), "i") : null;
      query = query.where("color").regex(colorRegex);
    }

    // Sizes filter
    if (sizes) {
      const sizesSet = new Set(sizes.split(","));
      query = query.where("sizes.name").in([...sizesSet]);
    }

    // Brand filter
    if (brand) {
      query = query.where("brand").regex(new RegExp(brand, "i"));
    }

    // Price range filter
    if (minPrice && maxPrice) {
      query = query.where("discountedPrice").gte(minPrice).lte(maxPrice);
    }

    // Discount filter
    if (minDiscount) {
      query = query.where("discountPersent").gt(minDiscount);
    }

    // Stock filter
    if (stock) {
      if (stock === "in_stock") {
        query = query.where("quantity").gt(0);
      } else if (stock === "out_of_stock") {
        query = query.where("quantity").lte(0);
      }
    }

    // Sorting
    if (sort) {
      switch (sort) {
        case "price_high":
          query = query.sort({ discountedPrice: -1 });
          break;
        case "price_low":
          query = query.sort({ discountedPrice: 1 });
          break;
        case "newest":
          query = query.sort({ createdAt: -1 });
          break;
        case "oldest":
          query = query.sort({ createdAt: 1 });
          break;
        case "rating":
          query = query.sort({ numRatings: -1 });
          break;
        default:
          query = query.sort({ createdAt: -1 });
      }
    }

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query.getQuery());

    // Apply pagination
    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);

    const products = await query.exec();
    const totalPages = Math.ceil(totalProducts / pageSize);

    return { 
      content: products, 
      currentPage: parseInt(pageNumber), 
      totalPages: totalPages,
      totalProducts: totalProducts
    };

  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
}

// Create multiple products
async function createMultipleProduct(products) {
  try {
    const createdProducts = [];
    
    for (let productData of products) {
      const product = await createProduct(productData);
      createdProducts.push(product);
    }
    
    return createdProducts;

  } catch (error) {
    throw new Error(`Error creating multiple products: ${error.message}`);
  }
}

// Get products by category
async function getProductsByCategory(categoryId) {
  try {
    const products = await Product.find({ category: categoryId })
      .populate("category")
      .populate("subCategory")
      .exec();
    
    return products;

  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
}

// Get products by subcategory
async function getProductsBySubCategory(subCategoryId) {
  try {
    const products = await Product.find({ subCategory: subCategoryId })
      .populate("category")
      .populate("subCategory")
      .exec();
    
    return products;

  } catch (error) {
    throw new Error(`Error fetching products by subcategory: ${error.message}`);
  }
}

// Search products by title or description
async function searchProducts(searchTerm, pageNumber = 1, pageSize = 10) {
  try {
    const searchRegex = new RegExp(searchTerm, "i");
    
    let query = Product.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { brand: { $regex: searchRegex } }
      ]
    }).populate("category").populate("subCategory");

    const totalProducts = await Product.countDocuments(query.getQuery());
    
    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);

    const products = await query.exec();
    const totalPages = Math.ceil(totalProducts / pageSize);

    return {
      content: products,
      currentPage: parseInt(pageNumber),
      totalPages: totalPages,
      totalProducts: totalProducts
    };

  } catch (error) {
    throw new Error(`Error searching products: ${error.message}`);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct,
  getProductsByCategory,
  getProductsBySubCategory,
  searchProducts
};