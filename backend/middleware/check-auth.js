// check sif a token is attached...
// validate token...
const jwt = require('jsonwebtoken');

// middleware simple returns a function...
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, 'this-should-be-a-very-long-string-which-encodes-my-secret-has-lololololol');
        next();
    } catch (error) {
        res.status(401).json({
            error: "Authentication Failed - No Token"
        })
    }
}
