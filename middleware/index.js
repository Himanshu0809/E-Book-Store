var Comment=require("../models/comments");

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

module.exports=middlewareObj;