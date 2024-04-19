const mongoos = require("mongoose")
const validate = require("validator")


const userSchema = mongoos.Schema({
 email:{
    type:String, 
    required:[true, " email is required "],
    unique: true,
    validate:[validate.isEmail,"please provide  a valid email"],
    lowercase:true

 },
 fullname:{
    type:String,
    required: [true, "Please fill your name"],
    minlength: [4, "At least needed four letters"],
    maxlength: [20, "You reached the max character limit"],
    lowercase: true
 },
 username:{
    type:String ,
    required :[true, 'Username field can not be empty'],
    minlength: [4, "Username must be at least 4 characters long"],

 },
    password: {
        type: String,
        required: [true, "Please fill the password"],
        minlength: [6, "Password, at least needs 6 letters"],

 }
,

profileimage:{
   type:String,
   default:"",
},

post: [{type: mongoos.Types.ObjectId, ref:'Post'}],
comments: [{type: mongoos.Types.ObjectId,ref:"Comment"}],
likes: [{type:mongoos.Types.ObjectId,ref:'Post'}],
saved: [{type: mongoos.Types.ObjectId,ref:'Post'}],

followers : [
   {
         type: mongoos.Schema.Types.ObjectId,
         ref: 'User'
   },
] ,

following :[{
   type: mongoos.Schema.Types.ObjectId,
   ref: 'User',
}],

bio:{
   type:String,
   default:""
}

})

module.exports= mongoos.model('User',userSchema )