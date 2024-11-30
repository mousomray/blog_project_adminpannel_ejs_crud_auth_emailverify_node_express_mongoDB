const jwt = require('jsonwebtoken');

const UseruiAuth = (req, res, next) => {
    try {
        const token = req.cookies?.user_auth;
        if (!token) {
            req.flash('err',"You can't access that page without login")
            return res.redirect('/login'); // Redirect to login page if user is not authenticated
        }
        jwt.verify(token, process.env.USER_API_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token. Please login again.' });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error in JWT authentication middleware:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { UseruiAuth }; /// assa