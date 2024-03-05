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

// //Admin area
// const routeAdminIn = require("./routes/AdminIn");
// app.use("/user",routeAdminIn);

// app.use(errorhandler)

module.exports = app;