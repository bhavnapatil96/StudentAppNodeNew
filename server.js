var express=require('express');
var bodyParser=require('body-parser');
var _=require('lodash');
var conn=require('./db/conn');
var session = require('express-session');
const {students}=require('./models/students');
const Student=require('./models/students').students;
const bcrypt=require('bcryptjs');
const passport=require('passport');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth=require("./config/auth");
var token;
var app=express();
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'ssshhhhh'}));

app.use((req,res,next) =>{

    /*res.header('Access-Control-Allow-Origin','*');*/
    console.log('request  : ',req.headers.origin);
   // res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Origin','http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(`Access-Control-Allow-Methods`, `POST`);
    res.header(`Access-Control-Expose-Headers`, `x-auth`);
    next();
});

app.get('/sucess',(req,res)=>{
   console.log('After Login')
});
app.post('/student/add',(req,res)=>{
    console.log('File :',req.body.photo);
    // if (!req.body.files)
    //     return res.status(400).send('No files were uploaded.');
    //
    // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // let sampleFile = req.body.files.file;
    // // console.log('File ',sampleFile);
    // // // Use the mv() method to place the file somewhere on your server
    // // sampleFile.mv('./tmp/'+sampleFile.name, function(err) {
    // //     if (err)
    // //         return res.status(500).send(err);
    // //
    // //     res.send('File uploaded!');
    // // });

    var student=new Student({
        fullname:req.body.fullname,
        email:req.body.email,
        password:req.body.password,
        contact:req.body.contact,
        gender:req.body.gender,
        city:req.body.city,
        iagree:req.body.iagree,
        photo:req.body.photo
    });

    student.save().then((data)=>{
        console.log(`Saveddd`)
        let token=student.generateAuthToken();
        token.then((t)=>{
            res.header('x-auth',t).send(student)
        }).catch((err)=>{
            res.send(err.message);
        })
    }).catch((err)=>{
        console.log(`Error : ${err.message}`);
    });

});
app.get('/student/list',(req,res)=>{
    Student.find().then((data)=>{
        if(!data){
            console.log(`Data Not found`);
        }
        console.log(data)
        res.header('x-auth',token).send(data);

    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
    })

});
app.post('/student/delete',(req,res)=>{
    let id=req.body.id;
    console.log(id);
    Student.findByIdAndRemove(id).then((student)=>{
        if (!student) {
            res.status(404).send();
        }
        res.send(student);
    }).catch ((e)=>{
            console.log(`error : ${e.message}`);
            res.status(404).send();
    })


});
app.post('/student/findbyid',(req,res)=>{
    let id=req.body.id;

    Student.find({_id:id}).then((student)=>{
       if(!student)
       {
           console.log(`${id} Id Not Found `);
           res.status(404).send();
       }

       res.send(student);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
        res.status(404).send();
    });
});
app.post('/student/update',(req,res)=>{
    let body=_.pick(req.body,['id','fullname','email','contact','gender','city']);
    //let id=body.id;
   console.log('request Id : ',req.body.id);
    Student.findByIdAndUpdate(req.body.id,{$set:body}).then((student)=>{
        if(!student){
            console.log(req.body.id,`Id Not Found`);
            res.status(404).send();
        }
        res.send(student);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
    });
});
app.post('/student/update',(req,res)=>{
    let body=_.pick(req.body,['id','fullname','email','contact','gender','city']);
    //let id=body.id;
    console.log('request Id : ',req.body.id);
    Student.findByIdAndUpdate(req.body.id,{$set:body}).then((student)=>{
        if(!student){
            console.log(req.body.id,`Id Not Found`);
            res.status(404).send();
        }
        res.send(student);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
    });
});
app.post('/student/login',(req,res)=>{
    let email=req.body.email;
    let password=req.body.password;
    console.log(email,password);
    var sess;
    Student.findOne({email:email},(err,data)=>{
        if(data){
            bcrypt.compare(password,data.password,(err,d)=>{

                if(d==true)
                {
                    sess = req.session;
                    sess.email=data.email;
                    console.log('Email',sess.email);
                    return res.send(data);
                }
                else
                {
                    return res.send(err);
                }
            })
        }else
        {
            console.log("Email in not Available");
            return res.status(401).send();
        }

    }).catch((e)=>{
        return reject(e);
    })

});

passport.serializeUser((user,done)=>{
    console.log('serialize');
    return done(null,user);
});
passport.deserializeUser((user,done)=>{
    console.log('serialize');
    return done(null,user);
});

passport.use(new LocalStrategy ((username, password, done) => {
        console.log('in passport',username,password);
        Student.findOne({email: username}, (err, user) => {
            if (err) {
                console.log('in err');
                return done(err)
            }
            // User not found
            if (!user) {
                console.log("User Not Found.....");
                return done(null, false)
            }
            else{
               // console.log(user);
                // Always use hashed passwords and fixed time comparison
                bcrypt.compare(password, user.password, (err, isValid) => {
                    if (err) {
                        return done(err)
                    }
                    if (!isValid) {
                        console.log("Invalid password.....");

                        return done(null, false)
                    }
                    else
                    {

                        console.log("valid password.....");
                        console.log( "User   : ",user);
                        token=user.tokens[0].token;
                        console.log( "token   : ",token);
                    }
                    return done(null, user)
                });

            }

        })
    }
));

app.post('/student/loginp',passport.authenticate('local', {
    successRedirect: '/student/list',
    failureRedirect: '/loginp',


}));
//............................................................
//Gmail Login.........................................................
app.use((req,res,next)=>{
    next();
});

passport.use('google',new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
    // google will send back the token and profile
    (accessToken, refreshToken, profile, done)=> {
        // asynchronous // Event Loop
        console.log("In fb use");

        process.nextTick(()=> {

            students.findOne({'google.id' : profile.id }, (err, user)=> {

                console.log('Profile Id :',profile.id)

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
                         return done(null, doc)
                    }).catch((err)=>{
                        console.log("User Error :: = "+err);
                        return done(err);
                    });
                }

            });
        });

    }));
//............................................................
require('./routes')(app,passport);
app.listen(8081,()=>{
    console.log('App is running on Port  8081');
});