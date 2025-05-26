const userService = require("../services/user.service.js");
const jwtProvider = require("../config/jwtProvider.js");
const cartService = require("../services/cart.service.js");
const otpService = require("../services/otp.service.js");

const sendOtp = async (req, res) => {
    const { mobile } = req.body;

    try {
        await otpService.sendOtp(mobile);
        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { mobile, otp } = req.body;

    try {
        const isValid = otpService.verifyOtp(mobile, otp);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = await userService.getUserByMobile(mobile);

        if (!user) {
            return res.status(200).json({
                newUser: true,
                message: "User not registered. Please complete registration.",
                mobile,
            });
        }

        const jwt = jwtProvider.generateToken(user._id);
        return res.status(200).json({ jwt, message: "Login successful via OTP" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const register = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        const jwt = jwtProvider.generateToken(user._id);

        await cartService.createCart(user);

        return res.status(200).json({ jwt, message: "Registration successful" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { sendOtp, verifyOtp, register };
