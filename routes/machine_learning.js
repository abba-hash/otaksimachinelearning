const {ML_Result,validate} = require('../models/ml/ml_result');
const {ML_Cart} = require('../models/ml/ml_cartitems');
const {ML_Products} = require('../models/ml/ml_selected_products');
const {Products} = require('../models/products');
const {UserSearchs} = require('../models/search');

const auth = require('../middleware/auth');
const brain = require('brain.js');

const express = require('express');
const router = express.Router();

router.get('/SearchData', auth, async(req, res) =>{
    let userID = req.user._id;
    let usData = await UserSearchs
    .find({ user:userID })
    .populate('data','_id') //data ref
    .select(['-_id', '-user'])
    .sort({_id:-1})
    .limit(1)

    if (!usData || usData.length == 0) return res.status(404).send('not found');


    let ProductID = usData[0]['data']._id;
    //ml start here
    let user_search = await UserSearchs
    .find({ user:userID })
    .populate('data','name') //data ref
    .select(['-_id', '-user'])
    .sort({_id:-1})
    .limit(3)

    let brvProducts = [];

    if(user_search.length > 0){
        for (let index = 0; index < user_search.length; index++) {
            const clist = user_search[index];
            brvProducts.push(clist.data['name'])
        }
    }

    //console.log('data', brvProducts)
    // Select all prod

    const ProductSelected = await Products.findById(ProductID)

    let allProducts = await Products
    .find({ prod_categories:ProductSelected.prod_categories })
    .select('-prod_categories');

    //console.log('all prod that have the same catego', allProducts)

    //create training data list
    const trainingData = [];

    for(let prodID in allProducts){
        const data = allProducts[prodID];
        if(String(allProducts[prodID]._id !== String(ProductSelected._id))){
            trainingData.push({
                input:[data.name, data.desc],
                output:String(data.name),
            })
        }
    }

    //console.log('training', trainingData)
    // main operation
    let FinalResult = [];
    let element = trainingData;
    
    for (let index = 0; index < trainingData.length; index++) {
        const net = new brain.recurrent.LSTM();
        net.train(element,{
            iterations:100,
            errorThresh:0.0011
        });

        const result = net.run([ProductSelected.name, ProductSelected.desc])

        if(result !=''){
            FinalResult.push(result);
        }
        element = element.filter(function(item){
            return item.output !== result
        })
        //console.log('rsx', result)
        if(FinalResult.length == 3){
            let FinalResultWithPrice =[];
            let newAllProject = [];

            const needle = ProductSelected.price;
            for (let index = 0; index < FinalResult.length; index++) {
                let res = FinalResult[index];
                let object = await Products
                .find({$text:{$search: res}})
                .limit(1)

                newAllProject.push(object)

                for (let index = 0; index < newAllProject.length; index++) {
                    const closest = newAllProject.reduce((a, b)=>{
                        return Math.abs(b - needle) < Math.abs(a - needle) ? b : a
                    });
                    
                    newAllProject = newAllProject.filter(function(item){
                        return item !== closest;
                    })

                    FinalResultWithPrice.push(closest)
                    if(FinalResultWithPrice.length < 3){
                        let machineL = new ML_Result({
                            Selected_ML_Result: object[0]._id,
                            UserID_ML_Result: userID
                        });
                        machineL = await machineL.save();
                    }
                    if(FinalResultWithPrice.length == 2){
                        console.log('Final Result X', FinalResultWithPrice)
                        break;
                    }
                }

            }
            break;
        }
        
    }
})

router.patch('/ml_products/:ProdID', auth, async(req, res)=>{
    let userID = req.user.id;
    let ProductID = req.params.ProdID;

    let products = new ML_Products({
        Selected_ML_Products:ProductID,
        UserID_ML_Products:userID
    },{new:true, useFindAndModify:false});

    await products.save();

    //ml start
    let User_Prod_list = await ML_Products
    .find({ UserID_ML_Products:userID })
    .populate('Selected_ML_Products', 'name')
    .select(['-_id', '-UserID_ML_Products'])
    .sort({_id: -1})
    .limit(3)

    let brvProducts =[];

    if(User_Prod_list.length > 0){
        for (let index = 0; index < User_Prod_list.length; index++) {
            const clist = User_Prod_list[index];
            brvProducts.push(clist.Selected_ML_Products['name']);
        }
    }
    //console.log('data', brvProducts);

    const ProductSelected = await Products.findById(ProductID);

    let allProducts = await Products
    .find({prod_categories:ProductSelected.prod_categories})
    .select('-prod_categories');

    const trainingData = [];
    for(let prodID in allProducts){
        const data = allProducts[prodID];
        if(String(allProducts[prodID]._id) !== String(ProductSelected._id)){
            trainingData.push({
                input:[data.name, data.desc],
                output:String(data.name)
            });
        }
    }

    // main operation
    let FinalResult = [];
    let element = trainingData;

    for (let index = 0; index < trainingData.length; index++) {
        const net = new brain.recurrent.LSTM();
        net.train(element, {
            iterations: 100,
            errorThresh:0.0011
        })
        const result = net.run([ProductSelected.name, ProductSelected.desc])
        if(result !==''){
            FinalResult.push(result);
        }

        element = element.filter(function(item){
            return item.output !== result;
        });

        if(FinalResult.length == 3){
            let FinalResultWithPrice = []
            let newAllProject =[];

            const needle = ProductSelected.price;
            for (let index = 0; index < FinalResult.length; index++) {
                let res = FinalResult[index];
                
                let object = await Products
                .find({ $text:{ $search:res } })
                .limit(1)

                newAllProject.push(object);

                if(index < FinalResult.length){
                    for (let index = 0; index < newAllProject.length; index++) {
                        const closest = newAllProject.reduce((a, b)=>{
                            return Math.abs(b - needle) < Math.abs(a - needle) ? b : a
                        });
                        
                        newAllProject = newAllProject.filter(function(item){
                            return item !== closest;
                        })
    
                        FinalResultWithPrice.push(closest)
                        if(FinalResultWithPrice.length < 3){
                            let machineL = new ML_Result({
                                Selected_ML_Result: object[0]._id,
                                UserID_ML_Result: userID
                            });
                            machineL = await machineL.save();
                        }
                        if(FinalResultWithPrice.length == 2){
                            console.log('Final Result X', FinalResultWithPrice)
                            break;
                        }
                    }
                }
            }
            break;
        }
    }
})

router.patch('/ml_cart/:ProdID', auth , async (req,res)=>{
    let userID = req.user._id;
    let ProductID = req.params.ProdID;

    let cart = await ML_Cart.findOne({
        Selected_ML_Cart:ProductID,
        UserID_ML_Cart:userID
    });
    if(cart){
        await cart.remove();
    }
    else{
        cart = new ML_Cart({
            Selected_ML_Cart:ProductID,
            UserID_ML_Cart:userID
        },{new:true, useFindAndModify:false})

        await cart.save();
    }
    let user_cart_list = await ML_Cart
    .find({ UserID_ML_Cart:userID})
    .populate('Selected_ML_Cart', 'name')
    .sort({_id: -1})
    .limit(3)

    let brvProducts = [];

    if(user_cart_list.length > 0){
        for (let index = 0; index < user_cart_list.length; index++) {
            const clist = user_cart_list[index];
            brvProducts.push(clist.Selected_ML_Cart['name']);
        }
    }

    const ProductSelected = await Products.findById(ProductID);

    let allProducts = await Products
    .find({prod_categories:ProductSelected.prod_categories})
    .select('-prod_categories');

    const trainingData = [];
    for(let prodID in allProducts){
        const data = allProducts[prodID];
        if(String(allProducts[prodID]._id) !== String(ProductSelected._id)){
            trainingData.push({
                input:[data.name, data.desc],
                output:String(data.name)
            });
        }
    }
      // main operation
      let FinalResult = [];
      let element = trainingData;
  
      for (let index = 0; index < trainingData.length; index++) {
          const net = new brain.recurrent.LSTM();
          net.train(element, {
              iterations: 100,
              errorThresh:0.0011
          })
          const result = net.run([ProductSelected.name, ProductSelected.desc])
          if(result !==''){
              FinalResult.push(result);
          }
  
          element = element.filter(function(item){
              return item.output !== result;
          });
  
          if(FinalResult.length == 3){
              let FinalResultWithPrice = []
              let newAllProject =[];
  
              const needle = ProductSelected.price;
              for (let index = 0; index < FinalResult.length; index++) {
                  let res = FinalResult[index];
                  
                  let object = await Products
                  .find({ $text:{ $search:res } })
                  .limit(1)
  
                  newAllProject.push(object);
  
                  if(index < FinalResult.length){
                      for (let index = 0; index < newAllProject.length; index++) {
                          const closest = newAllProject.reduce((a, b)=>{
                              return Math.abs(b - needle) < Math.abs(a - needle) ? b : a
                          });
                          
                          newAllProject = newAllProject.filter(function(item){
                              return item !== closest;
                          })
      
                          FinalResultWithPrice.push(closest)
                          if(FinalResultWithPrice.length < 3){
                              let machineL = new ML_Result({
                                  Selected_ML_Result: object[0]._id,
                                  UserID_ML_Result: userID
                              });
                              machineL = await machineL.save();
                          }
                          if(FinalResultWithPrice.length == 2){
                              //console.log('Final Result X', FinalResultWithPrice)
                              break;
                          }
                      }
                  }
              }
              break;
          }
      }

      res.send({data:'done'});
});

router.get('/All', auth, async(req, res)=>{
    let userID = req.user._id;
    let BigData = [];

    const MLres = await ML_Result.find({
        UserID_ML_Result:userID
    })
    .populate('Selected_ML_Result')
    .select(['-_id', '-UserID_ML_Result'])

    for (let index = 0; index < MLres.length; index++) {
        const element = MLres[index];
        
        let ifdata = BigData.find(x => x._id === element['Selected_ML_Result']._id)
        if(!ifdata){
            BigData.push(element['Selected_ML_Result']);
        }
    }
    res.send(BigData);
})

module.exports = router