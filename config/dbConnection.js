const mongoose = require("mongoose");

console.log("hellow we are here")

const dbConnection=()=>{

    mongoose.connect(process.env.DB_URL)
    .then(()=>console.log("successfully connected to mongodb")).catch((err)=>console.log(err))
};

module.exports = dbConnection


// const monngoos = require("mongoose");

// const dbConnection = () => {

//     monngoos.connect(process.env.DB_URL)
//     .then(()=> console.log('Database Connected'))
// .catch((err)=>console.error(`Error Connecting to Database ${err}`))
// }

// module.exports=dbConnection;


