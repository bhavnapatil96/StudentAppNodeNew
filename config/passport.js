const express=require('express');
const passport=require('passport');
const bodyParser=require('body-parser');
const {mongoose}=require("../db/conn");
const {students}=require('../models/students');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth=require("./auth");
var app=express();
passport.serializeUser((user,done)=>{
    console.log("serializer");
    done(null,user);
});
passport.deserializeUser((user,done)=>{
    console.log("deserializer");
    done(null,user);
});
//app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    encoded:true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(`Access-Control-Allow-Methods`, `POST`);
    res.header(`Access-Control-Expose-Headers`, `x-auth`);
    next();
});

passport.use("google",new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
    // google will send back the token and profile
    (accessToken, refreshToken, profile, done)=> {
        // asynchronous // Event Loop
        console.log("In fb use");

        process.nextTick(()=> {

            // find the user in the database based on their facebook id
            students.findOne({ 'id' : profile.id }, (err, user)=> {

                console.log('start gg')

                // if there is an error, stop everything and return that error connecting to the database
                if (err) return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new students({
                        id    : profile.id, // set the users gg id
                        token : accessToken, // we will save the token that gg provides to the user
                        fullname  :profile.displayName, // look at the passport user profile to see how names are returned
                        email :profile.emails[0].value // gg can return multiple emails so we'll take the first
                    });

                    // set all of the gg information in our gg model


                    // save our user to the database
                    newUser.save().then((doc)=>{
                        console.log("Saved User :: = "+doc);
                        return doc;
                    }).catch((err)=>{
                        console.log("User Error :: = "+err);
                        return err;
                    });
                }

            });
        });

    }));

require('../routes')(app,passport);
app.listen(8081,()=>{
    console.log('connected to server....');
});


