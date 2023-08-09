const config = require('config');

module.exports = function(){
    if(!config.get('jwtPrivateKey')){
        console.error('Fatal Error: Token is not defined');
        process.exit
    }
}