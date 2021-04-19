const mongoose = require('mongoose')
const {Objectid} = mongoose.Schema

// React 

const categorySchema = new mongoose.Schema({
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

    }
} , {timestamps: true});

module.exports = mongoose.model('Category' , categorySchema)