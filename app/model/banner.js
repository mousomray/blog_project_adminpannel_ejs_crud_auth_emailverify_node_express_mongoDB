const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
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
}, { timestamps: true });

const BannerModel = mongoose.model('banner', BannerSchema);

module.exports = BannerModel;