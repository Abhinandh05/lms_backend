import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {createLecture, editLecture, getCourseLecture, getLectureById, removeLecture} from "./lecture.controller.js";
import {uploadVideo} from "../middleware/upload.js";
import {isAdmin} from "../middleware/isAdmin.js";
import {editLimiter} from "../middleware/rateLimit.js";


const router = express.Router();

router.route("/lecture").post(isAuthenticated,uploadVideo.single("videoFile"),isAdmin,editLimiter, createLecture);

router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);

router.route("/:courseId/lecture/:lectureId").put(isAuthenticated,uploadVideo.single("videoFile"),isAdmin,editLimiter, editLecture);

router.route("/lecture/:lectureId").delete(isAuthenticated,isAdmin, removeLecture);

router.route("/lecture/:lectureId").get(isAuthenticated,isAdmin, getLectureById);

export default router;