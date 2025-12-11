// course.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Course = sequelize.define(
    "Course",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        course_title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "Course title cannot be empty or just whitespace." },
                notNull: { msg: "Course title is required." },
                isValidTitle(value) {
                    if (!value || value.trim().length === 0) {
                        throw new Error("Course title cannot be empty or just whitespace.");
                    }
                },
            },
        },
        sub_title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: "Category is required." },
                notNull: { msg: "Category is required." },
            },
        },
        course_level: {
            type: DataTypes.ENUM("Beginner", "Medium", "Advanced"),
            allowNull: true,
        },
        course_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
        },
        course_thumbnail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        course_type: {
            type: DataTypes.ENUM("free", "paid"),
            allowNull: false,
            defaultValue: "paid",
            validate: {
                isIn: {
                    args: [["free", "paid"]],
                    msg: "Course type must be either 'free' or 'paid'",
                },
            },
        },
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "courses",
        timestamps: true,
        underscored: true,
    }
);

export default Course;