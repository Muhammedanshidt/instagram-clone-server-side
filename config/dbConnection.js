const mongoose = require("mongoose");

console.log("hellow we are here")

const dbConnection = () => {

    mongoose.connect(process.env.DB_URL)
        .then(() => console.log("successfully connected to mongodb", mongoose.connection.host)).catch((err) => console.log(err))
};

module.exports = dbConnection

// PORT = https://instagram-clone-server-side-thqi.onrender.com





