const mongoos = require( 'mongoose' );

const  postSchema = new mongoos.Schema({
    imgUrl:{
        type:"string",
        required:true,
    },
    caption:{
        type:'string',
    },
    userId:{
        type : mongoos.Types.ObjectId , 
        ref : "User"

    },
    like:[{type : mongoos.Types.ObjectId , ref : "User"}],
    comments : [
      {  
        userId : { type: mongoos.Types.ObjectId ,ref :"User"},
        postId: {type: mongoos.Types.ObjectId ,ref :"Post"},
          text : String,
          createdAt : {
              type : Date ,
              default : ()=>new Date()
          }
      }
    ],
    saveBy: [{type : mongoos.Types.ObjectId , ref : "User"}]
})
module.exports= mongoos.model('Post',postSchema)
