import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { isAdmin } from "../middleware/isAdmin.js";
import upload from "../middleware/upload.js";
import {
    createCourse,
    editCourse,
    getCourseById,
    getCourseContent,
    getCourseWithFullAccess,
    getCreatorCourses,
    getPublishedCourse,
    getFreeCourses,
    getPaidCourses,
    searchCourse,
    togglePublishCourse,
} from "./course.controller.js";
import { checkCourseAccessMiddleware } from "../middleware/courseAccess.js";

const router = express.Router();

// PUBLIC ROUTES (No auth needed)
router.get("/search", searchCourse);
router.get("/published-course", getPublishedCourse);

//  STUDENT ROUTES
router.get("/free-courses", isAuthenticated, getFreeCourses);
router.get("/paid-courses", isAuthenticated, getPaidCourses);
router.get("/:courseId/content", isAuthenticated, getCourseContent);

// For Paid Courses Only - Requires enrollment
router.get(
    "/:courseId/full-content",
    isAuthenticated,
    checkCourseAccessMiddleware,
    getCourseWithFullAccess
);

// ADMIN/INSTRUCTOR ROUTES
router.post("/create", isAuthenticated, isAdmin, createCourse);
router.get("/creator", isAuthenticated, isAdmin, getCreatorCourses);
router.put("/edit/:courseId", isAuthenticated, isAdmin, upload.single("course_thumbnail"), editCourse);
router.patch("/publish/:courseId", isAuthenticated, isAdmin, togglePublishCourse);


router.get("/:courseId", getCourseById);

export default router;