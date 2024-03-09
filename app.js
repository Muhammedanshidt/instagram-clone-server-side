const express =  require('express');
const cors = require("cors")
const cookies = require("cookie-parser")
const app = express();

app.use(express.json())

app.use(cookies());

app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}));


//user area
const routeSingUp = require("./Routes/UserRoute");
app.use("/user",routeSingUp);




module.exports = app;