import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const UserForm = sequelize.define(
    "UserForm",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
            comment: "User's email address",
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^[6-9]\d{9}$/, // Indian phone number format
            },
            comment: "User's phone number",
        },
        // Educational Background
        educationLevel: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Plus Two, Degree, Master's, Diploma, etc.",
        },
        educationDetails: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
            comment: "Details like institution, field of study, year of completion",
        },
        // Current Course Selection
        currentCourse: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: "Currently enrolled course/stack",
        },
        // Previous courses studied in this platform
        previousCourses: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: "Array of previously completed courses in platform",
        },
        experienceLevel: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: "Beginner, Intermediate, Advanced",
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lastEditedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
            comment: "ID of mentor/admin who last edited",
        },
        editHistory: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: "History of all edits made to this form",
        },
    },
    {
        tableName: "user_forms",
        timestamps: true,
        underscored: true,
    }
);

export default UserForm;