const jwt= require('jsonwebtoken');
const md5= require('md5');
const sequelize= require('../database/connection');
const jwtPass = process.env.JWT_PASS;

//-------------------------------------MIDDLEWARE---------------------------------------//
const hashPassword= (req, res,next) => {
    let contrasenia= req.body.contrasenia;
    req.body.contrasenia= md5(contrasenia);
    next();
}

const authenticateUser= (req, res, next) => { 
    try {
        const token= req.headers.authorization.split(' ')[1];
        const verifyToken= jwt.verify(token, jwtPass);
        if (verifyToken) {
            req.user= verifyToken;
            return next();
        }
    }
    catch(err) {
        res.status(400).json({message: 'Header must contain JWT to verify identity'});
    }
}

const isAdmin= (req, res, next) => { 
    try {
        const token= req.headers.authorization.split(' ')[1];
        const verifyToken= jwt.verify(token, jwtPass);
            if (verifyToken.admin=== '1') {
                return next()
            }
        throw new Error();
    }
    catch(err) {
        res.status(403).json({message: 'Forbidden'});
    }

}


module.exports= {
    hashPassword,
    authenticateUser,
    isAdmin
}