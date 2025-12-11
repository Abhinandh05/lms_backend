import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { canSubmitForm } from "../middleware/canSubmitForm.js";
import {
    editForm,
    getUserForm,
    submitForm,
    getAllForms,
    getFormHistory
} from "./userForm.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// User routes - Students can submit and view their own form
router.post("/submit", isAuthenticated, canSubmitForm, submitForm);
router.get("/my", isAuthenticated, getUserForm);

// Admin/Mentor routes - Only admins and mentors can access these
router.put("/edit/:formId", isAuthenticated, isAdmin, editForm);
router.get("/all", isAuthenticated, isAdmin, getAllForms);
router.get("/history/:formId", isAuthenticated, isAdmin, getFormHistory);

export default router;