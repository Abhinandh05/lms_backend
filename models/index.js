import { sequelize } from "../config/database.js";
import User from "../user/user.model.js";
import Course from "../course/course.model.js";
import Lecture from "../lecture/lecture.model.js";
import CourseLecture from "../lecture/courseLecture.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import CourseProgress from "../courseProgress/courseProgress.model.js";
import LectureProgress from "../courseProgress/lectureProgress.model.js";


User.hasMany(Course, {
    foreignKey: "creator_id",
    as: "createdCourses",
});
Course.belongsTo(User, {
    foreignKey: "creator_id",
    as: "creator",
});

Course.belongsToMany(Lecture, {
    through: CourseLecture,
    foreignKey: "courseId",
    otherKey: "lectureId",
    as: "lectures",
});

Lecture.belongsToMany(Course, {
    through: CourseLecture,
    foreignKey: "lectureId",
    otherKey: "courseId",
    as: "courses",
});

User.belongsToMany(Course, {
    through: Enrollment,
    foreignKey: "user_id",
    otherKey: "course_id",
    as: "enrolledCourses",
});

Course.belongsToMany(User, {
    through: Enrollment,
    foreignKey: "course_id",
    otherKey: "user_id",
    as: "enrolledStudents",
});

Enrollment.belongsTo(User, { foreignKey: "user_id", as: "student" });
Enrollment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
Enrollment.belongsTo(User, { foreignKey: "granted_by", as: "admin" });

User.hasMany(CourseProgress, {
    foreignKey: "userId",
    as: "courseProgress",
    onDelete: "CASCADE",
});
CourseProgress.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
});

Course.hasMany(CourseProgress, {
    foreignKey: "courseId",
    as: "userProgress",
    onDelete: "CASCADE",
});
CourseProgress.belongsTo(Course, {
    foreignKey: "courseId",
    as: "course",
});

CourseProgress.hasMany(LectureProgress, {
    foreignKey: "courseProgressId",
    as: "lectureProgress",
    onDelete: "CASCADE",
});
LectureProgress.belongsTo(CourseProgress, {
    foreignKey: "courseProgressId",
    as: "courseProgress",
});

// Lecture ↔ LectureProgress
Lecture.hasMany(LectureProgress, {
    foreignKey: "lectureId",
    as: "lectureProgress",
    onDelete: "CASCADE",
});
LectureProgress.belongsTo(Lecture, {
    foreignKey: "lectureId",
    as: "lecture",
});

export {
    sequelize,
    User,
    Course,
    Lecture,
    CourseLecture,
    Enrollment,
    CourseProgress,
    LectureProgress,
};
