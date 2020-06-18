var express = require("express");
var router = express.Router();
var Review = require("../models/review");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'fernandaek', 
  api_key: 288584932748768, 
  api_secret: 'OBoyJzz-6JC4-WnODg9KA9-uuqw'
});



 //INDEX Route - Show all reviews
 router.get("/reviews", function(req, res){ 
    console.log(req.user);
    Review.find({}, function(err, allReviews){
        if(err){
            console.log(err);
        } else {
            res.render("reviews/reviews", {reviews:allReviews, currentUser: req.user});
            
        }
    });

});


//CREATE Route - Add new review to DB
router.post("/reviews", isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        //get data from a form and add to reviews array
        // add cloudinary url for the image to the review object under image property
        req.body.review.image = result.secure_url;
        // add author to review
        req.body.review.author = {
          id: req.user._id,
          username: req.user.username
        }
        Review.create(req.body.review, function(err, review) {
          if (err) {
            return res.redirect('back');
          }
          res.redirect('/reviews/' + review.id);
        });
      });
});


//NEW Route - Show form to create a new review
router.get("/reviews/new", isLoggedIn, function(req, res){
    res.render("reviews/new.ejs");
});


//SHOW Route - Show info about the clicked review
router.get("/reviews/:id", function(req, res){
    Review.findById(req.params.id).populate("comments").exec(function(err, foundReview){// finding review by id, populating the comments in that review and then executing it
        if(err){
            console.log(err);
        }else{
            console.log(foundReview)
            res.render("reviews/show", {review: foundReview});
        }
    });  
});


//EDIT Route 
//the middlewere shouuld be called before the event handler
router.get("/reviews/:id/edit", checkOwnership, function(req, res){
    Review.findById(req.params.id, function(err, foundReview){
        res.render("reviews/edit", {review: foundReview});
    });
});

//UPDATE Route
router.put("/reviews/:id", checkOwnership, function(req, res){
    //find and update 
    Review.findByIdAndUpdate(req.params.id, req.body.review, function(err, updateReview){
        if(err){
            res.redirect("/reviews");
        }else {
            //redirect to the show page
            res.redirect("/reviews/" + req.params.id);
        }
    })
});


//DELETE Route
router.delete("/reviews/:id", checkOwnership, function(req, res){
    Review.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/reviews");
        }else {
            res.redirect("/reviews")
        }
    })
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkOwnership(req, res, next){
//Check if the user is logged in
if(req.isAuthenticated()){
    Review.findById(req.params.id, function(err, foundReview){
        if(err){
            res.redirect("back"); //back to previous page
        } else{
            //Check if the user owns the post
            // if(Review.author.id === req.user._id)
            console.log(foundReview.author.id);//object
            console.log(req.user._id); //string
            if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin){
                // res.render("reviews/edit", {review: foundReview});
                next();
            } else {
                res.redirect("back");
            }
        }
    });
} 
else {
    res.redirect("back"); //Will redirect the user to the previous page
    }
}



module.exports = router;