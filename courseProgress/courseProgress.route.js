import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {
    getCourseProgress,
    markAsCompleted,
    markAsInCompleted,
    updateLectureProgress
} from "./courseProgress.controller.js";


const router = express.Router();

router.route("/:courseId").get(isAuthenticated, getCourseProgress);

router
    .route("/:courseId/lecture/:lectureId")
    .put(isAuthenticated, updateLectureProgress);

router.route("/:courseId/complete").put(isAuthenticated, markAsCompleted);

router.route("/:courseId/incomplete").put(isAuthenticated, markAsInCompleted);

export default router;
