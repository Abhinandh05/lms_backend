    import { DataTypes } from "sequelize";
    import { sequelize } from "../config/database.js";

    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
                unique: false,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM("mentor", "student", "admin", "superadmin"),
                allowNull: false,
                defaultValue: "student",
            },
            selectedCourseId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'selected_course_id', // Explicit mapping
            },
            isAccountVerified: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_account_verified', // Explicit mapping
            },
            verifyOtp: {
                type: DataTypes.STRING,
                allowNull: true, // Changed from defaultValue: ""
                defaultValue: null,
                field: 'verify_otp',
            },
            verifyOtpExpiresAt: {
                type: DataTypes.BIGINT,
                allowNull: true, // Changed to nullable
                defaultValue: null, // Changed from 0
                field: 'verify_otp_expires_at',
            },
            resetOtp: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
                field: 'reset_otp',
            },
            resetOtpExpiresAt: {
                type: DataTypes.BIGINT,
                allowNull: true,
                defaultValue: null,
                field: 'reset_otp_expires_at',
            },
        },
        {
            tableName: "users",
            timestamps: true,
            underscored: true,
        }
    );

    export default User;