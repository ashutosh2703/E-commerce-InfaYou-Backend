
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller.js");

// Create new address (requires authentication)
router.post("/", addressController.createAddress);

// Get current user's addresses (requires authentication)
router.get("/user", addressController.getUserAddresses);

// Get all addresses (admin use)
router.get("/", addressController.getAllAddresses);

// Get address by ID
router.get("/:id", addressController.getAddressById);

// Update address (requires authentication and ownership)
router.put("/:id", addressController.updateAddress);

// Delete address (requires authentication and ownership)
router.delete("/:id", addressController.deleteAddress);

module.exports = router;