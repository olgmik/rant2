var moment = require("moment");
var passport = require("passport");

//models
var User = require('../models/user.js');


exports.ensureAuthenticated = function(req, res, next) {
    console.log("is Authenticated:" + req.isAuthenticated());
    
    if (req.isAuthenticated()) { return next(); }
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

        User.register(new User({ username : req.body.username, email : req.body.email, dateMovedIn: req.body.dateMovedIn, dateMovedOut: req.body.dateMovedOut }), req.body.password, function(err, new_user) {
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

   User.findById(req.param('username'), function(err, user){

      if (err) {
        
        res.send("Uhoh something went wrong");
        console.log(err);

      } else if (blogpost.user != req.user.id){

        res.send('You do not own this account.');
      
      } else {
        
        console.log(user);
        
        var template_data = {
          username : username,
          email : email,
          dateMovedIn : dateMovedIn,
          dateMovedOut : dateMovedOut,
          password : password,
          password : password

        };

        res.render('edit_account_form.html', template_data);
      } 



    });

};

