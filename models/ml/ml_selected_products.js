const Joi = require('joi');
const mongoose = require('mongoose');

const Selected_ML_Products = new mongoose.Schema({
    Selected_ML_Products:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
    },
    UserID_ML_Products:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
})

const ML_Products = mongoose.model('ML_Products', Selected_ML_Products);

const validateML_Products = (ml_products) =>{
    const schema = Joi.object({
        Selected_ML_Products: Joi.required(),
        UserID_ML_Products:Joi.required(),
    })
    return schema.validate(ml_products);
}


exports.ML_Products = ML_Products;
exports.validate = validateML_Products;