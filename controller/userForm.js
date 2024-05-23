const { config } = require("dotenv");
const userModel = require("../SchemaModel.js/userModel");
const postSchema = require("../SchemaModel.js/postModel")
const nodemailer = require("nodemailer")
const configJs = require("../config/configemail")
const jwt = require('jsonwebtoken');
// const jwtDecode = require('jwt-decode');

config();
console.log("hai in sign");



// USER SIGNUP
const userSignUp = async (req, res) => {
  console.log("object")

  try {
    const { email } = req.body;

    console.log(req.body);

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    console.log(existingUser);
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    console.log(email);


    // Create transporter
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


    res.cookie("otpToken", jwtOtp);

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP",
      text: `Your OTP is: ${otp}`,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Failed to send verification code");
      } else {
        return res.status(200).json({ message: "Verification Code Sent" });
      }
    });

  } catch (error) {
    console.log("Error creating user:", error);
    return res.status(500).json({
      alert: error.message,
      message: "Internal server error. Please try again later",
    });
  }
};


// USER REGISTER

const userRegByVerification = async (req, res) => {

  console.log("jggh");

  const { userData, otp } = req.body
  console.log(userData, "userdata");
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
    const userCreate = await userModel.create(userData);
    return res.status(200).json({ message: 'OTP verified', success: true });
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

    console.log(process.env.JWT_SECRET);

    res.cookie("token", accessToken,{
      httpOnly :true ,
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
    console.log(req.cookies);
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        successful: false
      });
    }

    const secretKey = process.env.JWT_SECRET;
    const decodedToken = jwt.verify(token, secretKey);

    // Log the token for debugging purposes
    console.log(token);
    console.log(decodedToken);
    console.log("-----------");
    console.log(decodedToken.data.id);

    const data = await userModel.findById(decodedToken.data.id)

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
    console.log(userId);
    console.log(data);

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
  console.log("profile");
  try {
    let url = req.body.imageUrl
    let email = req.body.email
    console.log(url);
    const updateProfile = await userModel.findOneAndUpdate(
      { email: email },
      { $set: { profileimage: url } },
      { new: true }
    )
    await updateProfile.save(
      res.status(200).json(updateProfile)
    )

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" })

  }

}

// get all sign users


const getUser = async (req, res) => {

  const data = await userModel.find()

  res.status(200).send(data)

  console.log(data, "uyyuyuuhy");

}

const userFindByName = async (req, res) => {

  const { username } = req.body
  console.log(username, "uuuucurrent level");

  if (!username) {
    return res.status(400).json({ message: "No Username provided!" })
  } else {
    const founduser = await userModel.findOne({ username: username })
    // console.log(founduser);
    // console.log("------------------------");
    res.status(200)
      .send(founduser)
  }
}

// findUserById

const userFindById = async (req, res) => {
  const id = req.params.id; // Correctly extract id from req.params
  // console.log(id, "11111111111111111111111111111111111111111111111111111111111");
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
  // console.log(owner);
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

  console.log(req.body);

  const { userId } = req.body
  const { currentUserId } = req.body

  // console.log(userId);
  // console.log(currentUserId);
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
      console.log(followers);

      const findFollowers = await userModel.find({ _id: { $in: followers } });
      console.log(findFollowers);
      return res.status(200).json(findFollowers)

    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Error getting Followers" })
    }

  } else {

    console.log("no followers");
  }
}

// get followings


const getFollowing = async (req, res) => {

  if (req.query.owner && req.query.owner.followers) {

    try {
      const following = req.query.owner.following;
      const findFollowing = await userModel.find({ _id: { $in: following } });
      // console.log(findFollowing);
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

  console.log(id);
  console.log(caption);
  console.log(imageUrl);

  try {
    const createPost = await postSchema.create({
      caption: caption,
      userId: id,
      imgUrl: imageUrl
    });

    console.log(id);

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
// const user = await userModel.findById(id)
// console.log(user);



const getUserPost = async (req, res) => {
  const { ownerId } = req.query
  console.log(ownerId);

  try {
    const posts = await postSchema.find({ userId: ownerId })
    // console.log(posts,'hjgfdghd');
    res.status(201).json(posts)

  } catch (error) {
    console.log(error);
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
  console.log("oooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
  const { Id } = req.query;

  console.log(Id, '=============');


  try {
    const postData = await userModel.findById(Id).populate("post");
    console.log("------------------------------------------");
    console.log(postData, "postdata");
    console.log("------------------------------------------");

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

    console.log("user", ownerId);
    console.log("post", postId);
    console.log("comment", commentvalue);

    await postSchema.findByIdAndUpdate(postId, { $push: { comments: { userId: ownerId, text: commentvalue, postId: postId } } });

    const updatePost = await postSchema.findById(postId)
    const lastCommentId = updatePost.comments[updatePost.comments.length - 1]._id;

    console.log(lastCommentId, "lastcomment");
    await userModel.findByIdAndUpdate(ownerId, { $push: { comments: lastCommentId } })
    // const postData = await postSchema.findById(postId).populate('comments.userId');
    // const userData = await userModel.findById(ownerId).populate('comments.userId')
    const postData = await postSchema.findById(postId).populate('userId comments.userId comments.postId comments.userId.comments');

    // console.log(';WUIFGUTV');
    // console.log(postId.comments);
    // console.log(postData, "hai");


    res.status(201).json({ message: "success", postData: postData });

  }
  catch (err) {
    res.status(400).json({ error: "Bad Request" })
  }



}
const getUserSearch = async (req, res, next) => {
  try {
    const searchText = req.query.userName || "";
    console.log(searchText);
    const searchRegex = new RegExp({ searchText }, 'i');
    const lisitng = await userModel.find({ username: searchRegex });

    // if (!lisitng.length) {
    //   const err = new Error("No users found!");
    //   err.statusCode = 404; 
    //   throw err;
    // }
    // console.log(lisitng);


    res.status(200).json(lisitng);
  } catch (err) {
    next(err);
  }
};


const getPost = async (req, res) => {
  console.log("from post");
  try {
    const { currentPost } = req.query
    const posts = await postSchema.findById(currentPost).populate('userId comments.userId comments.postId');
    // const  user=await postSchema.findById(currentPost).populate('comments.userId comments.postId');
    // const  posts=await postSchema.findById(currentPost).populate('comments');
    console.log("d");

    console.log(posts);
    res.status(200).json(posts);



  } catch (error) {
    console.log(error);
  }
}

const userNameEdit = async (req, res) => {
  console.log("Handling username edit request");
  const { nameUser, nameFull, email } = req.body;
  console.log("New username:", nameUser);
  console.log("New fullname:", nameFull);
  console.log("New email:", email);
  try {

    const update = await userModel.aggregate([
      { $match: { email: email } }, { $set: { fullname: nameFull, username: nameUser } }
    ])

    const ckeck = await userModel.findOne({ email: email })

    console.log(ckeck)
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

    // console.log("----------------------------");
    // console.log(Data);
    // console.log("|||||||||||||||||||||||||||||||||");

    res.status(200).json(Data)

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

const editCaption = async (req, res) => {
  try {
    const { text, userId, postId } = req.body

    console.log(text);
    console.log(userId)
    console.log(postId)


    const data = await postSchema.findByIdAndUpdate(postId, { caption: text }, { new: true })
    // await  userModel.findByIdAndUpdate(userId,{po})
    res.status(201).send(data)

  } catch (error) {
    console.log(error);
  }
}

const deletePost = async (req, res) => {
  //   console.log("----------------------------");

  console.log(req.params);

  try {
    // const 
    // const postId = req.params.postId
    // console.log(postId);
    const { userId, postId } = req.params

    const data = await postSchema.findByIdAndDelete(postId) && await userModel.findByIdAndUpdate(userId, { $pull: { post: postId } })
    res.status(200).json({ successful: "Deleted Successfully", data: data });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" })
  }
}

const deleteComment = async (req, res) => {
  console.log("uiiyggyi");
  // console.log(req.params, "comment delete params");
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

  console.log(req.body);
  console.log("abc");
  const { editedComment, postId, commentId } = req.body

  // await postSchema.findByIdAndUpdate(postId,{$pull :{comments:{text:editedComment}}})
  const data = await postSchema.findOneAndUpdate(
    { _id: postId, 'comments._id': commentId },
    { $set: { 'comments.$.text': editedComment } }
  );

  res.status(200).json({ data: data })


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
  getUserPost,
  getOwnPost,
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
  editComment
};
