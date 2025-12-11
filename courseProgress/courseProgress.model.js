// models/courseProgress.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const CourseProgress = sequelize.define(
    "CourseProgress",
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
                model: "users", // references users table
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "courses", // references courses table
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "course_progress",
        timestamps: true,
        underscored: true,
    }
);

export default CourseProgress;
