const Joi = require('joi');
const mongoose = require('mongoose');

const ML_ResultSchema = new mongoose.Schema({
    Selected_ML_Result:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
    },
    UserID_ML_Result:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
})

const ML_Result = mongoose.model('ML_Result', ML_ResultSchema);

const validateML_Result = (ml_result) =>{
    const schema = Joi.object({
        Selected_ML_Result: Joi,
        UserID_ML_Result:Joi,
    })
    return schema.validate(ml_result);
}


exports.ML_Result = ML_Result;
exports.validate = validateML_Result;