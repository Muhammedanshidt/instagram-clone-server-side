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
  // console.log(otp);
  // console.log(token,'token');

  if (!token) {
    return res.status(404).json({ message: 'OTP token not found' });
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  //  console.log(decodedToken.otp,otp);
  // console.log(typeof(otp));
  // console.log(typeof(decodedToken.otp));

  if (decodedToken.otp === parseInt(otp)) {
    const userCreate = await userModel.create(userData);
    return res.status(200).json({ message: 'OTP verified', success: true });
  } else {
    return res.status(400).json({ message: 'OTP does not match' });
  }

}

//sample for user getting

// const getUserData  = async (req,res)=>{
//   const user = await userModel.find()
//     res.send(user)
// }

// login

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const findUser = await userModel.findOne({ email: email });
  console.log(findUser);

  if (!findUser) {
    res.status(401).json({
      success: false,
      message: "User not found",
    });
    return;
  }
  // console.log(findUser.password +" hey "+ password);
  if (password === findUser.password) {
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
    })
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid Password"
    })
  }
  const accessToken = await jwt.sign(
    { email: findUser.email, id: findUser._id }, process.env.JWT_SECRET,
    // {expiresIn:'1h'}
  )
  console.log(accessToken);
  console.log("login success");

  // res.cookie("loginToken",accessToken)

  res.status(200).json({
    success:true,
    message:"successful login",
    accessToken,
    userid:findUser.id
  })




}


module.exports = {
  userSignUp,
  userRegByVerification,
  userLogin
}
