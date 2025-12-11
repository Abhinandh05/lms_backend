import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Enrollment = sequelize.define(
    "Enrollment",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "courses",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        granted_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users", // Admin who granted access
                key: "id",
            },
            onDelete: "SET NULL",
        },
        enrollment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: true, // null = lifetime access
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        payment_status: {
            type: DataTypes.ENUM("pending", "paid", "free"),
            defaultValue: "pending",
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "enrollments",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["user_id", "course_id"],
            },
        ],
    }
);

export default Enrollment;