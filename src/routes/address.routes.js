const authenticate = require("../middleware/authenticat.js")
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller.js");

// Create new address (requires authentication)
router.post("/",authenticate, addressController.createAddress);

// Get current user's addresses (requires authentication)
router.get("/user",authenticate, addressController.getUserAddresses);

// Get all addresses (admin use)
router.get("/", addressController.getAllAddresses);

// Get address by ID
router.get("/:id", addressController.getAddressById);

// Update address (requires authentication and ownership)
router.put("/:id",authenticate, addressController.updateAddress);

// Delete address (requires authentication and ownership)
router.delete("/:id",authenticate, addressController.deleteAddress);

module.exports = router;