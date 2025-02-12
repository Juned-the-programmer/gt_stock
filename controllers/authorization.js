import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {userConnections} from '../controllers/auth.js'
dotenv.config({ path: './.env' });

const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ status: 401, success: false, message: 'Access Denied. No Token Provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ status: 403, success: false, message: 'Invalid or Expired Token.' });
        }
        const sequelize = userConnections.get(token)?.sequelize;
        if(!sequelize) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
        }

        req.user = user; // Store user information in the request object
        req.sequelize = sequelize;
        next(); // Proceed to the next middleware (or controller)
    });
};

export default authenticateJWT;