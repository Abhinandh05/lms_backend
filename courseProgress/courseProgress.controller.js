import Course from "../course/course.model.js";
import Lecture from "../lecture/lecture.model.js";
import CourseProgress from "./courseProgress.model.js";
import LectureProgress from "./lectureProgress.model.js";

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        // Find course details (with lectures)
        const courseDetails = await Course.findOne({
            where: { id: courseId },
            include: [
                {
                    model: Lecture,
                    as: "lectures",
                    attributes: ["id", "lectureTitle", "videoUrl", "isPreviewFree"],
                },
            ],
        });

        if (!courseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Find course progress for this user
        const courseProgress = await CourseProgress.findOne({
            where: { courseId, userId },
            include: [
                {
                    model: LectureProgress,
                    as: "lectureProgress",
                    attributes: ["lectureId", "viewed"],
                },
            ],
        });

        // If user hasn't started the course yet
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                },
            });
        }

        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            },
        });
    } catch (error) {
        console.error("Error fetching course progress:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        // Find or create course progress record
        let courseProgress = await CourseProgress.findOne({
            where: { courseId, userId },
        });

        if (!courseProgress) {
            courseProgress = await CourseProgress.create({
                userId,
                courseId,
                completed: false,
            });
        }

        // Find or create lecture progress
        const [lectureProgress] = await LectureProgress.findOrCreate({
            where: {
                courseProgressId: courseProgress.id,
                lectureId,
            },
            defaults: {
                viewed: true,
            },
        });

        // If it already exists but not viewed, update it
        if (!lectureProgress.viewed) {
            lectureProgress.viewed = true;
            await lectureProgress.save();
        }

        // Check if all lectures in course are viewed
        const totalLectures = await Lecture.count({ where: { course_id: courseId } });
        const viewedLectures = await LectureProgress.count({
            where: { courseProgressId: courseProgress.id, viewed: true },
        });

        if (totalLectures > 0 && viewedLectures === totalLectures) {
            courseProgress.completed = true;
            await courseProgress.save();
        }

        return res.status(200).json({ message: "Lecture progress updated successfully" });
    } catch (error) {
        console.error("Error updating lecture progress:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({
            where: { courseId, userId },
            include: [{ model: LectureProgress, as: "lectureProgress" }],
        });

        if (!courseProgress) {
            return res.status(404).json({ message: "Course progress not found" });
        }

        // Mark all lectures as viewed
        await LectureProgress.update(
            { viewed: true },
            { where: { courseProgressId: courseProgress.id } }
        );

        courseProgress.completed = true;
        await courseProgress.save();

        return res.status(200).json({ message: "Course marked as completed" });
    } catch (error) {
        console.error("Error marking course as completed:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({
            where: { courseId, userId },
            include: [{ model: LectureProgress, as: "lectureProgress" }],
        });

        if (!courseProgress) {
            return res.status(404).json({ message: "Course progress not found" });
        }

        // Mark all lectures as not viewed
        await LectureProgress.update(
            { viewed: false },
            { where: { courseProgressId: courseProgress.id } }
        );

        courseProgress.completed = false;
        await courseProgress.save();

        return res.status(200).json({ message: "Course marked as incompleted" });
    } catch (error) {
        console.error("Error marking course as incompleted:", error);
        res.status(500).json({ message: "Server error" });
    }
};
