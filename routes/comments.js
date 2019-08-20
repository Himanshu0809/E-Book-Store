var express = require("express");
var router = express.Router({ mergeParams: true });
var Book = require("../models/books");
var BestSelling = require("../models/bestSelling");
var Comment = require("../models/comments");
var middleware = require("../middleware");


//Comments New for book
router.get("/books/:id/comments/new", middleware.isLoggedIn, function (req, res) {
    //find the book by id
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            req.flash("error", "Book Not found");
            console.log(err);
        } else {
            res.render("comments/books/new", { book: book });
        }
    });
});

//Comments Create for books
router.post("/books/:id/comments", middleware.isLoggedIn, function (req, res) {
    //lookup for book using id
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            req.flash("error", "Book Not Found");
            res.redirect("/books");
        } else {
            //create new comment
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to the comments
                    comment.user.id = req.user._id;
                    comment.user.username = req.user.username;
                    //save the comment
                    comment.save();
                    //associate new comment to the books page
                    book.comments.push(comment);
                    book.save();
                    req.flash("success", "Comment Added Successfully!!");
                    //redirect to show page
                    res.redirect("/books/" + book._id);
                }
            });
        }
    });
});

//EDIT ROUTE for books
router.get("/books/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Book.findById(req.params.id, function (err, foundBook) {
        if (err || !foundBook) {
            req.flash("Book not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/books/edit", { book_id: req.params.id, comment: foundComment });
            }
        });
    })
});

//UPDATE ROUTE for books
router.put("/books/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment edited!!")
            res.redirect("/books/" + req.params.id);
        }
    })
});

//DELETE ROUTE for books
router.delete("/books/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted successfully!!");
            res.redirect("/books/" + req.params.id);
        }
    });
});

//Coment New for best selling book
router.get("/bestselling/:id/comments/new", middleware.isLoggedIn, function (req, res) {
    //find the book by id
    BestSelling.findById(req.params.id, function (err, bestSelling) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/bestSellings/new", { bestSelling: bestSelling });
        }
    });
});

//Comment create for best selling book
router.post("/bestselling/:id/comments", middleware.isLoggedIn, function (req, res) {
    //find the best selling book of that id
    BestSelling.findById(req.params.id, function (err, bestSelling) {
        if (err) {
            res.redirect("/bestselling");
        } else {
            //create new comment 
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username to the comments
                    comment.user.id = req.user._id;
                    comment.user.username = req.user.username;
                    //save comment
                    comment.save();
                    //associate to the best selling book
                    bestSelling.comments.push(comment);
                    bestSelling.save();
                    req.flash("success", "Comment Added Successfully!!")
                    //redirect to the show page
                    res.redirect("/bestselling/" + bestSelling._id);
                }
            });
        }
    });
});

//EDIT ROUTE for best selling books
router.get("/bestselling/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    BestSelling.findById(req.params.id, function (err, foundBestSelling) {
        if (err || !foundBestSelling) {
            req.flash("Book not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/bestSellings/edit", { bestSelling_id: req.params.id, comment: foundComment });
            }
        });
    });

});

//UPDATE ROUTE for best selling books
router.put("/bestselling/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment Edited!!")
            res.redirect("/bestselling/" + req.params.id);
        }
    })
});

//DELETE ROUTE for best selling books
router.delete("/bestselling/:id/comments/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted successfully!!")
            res.redirect("/bestselling/" + req.params.id);
        }
    });
});

module.exports = router;