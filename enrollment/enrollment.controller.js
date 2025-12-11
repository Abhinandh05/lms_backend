// Import models directly from their source files
import Enrollment from "../enrollment/enrollment.model.js";
import User from "../user/user.model.js";
import Course from "../course/course.model.js";
import Lecture from "../lecture/lecture.model.js";
import { Op } from "sequelize";

// ========== ADMIN: Grant course access to a student ==========
export const grantCourseAccess = async (req, res) => {
    try {
        const { userId, courseId, expiryDate, paymentStatus, notes } = req.body;
        const adminId = req.id; // From auth middleware

        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "User ID and Course ID are required!",
            });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }

        // Check if course exists
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
            where: { user_id: userId, course_id: courseId },
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "User already has access to this course!",
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            user_id: userId,
            course_id: courseId,
            granted_by: adminId,
            expiry_date: expiryDate || null,
            payment_status: paymentStatus || "paid",
            notes: notes || null,
            is_active: true,
        });

        return res.status(201).json({
            success: true,
            message: "Course access granted successfully!",
            enrollment,
        });

    } catch (error) {
        console.error("Error granting course access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to grant course access!",
            error: error.message,
        });
    }
};

// ========== ADMIN: Revoke course access ==========
export const revokeCourseAccess = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        const enrollment = await Enrollment.findByPk(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found!",
            });
        }

        enrollment.is_active = false;
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: "Course access revoked successfully!",
        });

    } catch (error) {
        console.error("Error revoking course access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to revoke course access!",
        });
    }
};

// ========== ADMIN: Get all enrollments for a course ==========
export const getCourseEnrollments = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollments = await Enrollment.findAll({
            where: { course_id: courseId },
            include: [
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: User,
                    as: "admin",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            message: "Enrollments fetched successfully!",
            enrollments,
        });

    } catch (error) {
        console.error("Error fetching course enrollments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments!",
        });
    }
};

// ========== STUDENT: Get my enrolled courses ==========
export const getMyEnrolledCourses = async (req, res) => {
    try {
        const userId = req.id; // From auth middleware

        const enrollments = await Enrollment.findAll({
            where: {
                user_id: userId,
                is_active: true,
                [Op.or]: [
                    { expiry_date: null },
                    { expiry_date: { [Op.gte]: new Date() } },
                ],
            },
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: [
                        "id",
                        "course_title",
                        "sub_title",
                        "course_thumbnail",
                        "course_level",
                        "category",
                    ],
                    include: [
                        {
                            model: User,
                            as: "creator",
                            attributes: ["name"],
                        },
                    ],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully!",
            courses: enrollments.map((e) => ({
                ...e.course.toJSON(),
                enrollmentDate: e.enrollment_date,
                expiryDate: e.expiry_date,
            })),
        });

    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch enrolled courses!",
        });
    }
};

// ========== STUDENT: Check if I have access to a course ==========
export const checkCourseAccess = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

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

        return res.status(200).json({
            success: true,
            hasAccess: !!enrollment,
            enrollment: enrollment || null,
        });

    } catch (error) {
        console.error("Error checking course access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check course access!",
        });
    }
};

// ========== STUDENT: Get course content (with access check) ==========
export const getCourseContent = async (req, res) => {
    try {
        const { courseId } = req.params;
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

        // Fetch course with lectures
        const course = await Course.findByPk(courseId, {
            include: [
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: [
                        "id",
                        "lectureTitle",
                        "isPreviewFree",
                        // Only include videoUrl if enrolled or free preview
                        ...(enrollment ? ["videoUrl", "publicId"] : []),
                    ],
                    through: { attributes: [] },
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        // Filter lectures based on access
        let lectures = course.lectures;
        if (!enrollment) {
            // Only show free preview lectures
            lectures = lectures.filter((l) => l.isPreviewFree);
        }

        return res.status(200).json({
            success: true,
            message: "Course content fetched successfully!",
            course: {
                ...course.toJSON(),
                lectures,
            },
            hasFullAccess: !!enrollment,
        });

    } catch (error) {
        console.error("Error fetching course content:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content!",
        });
    }
};

// ========== ADMIN: Bulk grant access ==========
export const bulkGrantAccess = async (req, res) => {
    try {
        const { userIds, courseId, expiryDate, paymentStatus } = req.body;
        const adminId = req.id;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !courseId) {
            return res.status(400).json({
                success: false,
                message: "User IDs array and Course ID are required!",
            });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        const enrollments = [];
        const errors = [];

        for (const userId of userIds) {
            try {
                const existingEnrollment = await Enrollment.findOne({
                    where: { user_id: userId, course_id: courseId },
                });

                if (existingEnrollment) {
                    errors.push({ userId, error: "Already enrolled" });
                    continue;
                }

                const enrollment = await Enrollment.create({
                    user_id: userId,
                    course_id: courseId,
                    granted_by: adminId,
                    expiry_date: expiryDate || null,
                    payment_status: paymentStatus || "paid",
                    is_active: true,
                });

                enrollments.push(enrollment);
            } catch (err) {
                errors.push({ userId, error: err.message });
            }
        }

        return res.status(201).json({
            success: true,
            message: `Granted access to ${enrollments.length} users.`,
            enrollments,
            errors: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error("Error bulk granting access:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to bulk grant access!",
        });
    }
};
