import UserForm from "./userForm.model.js";
import User from "../user/user.model.js";

export const submitForm = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            educationLevel,
            educationDetails,
            currentCourse,
            experienceLevel,
            comments
        } = req.body;
        const userId = req.user.id;

        // Validation
        if (!firstName || !lastName || !email || !phoneNumber || !educationLevel || !currentCourse) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, email, phone number, education level, and current course are required."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format.",
            });
        }

        // Validate phone number (Indian format: 10 digits starting with 6-9)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number. Please enter a valid 10-digit Indian phone number.",
            });
        }

        // Check if user already submitted a form
        const existingForm = await UserForm.findOne({ where: { userId } });

        if (existingForm) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a form. Only mentors and admins can edit it.",
            });
        }

        // Check if email or phone already exists for another user
        const duplicateEmail = await UserForm.findOne({
            where: { email },
            paranoid: true
        });

        if (duplicateEmail) {
            return res.status(400).json({
                success: false,
                message: "This email is already registered.",
            });
        }

        const duplicatePhone = await UserForm.findOne({
            where: { phoneNumber },
            paranoid: true
        });

        if (duplicatePhone) {
            return res.status(400).json({
                success: false,
                message: "This phone number is already registered.",
            });
        }

        // Structure education details
        const formattedEducationDetails = {
            level: educationLevel,
            institution: educationDetails?.institution || null,
            fieldOfStudy: educationDetails?.fieldOfStudy || null,
            yearOfCompletion: educationDetails?.yearOfCompletion || null,
            percentage: educationDetails?.percentage || null,
        };

        const form = await UserForm.create({
            userId,
            firstName,
            lastName,
            email,
            phoneNumber,
            educationLevel,
            educationDetails: formattedEducationDetails,
            currentCourse,
            experienceLevel,
            comments,
            previousCourses: [],
            editHistory: [{
                action: "created",
                timestamp: new Date(),
                performedBy: userId,
                changes: {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    educationLevel,
                    educationDetails: formattedEducationDetails,
                    currentCourse,
                    experienceLevel
                }
            }]
        });

        return res.status(201).json({
            success: true,
            message: "Form submitted successfully.",
            form,
        });
    } catch (error) {
        console.error("Submit form error:", error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error.",
                errors: error.errors.map(e => e.message),
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to submit form.",
        });
    }
};

export const getUserForm = async (req, res) => {
    try {
        const userId = req.user.id;

        const form = await UserForm.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "role"]
                },
                {
                    model: User,
                    as: "editor",
                    attributes: ["name", "email", "role"],
                    required: false
                }
            ],
        });

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "No form found for this user."
            });
        }

        res.status(200).json({
            success: true,
            form,
        });
    } catch (error) {
        console.error("Get form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch form.",
        });
    }
};

export const editForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            educationLevel,
            educationDetails,
            currentCourse,
            experienceLevel,
            comments
        } = req.body;
        const editorId = req.user.id;
        const editorRole = req.user.role;

        const form = await UserForm.findByPk(formId);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found."
            });
        }

        // Track changes
        const changes = {};
        const previousCourses = form.previousCourses || [];

        if (firstName && firstName !== form.firstName) {
            changes.firstName = { from: form.firstName, to: firstName };
            form.firstName = firstName;
        }

        if (lastName && lastName !== form.lastName) {
            changes.lastName = { from: form.lastName, to: lastName };
            form.lastName = lastName;
        }

        // Validate and update email
        if (email && email !== form.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format.",
                });
            }

            // Check if email already exists for another user
            const duplicateEmail = await UserForm.findOne({
                where: { email },
                paranoid: true
            });

            if (duplicateEmail && duplicateEmail.id !== form.id) {
                return res.status(400).json({
                    success: false,
                    message: "This email is already registered to another user.",
                });
            }

            changes.email = { from: form.email, to: email };
            form.email = email;
        }

        // Validate and update phone number
        if (phoneNumber && phoneNumber !== form.phoneNumber) {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid phone number. Please enter a valid 10-digit Indian phone number.",
                });
            }

            // Check if phone already exists for another user
            const duplicatePhone = await UserForm.findOne({
                where: { phoneNumber },
                paranoid: true
            });

            if (duplicatePhone && duplicatePhone.id !== form.id) {
                return res.status(400).json({
                    success: false,
                    message: "This phone number is already registered to another user.",
                });
            }

            changes.phoneNumber = { from: form.phoneNumber, to: phoneNumber };
            form.phoneNumber = phoneNumber;
        }

        // Track education level changes
        if (educationLevel && educationLevel !== form.educationLevel) {
            changes.educationLevel = { from: form.educationLevel, to: educationLevel };
            form.educationLevel = educationLevel;
        }

        // Track education details changes
        if (educationDetails) {
            const formattedEducationDetails = {
                level: educationLevel || form.educationLevel,
                institution: educationDetails?.institution || form.educationDetails?.institution,
                fieldOfStudy: educationDetails?.fieldOfStudy || form.educationDetails?.fieldOfStudy,
                yearOfCompletion: educationDetails?.yearOfCompletion || form.educationDetails?.yearOfCompletion,
                percentage: educationDetails?.percentage || form.educationDetails?.percentage,
            };

            changes.educationDetails = {
                from: form.educationDetails,
                to: formattedEducationDetails
            };
            form.educationDetails = formattedEducationDetails;
        }

        // Handle course change - move current to previous
        if (currentCourse && currentCourse !== form.currentCourse) {
            changes.currentCourse = { from: form.currentCourse, to: currentCourse };

            // Add old course to previous courses with timestamp
            previousCourses.push({
                course: form.currentCourse,
                enrolledAt: form.createdAt,
                completedAt: new Date(),
                changedBy: editorId,
                status: "completed"
            });

            form.currentCourse = currentCourse;
            form.previousCourses = previousCourses;
        }

        if (experienceLevel !== undefined) {
            changes.experienceLevel = { from: form.experienceLevel, to: experienceLevel };
            form.experienceLevel = experienceLevel;
        }

        if (comments !== undefined) {
            changes.comments = { from: form.comments, to: comments };
            form.comments = comments;
        }

        // Update edit history only if there are changes
        if (Object.keys(changes).length > 0) {
            const editHistory = form.editHistory || [];
            editHistory.push({
                action: "updated",
                timestamp: new Date(),
                performedBy: editorId,
                performedByRole: editorRole,
                changes,
            });

            form.editHistory = editHistory;
            form.lastEditedBy = editorId;
        }

        await form.save();

        // Fetch updated form with associations
        const updatedForm = await UserForm.findByPk(formId, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "role"]
                },
                {
                    model: User,
                    as: "editor",
                    attributes: ["name", "email", "role"]
                }
            ],
        });

        res.status(200).json({
            success: true,
            message: "Form updated successfully.",
            form: updatedForm,
        });
    } catch (error) {
        console.error("Edit form error:", error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error.",
                errors: error.errors.map(e => e.message),
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to update form.",
        });
    }
};

export const getAllForms = async (req, res) => {
    try {
        const { educationLevel, currentCourse, search } = req.query;

        const whereClause = {};
        if (educationLevel) whereClause.educationLevel = educationLevel;
        if (currentCourse) whereClause.currentCourse = currentCourse;

        // Search by name, email, or phone
        if (search) {
            const { Op } = await import('sequelize');
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phoneNumber: { [Op.like]: `%${search}%` } },
            ];
        }

        const forms = await UserForm.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["name", "email", "role"]
                },
                {
                    model: User,
                    as: "editor",
                    attributes: ["name", "email", "role"],
                    required: false
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            success: true,
            count: forms.length,
            forms,
        });
    } catch (error) {
        console.error("Get all forms error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms.",
        });
    }
};

export const getFormHistory = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await UserForm.findByPk(formId, {
            attributes: [
                "id",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "educationLevel",
                "educationDetails",
                "currentCourse",
                "previousCourses",
                "editHistory"
            ],
        });

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found."
            });
        }

        res.status(200).json({
            success: true,
            history: {
                personalInfo: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                },
                education: {
                    level: form.educationLevel,
                    details: form.educationDetails,
                },
                courses: {
                    current: form.currentCourse,
                    previous: form.previousCourses,
                },
                editHistory: form.editHistory,
            },
        });
    } catch (error) {
        console.error("Get form history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch form history.",
        });
    }
};