const { config } = require("dotenv");
const userModel = require("../SchemaModel.js/userModel");
const nodemailer = require("nodemailer")
const configJs = require("../config/config")
const jwt = require("jsonwebtoken");

config();


// USER SIGNUP
const userSignUp = async (req, res) => {


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
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: configJs.config.user,
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
      from: configJs.config.user,
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
  console.log(Useremail)
  console.log("nijmn");
  try {
  const existingUser = await userModel.findOne({ email:Useremail});
  const token = req.cookies.token;  
  // console.log(token)

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


const getUser = async(req,res) =>{

const data = await userModel.find()

// console.log(data);

}


module.exports = {
  userSignUp,
  userRegByVerification,
  userLogin,
  userAccess,
  getUser
}
