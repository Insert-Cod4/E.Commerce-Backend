const express = require('express')

const router = express.Router();


// middlewares
const { authCheck } = require('../middlewares/auth')
// Controllers
const {
    userCart,
    getUserCart,
    empyCart,
    saveAddress,
    applyCouponUserCart,
    createOrder,
    orders,
    addToWishlist,
    wishlist,
    removeFromWishlist,
    createCashOrder,
} = require('../controllers/user');

const { get } = require('mongoose');


router.post('/user/cart', authCheck, userCart); // save
router.get('/user/cart', authCheck, getUserCart);
router.delete('/user/cart', authCheck, empyCart);
router.post('/user/address', authCheck, saveAddress);

router.post('/user/order', authCheck, createOrder);
router.post('/user/cash-order', authCheck, createCashOrder);
router.get('/user/orders', authCheck, orders)

router.post('/user/cart/coupon', authCheck, applyCouponUserCart)
// wishlist 
router.post('/user/wishlist', authCheck, addToWishlist)
router.get('/user/wishlist', authCheck, wishlist)
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist)
module.exports = router;