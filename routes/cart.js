var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var middleware = require("../middleware");
var Cart = require("../models/cart");
var BestSelling = require("../models/bestSelling");
var Order = require("../models/order");

//Add to cart functionality for books
router.get("/books/add-to-cart/:id", function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {}); //every time an item is added a new object is created with the old cart from the session
    //we are checking whether we have an existing cart or not. if it exists we are passing the old cart otherwise an empty object

    Book.findById(productId, function (err, product) {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        cart.add(product, productId);
        req.session.cart = cart;
        console.log(req.session.cart);
        req.flash("success", "Succesfully Added to cart!")
        res.redirect('/');
    })
});

router.get("/reduce/:id", function(req, res){
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart=cart;
    res.redirect("/shopping-cart");
})

//Add to cart functionality for best selling
router.get("/bestselling/add-to-cart/:id", function (req, res) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {}); //every time an item is added a new object is created with the old cart from the session
    //we are checking whether we have an existing cart or not. if it exists we are passing the old cart otherwise an empty object

    BestSelling.findById(productId, function (err, product) {
        if (err) {
            console.log(err);
            return res.redirect("/");
        }
        cart.add(product, productId);
        req.session.cart = cart;
        console.log(req.session.cart);
        req.flash("success", "Succesfully Added to cart!")
        res.redirect('/');
    })
});


router.get("/shopping-cart", function (req, res) {
    if (!req.session.cart) {
        return res.render("cart/shopping-cart", { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render("cart/shopping-cart", { products: cart.generateArray(), totalPrice: cart.totalPrice });
})

router.get("/checkout", middleware.isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        return res.redirect("/shopping-cart");
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash("error")[0];
    res.render("cart/checkout", { total: cart.totalPrice, errMsg: errMsg, noError: !errMsg })
});

router.post("/checkout", middleware.isLoggedIn, function (req, res) {
    if (!req.session.cart) {
        return res.redirect("/shopping-cart");
    }
    var cart = new Cart(req.session.cart);
    var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/cards/collecting/web#create-token
    stripe.charges.create({
            amount: cart.totalPrice * 100,
            currency: 'inr',
            source: req.body.stripeToken,
            description: 'Test Charge',
        },
        function (err, charge) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("/checkout");
            }
            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id
            });
            order.save(function (err, result) {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
                req.flash("success", "Successfully bought product");
                req.session.cart = null;
                res.redirect("/");
            });
        }
    )
});
module.exports = router;