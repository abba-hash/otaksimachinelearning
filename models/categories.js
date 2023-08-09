const mongoose = require('mongoose');
const Joi = require('joi');

const CategoriesSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const Categories = mongoose.model('Categories',CategoriesSchema);

const validateCategories = (categories)=>{
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
    })
    return schema.validate(categories);
}

exports.Categories = Categories;
exports.validate = validateCategories;