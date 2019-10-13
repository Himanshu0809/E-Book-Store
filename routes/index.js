var express = require("express"),
    request = require("request"),
    Book = require("../models/books"),
    BestSelling = require("../models/bestSelling");
var router = express.Router();

//landing page
router.get("/", function (req, res) {
    BestSelling.find({}, function (err, foundBestSelling) {
        if (err) {
            console.log(err)
        } else {
            Book.find({}, function (err, foundBook) {
                if (err) {
                    console.log(err)
                } else {
                    res.render("landing", { bestSellings: foundBestSelling, books: foundBook });
                }
            });
        }
    });
});

//contact us
router.get("/contact", function (req, res) {
    res.render("contact");
});

//contact form
router.post("/contact", function (req, res) {
    req.flash("success","We will contact you shortly");
    res.redirect("/contact");
    //save the details in the backend
});

//about us 
router.get("/aboutus", function(req, res){
    res.render("aboutus");
});

router.get("/offers", function(req, res){
    res.render("offers");
});
module.exports = router;