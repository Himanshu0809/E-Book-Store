var express = require("express");
var router = express.Router({mergeParams: true});
var Book = require("../models/books");
var Review = require("../models/review");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Book.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, book) {
        if (err || !book) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {book: book});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the book, only one review per user is allowed
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {book: book});
    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Book.findById(req.params.id).populate("reviews").exec(function (err, book) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add user username/id and associated book to the review
            review.user.id = req.user._id;
            review.user.username = req.user.username;
            review.book = book;
            //save review
            review.save();
            book.reviews.push(review);
            // calculate the new average review for the book
            book.rating = calculateAverage(book.reviews);
            //save book
            book.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/books/' + book._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {book_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Book.findById(req.params.id).populate("reviews").exec(function (err, book) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate book average
            book.rating = calculateAverage(book.reviews);
            //save changes
            book.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/books/' + book._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Book.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, book) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate book average
            book.rating = calculateAverage(book.reviews);
            //save changes
            book.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/books/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;