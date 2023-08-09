const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const {Products, validate} = require('../models/products');
const imgUpload = require('./imgUpload');

const express = require('express');
const router = express.Router();

//get all prod
router.get('/All', async(req, res)=>{
    const Prod = await Products
    .find()
    .populate('prod_categories', 'name');

    res.send(Prod);
})

//get one prod
router.get('/:id', async(req, res)=>{
    const Prod = await Products.findById(req.params.id)
    .populate('prod_categories', 'name');

    if(!Prod) return res.status(404).send('This product is not found');

    res.send(Prod);
})

//get prod by page number
router.get('/ProdByPage/:Page', async(req, res)=>{
    const pageNumber = req.params.Page;
    const pageSize = 2;
    const Prod = await Products
    .find()
    .skip((pageNumber -1)* pageSize)
    .limit(pageSize)
    .populate('prod_categories', 'name');

    res.send(Prod);
})

//delete
router.delete('/:id',[auth,admin], async(req, res)=>{
    const prod = await Products.findByIdAndRemove(req.params.id,
        {useFindAndModify: false});

    if(!prod) return res.status(404).send('Cant FIND and delete the product u are looking for');

    res.send(prod);
})

//add product
router.post('/',[auth,admin], imgUpload, async(req, res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let product = await Products.findOne(
        {name:req.body.name}
    );
    if(product) return res.status(400).send('product already exists');

    let Prod_Pic = '';
    if(req.file && req.file !== ''){
        const URL = req.protocol + "://" + req.get("host");
        Prod_Pic = URL + "/images/" + req.file.filename;
    }else{
        Prod_Pic = req.body.profile_img;
    }

    product = new Products({
        name:req.body.name,
        desc:req.body.desc,
        price:req.body.price,
        product_img:req.body.product_img,
        prod_categories:req.body.prod_categories,
    },
    {new:true, useFindAndModify:false}
    );
    await product.save();

    res.send(product);
});

//Edit product
router.put('/:id',[auth,admin], imgUpload, async(req, res)=>{

    let Prod_Pic = '';
    if(req.file && req.file !== ''){
        const URL = req.protocol + "://" + req.get("host");
        Prod_Pic = URL + "/images/" + req.file.filename;
    }else{
        Prod_Pic = req.body.profile_img;
    }

    product = await Products.findByIdAndUpdate(req.params.id, 
    {
        name:req.body.name,
        desc:req.body.desc,
        price:req.body.price,
        product_img:req.body.name,
        prod_categories:req.body.name,
    },
    {new:true, useFindAndModify:false}
    );

    if(!product) return res.status(404).send('This product is no longer available');

    res.send(product);
});

module.exports = router;