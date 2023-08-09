const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

const imgUpload = require('./imgUpload');
const bcrypt = require('bcrypt');

const _ = require('lodash');
const {User, validate} = require('../models/user');
const express = require('express');

const router = express.Router();


//read user data
router.get('/me', auth, async(req, res)=>{
    const user = await User.findById(req.user._id)
    .select('-password');
    res.send(user);
})

//register
router.post('/', async(req, res)=> {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send('User already exists');

    user = new User(_.pick(req.body, ['first_name','last_name',
        'gender', 'birth_day','email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user,[
        '_id', 'first_name', 'last_name', 'gender', 'birth_day', 'email'
    ]))
})

//edit user data
router.put('/', auth, imgUpload, async(req, res)=>{
    let UserPic = '';
    if(req.file && req.file !==''){
        const URL = req.protocol + "://" + req.get("host");
        UserPic = URL + "/images/" + req.file.filename;
    }else{
        UserPic = req.body.profile_img;
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            profile_img: UserPic,
            gender: req.body.gender,
            birth_day: req.body.birth_day,
        },{new:true, useFindAndModify:false})

        if(!user) return res.status(404).send('this user is not found')

        res.send(user);
})

//change user role
router.put('/Role', [auth, admin], async(req, res)=>{
    const user = await User.findByIdAndUpdate(req.body._id,
        {isAdmin:req.body.isAdmin},
        {new:true, useFindAndModify:false})

        if(!user) return res.status(404).send('this user is not found')

        res.send(user)
})

//delete user
router.delete('/', auth, async(req, res)=>{
    const user = await User.findByIdAndRemove(req.user._id,
        {new:true, useFindAndModify:false})

        if(!user) return res.status(404).send('this user is not found')

        res.send(user)
})

module.exports = router;