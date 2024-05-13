const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        conversationId:{
            type:String,
            ref:"Conversation",

        },
        sender:{
            type:mongoose.Schema.Types.ObjectId, 
        },
        text:{
            type:String,
        },
        // isRead:{
        //     type:Boolean,
        //     default:false
        // }

    },
    { timestamps:true }
);

module.exports = mongoose.model("Message", MessageSchema)