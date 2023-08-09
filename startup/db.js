const mongoose = require('mongoose');
let winston = require('winston');

module.exports = function(){
    mongoose.connect('mongodb://localhost:27017/otaksi').then(()=> winston.info('connected to Mongodb')).catch(err =>
    console.error('cant connect to mongodb'));
}