const express = require('express');
const app = express();
let winston = require('winston');


require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/config')();
require('./startup/db')();



const port = process.env.PORT || 3000;

app.listen(port, ()=> winston.info(`listening on port ${port}...`));