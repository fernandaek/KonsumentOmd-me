var express = require("express"); //includes all contents of express
var app = express(); // save in the variable app
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var Review = require("./models/review");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");
//Requiring route files
var reviewRoutes = require("./routes/reviews");
var commentRoutes = require("./routes/comments");
var authRoutes = require("./routes/auth");
var methodOverride = require("method-override");



//seedDB(); //Mock data

mongoose.connect("mongodb+srv://fernandaek:Password123abc@review-h6cpu.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex:true,
}).then(() => {
    console.log("Connected To Mongo Db DataBase");
}).catch((err) => {
  console.log("DataBase Connection Error " + err);
})



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); //You set the files to ejs
app.use(express.static(__dirname + "/public"));
console.log(__dirname);
app.use(methodOverride("_method"));

app.locals.moment = require("moment");
//=======================================================================
//------------------------PASSPORT CONFIG--------------------------------
//=======================================================================
app.use(require("express-session")({
    secret:"Secret something",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //Authenticate method comes with passportLocalMongoose so you don't need to right yourself the method
passport.serializeUser(User.serializeUser()); // It also comes with passportLocalMongoose
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();//in other to movie on from the middleware
});

app.use(authRoutes);
app.use(commentRoutes);
app.use(reviewRoutes);





app.listen(process.env.PORT || 3000, () => {
    console.log("The server is running");
});