const jwt = require('jsonwebtoken');

// Middleware to authenticate users with JWT
exports.authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided' });
        }
        
        // Extract the token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided' });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
