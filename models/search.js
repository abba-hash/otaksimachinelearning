const Joi = require('joi');
const mongoose = require('mongoose');


const searchSchema = new mongoose.Schema({
    data:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
});

const UserSearchs = mongoose.model('UserSearchs', searchSchema);
const validateSearch = (search) =>{
    const schema = Joi.object({
        data:Joi.string().required(),
        user:Joi
    })
    return schema.validate(search)
}

exports.UserSearchs = UserSearchs;
exports.validate = validateSearch;