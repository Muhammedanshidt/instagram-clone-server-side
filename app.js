const express =  require('express');
const cors = require("cors")
const cookies = require("cookie-parser")
const app = express();

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(cookies());

// app.use(cors({
//         origin: "https://instagram-clone-client-side.vercel.app",
//         redentials: true,
// }))
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}));

// app.use(cors())

//user area
const routeSingUp = require("./Routes/UserRoute");
app.use("/user",routeSingUp);





module.exports = app;