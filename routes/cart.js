var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var middleware = require("../middleware");
var Cart=require("../models/cart");

//Add to cart functionality for books
router.get("/add-to-cart/:id", function(req, res){
    var productId=req.params.id;
    var cart=new Cart(req.session.cart ? req.session.cart:{items:{}}); //every time an item is added a new object is created with the old cart from the session
    //we are checking whether we have an existing cart or not. if it exists we are passing the old cart otherwise an empty object

    Book.findById(productId, function(err, product){
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        cart.add(product, productId);
        req.session.cart=cart;
        console.log(req.session.cart);
        req.flash("success","Succesfully Added to cart!")
        res.redirect('/books');
    })
});

module.exports = router;