const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    name: {
        type: String,
        required: "Username is required",
        minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: "Email is Required",
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email address should follow the format: abc@gmail.com']
    },
    phone: {
        type: Number,
        required: "Phone number is Required",
        min: [1000000000, 'Phone number must be exactly 10 digits'],
        max: [9999999999, 'Phone number must be exactly 10 digits']
    },
    message: {
        type: String,
        required: "Message is Required",
        minlength: [5, 'Message should be at least 5 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = CommentSchema;
