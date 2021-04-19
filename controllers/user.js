
const User = require('../models/user')
const Product = require('../models/product')
const Cart = require('../models/cart')
const Coupon = require('../models/coupon')
const Order = require('../models/order')
const uniqueid = require('uniqueid')

exports.userCart = async (req, res) => {
    console.log(req.body);
    const { cart } = req.body;


    // 
    let products = []

    const user = await User.findOne
        ({ email: req.user.email }).exec();

    // Check if cart with logged in user id already exist
    let cartExistByThisUser = await Cart
        .findOne({ orderBy: user._id }).exec();

    if (cartExistByThisUser) {
        cartExistByThisUser.remove();
        console.log('remove old cart');
    }

    for (let i = 0; i < cart.length; i++) {
        let object = {}

        object.product = cart[i]._id;
        object.count = cart[i].count
        object.color = cart[i].color
        // get price for getting total

        let productFromDb =
            await Product.findById(cart[i]._id)
                .select('price')
                .exec();
        object.price = productFromDb.price;

        products.push(object);
    }

    //console.log('products' , products)

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;

    }


    //console.log("carTotal" , cartTotal)

    let newCart = await new Cart({
        products,
        cartTotal,
        orderBy: user._id
    }).save();

    console.log("new cart --->", newCart);
    res.json({ ok: true });
};


exports.getUserCart = async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).exec();

    let cart = await Cart.findOne({ orderBy: user._id })
        .populate('products.product', '_id title price totalAfterDiscount')
        .exec();

    const { products, cartTotal, totalAfterDiscount } = cart;
    res.json({ products, cartTotal, totalAfterDiscount });

}


exports.empyCart = async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).exec();

    const cart = await Cart.findOneAndRemove({ orderBy: user._id }).exec();
    res.json({ cart });
};

exports.saveAddress = async (req, res) => {
    const userAdress = await User.findOneAndUpdate(
        { email: req.user.email },
        { address: req.body.address }
    ).exec();

    res.json({ ok: true })
};


exports.applyCouponUserCart = async (req, res) => {
    const { coupon } = req.body
    console.log('Coupon ', coupon);

    const validCoupon =
        await Coupon.findOne({ name: coupon }).exec();
    if (validCoupon === null) {
        return res.json({
            err: 'Invalid coupon',
        })
    }
    console.log('Valid Coupon', validCoupon);

    const user =
        await User.findOne({ email: req.user.email })
            .exec();

    let { products, cartTotal } = await Cart.findOne({ orderBy: user._id })
        .populate("products.product", "_id title price")
        .exec();

    console.log('cartTotal', cartTotal, 'discount%', validCoupon.discount)

    //  calucalte the Total after discount
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100)
        .toFixed(2);



    Cart.findOneAndUpdate(
        { orderBy: user._id },
        { totalAfterDiscount },
        { new: true }
    ).exec();

    res.json(totalAfterDiscount);
}

exports.createOrder = async (req, res) => {
    const { paymentIntent } = req.body.stripeResponse
    const user = await User.findOne({ email: req.user.email }).exec();

    let { products } = await Cart.findOne({ orderBy: user._id }).exec();

    let newOrder = await new Order({
        products,
        paymentIntent,
        orderBy: user._id,

    }).save();

    // Descrement quanlity , increment sold
    let bulkOption = products.map((item) => {

        return {
            updateOne: {
                filter: { _id: item.product._id }, // importa item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },

            }
        }

    })

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log('PRODUCT QUALITY DECREMENTED', updated)

    console.log('NEW ORDER SAVED', newOrder);
    res.json({ ok: true })
}

exports.orders = async (req, res) => {
    let user = await User.findOne({ email: req.user.email }).exec();

    let userOrders = await Order.find({ orderBy: user._id })
        .populate('products.product')
        .exec();

    res.json(userOrders);
}


// add Wishlist item

exports.addToWishlist = async (req, res) => {
    const { productId } = req.body;

    const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { $addToSet: { wishlist: productId } }
    ).exec();

    res.json({ ok: true })
}

exports.wishlist = async (req, res) => {

    const list = await User
        .findOne({ email: req.user.email })
        .select('wishlist')
        .populate('wishlist')
        .exec();

    res.json(list);

}

exports.removeFromWishlist = async (req, res) => {

    const { productId } = req.params;

    const user = await User.findOneAndUpdate(
        { email: req.user.email },
        { $pull: { wishlist: productId } }
    ).exec();

    res.json({ ok: true })

}


exports.createCashOrder = async (req, res) => {


    const { COD, couponApplied } = req.body;

    if (!COD) return res.status(400).send('Create cash order failed')

    const user = await User.findOne({ email: req.user.email }).exec();

    let userCart = await Cart.findOne({ orderBy: user._id }).exec();


    let finalAmount = 0;

    if (couponApllied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount * 100
    } else {
        finalAmount = userCart.cartTotal * 100
    }


    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqueid(),
            amount: userCart.cartTotal,
            currency: "usd",
            status: "Cash On Delivery",
            created: Date.now(),
            payment_method_types: ["cash"],
        },
        orderBy: user._id,
        orderstatus: "Cash On Delivery",

    }).save();

    // Descrement quanlity , increment sold
    let bulkOption = userCart.products.map((item) => {

        return {
            updateOne: {
                filter: { _id: item.product._id }, // importa item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },

            }
        }

    })

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log('PRODUCT QUALITY DECREMENTED', updated)

    console.log('NEW ORDER SAVED', newOrder);
    res.json({ ok: true })
}


