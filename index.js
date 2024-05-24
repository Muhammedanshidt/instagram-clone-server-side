const app = require("./app")
const dotenv = require("dotenv");
const dbConnection = require("./config/dbConnection")


dotenv.config({ path: "./config/config.env" });

dbConnection()

app.listen(3003, () => {
    console.log(`server is up on ${process.env.PORT}`);
})




