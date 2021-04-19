const User = require('../models/user');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Coupon = require('../models/coupon');
const stripe = require('stripe')('sk_test_51IfSRVJCPbEwePBFQb4TmDLs8K9gRzU6vef5tn5Zb3AiuGm1HxS7oRaw32s83Q43BeZsMBhM6zb7QEVuZu6tSdP3004LEqz0Pa');


exports.createPaymentIntent = async (req, res) => {

    //later apply coupon
    // later calculate price
    const { couponApllied } = req.body;

    // 1 find user by
    const user = await User.findOne({ email: req.user.email }).exec()
    // 2 get user cart total
    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderBy: user._id }).exec();
    //console.log('CART TOTAL CHARGED ', cartTotal, "After Disc ", totalAfterDiscount);

    let finalAmount = 0;

    if (couponApllied && totalAfterDiscount) {
        finalAmount = totalAfterDiscount * 100
    } else {
        finalAmount = cartTotal * 100
    }


    // create payment intenet with order amount and currency

    const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: 'usd',
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: finalAmount,
    })
}