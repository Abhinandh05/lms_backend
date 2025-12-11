import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const CourseLecture = sequelize.define(
    "CourseLecture",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "courses",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE", // ✅ Added to match migration
        },
        lectureId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "lectures",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE", // ✅ Added to match migration
        },
    },
    {
        tableName: "course_lectures",
        timestamps: true,
        underscored: true,
    }
);

export default CourseLecture;