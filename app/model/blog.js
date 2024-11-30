const mongoose = require('mongoose');
const CommentSchema = require('./comment');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: {
        type: String,
        required: "Title is required",
        minlength: [3, 'Title must be at least 3 characters long']
    },
    description: {
        type: String,
        required: "Description is required",
        minlength: [3, 'Description must be at least 3 characters long']
    },
    image: {
        type: String,
        required: "Enter image it is Required"
    },
    active: {
        type: Boolean,
        default: false
    },
    comments: [CommentSchema], // Import comment schema for to show comment 
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

const BlogModel = mongoose.model('blog', BlogSchema);

module.exports = BlogModel;