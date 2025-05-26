const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/register", authController.register); // Only called if newUser: true

module.exports = router;
