const categories = require('../routes/categories');
const products = require('../routes/products');
const users = require('../routes/users');
const auth = require('../routes/auth');
const search = require('../routes/search');
const machine_learning = require('../routes/machine_learning');
const express = require('express');

const error = require('../middleware/error');

module.exports = function(app){
    app.use(express.json());
    app.use('/api/categories', categories);
    app.use('/api/products', products);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/search', search);
    app.use('/api/machine_learning', machine_learning);

    //this error handle
    app.use(error);
}
