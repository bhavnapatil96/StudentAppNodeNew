
var {User}=require('./models/students');

module.exports=(app,passport)=>{

    app.get('/',(req,res)=>{
        console.log("In get ");
        res.send({msg:"success"});
    });
    app.get('/profile',(req,res)=>{
        res.send({msg:"user"});
    });

    // google ROUTES
    app.get('/auth/google', passport.authenticate('google',
        {  scope : ['profile', 'email']}
       // { scope: 'https://www.google.com/m8/feeds' }
        )
    );

    app.get('/auth/google/callback',passport.authenticate('google', {

            successRedirect: '/profile',
            failureRedirect: '/'
        }
    ));

};