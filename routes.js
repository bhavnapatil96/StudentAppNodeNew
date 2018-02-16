
var {User}=require('./models/students');

module.exports=(app,passport)=>{

    app.get('/',(req,res)=>{
        console.log("In get ");
        res.send({msg:"error"});
    });
    app.get('/profile1',(req,res)=>{
        console.log('profile')
        res.send({msg:"user"});
    });

    // google ROUTES
    app.get('/auth/google', passport.authenticate('google',
        {  scope : ['profile', 'email']}
       // { scope: 'https://www.google.com/m8/feeds' }
        )
    );

    app.get('/auth/google/callback',passport.authenticate('google', {
            successRedirect:'http://localhost:3001/list',
            failureRedirect: '/'
        }
    ),(req,res)=>{
        res.send("By Hardik Patel")
    });

};