// const nodemailer = require ("nodemailer")

// module.exports = async (email,subject,text) => {
//     try {
//         const transport = nodemailer.createTransport({
//             host:process.env.HOST,
//             service:process.env.SERVICE,
//             port:Number(process.env.PORT),
//             secure:Boolean(process.env.SECURE),
//             auth:{
//                 user:process.env.USER,
//                 pass:process.env.PASSWORD
//             }
//         })
//         await transport.sendMail({
//             from:process.env.USER,
//             to:email,
//             subject:subject,
//             text:text
//         });
//         console.log("Email send success ")
//     } catch (error) {
//         console.log(`Error sending email ${error}`)
        
//     }

// }