// course.controller.js
import { Course, User, Lecture, Enrollment } from "../models/index.js";
import { Op } from "sequelize";
import { deleteMediaFromS3, uploadMediaToS3 } from "../utils/s3Media.js";

export const createCourse = async (req, res) => {
    try {
        const { course_title, category, course_type, course_price } = req.body;

        if (!course_title?.trim() || !category?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Course title and category are needed!",
            });
        }

        // Validation: Paid courses must have a price
        if (course_type === "paid" && (!course_price || course_price <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Paid courses must have a price greater than 0!",
            });
        }

        const existingCourse = await Course.findOne({
            where: { course_title },
        });

        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: "Course title already exists!",
            });
        }

        const course = await Course.create({
            course_title,
            category,
            course_type: course_type || "paid",
            course_price: course_type === "free" ? 0 : (course_price || 0),
            creator_id: req.id,
        });

        return res.status(201).json({
            success: true,
            message: "Course Created Successfully!",
            course,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create course!",
        });
    }
};


export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = "", sortByPrice = "" } = req.query;

        const categoryArray = Array.isArray(categories)
            ? categories
            : categories.split(",").filter((c) => c.trim() !== "");

        const whereClause = {
            is_published: true,
            [Op.or]: [
                { course_title: { [Op.iLike]: `%${query}%` } },
                { sub_title: { [Op.iLike]: `%${query}%` } },
                { category: { [Op.iLike]: `%${query}%` } },
            ],
        };

        if (categoryArray.length > 0) {
            whereClause.category = { [Op.in]: categoryArray };
        }

        const order = [];
        if (sortByPrice === "low") {
            order.push(["course_price", "ASC"]);
        } else if (sortByPrice === "high") {
            order.push(["course_price", "DESC"]);
        }

        const courses = await Course.findAll({
            where: whereClause,
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "course_thumbnail",
                "course_level",
                "course_price",
                "category",
                "course_type", // ✅ Include course_type
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
            ],
            order,
        });

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully.",
            courses,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to search course!",
        });
    }
};


export const getPublishedCourse = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { is_published: true },
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "description",
                "course_thumbnail",
                "course_level",
                "course_price",
                "category",
                "course_type", // ✅ Include course_type
                "creator_id",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["name"],
                },
            ],
        });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No published courses found!",
            });
        }

        return res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        console.error("Error fetching published courses:", error);
        return res.status(500).json({
            success: false,
            message: "Cannot get the published courses!",
        });
    }
};


export const getFreeCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: {
                is_published: true,
                course_type: "free",
            },
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "description",
                "course_thumbnail",
                "course_level",
                "category",
                "course_type",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["name"],
                },
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: ["id", "lectureTitle"],
                    through: { attributes: [] },
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Free courses fetched successfully!",
            courses,
        });
    } catch (error) {
        console.error("Error fetching free courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch free courses!",
        });
    }
};


export const getPaidCourses = async (req, res) => {
    try {
        const userId = req.id;

        // Get all paid courses
        const courses = await Course.findAll({
            where: {
                is_published: true,
                course_type: "paid", // ✅ Only paid courses
            },
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "description",
                "course_thumbnail",
                "course_level",
                "course_price",
                "category",
                "course_type",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["name"],
                },
            ],
        });

        // Check which courses user is already enrolled in
        const enrolledCourseIds = await Enrollment.findAll({
            where: {
                user_id: userId,
                is_active: true,
            },
            attributes: ["course_id"],
        }).then((enrollments) => enrollments.map((e) => e.course_id));

        // Add enrollment status to each course
        const coursesWithStatus = courses.map((course) => ({
            ...course.toJSON(),
            isEnrolled: enrolledCourseIds.includes(course.id),
        }));

        return res.status(200).json({
            success: true,
            message: "Paid courses fetched successfully!",
            courses: coursesWithStatus,
        });
    } catch (error) {
        console.error("Error fetching paid courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch paid courses!",
        });
    }
};


export const getCreatorCourses = async (req, res) => {
    try {
        const creatorId = req.id;

        const courses = await Course.findAll({
            where: { creator_id: creatorId },
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "course_level",
                "course_price",
                "course_type", // ✅ Include course_type
                "is_published",
                "course_thumbnail",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for the creator.",
                courses: [],
            });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully.",
            courses,
        });
    } catch (error) {
        console.error("Error fetching creator courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses!",
        });
    }
};


export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const {
            course_title,
            sub_title,
            description,
            category,
            course_level,
            course_price,
            course_type,
        } = req.body;

        const course_thumbnail = req.file;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        // Validation: If changing to paid, must have price
        if (course_type === "paid" && (!course_price || course_price <= 0)) {
            return res.status(400).json({
                success: false,
                message: "Paid courses must have a price greater than 0!",
            });
        }

        let newThumbnailUrl = course.course_thumbnail;

        if (course_thumbnail) {
            try {
                if (course.course_thumbnail) {
                    const oldKey = course.course_thumbnail.split(".com/")[1];
                    await deleteMediaFromS3(oldKey);
                }

                const uploadResult = await uploadMediaToS3(
                    course_thumbnail.buffer,
                    course_thumbnail.mimetype,
                    course_thumbnail.originalname
                );
                newThumbnailUrl = uploadResult.url;
            } catch (uploadError) {
                console.error("Error replacing course thumbnail:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload thumbnail to S3",
                    error: uploadError.message,
                });
            }
        }

        Object.assign(course, {
            course_title: course_title || course.course_title,
            sub_title: sub_title || course.sub_title,
            description: description || course.description,
            category: category || course.category,
            course_level: course_level || course.course_level,
            course_price: course_type === "free" ? 0 : (course_price || course.course_price),
            course_type: course_type || course.course_type, // ✅ Update course_type
            course_thumbnail: newThumbnailUrl,
        });

        await course.save();

        return res.status(200).json({
            success: true,
            message: "Course updated successfully!",
            course,
        });
    } catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to edit the course.",
            error: error.message,
        });
    }
};


export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        const id = parseInt(courseId, 10);
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID format.",
            });
        }

        const course = await Course.findByPk(id, {
            attributes: [
                "id",
                "course_title",
                "sub_title",
                "description",
                "course_thumbnail",
                "course_level",
                "course_price",
                "category",
                "course_type", // ✅ Include course_type
                "is_published",
            ],
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: ["id", "lectureTitle", "isPreviewFree"],
                    where: { isPreviewFree: true },
                    required: false,
                    through: { attributes: [] },
                },
            ],
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully.",
            course,
        });
    } catch (error) {
        console.error("Error fetching course by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course!",
        });
    }
};


export const getCourseContent = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await Course.findByPk(courseId, {
            include: [
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

        // ✅ FREE COURSE - Allow all logged-in users
        if (course.course_type === "free") {
            const lecturesWithVideos = await Lecture.findAll({
                attributes: ["id", "lectureTitle", "videoUrl", "publicId", "isPreviewFree"],
                include: [
                    {
                        model: Course,
                        as: "courses",
                        where: { id: courseId },
                        through: { attributes: [] },
                    },
                ],
            });

            return res.status(200).json({
                success: true,
                message: "Free course content fetched successfully!",
                course: {
                    ...course.toJSON(),
                    lectures: lecturesWithVideos,
                },
                accessType: "free",
            });
        }

        // ✅ PAID COURSE - Check enrollment
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
            // Show only free preview lectures
            const freeLectures = await Lecture.findAll({
                attributes: ["id", "lectureTitle", "isPreviewFree"],
                where: { isPreviewFree: true },
                include: [
                    {
                        model: Course,
                        as: "courses",
                        where: { id: courseId },
                        through: { attributes: [] },
                    },
                ],
            });

            return res.status(200).json({
                success: true,
                message: "Course preview only. Contact admin for full access.",
                course: {
                    ...course.toJSON(),
                    lectures: freeLectures,
                },
                accessType: "preview",
                requiresEnrollment: true,
            });
        }

        // User has enrollment - show all lectures with videos
        const lecturesWithVideos = await Lecture.findAll({
            attributes: ["id", "lectureTitle", "videoUrl", "publicId", "isPreviewFree"],
            include: [
                {
                    model: Course,
                    as: "courses",
                    where: { id: courseId },
                    through: { attributes: [] },
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Full course content fetched successfully!",
            course: {
                ...course.toJSON(),
                lectures: lecturesWithVideos,
            },
            accessType: "enrolled",
            enrollment: {
                enrollmentDate: enrollment.enrollment_date,
                expiryDate: enrollment.expiry_date,
                paymentStatus: enrollment.payment_status,
            },
        });
    } catch (error) {
        console.error("Error fetching course content:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content!",
        });
    }
};


export const getCourseWithFullAccess = async (req, res) => {
    try {
        const { courseId } = req.params;
        const enrollment = req.enrollment; // Set by middleware

        const course = await Course.findByPk(courseId, {
            include: [
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: ["id", "lectureTitle", "videoUrl", "publicId", "isPreviewFree"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Full course content fetched successfully!",
            course,
            enrollment: {
                enrollmentDate: enrollment.enrollment_date,
                expiryDate: enrollment.expiry_date,
                paymentStatus: enrollment.payment_status,
            },
        });
    } catch (error) {
        console.error("Error fetching full course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course content!",
        });
    }
};


export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.body;

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found!",
            });
        }

        course.is_published = publish;
        await course.save();

        return res.status(200).json({
            success: true,
            message: `Course ${publish ? "published" : "unpublished"} successfully!`,
            course,
        });
    } catch (error) {
        console.error("Error toggling publish status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update course status!",
        });
    }
};