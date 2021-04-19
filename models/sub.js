const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
// React 

const subSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Name is Require',
        minLength: [3 , 'Too Short'],
        maxlength: [32, 'Too Long'],
    },
    slug:{
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    parent: {type: ObjectId , ref: "Category" , required: true},
    },
 {timestamps: true}
 );

module.exports = mongoose.model('Sub' , subSchema)