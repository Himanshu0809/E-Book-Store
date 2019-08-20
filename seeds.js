var mongoose = require("mongoose");
var Book = require("./models/books");
var data = [
    {
        title: "Half Torn Hearts",
        author:"bleh bleh",
        price: "151",
        image: "https://kbimages1-a.akamaihd.net/b203a442-e718-4563-b790-63f25b9faefe/210/316/False/half-torn-hearts.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
        title: "Emotional First",
        author:"bleh bleh",
        price: "487",
        image: "https://kbimages1-a.akamaihd.net/0f1c6220-fe96-4f25-abe2-92184ca78d16/140/215/60/False/emotional-first-aid-1.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
        title: "His to Defend",
        author:"bleh bleh",
        price: "578",
        image: "https://kbimages1-a.akamaihd.net/ac542ced-e712-4de7-b0b1-f70ea084a97c/140/215/60/False/his-to-defend.jpg",
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    }

];
function seedDB(){
    Book.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log("removed books");
            data.forEach(function(seed){
                Book.create(seed, function(err, book){
                    if(err){
                        console.log(err)
                    }else{
                        console.log("Added Book");
                    }
                })
            })
        }
    })
}

module.exports=seedDB;