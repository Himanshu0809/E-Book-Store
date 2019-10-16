require("dotenv").config()

//requiring npm packages
var createError = require('http-errors'),
    express = require("express"),
    app = express(),
    path = require('path'),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    flash = require("connect-flash"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride = require("method-override"),
    session = require("express-session"),
    cookieParser = require("cookie-parser"),
    request = require("request"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    logger = require('morgan'),
    MongoStore = require("connect-mongo")(session);
//requiring models
var Book = require("./models/books"),
    BestSelling = require("./models/bestSelling"),
    Comment = require("./models/comments"),
    User = require("./models/user"),
    seedDB = require("./seeds.js");

//requiring routes
var indexRoutes = require("./routes/index"),
    bookRoutes = require("./routes/books"),
    addDBRoutes = require("./routes/addDB"),
    bestSellingRoutes = require("./routes/bestSelling"),
    commentRoutees = require("./routes/comments"),
    userRoutes = require("./routes/user"),
    cartRoutes=require("./routes/cart");

mongoose.connect("mongodb+srv://Himanshu:MSDhoni07@cluster0-1uhbb.mongodb.net/HJ_Book_Store?retryWrites=true&w=majority", { useNewUrlParser: true })
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use('/public/images/', express.static('./public/images'));
//done to make the images directory in the public directory static

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

//PASSPORT CONFIGURATION
app.use(session({
    secret: "HJ Store Secret",
    //allows encrypted data to be stored during the session rather than storing the username and password a plain text
    resave: false,
    saveUninitialized: false,
    storage: new MongoStore({ mongooseConnection: mongoose.connection }), //so that there is no new connection opened
    cookie: { maxAge: 180 * 60 * 1000 } //how long the session should live before it expires (3hrs)
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//user authenticate comes in with passport local mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.session = req.session; // making the session available to the templates
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.use("/", indexRoutes);
app.use("/books", bookRoutes);
app.use("/", addDBRoutes);
app.use("/bestSelling", bestSellingRoutes);
app.use("/", commentRoutees);
app.use("/", userRoutes);
app.use("/", cartRoutes);

const PORT = process.env.PORT || 7781;

app.listen(PORT, function () {
    console.log(`E-book server started on port ${PORT}`);
});