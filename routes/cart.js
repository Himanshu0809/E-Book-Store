var express = require("express");
var router = express.Router();
var Book = require("../models/books");
var middleware = require("../middleware");

//Add to cart functionality
router.get("/add-to-cart/:id", function(req, res){
    var productId=req.params.id;
    
});

module.exports = router;