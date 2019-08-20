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
    Book.findById(req.params.id).populate("comments").exec(function (err, foundBook) {
        if (err || !foundBook) {
            req.flash("error", "Book Not Found");
            console.log(err);
        } else {
            res.render("books/show", { book: foundBook });
        }
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
    Book.findByIdAndUpdate(req.params.id, req.body.book, function (err, upgradedBook) {
        if (err) {
            res.redirect("/books");
        } else {
            res.redirect("/books/" + req.params.id);
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