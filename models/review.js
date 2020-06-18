var mongoose = require("mongoose");

//Schema setup:
var reviewSchema = new mongoose.Schema({
    //Blue print, how the data should look like
    name: String,
    price: String,
    image: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    author: {
       id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
       },
       fullname: String,
       email: String,
       username: String
    },
    comments: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Comment"
        }
     ]
});



module.exports = mongoose.model("Review", reviewSchema);