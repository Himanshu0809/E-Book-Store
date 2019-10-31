var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Comment = require("../models/comments");
var Order=require("../models/order");
var Cart=require("../models/cart");
var middleware = require("../middleware");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'distroters',
    api_key: 362386288297468,
    api_secret: "JMWcMdcHrjurh88t7wcrL4ZURWU"
});

//show register form
router.get("/register", function (req, res) {
    res.render("authentication/register");
});

//handle sign up logic
router.post("/register", function (req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
        }
    );
    if (req.body.username === "admin") {
        newUser.isAdmin = "admin";
    }
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.render("authentication/register",{error:err.message});
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("back");
        });
    });
});

//show login form
router.get("/login", function (req, res) {
    var messages=req.flash("error");
    res.render("authentication/login");
})

//handling login logic
router.post("/login", passport.authenticate("local", {
    // successRedirect: "/",
    failureRedirect: "/login",
    failureFlash:true,
    successFlash: 'Welcome to HG Book Store!'
}), function (req, res) {
    if(req.session.oldUrl){
        var oldUrl=req.session.oldUrl;
        req.session.oldUrl=null;
        res.redirect(oldUrl);   //to redirect user to previous url
    }else{
        res.redirect("/");
    }
    req.flash("success", "Welcome to YelpCamp ");
});

//logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged You Out!")
    res.redirect("/");
});

//forgot
router.get("/forgot", function (req, res) {
    res.render("authentication/forgot");
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'guptahimanshu479@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'guptahimanshu479@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) 
        {
            console.log(err);
            return next(err);
        
        }res.redirect('/forgot');
    });
});

router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('authentication/reset', { token: req.params.token });
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'guptahimanshu479@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'guptahimanshu479@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});

//user profile routes
router.get("/users/:id", middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("/");
        }
        res.render("users/show", { user: foundUser });

    });
});

router.get("/users/:id/myorders", middleware.isLoggedIn,function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }
        Order.find({user:req.user}, function(err, orders){
            if(err){
                req.flash("error", "Something went wrong!");
                return res.redirect("back");
            }
            var cart;
            console.log(orders);
            orders.forEach(function(order){
                cart=new Cart(order.cart); //order.cart bcz we are storing the cart in database
                order.items=cart.generateArray();
            });
            res.render("users/myorders",{orders:orders});
        });
    })
})

router.post("/users/:id/dp", middleware.isLoggedIn, upload.single('image'), function (req, res) {
    User.findById(req.params.id,async function (err, user) {
        if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    var result =await cloudinary.v2.uploader.upload(req.file.path);
                    user.imageId = result.public_id;
                    user.image = result.secure_url;
                } catch (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
        }
        user.save();
        req.flash("success", "Successfully Uploaded!");
        res.redirect("/users/" + user._id);
    });
});

router.post("/users/:id/edit", middleware.isLoggedIn, function(req, res){
    User.findById(req.params.id, async function(err, user){
        if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        }else{
            user.firstname=req.body.fname;
            user.lastname=req.body.lname;
            user.username=req.body.username;
            user.gender=req.body.gender;
            user.email=req.body.email;
        }
        user.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/users/" + user._id);
    })
})

module.exports = router;