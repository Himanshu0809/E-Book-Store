var express = require("express"),
    request = require("request"),
    BestSelling = require("../models/bestSelling"),
    middleware = require("../middleware");
var router = express.Router();

//INDEX - show all best selling books
router.get("/", function (req, res) {
    BestSelling.find({}, function (err, allBestSellings) {
        if (err) {
            console.log(err);
        } else {
            res.render("bestSellings/index", { bestSellings: allBestSellings });
        }
    });
});

//NEW - show form to create a best selling book(admin only)
router.get("/new", middleware.checkIsAdmin, function (req, res) {
    res.render("bestSellings/new");
});

//CREATE - add new best selling book to the DB(admin only)
router.post("/", middleware.checkIsAdmin, function (req, res) {
    var title = req.body.bs.title;
    var price = req.body.bs.price;
    var author = req.body.bs.author;
    var image = req.body.bs.image;
    var description = req.body.bs.description;
    var publisher = req.body.bs.publisher;
    var newBestSelling = { title: title, author: author, publisher: publisher, price: price, image: image, description: description };
    BestSelling.create(newBestSelling, function (err, newCreated) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Book Added to the Database");
            res.redirect("/bestselling");
        }
    });
});

//SHOW - show more info about one Best Selling book
router.get("/:id", function (req, res) {
    BestSelling.findById(req.params.id).populate("comments likes").exec(function (err, foundBestSelling) {
        if (err || !foundBestSelling) {
            req.flash("error", "Book Not Found")
            console.log(err)
        } else {
            res.render("bestSellings/show", { bestSelling: foundBestSelling });
        }
    });
});

// BestSelling Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    BestSelling.findById(req.params.id, function (err, foundBestSelling) {
        if (err || !foundBestSelling) {
            console.log(err);
            req.flash("error", "Book Not Found!");
            return res.redirect("/bestselling");
        }
        // check if req.user._id exists in foundBestSelling.likes
        var foundUserLike = foundBestSelling.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundBestSelling.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundBestSelling.likes.push(req.user);
        }

        foundBestSelling.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/bestselling");
            }
            return res.redirect("/bestselling/" + foundBestSelling._id);
        });
    });
});

//EDIT - edit best selling book(admin only)
router.get("/:id/edit", middleware.checkIsAdmin, function (req, res) {
    BestSelling.findById(req.params.id, function (err, foundBestSelling) {
        res.render("bestSellings/edit", { bestSelling: foundBestSelling });
    });
});

//UPGRADE - upgrade the best selling book
router.put("/:id", middleware.checkIsAdmin, function (req, res) {
    BestSelling.findById(req.params.id, function (err, bestSelling) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            bestSelling.title = req.body.bs.title;
            bestSelling.price = req.body.bs.price;
            bestSelling.author = req.body.bs.author;
            bestSelling.image = req.body.bs.image;
            bestSelling.description = req.body.bs.description;
            bestSelling.publisher = req.body.bs.publisher;
            bestSelling.save(function (err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully Updated!");
                    res.redirect("/bestselling/" + bestSelling._id);
                }
            });
        }
    });
});


//DESTROY - delete best selling(admin only)
router.delete("/:id", middleware.checkIsAdmin, function (req, res) {
    BestSelling.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/bestselling");
        } else {
            req.flash("success", "Book Deleted");
            res.redirect("/bestselling");
        }
    });
});

//buy best selling(all users)

//add to cart best selling(all users)

module.exports = router;