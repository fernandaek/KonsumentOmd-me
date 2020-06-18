var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user")




//====================================================================
//-------------------------ROOT ROUTE---------------------------------
//====================================================================
router.get("/", function(req, res){ // it takes two params the first is the path or url and the sec  and a callback func
    // console.log(req); // req and res is and object with a bunch of information
    res.render("landing");
});



//====================================================================
//------------------------AUTHENTICATION ROUTES-----------------------------
//====================================================================

//Show register form
router.get("/register", function(req, res){
    res.render("register");
});

//Handling the signup logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'ADMIN123'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render("register");
            }
            passport.authenticate("local")(req, res, function(){
                res.redirect("/reviews"); //If the username is already registered it will not register the user again thx to passportLocalMongoose
            });
        });
});

//Show Login form
router.get("/login", function(req, res){
    res.render("login");
});

//Handling the login logic
//app.post(pathHere, middlewareComingHere, and CallbackFunc)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/reviews",
    failureRedirect: "login"
}), function(req, res){}); //This callback doesn't do anything

//LOGOUT 
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/reviews");
});


//Function middleware to handle if user is logged or not
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;




