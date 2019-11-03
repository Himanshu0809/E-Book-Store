var Comment=require("../models/comments");
var Book=require("../models/books");
var Review=require("../models/review");

//all middlewares go here

var middlewareObj={};

middlewareObj.checkCommentOwnership=function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found!!");
                res.redirect("back");
            }else{
                //does user own the comment
                if(foundComment.user.id.equals(req.user._id)||req.user.isAdmin==="admin"){
                    next();
                }else{
                    req.flash("error","You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn=function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.session.oldUrl=req.url; 
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
}

middlewareObj.checkIsAdmin=function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.isAdmin=="admin"){
            return next();
        }
    }
    req.flash("error","You don't have the permission to do that");
    res.redirect("/");
}

middlewareObj.checkReviewOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Review.findById(req.params.review_id, function (err, foundReview) {
            if (err || !foundReview) {
                res.redirect("back");
            } else {
                // does user own the comment?
                if (foundReview.user.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Book.findById(req.params.id).populate("reviews").exec(function (err, foundBook) {
            if (err || !foundBook) {
                req.flash("error", "Book not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundBook.reviews
                var foundUserReview = foundBook.reviews.some(function (review) {
                    return review.user.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/books/" + foundBook._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};


module.exports=middlewareObj;