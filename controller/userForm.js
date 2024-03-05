// const { config } = require("dotenv");
// const userModel = require("../SchemaModel.js/userModel");
// const nodemailer = require("nodemailer")
// const configJs = require("../config/config")

//  const transporter = nodemailer.createTransport({

//   service:"gmail",
//   auth:{
//     user:configJs.email, // generated ethereal
//     pass:configJs.password// generated eth

//   }

//  })

//  const generatedOtp = () => {
//   return Math.floor(100000 + Math.random() * 900000)
// }

// const userSignUp = async (req, res) => {
//   try {
//       console.log(req.body)

//       const {email} = req.body

//       const findEmail = await userModel.findOne({email:email});

//       if (findEmail) {
//           res.status(400).send("User already exists");
//           return;
//       }

//       const verificationCode = generatedOtp();
//       const mailOptions = {
//               from:configJs.user,
//               to:email,
//               subject:"otp",
//               text:verificationCode
//       };

//       transporter.sendMail(mailOptions, (error) => {
//         if (error) {
//           console.error(error);
//           return res.status(500).send('Failed to send verification code');
//         }
//       });

//       const newUser = await userModel.create(req.body);
//       if(newUser){
//         res.status(200).json({
//           message: "Successful registration",
//           success: true
//       });
//       }

//   } catch (error) {
//       console.log("Error creating user:", error);
//       return res.status(500).json({
//           alert: error.message,
//           message: "Internal server error. Please try again later",
//       });
//   }
// };
  
//   module.exports ={
//     userSignUp
//   }

const { config } = require("dotenv");
const userModel = require("../SchemaModel.js/userModel");
const nodemailer = require("nodemailer")
const configJs = require("../config/config")

config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:" anshidkhanak@gmail.com",
    pass: "ubfb bkcw awmr jqdd",
  }
});

const generatedOtp = () => {
  return Math.floor(100000 + Math.random() * 900000)
}

const userSignUp = async (req, res) => {
  try {
    console.log(req.body)

    const { email } = req.body

    const findEmail = await userModel.findOne({ email: email });

    if (findEmail) {
      return res.status(400).send("User already exists");
    }

    const verificationCode = generatedOtp();
    const mailOptions = {
      from: configJs.config.user,
      to: email,
      subject: "otp",
      text: verificationCode.toString() // Convert to string
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Failed to send verification code');
      }
    });

    const newUser = await userModel.create(req.body);
    if (newUser) {
      return res.status(200).json({
        message: "Successful registration",
        success: true
      });
    }

  } catch (error) {
    console.log("Error creating user:", error);
    return res.status(500).json({
      alert: error.message,
      message: "Internal server error. Please try again later",
    });
  }
};

module.exports = {
  userSignUp
}
