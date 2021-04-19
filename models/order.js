

const moongose = require('mongoose');
const Schema = moongose.Schema
const { ObjectId } = moongose.Schema;


const orderSchema = new moongose.Schema({
    products: [
        {
            product: {
                type: ObjectId,
                ref: "Product",
            },
            count: Number,
            color: String,
        },

    ],
    paymentIntent: {},
    orderStatus: {
        type: String,
        default: 'Not Processed',
        enum: [
            "Not Processed",
            "Cash On Delivery",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Completed"
        ]
    },
    orderBy: { type: ObjectId, ref: "User" },
}, { timestamps: true });


module.exports = moongose.model('Order', orderSchema);