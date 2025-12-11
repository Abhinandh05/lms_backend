import Lecture from "../lecture/lecture.model.js";
import Course from "../course/course.model.js";
import {deleteMediaFromS3, uploadMediaToS3} from "../utils/s3Media.js";

// Create a lecture and link to multiple courses
export const createLecture = async (req, res) => {
    try {
        const { lectureTitle, isPreviewFree, courseIds } = req.body;
        const videoFile = req.file;

        if (!lectureTitle || !courseIds || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Lecture title and at least one course ID are required!",
            });
        }

        // Parse courseIds if it's a string
        const parsedCourseIds = Array.isArray(courseIds)
            ? courseIds
            : JSON.parse(courseIds);

        // Validate course IDs
        const validCourses = await Course.findAll({
            where: { id: parsedCourseIds }
        });

        if (validCourses.length !== parsedCourseIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more selected courses not found!",
            });
        }

        let videoUrl = null;
        let publicId = null;

        if (videoFile) {
            const uploadResult = await uploadMediaToS3(
                videoFile.buffer,
                videoFile.mimetype,
                videoFile.originalname
            );
            videoUrl = uploadResult.url;
            publicId = uploadResult.key;
        }

        const lecture = await Lecture.create({
            lectureTitle,
            isPreviewFree: isPreviewFree || false,
            videoUrl,
            publicId,
        });

        // Link lecture to courses
        await lecture.addCourses(parsedCourseIds);

        return res.status(201).json({
            success: true,
            message: "Lecture created and linked to courses!",
            lecture,
        });
    } catch (error) {
        console.error("Error creating lecture:", error);
        return res.status(500).json({
            success: false,
            message: "Error while creating the lecture!",
            error: error.message,
        });
    }
};

// Get all lectures for a specific course
export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByPk(courseId, {
            include: [
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
            message: "Lectures fetched successfully!",
            courseTitle: course.course_title,
            lectures: course.lectures,
        });
    } catch (error) {
        console.error("Error fetching course lectures:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get the course lectures!",
        });
    }
};

// Edit a lecture
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, isPreviewFree } = req.body;
        const { lectureId } = req.params;
        const videoFile = req.file;

        const lecture = await Lecture.findByPk(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!",
            });
        }

        let newVideoUrl = lecture.videoUrl;
        let newPublicId = lecture.publicId;

        // If a new video is uploaded
        if (videoFile) {
            try {
                // Delete old S3 video if it exists
                if (lecture.publicId) {
                    await deleteMediaFromS3(lecture.publicId);
                }

                // Upload new video to S3
                const uploadResult = await uploadMediaToS3(
                    videoFile.buffer,
                    videoFile.mimetype,
                    videoFile.originalname
                );

                newVideoUrl = uploadResult.url;
                newPublicId = uploadResult.key;
            } catch (uploadError) {
                console.error("Error replacing lecture video:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload video to S3",
                    error: uploadError.message,
                });
            }
        }

        // Update fields
        Object.assign(lecture, {
            lectureTitle: lectureTitle || lecture.lectureTitle,
            videoUrl: newVideoUrl,
            publicId: newPublicId,
            isPreviewFree: isPreviewFree !== undefined ? isPreviewFree : lecture.isPreviewFree,
        });

        await lecture.save();

        return res.status(200).json({
            success: true,
            message: "Lecture updated successfully!",
            lecture,
        });

    } catch (error) {
        console.error("Error editing lecture:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to edit the lecture!",
            error: error.message,
        });
    }
};

// Get lecture by ID with all its courses
export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const lecture = await Lecture.findByPk(lectureId, {
            include: [
                {
                    model: Course,
                    as: "courses",
                    attributes: ["id", "course_title", "category", "course_level"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lecture fetched successfully!",
            lecture,
        });

    } catch (error) {
        console.error("Error fetching lecture by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch lecture by ID!",
        });
    }
};

// Delete a lecture
export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        const lecture = await Lecture.findByPk(lectureId);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!",
            });
        }

        // Delete video from S3
        if (lecture.publicId) {
            try {
                await deleteMediaFromS3(lecture.publicId);
            } catch (err) {
                console.warn("S3 deletion warning:", err.message);
            }
        }

        // Delete lecture (cascade will remove CourseLecture entries)
        await lecture.destroy();

        return res.status(200).json({
            success: true,
            message: "Lecture deleted successfully!",
            deletedLectureId: lectureId,
        });
    } catch (error) {
        console.error("Error removing lecture:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove lecture!",
        });
    }
};