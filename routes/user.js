var express = require("express");
var router = express.Router();
var regions = require("philippines/regions");
var provinces = require("philippines/provinces");
var cities = require("philippines/cities");
var User = require("../models/user");
var Cart = require("../models/cart");
var Product= require("../models/product");
var History = require("../models/history");
var async = require("async");
var passport = require("passport");
var passportConfig = require("../config/passport");


function adminAuthentication(req, res, next){
	if(req.isAuthenticated()){

		if(req.user.isAdmin || req.user.superUser){
			return next();
		} else{
			return res.redirect("back");
		}
	} else{
		return res.redirect("/login");
	}
	
}

router.get("/login", function(req, res){
	if(req.user) return res.redirect("/");
	res.render("accounts/login", {message: req.flash("loginMessage")});
});

router.post("/login", passport.authenticate("local-login", {
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true
}), function(req, res){

});

router.get("/profile", function(req, res){
	// User
	// .findOne({_id: req.user._id})
	// .populate('history.item')
	// .exec(function(err, user){
	// 	if(err) return next(err);
	// 	res.render('accounts/profile', {user : user});
	// });
	async.waterfall([
		function(callback){
			User
			.findById({_id: req.user._id})
			.populate('history')
			.exec(function(err, user){
				if(err) return next(err);
				console.log(user);
				callback(null, user);
			});
		}, function(user){
			History
			.find({customer: req.user.email})
			.populate('item')
			.exec(function(err, history){
				if(err){
					console.log(err);
				} 
				res.render('accounts/profile', {user: user, history: history});
			});
		}
		]);
});

router.get("/signup", function(req, res){
	res.render("accounts/signup", {errors: req.flash("errors")});
});

router.post("/signup", function(req, res, next){

	async.waterfall([
		function(callback){
		var user = new User();
		user.profile.name = req.body.firstName + " " + req.body.lastName;
		user.email = req.body.email;
		user.profile.picture = user.gravatar();
		user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
		if(!(req.body.password === req.body.confirmPassword)){
			req.flash("errors", "Your password and confirm password does not match");
			return res.redirect("/signup");
		}
		user.password = req.body.password;
		User.findOne({email : req.body.email}, function(err, existingUser){
		if(existingUser){
			req.flash("errors", "Account with that email address already exist");
			return res.redirect("/signup");
		} else{
			user.save(function(err, user){
				if(err) return next(err);
				callback(null, user);
			});
		}
	});
		},
		function(user){
			var cart = new Cart();
			cart.owner = user._id;
			cart.save(function(err){
				if(err) return next(err);
				req.logIn(user, function(err){
				return res.redirect("/");
				});
			});
		}
	]);
});

router.get("/logout", function(req, res, next){
	User.findById(req.user._id, function(err, user){
		user.save(function(err, result){
			if(err) return next(err);
			console.log(result);
		});
	});
	

	req.logout();
	res.redirect("/");

});

router.get("/edit-profile", function(req, res, next){
	var month = ["January","February","March","April","May","June","July", "August", "September", "October", "November", "December"];
	var city = cities;
	var province = provinces;
	User.findById(req.user._id, function(err, user){
		if(err) return next(err);
	var getMonth = month[parseInt(user.birthdate.getMonth())];
	res.render("accounts/edit-profile", {message: req.flash("success"), user: user, getMonth: getMonth, city: city, province: province, errors: req.flash("errors")});
	});
});

router.post("/edit-profile", function(req, res, next){
	User.findOne({_id: req.user._id}, function(err, user){
		if(err) return next(err);
		if(req.body.address) user.address = req.body.address;
		if(req.body.month && req.body.day && req.body.year){
			user.birthdate = new Date(req.body.year + "-" + req.body.month + "-" + req.body.day);
		}
		if(req.body.currentPass){
		if(!user.comparePassword(req.body.currentPass)){
			req.flash("errors", "You have entered a wrong password");
			return res.redirect("/edit-profile");
		}
		}
		if(req.body.password && req.body.confirmPass){
		if(!(req.body.password === req.body.confirmPass)){
			req.flash("errors", "Your new password and confirm password does not match");
			return res.redirect("/edit-profile");
		}
		}
		if(req.body.password){
		user.password = req.body.password;
		}
		user.save(function(err){
			if(err) return next(err);
			req.flash("success", "You successfully edit your profile");
			return res.redirect("/edit-profile");	
		});
	});
});



module.exports = router;