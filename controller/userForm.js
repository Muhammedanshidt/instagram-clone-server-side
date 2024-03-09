
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



    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    console.log(email);
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: configJs.config.user,
        pass: "ubfb bkcw awmr jqdd", // Consider using environment variables
      },
    });

    // Generate OTP
    const generatedOtp = () => Math.floor(100000 + Math.random() * 900000);
    const otp = generatedOtp();

    // Sign OTP with JWT
    const jwtOtp = jwt.sign({ otp }, process.env.JWT_SECRET || "defaultSecret");

    // Set cookie with JWT
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
      }
    });

    // Return success message
    return res.status(200).json({ message: "OTP sent successfully" });

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

  const { userData, otp  } = req.body
  console.log(userData,"userdata");
  const token = req.cookies.otpToken;


  if (!token) {
    return res.status(400).json({ message: 'OTP token not found' });
  }

  let decodedToken ;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  } 
// console.log(decodedToken.otp);


  if (decodedToken.otp === otp) {

    const userCreate = await userModel.create(userData);
    return res.status(200).json({ message: 'OTP verified', success: true });
  } else {
    return res.status(400).json({ message: 'OTP does not match' });
  }

}



module.exports = {
  userSignUp,
  userRegByVerification
}
