const mongoose=require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost/studentdb',(err,res)=>{
    console.log('Student DB Connected....');
});
