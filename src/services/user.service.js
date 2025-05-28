const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model.js');
const jwtProvider=require("../config/jwtProvider")

const createUser = async (userData) => {
    try {
        let { firstName, lastName, email, password, role, mobile, dob } = userData;

        // Check for existing user (optional: use mobile only if you're doing OTP-only)
        const isUserExist = await User.findOne({ $or: [{ email }, { mobile }] });

        if (isUserExist) {
            throw new Error(`User already exists with email or mobile`);
        }

        // Hash password only if it's provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 8);
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            mobile,
            dob  // ✅ include DOB here
        });

        console.log("User created:", user);

        return user;
    } catch (error) {
        console.log("Create User Error -", error.message);
        throw new Error(error.message);
    }
};




const findUserById=async(userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("user not found with id : ",userId)
        }
        return user;
    } catch (error) {
        console.log("error :------- ",error.message)
        throw new Error(error.message)
    }
}

const getUserByEmail=async(email)=>{
    try {

        const user=await User.findOne({email});

        if(!user){
            throw new Error("user found with email : ",email)
        }

        return user;
        
    } catch (error) {
        console.log("error - ",error.message)
        throw new Error(error.message)
    }
}
const getUserByMobile = async (mobile) => {
    try {
        const user = await User.findOne({ mobile });

        // Instead of throwing, just return null
        return user || null;

    } catch (error) {
        console.log("Error -", error.message);
        throw new Error(error.message);
    }
}



const getUserProfileByToken=async(token)=>{
    try {

        const userId=jwtProvider.getUserIdFromToken(token)

        // console.log("userr id ",userId)


        const user= (await findUserById(userId)).populate("addresses");
        user.password=null;
        
        if(!user){
            throw new Error("user not exist with id : ",userId)
        }
        return user;
    } catch (error) {
        console.log("error ----- ",error.message)
        throw new Error(error.message)
    }
}

const getAllUsers=async()=>{
    try {
        const users=await User.find();
        return users;
    } catch (error) {
        console.log("error - ",error)
        throw new Error(error.message)
    }
}

module.exports={
    createUser,
    findUserById,
    getUserProfileByToken,
    getUserByEmail,
    getUserByMobile,
    getAllUsers
}