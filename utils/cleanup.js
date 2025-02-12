import { userConnections } from '../controllers/auth.js';  


const cleanupExpiredConnections = () => {
    const now = Date.now(); 
    userConnections.forEach((value, token) => {
        if (value.lastUsed && now - value.lastUsed > 60 * 60 * 1000) {  
            console.log(`Removing expired connection for token: ${token}`);
            userConnections.delete(token); 
        }
    });
};

setInterval(cleanupExpiredConnections, 60 * 60 * 1000); 

export default cleanupExpiredConnections;