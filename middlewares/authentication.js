const authentication = (req,res,next) => {
    const token = req.cookies.token;

    if(!token) {
        res.status(401).send("access denide")
    } else{
        next();
    }

}
module.exports = {authentication};