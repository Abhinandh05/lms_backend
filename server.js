import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/database.js';
import userRoute from './user/user.route.js';
import courseRoute from "./course/course.route.js";
import lectureRoute from "./lecture/lecture.route.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import userFormRoutes from "./userForm/userForm.route.js";
import courseProgressRoute from "./courseProgress/courseProgress.route.js";
import enrollmentRoute from "./enrollment/enrollment.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true, // Allow any origin in development
    credentials: true
}));
app.use(globalLimiter);


// Database connection
await connectDB();

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/video", lectureRoute);
app.use("/api/v1/form", userFormRoutes);
app.use("/api/v1/course-progress", courseProgressRoute);
app.use("/api/v1/enrollment", enrollmentRoute);

// Root route
app.get("/", (_, res) => {
    res.send("API is working and PostgreSQL Connected ✅");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// Start server
// Start server only if not in production (Vercel handles it otherwise)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
}

export default app;