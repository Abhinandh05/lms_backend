
import { Op } from "sequelize";
import Enrollment from "../enrollment/enrollment.model.js";

// Middleware to check if user has access to a course
export const checkCourseAccessMiddleware = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.id; // From auth middleware

        // Check if user has active enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                user_id: userId,
                course_id: courseId,
                is_active: true,
                [Op.or]: [
                    { expiry_date: null },
                    { expiry_date: { [Op.gte]: new Date() } },
                ],
            },
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You don't have access to this course. Please contact admin.",
            });
        }

        // Attach enrollment to request for use in controller
        req.enrollment = enrollment;
        next();

    } catch (error) {
        console.error("Error checking course access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify course access!",
        });
    }
};

// Middleware to allow access to free preview lectures OR enrolled users
export const checkLectureAccessMiddleware = async (req, res, next) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        // Check enrollment
        const enrollment = await Enrollment.findOne({
            where: {
                user_id: userId,
                course_id: courseId,
                is_active: true,
                [Op.or]: [
                    { expiry_date: null },
                    { expiry_date: { [Op.gte]: new Date() } },
                ],
            },
        });

        if (enrollment) {
            req.hasFullAccess = true;
            return next();
        }

        // Check if lecture is free preview
        const lecture = await Lecture.findByPk(lectureId);
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!",
            });
        }

        if (lecture.isPreviewFree) {
            req.hasFullAccess = false;
            return next();
        }

        // No access
        return res.status(403).json({
            success: false,
            message: "This lecture requires course enrollment. Please contact admin.",
        });

    } catch (error) {
        console.error("Error checking lecture access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify lecture access!",
        });
    }
};