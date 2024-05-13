const mongoose = require("mongoose");

console.log("hellow we are here")

const dbConnection = () => {

    mongoose.connect("mongodb+srv://muhammedanshidht:Zwcbu2AgCU0PGbrL@cluster0.oozpamy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        .then(() => console.log("successfully connected to mongodb", mongoose.connection.host)).catch((err) => console.log(err))
};

module.exports = dbConnection




