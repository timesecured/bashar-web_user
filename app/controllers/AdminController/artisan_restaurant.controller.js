const db = require("../../models"); 
const config = require("../../config/auth.config");
const User = db.user;
const Role = db.role;
const Categories = db.categories;
const RestaurantAndFoodTruck = db.restaurants_and_foodtruck;
const Dishes = db.dishes;
const Dishes_Categories = db.dishes_categories;
const Restaurant_Categories = db.restaurant_categories;
const Schedule = db.schedule;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
var path = require('path')
var flash = require('express-flash-messages');
var moment = require('moment');

async function ArtisanShedulelist (req, res){
  controller = 'ArtisanRestaurantMenu';
  action = 'list';  
  console.log(req.params.id);
  var restaurant = await RestaurantAndFoodTruck.findOne({where:{
                        id:req.params.id
                  }}).then(data =>{
                        return data;
                  });

  var schedule = await Schedule.findAll({where:{restaurant_userid:restaurant.restaurant_userid},order: [ [ 'day_number', 'ASC' ]]}).then(schedule => {
      return schedule;
  });

    var allschedule = [];
    for (var m of schedule) {
         let v = {};
          v.id = m.id,
          v.day = m.day,
          v.online_time = m.open_time,
          v.offline_time = m.close_time,
          v.close_for_day = m.close_for_day,
          allschedule.push(v);
    }

     res.render('admin/schedule/index',{data:allschedule,controller:controller,action:action,restaurant_name:restaurant.name});


}
exports.ArtisanShedulelist = ArtisanShedulelist;

async function MenuListView (req, res) {  
    controller = 'ArtisanRestaurantMenu';
    action = 'list';  
    console.log(req.params.id);
     
   var dishes =  await  Dishes.findAll({
          where:{
            restaurant_id:req.params.id
          }
        }).then(dishes => {
          return dishes;
          });

        var alldishes = [];
          for (var m of dishes) {

             var restaurantcategory = await Restaurant_Categories.findOne({
                where:{
                  id:m.restaurant_category,
                }
              }).then(restaurant_category =>{
                  return restaurant_category;
              });

              if(restaurantcategory == null){
                  var cat = "";
              }else{
                  var cat = restaurantcategory.name;
              }

              // catering category
              var cateringcategory = await Categories.findOne({
                where:{
                  id:m.catering_category,
                }
              }).then(catering_category =>{
                  return catering_category;
              });

              if(cateringcategory == null){
                  var catering_cat = "";
              }else{
                  var catering_cat = cateringcategory.name;
              }
              // catering category

               let v = {};
                v.id = m.id,
                v.name = m.name,
                v.price = m.price,
                v.restaurant_id = m.restaurant_id,
                v.restaurant_name = m.restaurant_name,
                v.restaurant_type = m.restaurant_type,
                v.restaurant_category = cat,
                v.catering_category = catering_cat,
                v.ratings = m.ratings,
                v.description = m.description,
                v.note = m.note,
                v.image = m.image,
               
                alldishes.push(v);
              }

            res.render('admin/artisan_restaurants/menu',{data:alldishes,controller:controller,action:action});
           
};  
exports.MenuListView = MenuListView;

async function ArtisanRestaurantAdd (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'add';  
    res.set('content-type' , 'text/html; charset=mycharset'); 
    var category =  await Categories.findAll({ where: { parent_category: 1 } }).then(function(result){   
                        return result;
                    });
     var catering_category =  await Categories.findAll({ where: { parent_category: 3 } }).then(function(result){   
                        return result;
                    });
    res.render('admin/artisan_restaurants/add',{page_title:"Admin - Dashboard",controller:controller,action:action,category:category,catering_category:catering_category});   
    
}; 
exports.ArtisanRestaurantAdd = ArtisanRestaurantAdd;

async function ArtisanRestaurantEdit (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'add';  
    res.set('content-type' , 'text/html; charset=mycharset');
     var restaurant =  await RestaurantAndFoodTruck.findOne({ where: { id: req.params.id } }).then(function(result1){   
                        return result1;
                    }); 
    var category =  await Categories.findAll({ where: { parent_category: 1 } }).then(function(result){   
                        return result;
                    });
     var catering_category =  await Categories.findAll({ where: { parent_category: 3 } }).then(function(result){   
                        return result;
                    });
    res.render('admin/artisan_restaurants/edit',{page_title:"Admin - Dashboard",restaurant:restaurant,controller:controller,action:action,category:category,catering_category:catering_category});   
    
}; 
exports.ArtisanRestaurantEdit = ArtisanRestaurantEdit;

async function FoodTruckEdit (req, res) { 
    controller = 'FoodTruck';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');
     var restaurant =  await RestaurantAndFoodTruck.findOne({ where: { id: req.params.id } }).then(function(result1){   
                        return result1;
                    }); 
    var category =  await Categories.findAll({ where: { parent_category: 1 } }).then(function(result){   
                        return result;
                    });
     var catering_category =  await Categories.findAll({ where: { parent_category: 3 } }).then(function(result){   
                        return result;
                    });
    res.render('admin/food_truck/edit',{page_title:"Admin - Dashboard",restaurant:restaurant,controller:controller,action:action,category:category,catering_category:catering_category});   
    
}; 
exports.FoodTruckEdit = FoodTruckEdit;


async function RestaurantCategoriesAdd (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');

    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            id:req.params.id,
          }
      }).then(restaurant =>{
          return restaurant;
      });

    var  categoriesdata = [];
    var resturantcatories = await Restaurant_Categories.findAll({
                                      where: {
                                        restaurant_userid: rest.restaurant_userid,
                                      },
                                  }).then(rest_cat =>{
                                    for (var m of rest_cat) {
                              
                                     let v = {};
                                      v.id = m.id,
                                      v.name = m.name,
                                      v.description = m.description,
                                      v.image = 'http://52.22.77.138:3000/upload/'+m.image,
                                     
                                      categoriesdata.push(v);
                                  }
                                }); 
   

    res.render('admin/restaurant_categories/add',{page_title:"Admin - Dashboard",controller:controller,action:action,rest:rest,restaurant_category:categoriesdata});   
    
}; 
exports.RestaurantCategoriesAdd = RestaurantCategoriesAdd;

async function RestaurantCategoriesDelete (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');

    Restaurant_Categories.destroy({ where: { id: req.body.id } });

    res.set('content-type' , 'text/html; charset=mycharset'); 

    return   res.send({ 
          status:"1",
          message: "Restaurant Categories deleted successfully!",
     
    });
   
}; 
exports.RestaurantCategoriesDelete = RestaurantCategoriesDelete;

async function RestaurantCategoriesList (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');

    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            id:req.params.id,
          }
      }).then(restaurant =>{
          return restaurant;
      });

    var  categoriesdata = [];
    var resturantcatories = await Restaurant_Categories.findAll({
                                      where: {
                                        restaurant_userid: rest.restaurant_userid,
                                      },
                                  }).then(rest_cat =>{
                                    for (var m of rest_cat) {
                              
                                     let v = {};
                                      v.id = m.id,
                                      v.name = m.name,
                                      v.description = m.description,
                                      v.image = 'http://52.22.77.138:3000/upload/'+m.image,
                                     
                                      categoriesdata.push(v);
                                  }
                                }); 
   
    res.render('admin/restaurant_categories/list',{page_title:"Admin - Dashboard",controller:controller,action:action,rest:rest,restaurant_category:categoriesdata});   
    
}; 
exports.RestaurantCategoriesList = RestaurantCategoriesList;

async function RestaurantCategoriesEdit (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');

    console.log(req.params.id);
    var resturantcatories = await Restaurant_Categories.findOne({
                                      where: {
                                        id: req.params.id,
                                      },
                                  }).then(rest_cat =>{
                                    return rest_cat;
                                }); 

                  console.log(resturantcatories);
   
    res.render('admin/restaurant_categories/edit',{page_title:"Admin - Dashboard",controller:controller,action:action,restaurant_category:resturantcatories});   
    
}; 
exports.RestaurantCategoriesEdit = RestaurantCategoriesEdit;

async function FoodTruckEditSave (req, res) { 
    controller = 'FoodTruck';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');


    var rest_cat1 =  await RestaurantAndFoodTruck.findOne({where:{id:req.body.id}}).then(categories1 =>{ return categories1; });


    if(req.files){
       var file = req.files.image;
       var img_name=Date.now()+path.extname(file.name);                         
       file.mv('app/views/admin/assets/upload/artisan_restaurant/'+img_name);
    }else{
      var img_name = rest_cat1.image;
    }

    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            restaurant_userid:rest_cat1.restaurant_userid,
          }
      }).then(restaurant =>{
          return restaurant;
      });
      if(req.body.description  == ""){
          var description = "";
      }else{
        var description = req.body.description;
      }

      var rest_cat =  await RestaurantAndFoodTruck.update({
                  name: req.body.name,
                  description: description,
                  image:img_name,
                },{where:{id:req.body.id}}).then(categories =>{
                    
            });
          
    res.redirect(nodeAdminUrl+'/food_truck/list');
   
}; 
exports.FoodTruckEditSave = FoodTruckEditSave;


async function ArtisanRestaurantEditSave (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');


    var rest_cat1 =  await RestaurantAndFoodTruck.findOne({where:{id:req.body.id}}).then(categories1 =>{ return categories1; });


    if(req.files){
       var file = req.files.image;
       var img_name=Date.now()+path.extname(file.name);                         
       file.mv('app/views/admin/assets/upload/artisan_restaurant/'+img_name);
    }else{
      var img_name = rest_cat1.image;
    }

    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            restaurant_userid:rest_cat1.restaurant_userid,
          }
      }).then(restaurant =>{
          return restaurant;
      });
      if(req.body.description  == ""){
          var description = "";
      }else{
        var description = req.body.description;
      }

      var rest_cat =  await RestaurantAndFoodTruck.update({
                  name: req.body.name,
                  description: description,
                  image:img_name,
                },{where:{id:req.body.id}}).then(categories =>{
                    
            });
          
    res.redirect(nodeAdminUrl+'/artisan_restaurants/list/');
   
}; 
exports.ArtisanRestaurantEditSave = ArtisanRestaurantEditSave;


async function RestaurantCategoriesEditSave (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');

    var rest_cat1 =  await Restaurant_Categories.findOne({where:{id:req.body.id}}).then(categories1 =>{ return categories1; });
    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            restaurant_userid:rest_cat1.restaurant_userid,
          }
      }).then(restaurant =>{
          return restaurant;
      });
      if(req.body.description  == ""){
          var description = "";
      }else{
        var description = req.body.description;
      }

      var rest_cat =  await Restaurant_Categories.update({
                  name: req.body.name,
                  description: description,
                },{where:{id:req.body.id}}).then(categories =>{
                    
            });
          
    res.redirect(nodeAdminUrl+'/restaurant_categories/list/'+rest.id);
   
}; 
exports.RestaurantCategoriesEditSave = RestaurantCategoriesEditSave;

async function RestaurantCategoriesSave (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'list';  
    res.set('content-type' , 'text/html; charset=mycharset');



    var rest =  await RestaurantAndFoodTruck.findOne({
          where:{
            id:req.body.restaurant_id,
          }
      }).then(restaurant =>{
          return restaurant;
      });
      if(req.body.description  == ""){
          var description = "";
      }else{
        var description = req.body.description;
      }

      var rest_cat =  await Restaurant_Categories.create({
                  name: req.body.name,
                  description: description,
                  restaurant_userid: rest.restaurant_userid
                }).then(categories =>{
                    
            });
          
    res.redirect(nodeAdminUrl+'/restaurant_categories/list/'+req.body.restaurant_id);
   
}; 
exports.RestaurantCategoriesSave = RestaurantCategoriesSave;

async function  ArtisanRestaurantDelete (req, res)  { 
    controller = 'ArtisanRestaurant';
    action = 'add';  
    console.log(req.body);

    var restaurant  = await RestaurantAndFoodTruck.findOne({where:{ id: req.body.id}}).then(restaurant =>{
      return restaurant;
    })

    await User.destroy({ where: { id:restaurant.restaurant_userid  } });
   await RestaurantAndFoodTruck.destroy({ where: { id: req.body.id } });
    res.set('content-type' , 'text/html; charset=mycharset'); 
     return   res.send({ 

        status:"1",
        message: "User registered successfully!",
       
      });
}; 
exports.ArtisanRestaurantDelete = ArtisanRestaurantDelete;

async function ArtisanRestaurantSave (req, res) { 
    controller = 'ArtisanRestaurant';
    action = 'add';  
    var currdatetime = new Date();
 console.log(req.body);
    if(req.files){
      var file = req.files.image;
      var img_name=Date.now()+path.extname(file.name); 
                            
      file.mv('app/views/admin/assets/upload/artisan_restaurant/'+img_name);
    }else{
      var img_name = "";
    }

    RestaurantAndFoodTruck.findOne({
      where:{
        approval_code:req.body.approval_code
      }
    }).then(chkrestaurant =>{
      if(chkrestaurant != null){

      }else{

        User.create({
        name: req.body.name,
        approval_code: req.body.approval_code,
        role:3
         }).then(userdata =>{

        //Save User to Database
        RestaurantAndFoodTruck.create({
            name: req.body.name,
            approval_code: req.body.approval_code,
            restaurant_userid:userdata.id,
            image:img_name,
            description: req.body.description,
            type:1
        }).then(category => {
          console.log(category);

          var category_catering = req.body.catering_category_id;
          var arr1 = Array.isArray(category_catering);
         if(arr1 == false){
               Dishes_Categories.create({
                      restaurant_id: category.id,
                      category_id:category_catering,
                     
               }).then(catering_data_added =>{ 
               }); 
         }else{
            category_catering.forEach((item, index, array) => {
          
                itemsProcessed++;
                 Dishes_Categories.create({
                    restaurant_id: category.id,
                    category_id:item,
                  });
            });
          }

          var category1 = req.body.category_id;
          var arr = Array.isArray(category1);
         if(arr == false){
               Dishes_Categories.create({
                      restaurant_id: category.id,
                      category_id:category1,
                     
               }).then(data_added =>{
                res.redirect(nodeAdminUrl+'/artisan_restaurants/list'); 
               }); 
         }else{
          var itemsProcessed = 0;
            category1.forEach((item, index, array) => {
          
                itemsProcessed++;
                 Dishes_Categories.create({
                    restaurant_id: category.id,
                    category_id:item,
                  });  
                if(itemsProcessed === array.length) {
                  res.redirect(nodeAdminUrl+'/artisan_restaurants/list');
                }
            });
         }  
        });

        });

      }

    }).catch(err => {
     return res.status(500).send({ message: err.message });
    });
    
    
}; 
exports.ArtisanRestaurantSave = ArtisanRestaurantSave;

exports.AddRatings = (req, res) => { 
    controller = 'ArtisanRestaurant';
    action = 'add';  
    var currdatetime = new Date();
    console.log(req.body);
    //Save ratings to Database
    RestaurantAndFoodTruck.update({ ratings: req.body.ratings }, { where: { id: req.body.restaurant_id } })
       .then(category => {
             res.redirect(nodeAdminUrl+'/artisan_restaurants/list');
        })
        .catch(err => {
         return res.status(500).send({ message: err.message });
        });
    
};      



exports.ArtisanRestaurantlist = (req, res) => { 
controller = 'ArtisanRestaurant';
action = 'list';  
    RestaurantAndFoodTruck.findAll({ where: { type: 1 } }).then(data => {
   // console.log(data);
        res.render('admin/artisan_restaurants/list',{data:data,controller:controller,action:action});
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      });  
    
};    



