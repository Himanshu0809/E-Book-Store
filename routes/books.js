var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var middleware = require("../middleware");

//INDEX - Show all books
router.get("/", function (req, res) {
    var noMatch;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //Get all the books from the DB
        Book.find({ title: regex }, function (err, allBooks) {
            if (err) {
                console.log(err);
            } else {
                if (allBooks.length < 1) {
                    noMatch = "No books match found!!"
                }
                res.render("books/index", { books: allBooks, noMatch: noMatch });
            }
        });
    } else {
        //Get all the books from the DB
        Book.find({}, function (err, allBooks) {
            if (err) {
                console.log(err);
            } else {
                res.render("books/index", { books: allBooks, noMatch: noMatch });
            }
        });
    }
});

//NEW - show form to create a book
router.get("/new", middleware.checkIsAdmin, function (req, res) {
    res.render("books/new");
});

//CREATE - add new book to the DB(admin only)
router.post("/", middleware.checkIsAdmin, function (req, res) {
    var title = req.body.book.title;
    var price = req.body.book.price;
    var author = req.body.book.author;
    var image = req.body.book.image;
    var description = req.body.book.description;
    var publisher = req.body.book.publisher;
    var newBook = { title: title, author: author, publisher: publisher, price: price, image: image, description: description };
    Book.create(newBook, function (err, newCreated) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Book Added to the Database");
            res.redirect("/books");
        }
    });
});


//SHOW - Show more info about one campground
router.get("/:id", function (req, res) {
    //find the book by provided ID
    Book.findById(req.params.id).populate("comments likes").exec(function (err, foundBook) {
        if (err || !foundBook) {
            req.flash("error", "Book Not Found");
            console.log(err);
        } else {
            res.render("books/show", { book: foundBook });
        }
    });
});

// Book Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Book.findById(req.params.id, function (err, foundBook) {
        if (err || !foundBook) {
            console.log(err);
            req.flash("error", "Book Not Found!");
            return res.redirect("/books");
        }
        // check if req.user._id exists in foundBestSelling.likes
        var foundUserLike = foundBook.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundBook.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundBook.likes.push(req.user);
        }

        foundBook.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/books");
            }
            return res.redirect("/books/" + foundBook._id);
        });
    });
});

//EDIT - edit book(admin only)
router.get("/:id/edit", middleware.checkIsAdmin, function (req, res) {
    Book.findById(req.params.id, function (err, foundBook) {
        res.render("books/edit", { book: foundBook });
    });
});

//UPGRADE - upgrade the book
router.put("/:id", middleware.checkIsAdmin, function (req, res) {
    Book.findById(req.params.id, function (err, book) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            book.title = req.body.book.title;
            book.price = req.body.book.price;
            book.author = req.body.book.author;
            book.image = req.body.book.image;
            book.description = req.body.book.description;
            book.publisher = req.body.book.publisher;
            book.save(function (err) {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully Updated!");
                    res.redirect("/books/" + book._id);
                }
            });
        }
    });
});

//DESTROY - delete book(admin only)
router.delete("/:id", middleware.checkIsAdmin, function (req, res) {
    Book.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/books");
        } else {
            req.flash("success", "Book Deleted");
            res.redirect("/books");
        }
    });
});

//buy best selling(all users)

//add to cart best selling(all users)

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;