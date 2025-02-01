import express from "express";
import dotEnv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { authDbConnection, dbConnection } from "./db.js";

// routes
import adminRouter from "./routes/admin.js";
import authRouter from "./routes/auth.js";

const app = express();
dotEnv.config({ path: "./.env" });

app.use(cors({
    origin: '*'
}));

app.use(helmet());

// const limit = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 100,
//     message: "Too many request! Please try again later"
// });

// app.use(limit);

app.use(morgan("dev"));

app.use(express.json({ limit: '10kb' }));

(async () => {
    try {
        // Wait for the database to connect
        await dbConnection();
        await authDbConnection();

        // Define routes after DB is connected
        app.use('/api', [adminRouter, authRouter]);

        const PORT = process.env.PORT || 5000;

        // Start the server
        app.listen(PORT, () => console.log(`Server is running on PORT - ${PORT}`));
    } catch (error) {
        console.error("Failed to initialize the application:", error);
        process.exit(1); // Exit the application if DB connection fails
    }
})();