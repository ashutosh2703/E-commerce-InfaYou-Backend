const Address = require('../models/address.model.js');
const User = require('../models/user.model.js');

const createAddress = async (addressData, userId) => {
    try {
        const { firstName, lastName, streetAddress, city, state, zipCode, mobile } = addressData;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found with id: ${userId}`);
        }
        
        const address = await Address.create({
            firstName,
            lastName,
            streetAddress,
            city,
            state,
            zipCode,
            user: userId,
            mobile
        });
        
        console.log("Address created:", address);
        return address;
        
    } catch (error) {
        console.log("Create Address Error -", error.message);
        throw new Error(error.message);
    }
};

const getAddressesByUserId = async (userId) => {
    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found with id: ${userId}`);
        }
        
        const addresses = await Address.find({ user: userId }).populate('user', 'firstName lastName email mobile');
        return addresses;
        
    } catch (error) {
        console.log("Get Addresses Error -", error.message);
        throw new Error(error.message);
    }
};

const getAddressById = async (addressId) => {
    try {
        const address = await Address.findById(addressId).populate('user', 'firstName lastName email mobile');
        
        if (!address) {
            throw new Error(`Address not found with id: ${addressId}`);
        }
        
        return address;
        
    } catch (error) {
        console.log("Get Address By ID Error -", error.message);
        throw new Error(error.message);
    }
};

const updateAddress = async (addressId, updateData, userId) => {
    try {
        const { firstName, lastName, streetAddress, city, state, zipCode, mobile } = updateData;
        
        // Check if address exists and belongs to the user
        const existingAddress = await Address.findOne({ _id: addressId, user: userId });
        if (!existingAddress) {
            throw new Error(`Address not found or you don't have permission to update this address`);
        }
        
        // Prepare update object
        const updateObject = {};
        if (firstName !== undefined) updateObject.firstName = firstName;
        if (lastName !== undefined) updateObject.lastName = lastName;
        if (streetAddress !== undefined) updateObject.streetAddress = streetAddress;
        if (city !== undefined) updateObject.city = city;
        if (state !== undefined) updateObject.state = state;
        if (zipCode !== undefined) updateObject.zipCode = zipCode;
        if (mobile !== undefined) updateObject.mobile = mobile;
        
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            updateObject,
            { new: true, runValidators: true }
        ).populate('user', 'firstName lastName email mobile');
        
        console.log("Address updated:", updatedAddress);
        return updatedAddress;
        
    } catch (error) {
        console.log("Update Address Error -", error.message);
        throw new Error(error.message);
    }
};

const deleteAddress = async (addressId, userId) => {
    try {
        // Check if address exists and belongs to the user
        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            throw new Error(`Address not found or you don't have permission to delete this address`);
        }
        
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        
        console.log("Address deleted:", deletedAddress);
        return deletedAddress;
        
    } catch (error) {
        console.log("Delete Address Error -", error.message);
        throw new Error(error.message);
    }
};

const getAllAddresses = async () => {
    try {
        const addresses = await Address.find().populate('user', 'firstName lastName email mobile');
        return addresses;
        
    } catch (error) {
        console.log("Get All Addresses Error -", error.message);
        throw new Error(error.message);
    }
};

module.exports = {
    createAddress,
    getAddressesByUserId,
    getAddressById,
    updateAddress,
    deleteAddress,
    getAllAddresses
};