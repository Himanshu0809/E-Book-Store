var mongoose = require("mongoose");

var mapSchema = mongoose.Schema({
    location: String,
    lat: Number,
    lng: Number,
});

module.exports = mongoose.model("Map", mapSchema);
