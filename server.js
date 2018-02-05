var express=require('express');
var bodyParser=require('body-parser');
var _=require('lodash');
var conn=require('./db/conn');
var session = require('express-session');

const Student=require('./models/students').students;
const bcrypt=require('bcryptjs');
const passport=require('passport');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var app=express();
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'ssshhhhh'}));

app.use((req,res,next) =>{

    res.header('Access-Control-Allow-Origin',' http://localhost:3001');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});
app.post('/student/add',(req,res)=>{
    // if (!req.files)
    //     return res.status(400).send('No files were uploaded.');
    //
    // // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // let sampleFile = req.files.file;
    //
    // // Use the mv() method to place the file somewhere on your server
    // sampleFile.mv('./tmp/'+sampleFile.name, function(err) {
    //     if (err)
    //         return res.status(500).send(err);
    //
    //     res.send('File uploaded!');
    // });

  var student=new Student({
        fullname:req.body.fullname,
        email:req.body.email,
        password:req.body.password,
        contact:req.body.contact,
        gender:req.body.gender,
        city:req.body.city,
        iagree:req.body.iagree
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
        res.send(data);
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

//............................................................

app.listen(8081,()=>{
    console.log('App is running on Port  8081');
});