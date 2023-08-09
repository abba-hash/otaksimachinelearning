const config = require('config');
const jwt = require('jsonwebtoken');

const Joi = require('joi');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:50
    },
    last_name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:50
    },
    gender:{
        type:String,
        required:false
    },
    birth_day:{
        type:String,
        required:false,
    },
    profile_img:{
        type:String,
        required:false,
    },
    email:{
        type:String,
        required:true,
        minlength:5,
        maxlength:250,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:1024
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
});

UserSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id, isAdmin:this.isAdmin},
        config.get('jwtPrivateKey'));
        return token;
}

const User = mongoose.model('User', UserSchema);

const validateUser = (user)=>{
    const schema = Joi.object({
        first_name: Joi.string().min(3).max(50).required(),
        last_name: Joi.string().min(3).max(50).required(),
        birth_day: Joi.string(),
        gender: Joi.string(),
        email: Joi.string().email().min(5).max(500).required(),
        profile_img: Joi.string(),
        password: Joi.string().min(8).max(1024).required(),
        isAdmin: Joi.boolean(),
    })
    return schema.validate(user)
}

exports.User = User;
exports.validate = validateUser;