var express = require("express");
var router = express.Router();
var Review = require("../models/review");
var Comment = require("../models/comment");

//====================================================================
//------------------------COMMENTS ROUTES-----------------------------
//====================================================================


//Create comment
router.get("/reviews/:id/comments/new", isLoggedIn, function(req, res){
    //find review by id
    Review.findById(req.params.id, function(err, review){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {review: review});// review is coming back from the DB
        }
    })
});


router.post("/reviews/:id/comments/", isLoggedIn, function(req, res){
    //lookup the review using ID
    Review.findById(req.params.id, function(err, review){
        if(err){
            console.log(err);
            res.redirect("/reviews");
        }else{
            //console.log(req.body.comment);
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    console.log('New comment username: ' + req.user.username);
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    review.comments.push(comment);
                    review.save();
                    res.redirect("/reviews/" + review._id);
                }
            })
        }
    })
});

//EDIT Route
router.get("/reviews/:id/comments/:comment_id/edit", checkCommentOwner, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else{
            res.render("comments/edit", {review_id: req.params.id, comment: foundComment});
        }
    })
});

//UPDATE Route
router.put("/reviews/:id/comments/:comment_id", checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/reviews/" + req.params.id);
        }
    });
});


//DELETE Route
router.delete("/reviews/:id/comments/:comment_id", checkCommentOwner, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/reviews/" + req.params.id);
        }
    });
});





//Function middleware to handle if user is logged or not
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


function checkCommentOwner(req, res, next){
    //Check if the user is logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back"); //back to previous page
            } else{
                //Check if the user owns the post
                // if(Comment.author.id === req.user._id)
                console.log(foundComment.author.id);//object
                console.log(req.user._id); //string
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    // res.render("reviews/edit", {comment: foundComment});
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