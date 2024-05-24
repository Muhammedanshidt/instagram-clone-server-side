const express = require('express');
const cors = require('cors');
const cookies = require("cookie-parser")
const bodyParser = require('body-parser')
const app = express();




app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookies());

app.use(bodyParser.json());

const corsOptions = {
  origin: 'https://instagram-clone-client-side.vercel.app',
  credentials: true,
};


app.use(cors(corsOptions))




//user area
const routeSingUp = require("./Routes/UserRoute");
app.use("/user", routeSingUp);

// const routeMessage = require("./Routes/MessageRoute")
// app.use("/message", routeMessage);




module.exports = app;