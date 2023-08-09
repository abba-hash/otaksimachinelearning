const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const {Categories, validate} = require('../models/categories');

const express = require('express');
const router = express.Router();


//add new catego
router.post('/',[auth,admin],async(req, res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let cat = new Categories ({
        name: req.body.name
    })
    cat = await cat.save();

    res.send(cat);
})

//all catego
router.get('/All', async(req, res)=>{
    const Cat = await Categories.find();
    res.send(Cat);
})

//get one catego by id
router.get('/:id', async(req, res)=>{
    const cat = await Categories.findById(req.params.id);

    if(!cat) return res.status(404).send('The Category with these id has not being found');

    res.send(cat);
})

//get catego by page number
router.get('/CatByPage/:Page', async(req, res)=>{
    const pageNumber = req.params.Page;
    const pageSize = 2;
    const Cat = await Categories
    .find()
    .skip((pageNumber -1)* pageSize)
    .limit(pageSize);

    res.send(Cat)
})

//edit catego by id
router.put('/:id',[auth,admin], async(req, res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const cat = await Categories.findByIdAndUpdate(req.params.id,
        {name:req.body.name},
        {new:true, useFindAndModify: false});

    if(!cat) return res.status(404).send('Cant find the catego u are looking for');

    res.send(cat);
})

//remove catego by id
router.delete('/:id',[auth,admin], async(req, res)=>{
    const cat = await Categories.findByIdAndRemove(req.params.id,
        {useFindAndModify: false});

    if(!cat) return res.status(404).send('Cant delete the catego u are looking for');

    res.send(cat);
})

module.exports = router

