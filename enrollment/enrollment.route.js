import express from "express";
import {
    grantCourseAccess,
    revokeCourseAccess,
    getCourseEnrollments,
    getMyEnrolledCourses,
    checkCourseAccess,
    getCourseContent,
    bulkGrantAccess,
} from "./enrollment.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import {isAdmin} from "../middleware/isAdmin.js";


const router = express.Router();

// ADMIN ROUTES
router.post("/grant", isAuthenticated, isAdmin, grantCourseAccess);
router.post("/bulk-grant", isAuthenticated, isAdmin, bulkGrantAccess);
router.patch("/revoke/:enrollmentId", isAuthenticated, isAdmin, revokeCourseAccess);
router.get("/course/:courseId", isAuthenticated, isAdmin, getCourseEnrollments);

//STUDENT ROUTES
router.get("/my-courses", isAuthenticated, getMyEnrolledCourses);
router.get("/check-access/:courseId", isAuthenticated, checkCourseAccess);
router.get("/course-content/:courseId", isAuthenticated, getCourseContent);

export default router;