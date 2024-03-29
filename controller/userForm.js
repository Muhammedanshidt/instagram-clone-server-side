const { config } = require("dotenv");
const userModel = require("../SchemaModel.js/userModel");
const nodemailer = require("nodemailer")
const configJs = require("../config/configemail")
const jwt = require("jsonwebtoken");

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
      service:"gmail",
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

  res.cookie("token", accessToken);

  return res.status(200).json({
    success: true,
    message: "successful login",
    accessToken,
    userid: findUser.id
  });
};

// user access

const userAccess = async(req,res)=>{
  const Useremail  = req.body.email;
  // console.log(Useremail)

  
  try {
  const existingUser = await userModel.findOne({ email:Useremail});
   
  console.log(existingUser)

  if (!existingUser ) {
    
    return res.status(401).json({ successful: false, error: "Unauthorized" });
  }

  res.status(200).json({
    Data: existingUser,
    successful: true
  });

    
  } catch (error) {
    res.status(500).json({
    message:'server got an issue',
    successful: false
  });
  }
 
}

// user bio setting
const bioRes =  async (req , res) =>{
  try{
let data = req.body.bio ;
let userId = req.body.userData._id
        console.log(userId);
        console.log(data);

        const updateBio = await userModel.findByIdAndUpdate(
          userId,
         {bio: data},
         {new :true },
        );
        await updateBio.save()
        res.status(200).json(updateBio);
  }catch(err){
       console.log(err)
       res.status(500).json({message:"server error"})
  }
}

// user logout
const logBack = (req,res) => {
  try{
  res.clearCookie("token").json({ message: "Logged out successfully" });
  }catch(error){
    res.status(401).json({ message: 'You are not logged in' })
  }
  }

  
  // profile pic setting
  const userProfileImage = async (req,res) => {
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
      res.status(500).json({message:"server error"})

    }

  }

  // get all sign users


const getUser = async(req,res) =>{

const data = await userModel.find()
res.status(200).send(data)

// console.log(data);

}

const userFindByName =  async (req , res)=>{
  const {username} = req.body
  // console.log(username);
  
  if(!username){
    return res.status(400).json({ message : "No Username provided!" })
  }else{
    const founduser = await userModel.findOne({username:username})
    console.log(founduser);
    console.log("------------------------");
        res.status(200)
        .send(founduser)
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
  userFindByName
}
