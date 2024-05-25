const { config } = require("dotenv");
const userModel = require("../SchemaModel.js/userModel");
const postSchema = require("../SchemaModel.js/postModel")
const nodemailer = require("nodemailer")
const configJs = require("../config/configemail")
const jwt = require('jsonwebtoken');
// const jwtDecode = require('jwt-decode');

config();

// USER SIGNUP
const userSignUp = async (req, res) => {
  
  try {
    const { email } = req.body;
    

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists");
    }
 

    // Create transporter mail

    const transporter = nodemailer.createTransport(
      {
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: "ubfb bkcw awmr jqdd",
        },
      });


    // Generate OTP
    const generatedOtp = () => Math.floor(100000 + Math.random() * 900000);
    const otp = generatedOtp();


    const jwtOtp = jwt.sign({ otp }, process.env.JWT_SECRET);
 

    res.cookie("otpToken", jwtOtp, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 100000
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP",
      text: `Your OTP is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {

        return res.status(500).send("Failed to send verification code");
      } else {
        return res.status(200).json({ message: "Verification Code Sent" });
      }
    });

  } catch (error) {

    return res.status(500).json({
      alert: error.message,
      message: "Internal server error. Please try again later",
    });
  }
};


// USER REGISTER

const userRegByVerification = async (req, res) => {



  const { userData, otp } = req.body

  const token = req.cookies.otpToken;



  if (!token) {
    return res.status(404).json({ message: 'OTP token not found' });
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }


  if (decodedToken.otp === parseInt(otp)) {
    try{
    const userCreate = await userModel.create(userData);
    return res.status(200).json({ message: 'OTP verified', success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error. Please try again later' });
    }
  } else {
    return res.status(400).json({ message: 'OTP does not match' });
  }

}


const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const findUser = await userModel.findOne({ email: email });

    if (!findUser) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (password !== findUser.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      });
    }

    const accessToken = jwt.sign(
      { email: findUser.email, id: findUser._id }, process.env.JWT_SECRET
    );

    

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });


    return res.status(200).json({
      success: true,
      message: "successful login",
      accessToken,
      userid: findUser.id
    });
  } catch (err) {
    console.log(err);
  }
};

// user access

const userAccess = async (req, res) => {
  try {
    
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        successful: false
      });
    }

    const secretKey = process.env.JWT_SECRET;
    const decodedToken = jwt.verify(token, secretKey);

    

    const data = await userModel.findById(decodedToken?.id)



    // Send the token in the response
    res.status(200).json({
      data: token,
      decode: data,
      successful: true
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      message: 'Server encountered an issue',
      successful: false
    });
  }
};








// user bio setting
const bioRes = async (req, res) => {
  try {
    let data = req.body.bio;
    let userId = req.body.userData._id

    const updateBio = await userModel.findByIdAndUpdate(
      userId,
      { bio: data },
      { new: true },
    );
    await updateBio.save()
    res.status(200).json(updateBio);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "server error" })
  }
}

// user logout
const logBack = (req, res) => {
  try {
    res.clearCookie("token").json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(401).json({ message: 'You are not logged in' })
  }
}


// profile pic setting
const userProfileImage = async (req, res) => {
  try {
    let url = req.body.imageUrl
    let email = req.body.email

    const updateProfile = await userModel.findOneAndUpdate(
      { email: email },
      { $set: { profileimage: url } },
      { new: true }
    )
    await updateProfile.save(
      res.status(200).json(updateProfile)
    )

  } catch (error) {

    res.status(500).json({ message: "server error" })

  }

}

// get all sign users


const getUser = async (req, res) => {

  const data = await userModel.find()

  res.status(200).send(data)



}

const userFindByName = async (req, res) => {

  const { username } = req.body


  if (!username) {
    return res.status(400).json({ message: "No Username provided!" })
  } else {
    const founduser = await userModel.findOne({ username: username })

    res.status(200)
      .send(founduser)
  }
}

// findUserById

const userFindById = async (req, res) => {
  const id = req.params.id; // Correctly extract id from req.params

  try {
    const user = await userModel.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

// following

const userFollow = async (req, res) => {
  const { user } = req.body
  const { owner } = req.body

  try {
    const following = await userModel.findById(user);
    if (!following) {
      return res.status(400).send('no user id')
    }
    if (following.followers.includes(owner)) {
      return res.status(409).send('User already follows this user')
    }
    following.followers.push(owner);
    await following.save();
    await userModel.findByIdAndUpdate(owner, { $addToSet: { following: user } });
    res.status(201).json(following)
  }
  catch (err) {
    console.log(err);
    res.status(500).send('server error')
  }
}

// unfollow

const userUnfollow = async (req, res) => {



  const { userId } = req.body
  const { currentUserId } = req.body

  try {

    await userModel.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });
    await userModel.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to unfollow user" });
  }
};

// get followers


const getFollowers = async (req, res) => {
  if (req.query.owner && req.query.owner.followers) {
    try {
      const followers = req.query.owner.followers;


      const findFollowers = await userModel.find({ _id: { $in: followers } });

      return res.status(200).json(findFollowers)

    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Error getting Followers" })
    }

  } else {


  }
}

// get followings


const getFollowing = async (req, res) => {

  if (req.query.owner && req.query.owner.followers) {

    try {
      const following = req.query.owner.following;
      const findFollowing = await userModel.find({ _id: { $in: following } });

      return res.status(200).json(findFollowing)

    }
    catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Server Error' })
    }
  }
}

// user post photo

const creatPost = async (req, res) => {
  const { caption } = req.body
  const { id } = req.body
  const { imageUrl } = req.body


  try {
    const createPost = await postSchema.create({
      caption: caption,
      userId: id,
      imgUrl: imageUrl
    });

    

    const userUpdate = await userModel.findByIdAndUpdate(
      id,
      { $addToSet: { post: createPost._id } }
    );

    if (userUpdate) {
      return res.status(200).json({ message: 'Post created and user updated' });
    } else {
      return res.status(400).json({ message: 'Failed to create post' });
    }

  } catch (e) {
    console.log('Error in creating a post:', e);
  }

}

const createVideo = async (req, res) => {

  const { caption } = req.body
  const { id } = req.body
  const { videoUrl } = req.body

  try {
    const createVideo = await postSchema.create({
      caption: caption,
      userId: id,
      imgUrl: videoUrl,
      file: "video"
    });



    const userUpdate = await userModel.findByIdAndUpdate(
      id,
      { $addToSet: { post: createVideo._id } }
    );

    if (userUpdate) {
      return res.status(200).json({ message: 'Post created and user updated' });
    } else {
      return res.status(400).json({ message: 'Failed to create post' });
    }

  } catch (e) {
    console.log('Error in creating a post:', e);
  }



}



const getUserPost = async (req, res) => {
  const { ownerId } = req.query


  try {
    const posts = await postSchema.find({ userId: ownerId })

    res.status(201).json(posts)

  } catch (error) {
    console.log(error);
  }
}


// get reels

const getReels = async (req, res) => {


  try {

    const data = await postSchema.aggregate([{ $match: { file: 'video' } }])

    const populateData = await postSchema.populate(data, { path: 'userId' })

      
    res.status(200).send(data)


  } catch (error) {
    console.log(error)

  }

}




// get explore post

const explorePost = async (req, res) => {

  try {

    const data = await postSchema.find().populate("userId")

    res.status(200).send(data)

  } catch (error) {
    console.log(error);
      res.status(400).send(error)
  }
};


// post like

const likeHandler = async (req, res) => {
  try {
    const { ownerId, postId } = req.body;

    const user = await userModel.findById(ownerId);
    const post = await postSchema.findById(postId);


    const Liked = user.likes.includes(postId);

    if (!Liked) {

      await userModel.findByIdAndUpdate(ownerId, { $push: { likes: postId } });
      await postSchema.findByIdAndUpdate(postId, { $push: { like: ownerId } });
    } else {

      await userModel.findByIdAndUpdate(ownerId, { $pull: { likes: postId } });
      await postSchema.findByIdAndUpdate(postId, { $pull: { like: ownerId } });
    }


    const updatedUser = await userModel.findById(ownerId);
    const updatedPost = await postSchema.findById(postId);

    res.status(201).json({ message: "success", data: { user: updatedUser, post: updatedPost } });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// own acconunt post

const getOwnPost = async (req, res) => {
 
  const { Id } = req.query;




  try {
    const postData = await userModel.findById(Id).populate("post");
   

    if (postData && postData.post) {
      res.status(200).json({ post: postData.post });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// post comment

const commentHandle = async (req, res) => {


  try {
    const { ownerId, postId, commentvalue } = req.body



    await postSchema.findByIdAndUpdate(postId, { $push: { comments: { userId: ownerId, text: commentvalue, postId: postId } } });

    const updatePost = await postSchema.findById(postId)
    const lastCommentId = updatePost.comments[updatePost.comments.length - 1]._id;


    await userModel.findByIdAndUpdate(ownerId, { $push: { comments: lastCommentId } })
   
    const postData = await postSchema.findById(postId).populate('userId comments.userId comments.postId comments.userId.comments');




    res.status(201).json({ message: "success", postData: postData });

  }
  catch (err) {
    res.status(400).json({ error: "Bad Request" })
  }



}
const getUserSearch = async (req, res, next) => {
  try {
    const searchText = req.query.userName || "";

    const searchRegex = new RegExp({ searchText }, 'i');
    const lisitng = await userModel.find({ username: searchRegex });



    res.status(200).json(lisitng);
  } catch (err) {
    next(err);
  }
};


// const getPost = async (req, res) => {
  
//   try {
//     const { currentPost } = req.query
//     const posts = await postSchema.findById(currentPost).populate('userId comments.userId comments.postId');
//     // const  user=await postSchema.findById(currentPost).populate('comments.userId comments.postId');
//     // const  posts=await postSchema.findById(currentPost).populate('comments');
//     console.log("d");

//     console.log(posts);
//     res.status(200).json(posts);



//   } catch (error) {
//     console.log(error);
//   }
// }

const getPost = async (req, res) => {
  
  try {
    const { currentPost } = req.query
    const posts = await postSchema.findById(currentPost).populate('userId comments.userId comments.postId');
    const like = await postSchema.findById(currentPost).populate('like');

    res.status(200).json({ post: posts, likes: like });

  } catch (error) {
    console.log(error);
  }
}

const userNameEdit = async (req, res) => {
    const { nameUser, nameFull, email } = req.body;

  try {

    const update = await userModel.aggregate([
      { $match: { email: email } }, { $set: { fullname: nameFull, username: nameUser } }
    ])

    const ckeck = await userModel.findOne({ email: email })

    res.status(200).json({ update, message: "Update success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
}

const notification = async (req, res) => {
  try {
    const { id } = req.query
    const Data = await userModel.findById(id)
      .populate({
        path: 'post',
        populate: {
          path: 'like',
          model: 'User'
        }
      })
      .populate('followers');

  

    res.status(200).json(Data)

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

const editCaption = async (req, res) => {
  try {
    const { text, userId, postId } = req.body



    const data = await postSchema.findByIdAndUpdate(postId, { caption: text }, { new: true })
    
    res.status(201).send(data)

  } catch (error) {
    console.log(error);
  }
}

const deletePost = async (req, res) => {




  try {

    const { userId, postId } = req.params

    const data = await postSchema.findByIdAndDelete(postId) && await userModel.findByIdAndUpdate(userId, { $pull: { post: postId } })
    res.status(200).json({ successful: "Deleted Successfully", data: data });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" })
  }
}

const deleteComment = async (req, res) => {
  
  try {
    const { userId, commentId, postId } = req.params
    const userData = await postSchema.findByIdAndUpdate(postId, { $pull: { comments: { _id: commentId } } })
    const postData = await userModel.findByIdAndUpdate(userId, { $pull: { comments: commentId } })

    res.status(200).json({ successful: "success", postData, userData })
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to Delete Comment" });
  }
}

const editComment = async (req, res) => {


  const { editedComment, postId, commentId } = req.body

  
  const data = await postSchema.findOneAndUpdate(
    { _id: postId, 'comments._id': commentId },
    { $set: { 'comments.$.text': editedComment } }
  );

  res.status(200).json({ data: data })


}


const savePost = async (req, res) => {


  try {
    const { userId, postId } = req.params

    const user = await userModel.findById(userId)

    const saved = user.saved.includes(postId)


    if (!saved) {

      await postSchema.findByIdAndUpdate(postId, { $push: { saveBy: userId } })
      await userModel.findByIdAndUpdate(userId, { $push: { saved: postId } })
    }
    else {
      await postSchema.findByIdAndUpdate(postId, { $pull: { saveBy: userId } })
      await userModel.findByIdAndUpdate(userId, { $pull: { saved: postId } })
    }
    res.status(201).json({ mesaage: "successfully saved" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'server failed', success: "false" })
  }


}

const getSavePost = async (req, res) => {

  try {
    const { userId } = req.params



    const data = await userModel.findById(userId).populate("saved");

    if (!data) {
      return res.status(404).json({ message: "post not found" });
    }

    res.status(201).json({ message: "success", data: data })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "server error" })
  }
}


module.exports = {
  userSignUp,
  userRegByVerification,
  userLogin,
  userAccess,
  bioRes,
  logBack,
  userProfileImage,
  getUser,
  userFindByName,
  userFindById,
  userFollow,
  userUnfollow,
  getFollowers,
  getFollowing,
  creatPost,
  createVideo,
  getUserPost,
  getOwnPost,
  getReels,
  explorePost,
  likeHandler,
  commentHandle,
  getUserSearch,
  getPost,
  userNameEdit,
  notification,
  editCaption,
  deletePost,
  deleteComment,
  editComment,
  savePost,
  getSavePost
};
