const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfessionalSchema = new Schema({
    name: {
        type: String,
        required: "Name is required",
        minlength: [3, 'Name must be at least 3 characters long']
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


}, { timestamps: true });

const ProfessionalModel = mongoose.model('professional', ProfessionalSchema);

module.exports = ProfessionalModel;