import Sequelize from "sequelize";
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

let sequelize; 
let authsequelize;

// export const dbConnection = async () => {
//     const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
//         host: process.env.DB_HOST,
//         dialect: 'mssql'
//     });
//     try {
//         await sequelize.authenticate(); // Ensure the connection is established
//         console.log('Connection has been established successfully.');
//         return sequelize;
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//         throw error; // Re-throw the error to handle it properly
//     }
// };

export const dbConnection = async () => {
    if (!sequelize) {
        sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mssql'
        });

        try {
            await sequelize.authenticate();
            console.log('Database connected successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
    return sequelize;
};

export const authDbConnection = async () => {
    if(!authsequelize) {
        authsequelize = new Sequelize(process.env.AUTH_DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mssql'
        });

        try {
            await authsequelize.authenticate();
            console.log('Auth Database Conencted Successfully.');
        } catch (error) {
            console.log('Unable to Connect to the database:', error);
        }
    }
    return authsequelize;
}

export const authsequelizeInstance = () => {
    if(!authsequelize) {
        throw new Error("Sequelize instance is not initialized. Call dbConnection() first.");
    }
    return authsequelize;
}

export const getSequelizeInstance = () => {
    if (!sequelize) {
        throw new Error("Sequelize instance is not initialized. Call dbConnection() first.");
    }
    return sequelize;
};