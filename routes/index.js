var express = require("express"),
    request = require("request"),
    sgMail  = require('@sendgrid/mail'),
    Book = require("../models/books"),
    BestSelling = require("../models/bestSelling");
var router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
    var contact=req.body.contact;
    var message=req.body.id;
    if(contact){
        const msg = {
            to: contact.email,
            from: 'guptahimanshu479@gmail.com',
            subject: 'E-Book-Store Support',
            text: 'You tried to contact us...',
            html: 	 '<h1>Your Account Info.... ' +
					 '<br>' +
					 '<b>Customer Name: ' + contact.name +
					 '<br>' +
                     '<b>Customer Email: ' +contact.email+
                     '<br>' +
                     '<b>Customer Mobile: ' +contact.mobile+
                     '<br>' +
                     '<b>Customer concern: ' +message+
                     '<p>We are working on the issue and will reply back ASAP</p>'
		};
        sgMail.send(msg,(err, result)=>{
            if(err){
                console.log(err);
				req.flash("error", "Email not sent!" ); 
				res.redirect("back");
            }
            else{
                req.flash("success","We will contact you shortly");
                res.redirect("/contact");
            }
        });
    }
    else{
        req.flash("error","Incomplete");
        res.redirect("/contact");
    }
    //save the details in the backend
});

//about us 
router.get("/aboutus", function(req, res){
    res.render("aboutus");
});

//offers
router.get("/offers", function(req, res){
    res.render("offers");
});

router.get("/terms", function(req, res){
    res.render("terms");
});

module.exports = router;