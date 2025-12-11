export const isAdmin = async (req, res, next) => {
    try {
        // Check if user exists (set by authentication middleware)
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required. Please login first.",
                success: false
            });
        }

        // Check if user is admin or superadmin
        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            return next(); // ✅ User is admin, proceed
        }

        // User is authenticated but not admin
        return res.status(403).json({
            message: "Access denied. Only administrators can access this resource.",
            success: false
        });

    } catch (err) {
        console.error("Admin middleware error:", err);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
};