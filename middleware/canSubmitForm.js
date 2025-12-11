import UserForm from "../userForm/userForm.model.js";


export const canSubmitForm = async (req, res, next) => {
    try {
        const userRole = req.user.role; // role from token (student, admin, mentor)
        const userId = req.user.id;

        // ✅ Admins, mentors, and superadmins can always edit or resubmit
        if (["admin", "mentor", "superadmin"].includes(userRole)) {
            return next();
        }

        // ✅ Check if user already submitted
        const existingForm = await UserForm.findOne({ where: { userId } });

        if (existingForm) {
            return res.status(403).json({
                success: false,
                message: "You have already submitted the form. You cannot submit again.",
            });
        }

        next();
    } catch (error) {
        console.error("Form check error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify form submission access.",
        });
    }
};
