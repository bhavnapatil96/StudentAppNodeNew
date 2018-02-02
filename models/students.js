const mongoose =require('mongoose');
var validator=require('validator');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');

var StudentSchema=new mongoose.Schema({
    fullname:{
        required: true,
        type: String,
        minlength: 1,
        trim: true

    },
    email:{
        required: true,
        type: String,
        minlength: 1,
        trim: true,
        //unique: true
        validate:{
            validator:validator.isEmail,
            message:'{Value} is not valid Email'
        }
    },
    password:{
        required: true,
        type: String,
        minlength: 5

    },
    contact:{
        required: true,
        type: Number,
        length: 10

    },
    gender:{
        required: true,
        type: String,
        length: 1
    },
    city:{
        required: true,
        type: String
    },
    iagree:{
        required: true,
        type: String

    },
    photo:{
        type:String
    },
    tokens:[{
     access:{
         type:String
     },
     token:{
         type:String
     }
    }]

});
StudentSchema.pre('save',function(next){
    let student=this;
    if(student.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(student.password,salt,(err,hash)=>{
                student.password=hash;
                next();
            })
        })
    }
    else{
        next();
    }
})
StudentSchema.methods.generateAuthToken=function(){
    const student=this;
    const access='auth';
    const token=jwt.sign({_id:student._id.toHexString(),access},'abc123').toString();
    student.tokens.push({access,token});
    return student.save().then(()=>{
        return token;
    });
}

StudentSchema.methods.login=(email,password)=>{
    let student=this;
    return new Promise((resole, reject) => {
        student.findOne({email:email},(err,data)=>{
            if(data){
                bcrypt.compare(password,data.password,(err,res)=>{
                    console.log(res);
                    if(res==true)
                    {
                        return resole(data);
                    }
                    else
                    {
                        return reject(err);
                    }
                })
            }else
            {
                console.log("Email in not Available");
                return reject(err);
            }

        }).catch((e)=>{
            return reject(e);
        })
    });

}
let students=mongoose.model('students',StudentSchema);

module.exports={students};