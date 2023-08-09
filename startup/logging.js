require('express-async-error');
let winston = require('winston');

module.exports = function(){
    //uncaught Exception
    process.on('uncaughtException', (ex)=>{
        console.log('uncaughtException:backend');
        winston.error(ex.message, ex);
        process.exit(1);
    })

    //unhandledRejection
    process.on('unhandledRejection', (ex)=>{
        console.log('unhandledRejection:backend');
        winston.error(ex.message, ex);
        process.exit(1);
    })

    winston.add(winston.transports.File, {filename:'logfile.log'});
}