var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var Review=require("../models/review");
var middleware = require("../middleware");

//INDEX - Show all books
router.get("/", function (req, res) {
    var perPage = 16;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //Get all the books from the DB
        Book.find({ title: regex }).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function (err, allBooks) {
            Book.count({ title: regex }).exec(function (err, count) {
                if (err || !allBooks) {
                    req.flash("Something Went Wrong!!");
                    console.log(err)
                    res.redirect("back");
                }
                else {
                    if (allBooks.length < 1) {
                        noMatch = "No books match found!! Please Try Again!!"
                    }
                    res.render("books/index", { books: allBooks, currentUser: req.user, noMatch: noMatch, current: pageNumber, pages: Math.ceil(count / perPage), search: req.query.search });
                }
            });
        });
    } else {
        //Get all the books from the DB
        Book.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allBooks) {
            Book.count().exec(function (err, count) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("books/index", { books:allBooks, currentUser: req.user, noMatch: noMatch, current: pageNumber, pages: Math.ceil(count / perPage), search: false });
                }
            });
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
    Book.findById(req.params.id).populate("comments likes").populate({
        path:"reviews",
        options:{sort:{createdAt:-1}}
    }).exec(function (err, foundBook) {
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
    delete req.body.book.rating;
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

//DESTROY - delete book(admin only)
router.delete("/:id", middleware.checkIsAdmin, function (req, res) {
    Book.findById(req.params.id, async function (err, book) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            //delete all comments associated with the campground
            await Comment.remove({ "_id": { $in: book.comments } }, async function (err) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                //delete all the reviews associated with the campground
                Review.remove({ "_id": { $in: book.reviews } }, async function (err) {
                    if (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                    //delete the book
                    book.remove();
                    req.flash('success', 'Book deleted successfully!');
                    res.redirect('/books');
                });
            });

        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

//buy best selling(all users)

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;