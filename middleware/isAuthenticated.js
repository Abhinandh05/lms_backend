import jwt from "jsonwebtoken";
import User from "../user/user.model.js";


const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }


        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role']
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = user;
        req.id = decoded.id;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

export default isAuthenticated;