const Wishlist = require('../models/wishlist.model');

async function getWishlist(userId) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
  return { wishlist, updated: false }; // No change on get
}

async function addToWishlist(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, items: [] });
  }

  const alreadyAdded = wishlist.items.find(item => item.product.toString() === productId);
  if (!alreadyAdded) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('items.product');
    return { wishlist, updated: true };
  }

  await wishlist.populate('items.product');
  return { wishlist, updated: false };
}

async function removeFromWishlist(userId, productId) {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) return { wishlist: null, updated: false };

  const originalLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);

  const updated = wishlist.items.length !== originalLength;
  if (updated) {
    await wishlist.save();
  }

  await wishlist.populate('items.product');
  return { wishlist, updated };
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
