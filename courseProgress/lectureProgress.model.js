// models/lectureProgress.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const LectureProgress = sequelize.define(
    "LectureProgress",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        courseProgressId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "course_progress", // references CourseProgress table
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        lectureId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "lectures", // assuming you have a lectures table
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        viewed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "lecture_progress",
        timestamps: true,
        underscored: true,
    }
);

export default LectureProgress;
