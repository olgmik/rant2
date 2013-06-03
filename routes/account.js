var moment = require("moment");
var passport = require("passport");

//models
var User = require('../models/user.js');


exports.ensureAuthenticated = function(req, res, next) {
    console.log("is Authenticated:" + req.isAuthenticated());
    
    if (req.isAuthenticated()) { 
      return next(); 
    }
    
    res.redirect('/login');
}

// Login display
exports.login = function(req, res) {
	templateData = {
		user:req.user,
	}

	res.render('account/login.html', templateData);
};

// Login post
exports.login_post = function(req, res) {
	res.redirect('/write');
};

// logout
exports.logout = function(req, res) {
	req.logout();
    res.redirect('/');
};

exports.register = function(req, res) {
    res.render('account/register.html', { });
};

exports.register_post = function(req, res) {

	if (req.body.password != req.body.confirm) {
		return res.render('account/register.html');
	} else {

        var addressData = {

          building : req.body.building,
          apartment : req.body.apartment,
          city : req.body.city,
          zip : req.body.zip
        }

        User.register(new User({ username : req.body.username, 
          email : req.body.email, 
          address : addressData,
          dateMovedIn: req.body.dateMovedIn, 
          dateMovedOut: req.body.dateMovedOut }), 
          req.body.password, function(err, new_user) {
            if (err) {
                console.log(err)
                return res.render('account/register.html');
            }
            console.log("**********");
            console.log(new_user);
            res.redirect('/write');
        });
    }
};

exports.edit = function(req,res){ 

    console.log("got from user_posts.html user_id: "+req.param('user_id'));

    User.findById(req.param('user_id'), function(err, user){

    var tempDateIn = moment(user.dateMovedIn);
    var formattedDateIn = tempDateIn.format("YYYY-MM-DD");
    var tempDateOut = moment(user.dateMovedOut);
    var formattedDateOut = tempDateOut.format("YYYY-MM-DD");

    var template_data = {
          /*user_id : user.id,
          username : user.username,
          email : user.email,*/
          currentUser: user,
          user_id: user.id,
          dateMovedIn : formattedDateIn,
          dateMovedOut : formattedDateOut

        };

        console.log(template_data);

      res.render('account/edit_account_form.html', template_data);

});

};

exports.saveEdit = function(req,res) {

  var user_id = req.param('user_id');

  console.log(user_id); 

  if (req.param('user_id') != undefined) { 

   User.findById(req.param('user_id'), function(err, user){

    console.log("found user");
    console.log("got from edit_account_form.html user_id: " + user_id);
   
    if (err) {
        console.log(err);
        res.send("uh oh, can't find that note");
    }

    else {

      var addressData = {
              building : req.body.building,
              apartment : req.body.apartment,
              city : req.body.city,
              zip : req.body.zip
            }

      user.username = req.body.username;
      user.email = req.body.email;
      user.address = addressData; 
      user.dateMovedIn = req.body.dateMovedIn;
      user.dateMovedOut = req.body.dateMovedOut;
      user.password= req.body.password;
      user.save();
      
      /*if (req.user != undefined){
            template_data.isOwner = (req.user.id == user.id)
          }*/

      res.redirect('/user/' + user.username); 

    }

  });
 }
}

