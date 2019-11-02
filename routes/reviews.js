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


module.exports = router;