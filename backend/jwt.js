const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
   

    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({error:'Unauthorized: No token provided'});
        }

        const token=authHeader.split(" ")[1];
        const decoded =jwt.verify(token, "123456");

        req.user = decoded;
        next();
    }
    catch(err){
        console.log(err);
        res.status(400).json({error:'Invalid Token'});
    }

};

const generateToken = (user) => {

    return jwt.sign(
        { id: user.id, username: user.username }, 
        "123456",
        { expiresIn: '1h' }
    );              
}


module.exports = {jwtAuthMiddleware,generateToken};
