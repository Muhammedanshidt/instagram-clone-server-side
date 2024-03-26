const mongoos = require( 'mongoose' );

const  postSchema = new mongoos.Schema({
    imgUrl:{
        type:"string",
        required:true,
    },
    caption:{
        type:'string',
    },
    like:{
        userId:[{type : mongoos.Types.ObjectId , ref : "User"}],
        count: {
            type : Number ,
            default : 0
        }
    },
    comments : [
      {  
          userId : { type: mongoos.Types.ObjectId ,ref :"User"},
          text : String,
          createdAt : {
              type : Date ,
              default : ()=>new Date()
          }
      }
    ],
    save: [{type : mongoos.Types.ObjectId , ref : "User"}]
})
module.exports= mongoos.model('Post',postSchema)
