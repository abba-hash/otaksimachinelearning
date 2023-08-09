const Joi = require('joi');
const mongoose = require('mongoose');

const ML_CartSchema = new mongoose.Schema({
    Selected_ML_Cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
    },
    UserID_ML_Cart:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
})

const ML_Cart = mongoose.model('ML_Cart', ML_CartSchema);

const validateML_Cart = (ml_cart) =>{
    const schema = Joi.object({
        Selected_ML_Cart: Joi.required(),
        UserID_ML_Cart:Joi.required(),
    })
    return schema.validate(ml_cart);
}


exports.ML_Cart = ML_Cart;
exports.validate = validateML_Cart;