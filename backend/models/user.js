const mongoose=require('mongoose')
const bcrypt=require('bcrypt')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    balance:{
        type:Number,
        default:0
    },
    income:{
        type:Number,
        default:0
    },
    expenses:{
        type:Number,
        default:0
    },
    transactions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transaction'
    }]
});

userSchema.pre('save',async function(next){
    const user=this;
    if(!user.isModified('password')) return next();

    try{
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(user.password,salt);
        user.password=hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
});

const User =mongoose.model('User',userSchema);

module.exports=User;