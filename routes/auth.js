const Joi = require('joi');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();


//login
router.post('/', async(req, res)=>{
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid Email 0r Password');

    const validatePassword = await bcrypt.compare(req.body.password, user.password);

    if(!validatePassword) return res.status(400).send('Invalid Email 0r Password');

    const token = user.generateAuthToken();
    res.send(token)
})

const validate = (req) => {
    const schema = Joi.object({
        email:Joi.string().email().min(5).max(500).required(),
        password:Joi.string().min(8).max(1024).required(),
    })
    return schema.validate(req);
}


module.exports = router