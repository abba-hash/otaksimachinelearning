const {UserSearchs,validate} = require('../models/search');
const {Products} = require('../models/products');
const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();

// first one
router.get('/:SearchData', async(req, res)=>{
    let regex = new RegExp(req.params.SearchData, 'i');

    const SearchResult = await Products
    .find({$or:[{name:regex}, {desc:regex}]})
    .limit(6);
    res.send(SearchResult)
})

//with auth
router.get('/user/:SearchData', auth, async(req, res)=>{
    let regex = new RegExp(req.params.SearchData, 'i');

    const SearchResult = await Products
    .find({$or:[{name:regex}, {desc:regex}]})
    .limit(6);
    // user & Usersearch
    for (let index = 0; index < SearchResult.length; index++) {
        let SearchData = SearchResult[index]._id;
        let userID = req.user._id;
        let search = new UserSearchs(
            {data:SearchData, user:userID},
            {new:true, useFindAndModify:false}
        )
        await search.save();
    }
    res.send(SearchResult)
})

module.exports = router;